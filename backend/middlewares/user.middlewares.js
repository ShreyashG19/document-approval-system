const Joi = require("joi");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { verifyPassword } = require("../utils/hashPassword");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/createError");
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
        return res.status(400).json({
            message: "Invalid details",
            error: error.details[0].message,
        });
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
        return res.status(400).json({
            message: "Invalid details",
            error: error.details[0].message,
        });
    }
    next();
};

const verifyToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        const error = new Error("User not logged in");
        error.statusCode = 401;
        return next(error);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded) {
        const error = new Error("Invalid token");
        error.statusCode = 401;
        res.clearCookie("token");
        return next(error);
    }

    const user = await User.findOne({
        username: decoded.username,
        isActive: true,
        isVerified: true,
    });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        res.clearCookie("token");
        return next(error);
    }
    const jti = decoded.jti;
    if (user.validJtis.length === 0) {
        const error = new Error("User not logged in");
        error.statusCode = 401;
        res.clearCookie("token");
        return next(error);
    }
    if (!user.validJtis.includes(jti)) {
        const error = new Error("Invalid token");
        error.statusCode = 401;
        res.clearCookie("token");
        return next(error);
    }
    req.user = user;
    next();
});

const verifySpToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies.sptoken;
    if (!token) {
        return res.status(400).json({
            status: false,
            message: "Access Denied",
        });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    if (decoded.usage !== "OTP") {
        return res.status(401).json({
            status: false,
            message: "No token found",
        });
    }
    const user = await User.findOne({ username: decoded.username });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        return next(error);
    }
    req.user = user;
    // req.username = decoded.username;
    // req.usage = decoded.usage;
    next();
});

//new
const resetPasswordSchema = Joi.object({
    email: emailSchema.required(),
    otp: otpSchema.required(),
    newPassword: passwordSchema.required(),
});

const resetPasswordValidator = (req, res, next) => {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: "Invalid details",
            error: error.details[0].message,
        });
    }
    next();
};

const verifyEmailExists = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        const error = new Error("Email is required");
        error.statusCode = 400;
        return next(error);
    }
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        return next(error);
    }
    next();
});
const verifyOldPassword = asyncHandler(async (req, res, next) => {
    const { currentPassword } = req.body;
    if (!currentPassword) {
        const error = new Error("Current password is required");
        error.statusCode = 400;
        return next(error);
    }

    const isMatch = await verifyPassword(currentPassword, req.user.password);
    if (!isMatch) {
        const error = new Error("Invalid Current Password");
        error.statusCode = 400;
        return next(error);
    }
    next();
});
//todo: remove later
const authorizeRoles = (roles) => (req, res, next) => {
    if (!roles.includes(req.session.role)) {
        throw createError(401, "Access Denied!");
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
        throw createError(400, error.details[0].message);
    }
    next();
};
module.exports = {
    signUpDetailsValidator,
    signiInDetailsValidator,
    verifyToken,
    verifySpToken,
    verifyEmailExists,
    verifyOldPassword,
    authorizeRoles,
    resetPasswordValidator,
    //v2
    updateProfileValidator,
};
