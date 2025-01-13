const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { hashPassword, verifyPassword } = require("../utils/hashPassword");
const crypto = require("crypto");
const UserOTPVerification = require("../models/userotp.model");

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});
const signIn = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }

        const isMatch = await verifyPassword(password, user.password);

        if (!isMatch) {
            const error = new Error("Invalid username or password");
            error.statusCode = 401;
            return next(error);
        }

        const token = jwt.sign(
            {
                username: username,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
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
            },
        });
    } catch (error) {
        console.log("user controller service :: signin :: error : ", error);
        error.statusCode = 500;
        return next(error);
    }
};
const signUp = async (req, res, next) => {
    try {
        const { username, password, fullName, email, mobileNo } = req.body;
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

        const privateKey = crypto
            .randomBytes(32)
            .toString("base64")
            .replace(/[+/]/g, (m) => (m === "+" ? "-" : "_"));

        try {
            const hash = await hashPassword(password);
            const newUser = await User.create({
                username,
                password: hash,
                fullName,
                email,
                mobileNo,
                privateKey,
            });

            await newUser.save();
            await sendOTPVerificationEmail({ username, email }, res);
        } catch (hashError) {
            const error = new Error("Error creating user");
            error.statusCode = 500;
            return next(error);
        }
    } catch (error) {
        console.log("user-controller service :: signup :: error : ", error);
        error.statusCode = 500;
        return next(error);
    }
};

const signOut = async (req, res, next) => {
    try {
        res.clearCookie("token");
        console.log("cookie removed");
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("user-controller service :: signOut :: error : ", error);
        error.statusCode = 500;
        return next(error);
    }
};

const checkAuthStatus = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.username });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            status: true,
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
            },
        });
    } catch (error) {
        console.log("User controller :: checkAuthStatus :: error : ", error);
        return res.status(500).json({
            status: false,
            message: "Server Error",
        });
    }
};

const sendOTPVerificationEmail = async ({ username, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
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
    } catch (error) {
        console.log(
            "user-controller service :: sendUserVerificationEmail :: error : ",
            error
        );
        return res
            .status(500)
            .json({ status: "failed", message: "Server Error" });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { username, otp } = req.body;
        if (!username || !otp)
            return res.status(400).json({ message: "OTP is required" });
        else {
            const userOTPVerificationReacords = await UserOTPVerification.find({
                username,
            });
            if (userOTPVerificationReacords.length <= 0)
                return res.status(404).json({ message: "OTP not found" });
            else {
                const { expiresAt } = userOTPVerificationReacords[0];
                const hashedOtp =
                    userOTPVerificationReacords[
                        userOTPVerificationReacords.length - 1
                    ].otp;

                if (expiresAt < Date.now()) {
                    await UserOTPVerification.deleteMany({ username });
                    return res.status(400).json({ message: "OTP expired" });
                } else {
                    // const isValid = await bcrypt.compare(otp, hashedOtp);
                    const isValid = await verifyPassword(otp, hashedOtp);
                    console.log(otp);
                    if (!isValid)
                        return res.status(400).json({ message: "OTP invalid" });
                    else {
                        await User.updateOne(
                            { username },
                            { isVerified: true }
                        );
                        await UserOTPVerification.deleteMany({ username });
                        return res.status(200).json({
                            status: "VERIFIED",
                            message: "OTP verified",
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.log("user-controller service :: verifyOTP :: error : ", error);
        return res
            .status(500)
            .json({ status: "FAILED", message: "Server Error" });
    }
};

const verifySpOTP = async (req, res) => {
    try {
        const { otp, email } = req.body;
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
                userOTPVerificationReacords[
                    userOTPVerificationReacords.length - 1
                ].otp;

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
                        process.env.JWT_SECRET
                    );
                    res.cookie("sptoken", sptoken, {
                        httpOnly: true,
                        sameSite: "strict",
                        maxAge: 10 * 60 * 1000,
                    });
                    return res.status(200).json({ status: true });
                }
            }
        }
    } catch (error) {
        console.log(
            "user-controller service :: verifySpOTP :: error : ",
            error
        );
        return res.status(500).json({ status: false, message: "Server error" });
    }
};
const resendOTPAndVerify = async (req, res) => {
    try {
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
    } catch (error) {
        console.log(
            "user-controller service :: resendOTPAndVerify :: error : ",
            error
        );
        return res
            .status(500)
            .json({ status: "FAILED", message: "Server Error" });
    }
};

const sendPasswordResetOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res
                .status(400)
                .json({ status: "FAILED", message: "Email is required" });
        }
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
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
    } catch (error) {
        console.log(
            "user-controller service :: sendUserVerificationEmail :: error : ",
            error
        );
        return res
            .status(500)
            .json({ status: "failed", message: "Server Error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        let username;
        const { newPassword } = req.body;

        if (req.usage === "OTP") {
            username = req.username;
        } else {
            username = req.body.username;
        }
        if (!newPassword || !username) {
            return res.status(400).json({
                status: "FAILED",
                message: `Please provide ${
                    username ? "new password" : "username"
                }`,
            });
        }
        // const hash = await bcrypt.hash(newPassword, 10);
        const hash = await hashPassword(newPassword);
        await User.updateOne({ username }, { password: hash });
        return res.status(200).json({
            status: "SUCCESS",
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error(
            "user-controller service :: verifyOTPAndResetPassword :: error : ",
            error
        );
        return res.status(500).json({
            status: "FAILED",
            message: "Server Error",
        });
    }
};

module.exports = {
    signIn,
    signUp,
    verifyOTP,
    resendOTPAndVerify,
    checkAuthStatus,
    sendPasswordResetOTP,
    resetPassword,
    verifySpOTP,
    signOut,
};
