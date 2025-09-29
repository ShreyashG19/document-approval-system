const express = require("express");
const router = express.Router();
const Department = require("../models/department.model");
const { Role } = require("../utils/enums");
const asyncHandler = require("../utils/asyncHandler");
const {
    getAllDepartments,
    addDepartment,
} = require("../controllers/department.controllers");
const {
    verifySession,
    authorizeRoles,
} = require("../middlewares/auth.middlewares");

router.get(
    "/get-all-departments",
    verifySession,
    authorizeRoles([Role.ASSISTANT, Role.ADMIN, Role.APPROVER]),
    getAllDepartments,
);

router.post(
    "/add-department",
    verifySession,
    authorizeRoles([Role.ADMIN, Role.ASSISTANT]),
    addDepartment,
);

module.exports = router;
