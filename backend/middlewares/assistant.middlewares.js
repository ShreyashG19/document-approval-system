const User = require("../models/user.model");
const Department = require("../models/department.model");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { Role } = require("../utils/enums");
const asyncHandler = require("../utils/asyncHandler");
const config = require("../config/appConfig");
const createUserValidationsSchema = Joi.object({
    username: Joi.string().min(2).required(),
    fullName: Joi.string().min(2).required(),
    mobileNo: Joi.number().min(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(2).required(),
    role: Joi.string().valid(Role.ASSISTANT, Role.APPROVER).required(),
});
const createUserValidator = (req, res, next) => {
    const { error } = createUserValidationsSchema.validate(req.body);
    if (error) {
        error.statusCode = 400;
        return next(error);
    }
    next();
};

const verifySeniorAssistant = asyncHandler(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        const error = new Error("Access Denied!");
        error.statusCode = 401;
        return next(error);
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findOne({
        username: decoded.username,
        isVerified: true,
        isActive: true,
    });
    if (!user) {
        const error = new Error("Access Denied!");
        error.statusCode = 400;
        return next(error);
    }
    if (user.role !== Role.SENIOR_ASSISTANT) {
        throw new Error("Access Denied!");
    }
    req.user = user;
    next();
});

const verifyAssistant = asyncHandler(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        const error = new Error("Access Denied!");
        error.statusCode = 401;
        return next(error);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findOne({
        username: decoded.username,
        isVerified: true,
        isActive: true,
    });
    if (!user) {
        const error = new Error("Access Denied!");
        error.statusCode = 400;
        return next(error);
    }
    if (user.role !== Role.ASSISTANT && user.role !== Role.SENIOR_ASSISTANT) {
        const error = new Error("Access Denied!");
        error.statusCode = 400;
        return next(error);
    }
    req.user = user;
    //temp
    console.log("body: ", req.body);
    next();
});

module.exports = {
    createUserValidator,
    verifySeniorAssistant,
    verifyAssistant,
};
