const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const uuidv4 = require("uuid").v4;
const { hashPassword, verifyPassword } = require("../utils/hashPassword");
const { Role } = require("../utils/enums");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const { verifyOTP } = require("./otp.controllers");
const { terminateUserSession } = require("../controllers/auth.controllers");
const config = require("../config/appConfig");
const { transporter, MailOptions, sendEmail } = require("../utils/sendEmail");
const createError = require("../utils/createError");

const signIn = asyncHandler(async (req, res, next) => {
    let { username, password, deviceToken } = req.body;
    username = username.trim().toLowerCase();
    password = password.trim();
    deviceToken = deviceToken.trim();
    if (!deviceToken) {
        const error = new Error("Device token is required");
        error.statusCode = 400;
        return next(error);
    }

    const user = await User.findOne({ username });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        return next(error);
    }

    if (user.isVerified === false) {
        const error = new Error("User not verified");
        await User.deleteMany({ username });
        error.statusCode = 400;
        return next(error);
    }
    if (user.isActive === false) {
        const error = new Error("User is deactivated");
        error.statusCode = 400;
        return next(error);
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
        const error = new Error("Invalid username or password");
        error.statusCode = 401;
        return next(error);
    }

    if (!user.deviceTokens.includes(deviceToken)) {
        user.deviceTokens.push(deviceToken);
        await user.save();
    }

    const jti = uuidv4();
    const token = jwt.sign(
        {
            username: username,
            email: user.email,
            role: user.role,
            jti: jti,
        },
        config.jwtSecret
    );
    await User.updateOne({ username }, { $push: { validJtis: jti } });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
    });

    await user.populate({
        path: "assignedApprover createdAssistants",
        select: "-password -encKey -deviceTokens",
        populate: {
            path: "assignedApprover",
            select: "fullName",
        },
    });
    return res.status(200).json({
        success: true,
        message: "Login success!",
        token: token,
        user: {
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            assignedApprover: user?.assignedApprover?.fullName,
        },
    });
});
const signUp = asyncHandler(async (req, res, next) => {
    let { username, password, fullName, email, mobileNo } = req.body;
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();
    mobileNo = mobileNo.trim().toLowerCase();
    fullName = fullName.trim().toLowerCase();
    const existingVerifiedUser = await User.findOne({
        $or: [{ username }, { email }, { mobileNo }],
        isVerified: true,
    });

    if (existingVerifiedUser) {
        const error = new Error("duplicate user found");
        error.statusCode = 400;
        error.key =
            existingVerifiedUser.username === username
                ? "username"
                : existingVerifiedUser.email === email
                ? "email"
                : "mobileNo";
        return next(error);
    }

    await User.deleteMany({
        $or: [{ username }, { email }, { mobileNo }],
        isVerified: false,
    });

    // const privateKey = crypto
    //     .randomBytes(32)
    //     .toString("base64")
    //     .replace(/[+/]/g, (m) => (m === "+" ? "-" : "_"));
    const encKey = crypto.randomBytes(32).toString("hex");

    const hash = await hashPassword(password);

    const newUser = await User.create({
        username,
        password: hash,
        fullName,
        email,
        mobileNo,
        encKey,
    });

    await newUser.save();
    await sendOTPVerificationEmail({ username, email }, res);
});
const signOut = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, config.jwtSecret);
    res.clearCookie("token");
    if (!decoded) {
        return res.status(200).json({ message: "Logged out successfully" });
    }

    const jti = decoded.jti;
    await User.updateOne({ _id: req.user._id }, { $pull: { validJtis: jti } });
    const deviceToken = req.body.deviceToken;
    //remove device token from user.deviceTokens
    if (deviceToken) {
        await User.updateOne(
            { _id: req.user._id },
            { $pull: { deviceTokens: deviceToken } }
        );
    }
    console.log("cookie removed");
    return res.status(200).json({ message: "Logged out successfully" });
});

const signOutAll = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, config.jwtSecret);
    res.clearCookie("token");
    if (!decoded) {
        return res.status(200).json({ message: "Logged out successfully" });
    }

    await User.updateOne(
        { _id: req.user._id },
        {
            $set: {
                validJtis: [],
                deviceTokens: [],
            },
        }
    );
    console.log("cookie removed");
    return res
        .status(200)
        .json({ message: "Logged out from all devicess successfully" });
});

const checkAuthStatus = asyncHandler(async (req, res, next) => {
    return res.status(200).json({
        status: true,
        user: {
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
            fullName: req.user.fullName,
            mobileNo: req.user.mobileNo,
        },
    });
});

const sendOTPVerificationEmail = asyncHandler(
    async ({ username, email }, res) => {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const mailOptions = {
            from: config.authEmail,
            to: email,
            subject: "Verify your email",
            html: `<p>Enter the OTP : <b>${otp}</b> on verification page to complete your registration</p><p>The OTP will expire in 10 minutes</p>`,
        };

        //generate hashed otp
        const saltRounds = 10;
        // const hashedOtp = await bcrypt.hash(otp, saltRounds);
        const hashedOtp = await hashPassword(otp);
        const newOTPVerification = await new UserOTPVerification({
            username,
            otp: hashedOtp,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 600000),
        });
        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);
        return res.status(200).json({
            status: "pending",
            message: "OTP sent successfully",
            data: {
                username,
                email,
            },
        });
    }
);

// const verifyOTP = asyncHandler(async (req, res) => {
//     let { username, otp } = req.body;
//     username = username.trim().toLowerCase();
//     otp = otp.trim().toLowerCase();
//     if (!username || !otp)
//         return res.status(400).json({ message: "OTP is required" });
//     else {
//         const userOTPVerificationReacords = await UserOTPVerification.find({
//             username,
//         });
//         if (userOTPVerificationReacords.length <= 0)
//             return res.status(404).json({ message: "OTP not found" });
//         else {
//             const { expiresAt } = userOTPVerificationReacords[0];
//             const hashedOtp =
//                 userOTPVerificationReacords[
//                     userOTPVerificationReacords.length - 1
//                 ].otp;

//             if (expiresAt < Date.now()) {
//                 await UserOTPVerification.deleteMany({ username });
//                 return res.status(400).json({ message: "OTP expired" });
//             } else {
//                 // const isValid = await bcrypt.compare(otp, hashedOtp);
//                 const isValid = await verifyPassword(otp, hashedOtp);
//                 console.log(otp);
//                 if (!isValid)
//                     return res.status(400).json({ message: "OTP invalid" });
//                 else {
//                     await User.updateOne({ username }, { isVerified: true });
//                     await UserOTPVerification.deleteMany({ username });
//                     return res.status(200).json({
//                         status: "VERIFIED",
//                         message: "OTP verified",
//                     });
//                 }
//             }
//         }
//     }
// });

const verifySpOTP = asyncHandler(async (req, res) => {
    let { otp, email } = req.body;
    email = email.trim().toLowerCase();
    otp = otp.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            status: false,
            message: "User not found",
        });
    }
    const username = user.username;
    const userOTPVerificationReacords = await UserOTPVerification.find({
        username,
    });
    if (userOTPVerificationReacords.length <= 0)
        return res.status(404).json({ message: "OTP not found" });
    else {
        const { expiresAt } = userOTPVerificationReacords[0];
        const hashedOtp =
            userOTPVerificationReacords[userOTPVerificationReacords.length - 1]
                .otp;

        if (expiresAt < Date.now()) {
            await UserOTPVerification.deleteMany({ username });
            return res.status(400).json({ message: "OTP expired" });
        } else {
            console.log(otp);
            // const isValid = await bcrypt.compare(otp, hashedOtp);
            const isValid = await verifyPassword(otp, hashedOtp);
            if (!isValid)
                return res.status(400).json({ message: "OTP invalid" });
            else {
                await User.updateOne({ username }, { isVerified: true });
                await UserOTPVerification.deleteMany({ username });
                const sptoken = jwt.sign(
                    { username: user.username, email, usage: "OTP" },
                    config.jwtSecret
                );
                // make age of 1 minute 30 seconds
                res.cookie("sptoken", sptoken, {
                    httpOnly: true,
                    sameSite: "strict",
                    maxAge: 60 * 30 * 1000,
                });
                return res.status(200).json({ status: true });
            }
        }
    }
});

const resendOTPAndVerify = asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    if (!username || !email) {
        return res.status(400).json({
            status: "FAILED",
            message: "Please provide username and email.",
        });
    } else {
        await UserOTPVerification.deleteMany({ username });
        sendOTPVerificationEmail({ username, email }, res);
    }
});

const sendPasswordResetOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res
            .status(400)
            .json({ status: "FAILED", message: "Email is required" });
    }
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
        from: config.authEmail,
        to: email,
        subject: "OTP for reseting password",
        html: `<p>Enter the OTP : <b>${otp}</b> on verification page for changing your password</p><p>The OTP will expire in 10 minutes</p>`,
    };

    //generate hashed otp
    const saltRounds = 10;
    // const hashedOtp = await bcrypt.hash(otp, saltRounds);
    const hashedOtp = await hashPassword(otp);
    const user = await User.findOne({ email });
    const newOTPVerification = await new UserOTPVerification({
        username: user.username,
        otp: hashedOtp,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 600000),
    });
    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
        status: "pending",
        message: "OTP sent successfully",
        data: {
            username: user.username,
            email,
        },
    });
});

const getAssistants = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id)
        .populate({
            path: "assistants",
            select: "username fullName email mobileNo role isActive",
        })
        .select("assistants");
    return res.status(200).json({
        status: true,
        message: "Assistants fetched successfully",
        assistants: user.assistants || [],
    });
});

//v2
const sendCredentials = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const mailOptions = new MailOptions(
        config.authEmail,
        email,
        "Your account credentials",
        `<p>Your account credentials for document approval system</p><p><b>Username:</b> ${username}</p><p><b>Password:</b> ${password}</p>`
    );
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
        status: true,
        message: "Credentials sent successfully",
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
        return createError(400, "Invalid OTP");
    }
    const user = await User.findOne({ email });
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    //todo: is there need to terminate all sessions?
    return res.status(200).json({
        status: true,
        message: "Password updated successfully",
    });
});

const updateProfile = asyncHandler(async (req, res, next) => {
    const { username, email, fullName, mobileNo, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        throw createError(400, "User not found");
    }
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (mobileNo) {
        const existingUser = await User.findOne({ mobileNo });
        if (existingUser && existingUser.username !== username) {
            throw createError(400, "Mobile number already in use.");
        }
        updates.mobileNo = mobileNo;
    }
    if (email) {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.username !== username) {
            throw createError(400, "Email already in use.");
        }
        updates.email = email;
    }
    if (password) {
        updates.password = await hashPassword(password);
    }

    // Update user in DB
    await User.updateOne({ username }, { $set: updates });

    //terminate session
    terminateUserSession(req, user.sessionID);
    user.sessionID = null;
    user.deviceToken = null;
    await user.save();

    // todo: is sending credentials to email needed?
    //send email if password is updated
    if (password) {
        const mailOptions = new MailOptions(
            config.authEmail,
            email,
            "Your account credentials",
            `<p>Your account credentials for document approval system</p><p><b>Username:</b> ${username}</p><p><b>Password:</b> ${password}</p>`
        );
        await sendEmail(mailOptions);
    }
    return res.status(200).json({
        status: true,
        message: "User details updated successfully",
        user: {
            username,
            email,
            fullName,
            mobileNo,
        },
    });
});

const setUserStatus = asyncHandler(async (req, res, next) => {
    let { username, isActive } = req.body;

    if (typeof isActive !== "boolean")
        throw createError(400, "isActive (boolean) is required");

    const user = await User.findOne({ username });

    if (!user) {
        throw createError(404, "User not found");
    }

    if (user.role === Role.ADMIN) {
        throw createError(400, "Access Denied!");
    }

    user.isActive = isActive;
    if (!isActive) {
        terminateUserSession(req, user.sessionID);
        user.sessionID = null;
        user.deviceToken = null;
    }
    await user.save();
    return res.status(200).json({
        status: true,
        message: `${username} is now ${isActive ? "activated" : "deactivated"}`,
    });
});

module.exports = {
    signIn,
    signUp,
    signOut,
    // verifyOTP,
    resendOTPAndVerify,
    checkAuthStatus,
    sendPasswordResetOTP,
    verifySpOTP,
    getAssistants,
    signOutAll,
    //v2
    sendCredentials,
    resetPassword,
    updateProfile,
    setUserStatus,
};
