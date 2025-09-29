const User = require("../models/user.model");
const Department = require("../models/department.model");
const createApiError = require("../utils/createApiError");
const { Role } = require("../utils/enums");
const asyncHandler = require("../utils/asyncHandler");
const Joi = require("joi");
const verifyFileAtrributes = asyncHandler(async (req, res, next) => {
    const fileAttributesSchema = Joi.object({
        department: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().optional(),
    });
    const { error } = fileAttributesSchema.validate(req.body);
    console.log("body : ", req.body);
    if (error) {
        throw createApiError(400, error.details[0].message);
    }

    const department = await Department.findOne({
        departmentName: req.body.department,
    });

    if (!department) {
        throw createApiError(400, `${req.body.department} not found!`);
    }
    req.body.department = department._id;
    next();
});

module.exports = {
    verifyFileAtrributes,
};
