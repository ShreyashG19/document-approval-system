const { verifyPassword } = require("../utils/hashPassword");
const OTP = require("../models/otp.model");

const verifyOTP = async (email, mobileNo, otp) => {
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
    return true;
};

module.exports = {
    verifyOTP,
};
