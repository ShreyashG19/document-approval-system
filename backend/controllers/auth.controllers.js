const User = require("../models/user.model");
const OTP = require("../models/otp.model");
const { hashPassword } = require("../utils/hashPassword");
const { MailOptions, transporter } = require("../utils/sendEmail");
const { Role } = require("../utils/enums");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const config = require("../config/appConfig");
const { generateOTP } = require("../utils/otpUtils");
const { verifyOTP } = require("./otp.controllers");

const sendOTPEmail = asyncHandler(async (req, res, next) => {
    const { email, mobileNo } = req.body;

    const otp = generateOTP();
    const hashedOtp = await hashPassword(otp);
    await OTP.create({
        otp: hashedOtp,
        email,
        mobileNo,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
    });

    const mailOptions = new MailOptions(
        config.authEmail,
        email,
        "Verify your email",
        `<p>Enter the OTP : <b>${otp}</b> on verification page of Document Approval System</p><p>The OTP will expire in 2 minutes</p>`
    );
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
        status: true,
        message: "OTP sent successfully",
        data: {
            username: req.body.username,
            email: req.body.email,
        },
    });
});

const verifyAndRegister = asyncHandler(async (req, res, next) => {
    const { email, mobileNo, otp } = req.body;

    const isValid = await verifyOTP(email, mobileNo, otp);
    if (!isValid) {
        const error = new Error("Invalid OTP");
        error.statusCode = 400;
        throw error;
    }
    //make sure assigning role as senior assistant works in all cases
    req.body.role = Role.SENIOR_ASSISTANT;
    const newUser = await register(req, res, next);

    return res.status(200).json({
        status: true,
        message: "User registered successfully",
        data: {
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            fullName: newUser.fullName,
        },
    });
});

const register = async (req) => {
    const { username, password, fullName, email, mobileNo, role } = req.body;
    const encKey = crypto.randomBytes(32).toString("hex"); //generate encyption key
    const hash = await hashPassword(password);
    const newUser = await User.create({
        username,
        password: hash,
        fullName,
        email,
        role,
        mobileNo,
        encKey,
    });

    await newUser.save();
    return newUser;
};
module.exports = { verifyAndRegister, sendOTPEmail };
