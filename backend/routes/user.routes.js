const express = require("express");
const { signIn, signUp } = require("../controllers/user.controllers");
const {
    signUpDetailsValidator,
    signiInDetailsValidator,
} = require("../middlewares/user.middlewares");

const router = express.Router();

router.post("/signup", signUpDetailsValidator, signUp);
router.post("/signin", signiInDetailsValidator, signIn);
module.exports = router;
