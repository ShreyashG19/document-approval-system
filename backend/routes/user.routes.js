const express = require("express");
const {
    signIn,
    signUp,
    signOut,
    signOutAll,
    // verifyOTP,
    resendOTPAndVerify,
    checkAuthStatus,
    sendPasswordResetOTP,
    resetPassword,
    verifySpOTP,
    updateProfile,
    changeUserStatus,
    getAssistants,
    //v2
    sendCredentials,
} = require("../controllers/user.controllers");
const {
    signUpDetailsValidator,
    signiInDetailsValidator,
    verifyToken,
    verifySpToken,
    verifyEmailExists,
    verifyOldPassword,
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

router.post("/signup", signUpDetailsValidator, signUp);
router.post("/signin", signiInDetailsValidator, signIn);
router.post("/signout", verifyToken, signOut);
router.post("/signout-all", verifyToken, signOutAll);
router.get("/status", verifyToken, checkAuthStatus);

// router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTPAndVerify);

router.post(
    "/send-password-reset-otp",
    verifyEmailExists,
    sendPasswordResetOTP
);
router.post("/verify-sp-otp", verifySpOTP);
// router.post("/reset-password", verifySpToken, resetPassword);
router.post("/change-password", verifyToken, verifyOldPassword, resetPassword);
// router.post("/update-profile", verifyToken, updateProfile);

//route for toggling user status
router.post(
    "/change-user-status",
    verifyToken,
    authorizeRoles([Role.SENIOR_ASSISTANT, Role.ADMIN]),
    changeUserStatus
);

router.get(
    "/get-assistants",
    verifyToken,
    authorizeRoles([Role.APPROVER]),
    getAssistants
);

//v2
router.post(
    "/send-credentials",
    verifySession,
    authorizeRoles([Role.ADMIN]),
    emailValidator,
    passwordValidator,
    usernameValidator,
    sendCredentials
);

// router.post("/reset-password", resetPasswordValidator, resetPassword);

router.post(
    "/update-profile",
    verifySession,
    authorizeRoles([Role.ADMIN]),
    updateProfileValidator,
    updateProfile
);
module.exports = router;
