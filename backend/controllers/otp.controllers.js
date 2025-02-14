const { verifyPassword, hashPassword } = require("../utils/hashPassword");
const OTP = require("../models/otp.model");
const { MailOptions, sendEmail } = require("../utils/sendEmail");
const { generateOTP } = require("../utils/otpUtils");
const config = require("../config/appConfig");
const asyncHandler = require("../utils/asyncHandler");
const verifyOTP = async (email, mobileNo, otp) => {
    console.log("verifying otp");
    const otpExists = await OTP.findOne({
        email,
        mobileNo,
    })
        .sort({ createdAt: -1 })
        .limit(1);

    if (!otpExists) return false;

    if (otpExists.expiresAt < Date.now()) {
        const error = new Error("OTP expired");
        error.statusCode = 400;
        throw error;
    }

    const isValid = await verifyPassword(otp, otpExists.otp);
    if (!isValid || otpExists.isVerified) return false;

    //all conditions are good, update the otp to verified
    await otpExists.updateOne({ isVerified: true });
    console.log("otp verified");
    return true;
};

const sendOTPEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const otp = generateOTP();
    const hashedOtp = await hashPassword(otp);
    await OTP.create({
        otp: hashedOtp,
        email,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
    });

    const mailOptions = new MailOptions(
        config.authEmail,
        email,
        "Verify your email",
        `<p>Enter the OTP : <b>${otp}</b> on Document Approval System</p><p>The OTP will expire in 2 minutes</p>`
    );
    await sendEmail(mailOptions);
    return res.status(200).json({
        status: true,
        message: "OTP sent to email",
        data: {
            username: req.body.username,
            email: req.body.email,
        },
    });
});

module.exports = {
    sendOTPEmail,
    verifyOTP,
};
