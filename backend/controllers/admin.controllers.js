const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const { Role } = require("../utils/enums");

const getUsersByRole = asyncHandler(async (req, res, next) => {
    const { role } = req.query;
    role.trim().toLowerCase();
    if (!role) {
        const error = new Error("Role is required");
        error.statusCode = 400;
        return next(error);
    }
    if (!Object.values(Role).includes(role)) {
        const error = new Error("Invalid role");
        error.statusCode = 400;
        return next(error);
    }
    if (role === Role.ADMIN) {
        const error = new Error("Admin role is not allowed");
        error.statusCode = 400;
        return next(error);
    }
    const users = await User.find({ role })
        .select(
            "username fullName email role isActive mobileNo assignedApprover"
        )
        .populate("assignedApprover", "username fullName email");

    return res.status(200).json({
        status: true,
        message: "Users fetched successfully",
        users,
    });
});

const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find({ role: { $ne: Role.ADMIN } })
        .select(
            "username fullName email role isActive mobileNo assignedApprover"
        )
        .populate("assignedApprover", "username fullName email");
    return res.status(200).json({
        status: true,
        message: "Users fetched successfully",
        users,
    });
});

module.exports = {
    getUsersByRole,
    getAllUsers,
};
