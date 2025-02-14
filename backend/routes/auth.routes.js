const express = require("express");
const router = express.Router();
const {
    registerDetailsValidator,
    userExistsValidator,
    loginDetailsValidator,
    checkLoggedIn,
    checkIsAdmin,
} = require("../middlewares/auth.middlewares");
const { register, login } = require("../controllers/auth.controllers");

//todo: allow for only admin
router.post(
    "/register",
    checkLoggedIn,
    checkIsAdmin,
    registerDetailsValidator,
    userExistsValidator,
    register
);

router.post("/login", loginDetailsValidator, login);
module.exports = router;
