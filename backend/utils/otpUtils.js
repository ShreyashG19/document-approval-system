const generateOTP = () => {
    const otpLength = Math.floor(Math.random() * 3) + 6; // Randomly 6, 7, or 8 length
    const otp = `${Math.floor(
        Math.pow(10, otpLength - 1) +
            Math.random() * 9 * Math.pow(10, otpLength - 1)
    )}`;

    return otp;
};
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
module.exports = {
    generateOTP,
};
