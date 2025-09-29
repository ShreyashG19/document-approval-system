const createApiError = require("../utils/createApiError");
const ApiResponse = require("../utils/ApiResponse");
const Department = require("../models/department.model");

const getAllDepartments = asyncHandler(async (req, res, next) => {
    const departments = await Department.find({});
    const departmentNames = departments.map((dept) => dept.departmentName);

    return res.status(200).json(
        new ApiResponse(200, "Successfully fetched all departments", {
            departments: departmentNames,
        }),
    );
});

const addDepartment = asyncHandler(async (req, res, next) => {
    let { departmentName } = req.body;
    departmentName = departmentName.trim().toLowerCase();
    const departmentExists = await Department.findOne({
        departmentName,
    });
    if (departmentExists) {
        throw createApiError(400, "Department already exists");
    }
    const newDepartment = new Department({
        departmentName,
    });
    await newDepartment.save();

    return res.status(201).json(
        new ApiResponse(201, "Department added successfully", {
            department: newDepartment.departmentName,
        }),
    );
});

module.exports = { getAllDepartments, addDepartment };
