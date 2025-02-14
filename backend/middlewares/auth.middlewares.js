const Joi = require("joi");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/createError");
const { Role } = require("../utils/enums");
const {
    usernameSchema,
    fullNameSchema,
    emailSchema,
    mobileNoSchema,
    roleSchema,
    passwordSchema,
} = require("../utils/validationSchemas");

const registerDetailsSchema = Joi.object({
    username: usernameSchema.required(),
    email: emailSchema.required(),
    password: passwordSchema.required(),
    fullName: fullNameSchema.required(),
    mobileNo: mobileNoSchema.required(),
    role: roleSchema.required(),
});

const registerDetailsValidator = (req, res, next) => {
    const { error } = registerDetailsSchema.validate(req.body);
    if (error) {
        throw createError(400, error.details[0].message);
    }
    req.body.username = req.body.username.trim();
    req.body.email = req.body.email.toLowerCase().trim();
    req.body.password = req.body.password.trim();
    req.body.fullName = req.body.fullName.trim();
    next();
};

const loginDetailsSchema = Joi.object({
    username: usernameSchema.required(),
    password: passwordSchema.required(),
    deviceToken: Joi.string().required(),
});
const loginDetailsValidator = (req, res, next) => {
    const { error } = loginDetailsSchema.validate(req.body);
    if (error) {
        throw createError(400, error.details[0].message);
    }
    next();
};

const userExistsValidator = asyncHandler(async (req, res, next) => {
    const { username, email, mobileNo, role } = req.body;

    // Check if user already exists with duplicate credentials
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
        throw createError(400, errorMessage);
    }

    // Check if an approver already exists
    if (role === Role.APPROVER) {
        const existingApprover = await User.findOne({ role: Role.APPROVER });
        if (existingApprover) {
            throw createError(400, "Max approvers limit reached");
        }
    }
    next();
});

//generic validators
const emailValidator = (req, res, next) => {
    const { email } = req.body;
    const { error } = emailSchema.required().validate(email);
    if (error) {
        const err = new Error("Invalid email");
        err.statusCode = 400;
        throw err;
    }
    next();
};
const mobileNoValidator = (req, res, next) => {
    const { mobileNo } = req.body;
    const { error } = mobileNoSchema.required().validate(mobileNo);
    if (error) {
        const err = new Error("Invalid mobile number");
        err.statusCode = 400;
        throw err;
    }
    next();
};
const usernameValidator = (req, res, next) => {
    const { username } = req.body;
    const { error } = usernameSchema.required().validate(username);
    if (error) {
        const err = new Error(
            "Username must be atleast 5 characters long, and can contain only letters, numbers, and underscores"
        );
        err.statusCode = 400;
        throw err;
    }
    next();
};

const passwordValidator = (req, res, next) => {
    console.log("password :", typeof req.body.password);
    const { password } = req.body;
    const { error } = passwordSchema.required().validate(password);
    if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
    }
    next();
};

const verifySession = asyncHandler(async (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        throw createError(401, "User not logged in");
    }
});

const authorizeRoles = (roles) => (req, res, next) => {
    if (!roles.includes(req.session.role)) {
        const error = new Error("Access Denied!");
        error.statusCode = 401;
        return next(error);
    }
    next();
};

module.exports = {
    registerDetailsValidator,
    loginDetailsValidator,
    userExistsValidator,
    emailValidator,
    passwordValidator,
    mobileNoValidator,
    usernameValidator,
    verifySession,
    authorizeRoles,
};
