const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const { Role } = require("../utils/enums");
const {
    createUserValidator,
    verifySeniorAssistant,
    verifyAssistant,
} = require("../middlewares/assistant.middlewares");
const {
    createUser,
    getCreatedAssistants,
    getApprover,
} = require("../controllers/assistant.controllers");
const {
    verifySession,
    authorizeRoles,
} = require("../middlewares/auth.middlewares");

router.post(
    "/create-user",
    verifySession,
    authorizeRoles([Role.SENIOR_ASSISTANT]),
    createUserValidator,
    createUser,
);

router.get(
    "/get-created-assistants",
    verifySession,
    authorizeRoles([Role.SENIOR_ASSISTANT]),
    getCreatedAssistants,
);

router.get(
    "/get-approver",
    verifySession,
    authorizeRoles([Role.SENIOR_ASSISTANT, Role.ASSISTANT]),
    getApprover,
);

module.exports = router;
