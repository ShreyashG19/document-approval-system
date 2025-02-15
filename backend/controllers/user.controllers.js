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

//v1: for reference
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

const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: { $ne: Role.ADMIN } }).select(
        "username fullName email mobileNo role isActive"
    );
    if (!users.length) {
        throw createError(404, "No users found");
    }
    return res.status(200).json({
        status: true,
        message: "Users fetched successfully",
        users,
    });
});
module.exports = {
    signOutAll,
    //v2
    sendCredentials,
    resetPassword,
    updateProfile,
    setUserStatus,
    getUsers,
};
