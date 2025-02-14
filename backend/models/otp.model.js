const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobileNo: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: Date,
    isVerified: {
        type: Boolean,
        default: false,
    },
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
