const Joi = require("joi");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { verifyPassword } = require("../utils/hashPassword");
const asyncHandler = require("../utils/asyncHandler");
const createApiError = require("../utils/createApiError");
const config = require("../config/appConfig");
const {
    emailSchema,
    otpSchema,
    passwordSchema,
    usernameSchema,
    fullNameSchema,
    mobileNoSchema,
} = require("../utils/validationSchemas");
const signUpDetailsSchema = Joi.object({
    // TODO: change after
    username: Joi.string().min(2),
    email: Joi.string().email(),
    password: Joi.string().min(2),
    fullName: Joi.string().min(2),
    mobileNo: Joi.number().min(10),
});
const signUpDetailsValidator = (req, res, next) => {
    const { error } = signUpDetailsSchema.validate(req.body);
    if (error) {
        throw createApiError(400, error.details[0].message);
    }
    next();
};

const signInDetailsSchema = Joi.object({
    //TODO: change after
    username: Joi.string().min(2),
    password: Joi.string().min(2),
    deviceToken: Joi.string(),
});

//todo: check if user is verified
const signiInDetailsValidator = (req, res, next) => {
    const { error } = signInDetailsSchema.validate(req.body);
    if (error) {
        throw createApiError(400, error.details[0].message);
    }
    next();
};

//new
const resetPasswordSchema = Joi.object({
    email: emailSchema.required(),
    otp: otpSchema.required(),
    newPassword: passwordSchema.required(),
});

const resetPasswordValidator = (req, res, next) => {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
        throw createApiError(400, error.details[0].message);
    }
    next();
};

const verifyEmailExists = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        throw createApiError(400, "Email is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw createApiError(404, "User not found");
    }
    next();
});
const verifyOldPassword = asyncHandler(async (req, res, next) => {
    const { currentPassword } = req.body;
    if (!currentPassword) {
        throw createApiError(400, "Current password is required");
    }

    const isMatch = await verifyPassword(currentPassword, req.user.password);
    if (!isMatch) {
        throw createApiError(400, "Invalid Current Password");
    }
    next();
});
//todo: remove later
const authorizeRoles = (roles) => (req, res, next) => {
    if (!roles.includes(req.session.role)) {
        throw createApiError(401, "Access Denied!");
    }
    next();
};

//v2
const updateProfileValidator = (req, res, next) => {
    const updateProfileSchema = Joi.object({
        username: usernameSchema.required(),
        email: emailSchema,
        fullName: fullNameSchema,
        mobileNo: mobileNoSchema,
        password: passwordSchema,
    });
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
        throw createApiError(400, error.details[0].message);
    }
    next();
};
module.exports = {
    signUpDetailsValidator,
    signiInDetailsValidator,
    verifyEmailExists,
    verifyOldPassword,
    authorizeRoles,
    resetPasswordValidator,
    //v2
    updateProfileValidator,
};
