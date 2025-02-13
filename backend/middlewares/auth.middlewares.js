const Joi = require("joi");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");

const registerDetailsSchema = Joi.object({
    username: Joi.string()
        .pattern(/^[A-Za-z0-9_]{5,10}$/)
        .messages({
            "string.pattern.base":
                "Username must be atleast 5 characters long, and can contain only letters, numbers, and underscores",
            "string.empty": "Username is required",
            "string.min": "Username must be at least 5 characters long",
            "string.max": "Username must not exceed 30 characters",
        })
        .required(),
    email: Joi.string()
        .email()
        .messages({
            "string.email": "Please enter a valid email address",
            "string.empty": "Email address is required",
        })
        .required(),
    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password must not exceed 30 characters",
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
        })
        .required(),
    fullName: Joi.string()
        .pattern(/^[A-Za-z\s]{5,50}$/)
        .custom((value, helpers) => {
            const words = value.trim().split(/\s+/);
            if (words.length < 2) {
                return helpers.error("string.minWords");
            }
            return value;
        })
        .messages({
            "string.pattern.base":
                "Full name must contain only letters and spaces",
            "string.minWords":
                "Full name must include both first and last name",
            "string.empty": "Full name is required",
            "string.min": "Full name must be at least 5 characters long",
            "string.max": "Full name must not exceed 50 characters",
        })
        .required(),
    mobileNo: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
            "string.pattern.base": "Mobile number must be exactly 10 digits",
            "string.empty": "Mobile number is required",
        })
        .required(),
    otp: Joi.string()
        .pattern(/^\d{6,8}$/)
        .optional(),
});

const registerDetailsValidator = (req, res, next) => {
    const { error } = registerDetailsSchema.validate(req.body);
    if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
    }
    req.body.username = req.body.username.trim();
    req.body.email = req.body.email.toLowerCase().trim();
    req.body.password = req.body.password.trim();
    req.body.fullName = req.body.fullName.trim();
    next();
};

const userExistsValidator = asyncHandler(async (req, res, next) => {
    const { username, email, mobileNo } = req.body;
    const existingUser = await User.findOne({
        $or: [{ username }, { email }, { mobileNo }],
    });
    if (existingUser) {
        let errorMessage;
        if (existingUser.username === username) {
            errorMessage = `The username "${username}" is already taken`;
        } else if (existingUser.email === email) {
            errorMessage = `The email is already registered`;
        } else {
            errorMessage = `The mobile number is already registered`;
        }
        const error = new Error(errorMessage);
        error.statusCode = 400;
        error.key =
            existingUser.username === username
                ? "username"
                : existingUser.email === email
                ? "email"
                : "mobileNo";
        throw error;
    }
    next();
});

const emailValidator = (req, res, next) => {
    const { email } = req.body;
    const emailSchema = Joi.string().email().required();
    const { error } = emailSchema.validate(email);
    if (error) {
        const err = new Error("Invalid email");
        err.statusCode = 400;
        throw err;
    }
    next();
};
const mobileNoValidator = (req, res, next) => {
    const { mobileNo } = req.body;
    const mobileNoSchema = Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required();
    const { error } = mobileNoSchema.validate(mobileNo);
    if (error) {
        const err = new Error("Invalid mobile number");
        err.statusCode = 400;
        throw err;
    }
    next();
};
const usernameValidator = (req, res, next) => {
    const { username } = req.body;
    const usernameSchema = Joi.string()
        .pattern(/^[A-Za-z0-9_]{5,10}$/)
        .required();
    const { error } = usernameSchema.validate(username);
    if (error) {
        const err = new Error(
            "Username must be atleast 5 characters long, and can contain only letters, numbers, and underscores"
        );
        err.statusCode = 400;
        throw err;
    }
    next();
};
module.exports = {
    registerDetailsValidator,
    userExistsValidator,
    emailValidator,
    mobileNoValidator,
    usernameValidator,
};
