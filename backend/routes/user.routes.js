const express = require("express");
const {
    signOutAll,
    resetPassword,
    updateProfile,
    //v2
    sendCredentials,
    setUserStatus,
    getUsers,
} = require("../controllers/user.controllers");
const {
    resetPasswordValidator,
    //v2
    updateProfileValidator,
} = require("../middlewares/user.middlewares");
const {
    verifySession,
    authorizeRoles,
    emailValidator,
    passwordValidator,
    usernameValidator,
} = require("../middlewares/auth.middlewares");
const { Role } = require("../utils/enums");
const router = express.Router();

router.post("/signout-all", verifySession, signOutAll);

//v2
router.post(
    "/send-credentials",
    verifySession,
    authorizeRoles([Role.ADMIN]),
    emailValidator,
    passwordValidator,
    usernameValidator,
    sendCredentials,
);

// router.post("/reset-password", resetPasswordValidator, resetPassword);

router.post(
    "/update-profile",
    verifySession,
    authorizeRoles([Role.ADMIN]),
    updateProfileValidator,
    updateProfile,
);

router.post(
    "/set-user-status",
    verifySession,
    authorizeRoles([Role.ADMIN]),
    usernameValidator,
    setUserStatus,
);

router.get("/get-users", verifySession, authorizeRoles([Role.ADMIN]), getUsers);

module.exports = router;
