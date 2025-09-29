const Joi = require("joi");
const User = require("../models/user.model");
const createApiError = require("../utils/createApiError");

const otpValidator = (req, res, next) => {
    const { otp } = req.body;
    const otpSchema = Joi.string()
        .pattern(/^\d{6,8}$/)
        .required();
    const { error } = otpSchema.validate(otp);
    if (error) {
        throw createApiError(400, "Invalid OTP format");
    }
    next();
};

module.exports = {
    otpValidator,
};
