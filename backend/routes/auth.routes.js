const express = require("express");
const router = express.Router();
const {
    registerDetailsValidator,
    userExistsValidator,
    emailValidator,
    mobileNoValidator,
} = require("../middlewares/auth.middlewares");
const {
    sendOTPEmail,
    verifyAndRegister,
} = require("../controllers/auth.controllers");
const { otpValidator } = require("../middlewares/otp.middlwares");

//todo: change the route to /register or something, suppose if i need to change password and get otp
router.post("/send-otp", emailValidator, mobileNoValidator, sendOTPEmail);

router.post(
    "/verify-and-register",
    registerDetailsValidator,
    otpValidator,
    userExistsValidator,
    verifyAndRegister
);

module.exports = router;
