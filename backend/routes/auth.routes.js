const express = require("express");
const router = express.Router();
const {
    registerDetailsValidator,
    userExistsValidator,
} = require("../middlewares/auth.middlewares");
const { register } = require("../controllers/auth.controllers");

//todo: allow for only admin
router.post(
    "/register",
    registerDetailsValidator,
    userExistsValidator,
    register
);


module.exports = router;
