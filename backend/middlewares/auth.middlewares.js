const Joi = require("joi");
const User = require("../models/user.model");
const Session = require("../models/session.model");
const asyncHandler = require("../utils/asyncHandler");
const createApiError = require("../utils/createApiError");
const { Role } = require("../utils/enums");
const jwt = require("jsonwebtoken");
const {
    usernameSchema,
    fullNameSchema,
    emailSchema,
    mobileNoSchema,
    roleSchema,
    passwordSchema,
} = require("../utils/validationSchemas");

const registerDetailsValidator = (req, res, next) => {
    const schema = Joi.object({
        username: usernameSchema.required(),
        email: emailSchema.required(),
        password: passwordSchema.required(),
        fullName: fullNameSchema.required(),
        mobileNo: mobileNoSchema.required(),
        role: roleSchema.required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        throw createApiError(400, error.details[0].message);
    }
    req.body.username = req.body.username.trim();
    req.body.email = req.body.email.toLowerCase().trim();
    req.body.password = req.body.password.trim();
    req.body.fullName = req.body.fullName.trim();
    next();
};

const loginDetailsValidator = (req, res, next) => {
    const schema = Joi.object({
        username: usernameSchema.required(),
        password: passwordSchema.required(),
        deviceToken: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        throw createApiError(400, error.details[0].message);
    }
    next();
};

const ensureUniqueUser = asyncHandler(async (req, res, next) => {
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
        throw createApiError(400, errorMessage);
    }

    // Check if an approver already exists
    if (role === Role.APPROVER) {
        const existingApprover = await User.findOne({ role: Role.APPROVER });
        if (existingApprover) {
            throw createApiError(400, "Max approvers limit reached");
        }
    }
    next();
});

const ensureEmailExists = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        throw createApiError(400, "Email not registered");
    }
    next();
});
//generic validators
const emailValidator = (req, res, next) => {
    const { email } = req.body;
    const { error } = emailSchema.required().validate(email);
    if (error) {
        throw createApiError(400, "Invalid email");
    }
    next();
};
const mobileNoValidator = (req, res, next) => {
    const { mobileNo } = req.body;
    const { error } = mobileNoSchema.required().validate(mobileNo);
    if (error) {
        throw createApiError(400, "Invalid mobile number");
    }
    next();
};
const usernameValidator = (req, res, next) => {
    const { username } = req.body;
    const { error } = usernameSchema.required().validate(username);
    if (error) {
        throw createApiError(
            400,
            "Username must be atleast 5 characters long, and can contain only letters, numbers, and underscores",
        );
    }
    next();
};

const passwordValidator = (req, res, next) => {
    const { password } = req.body;
    const { error } = passwordSchema.required().validate(password);
    if (error) {
        throw createApiError(400, error.details[0].message);
    }
    next();
};

// const verifySession = asyncHandler(async (req, res, next) => {
//     if (req.session.user) {
//         next();
//     } else {
//         throw createError(401, "User not logged in");
//     }
// });
const verifySession = asyncHandler(async (req, res, next) => {
    // const token =
    //     req.cookies.token || req.headers?.authorization?.split(" ")[1];
    const token = req.cookies.token;

    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.session = await Session.findOne({ jti: decoded.jti });
        if (!req.session) {
            res.clearCookie("token");
            throw createApiError(401, "User not logged in");
        }
        next();
    } else {
        throw createApiError(401, "User not logged in");
    }
});
const verifyAlreadyLoggedIn = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;
    console.log(token);
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.session = await Session.findOne({ jti: decoded.jti });
        if (req.session) {
            throw createApiError(400, "User already logged in");
        }
        next();
    }

    next();
});

const authorizeRoles = (roles) => (req, res, next) => {
    if (!roles.includes(req.session.role)) {
        throw createApiError(401, "Access Denied!");
    }
    next();
};

module.exports = {
    registerDetailsValidator,
    loginDetailsValidator,
    ensureUniqueUser,
    ensureEmailExists,
    emailValidator,
    passwordValidator,
    mobileNoValidator,
    usernameValidator,
    verifySession,
    verifyAlreadyLoggedIn,
    authorizeRoles,
};
