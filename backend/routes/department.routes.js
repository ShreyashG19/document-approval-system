const express = require("express");
const router = express.Router();
const Department = require("../models/department.model");
const { Role } = require("../utils/enums");
const { verifyFileAtrributes } = require("../middlewares/file.middlewares");
const asyncHandler = require("../utils/asyncHandler");
const {
    verifyToken,
    authorizeRoles,
} = require("../middlewares/user.middlewares");

router.get(
    "/get-all-departments",
    verifyToken,
    authorizeRoles([
        Role.SENIOR_ASSISTANT,
        Role.ASSISTANT,
        Role.ADMIN,
        Role.APPROVER,
    ]),
    asyncHandler(async (req, res, next) => {
        const departments = await Department.find({});
        if (departments.length === 0) {
            const error = new Error("No departments found");
            error.status = 404;
            next(error);
        }
        const departmentNames = departments.map((dept) => dept.departmentName);
        res.status(200).json({
            status: true,
            message: "Successfully fetched all departments",
            data: departmentNames,
        });
    })
);

router.post(
    "/add-department",
    verifyToken,
    authorizeRoles([Role.ADMIN, Role.SENIOR_ASSISTANT, Role.ASSISTANT]),
    asyncHandler(async (req, res, next) => {
        let { departmentName } = req.body;
        departmentName = departmentName.trim().toLowerCase();
        const departmentExists = await Department.findOne({
            departmentName,
        });
        if (departmentExists) {
            const error = new Error("Department already exists");
            error.status = 400;
            next(error);
        }
        const newDepartment = new Department({
            departmentName,
        });
        await newDepartment.save();
        res.status(201).json({
            status: true,
            message: "Department added successfully",
            department: newDepartment.departmentName,
        });
    })
);

module.exports = router;
