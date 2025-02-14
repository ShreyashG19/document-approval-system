const User = require("../models/user.model");
const Joi = require("joi");
const { Role } = require("../utils/enums");
const asyncHandler = require("../utils/asyncHandler");

const createApproverValidationSchema = Joi.object({
    username: Joi.string().min(2).required(),
    fullName: Joi.string().min(2).required(),
    mobileNo: Joi.number().min(10).max(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(2).required(),
    role: Joi.string().valid(Role.APPROVER).required(),
    seniorAssistantUsername: Joi.string().min(2).required(),
});

const createApproverValidator = (req, res, next) => {
    const { error } = createApproverValidationSchema.validate(req.body);
    if (error) {
        error.statusCode = 400;
        return next(error);
    }
    // trim everything, lowercase some fields
    req.body.username = req.body.username.trim().toLowerCase();
    req.body.email = req.body.email.trim().toLowerCase();
    req.body.mobileNo = req.body.mobileNo.trim().toLowerCase();
    req.body.fullName = req.body.fullName.trim().toLowerCase();
    req.body.seniorAssistantUsername = req.body.seniorAssistantUsername
        .trim()
        .toLowerCase();
    req.body.password = req.body.password.trim();
    req.body.role = req.body.role.trim();
    next();
};

const createSrAssistantValidatorSchema = Joi.object({
    username: Joi.string().min(2).required(),
    fullName: Joi.string().min(2).required(),
    mobileNo: Joi.number().min(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(2).required(),
    role: Joi.string().valid(Role.ASSISTANT).required(),
    approverUsername: Joi.string().min(2).required(),
});

const createSrAssistantValidator = (req, res, next) => {
    const { error } = createSrAssistantValidatorSchema.validate(req.body);
    if (error) {
        error.statusCode = 400;
        return next(error);
    }
    // trim everything, lowercase some fields
    req.body.username = req.body.username.trim().toLowerCase();
    req.body.email = req.body.email.trim().toLowerCase();
    req.body.mobileNo = req.body.mobileNo.trim().toLowerCase();
    req.body.fullName = req.body.fullName.trim().toLowerCase();
    req.body.approverUsername = req.body.approverUsername.trim().toLowerCase();
    req.body.password = req.body.password.trim();
    req.body.role = req.body.role.trim();
    next();
};

module.exports = {
    createApproverValidator,
    createSrAssistantValidator,
};
