const express = require("express");
const router = express.Router();
const {
    registerDetailsValidator,
    userExistsValidator,
    loginDetailsValidator,
    verifySession,
    authorizeRoles,
} = require("../middlewares/auth.middlewares");
const { register, login, logout } = require("../controllers/auth.controllers");
const { Role } = require("../utils/enums");

//todo: allow for only admin
router.post(
    "/register",
    verifySession,
    authorizeRoles([Role.ADMIN]),
    registerDetailsValidator,
    userExistsValidator,
    register
);

router.post("/login", loginDetailsValidator, login);
router.post("/logout", verifySession, logout);
module.exports = router;
