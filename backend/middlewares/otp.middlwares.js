const Joi = require("joi");
const User = require("../models/user.model");

const otpValidator = (req, res, next) => {
    const { otp } = req.body;
    const otpSchema = Joi.string()
        .pattern(/^\d{6,8}$/)
        .required();
    const { error } = otpSchema.validate(otp);
    if (error) {
        const err = new Error("Invalid OTP format");
        err.statusCode = 400;
        throw err;
    }
    next();
};

module.exports = {
    otpValidator,
};
