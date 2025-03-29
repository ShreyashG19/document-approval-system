const express = require("express");
const router = express.Router();
const {
    registerDetailsValidator,
    ensureUniqueUser,
    ensureEmailExists,
    loginDetailsValidator,
    verifySession,
    verifyAlreadyLoggedIn,
    authorizeRoles,
    emailValidator,
} = require("../middlewares/auth.middlewares");
const {
    register,
    login,
    logout,
    getSession,
} = require("../controllers/auth.controllers");
const { sendOTPEmail } = require("../controllers/otp.controllers");
const { Role } = require("../utils/enums");

router.post(
    "/register",
    verifySession,
    authorizeRoles([Role.ADMIN]),
    registerDetailsValidator,
    ensureUniqueUser,
    register,
);

router.post("/login", loginDetailsValidator, verifyAlreadyLoggedIn, login);
router.post("/logout", verifySession, logout);

// router.post("/send-otp", emailValidator, ensureEmailExists, sendOTPEmail);

router.get("/get-session", verifySession, getSession);
module.exports = router;
