const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const { Role } = require("../utils/enums");
const {
    verifyToken,
    authorizeRoles,
} = require("../middlewares/user.middlewares");

const {
    getUsersByRole,
    getAllUsers,
} = require("../controllers/admin.controllers");

router.get(
    "/get-users",
    verifyToken,
    authorizeRoles([Role.ADMIN]),
    getUsersByRole
);

router.get(
    "/get-all-users",
    verifyToken,
    authorizeRoles([Role.ADMIN]),
    getAllUsers
);
module.exports = router;
