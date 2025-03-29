const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const { Role } = require("../utils/enums");
const {
    verifySession,
    authorizeRoles,
} = require("../middlewares/auth.middlewares");
const {
    createApproverValidator,
    createSrAssistantValidator,
} = require("../middlewares/admin.middlewares");
const {
    getUsersByRole,
    getAllUsers,
    createApprover,
    createSrAssistant,
} = require("../controllers/admin.controllers");

router.get(
    "/get-users",
    verifySession,
    authorizeRoles([Role.ADMIN]),
    getUsersByRole,
);

router.get(
    "/get-all-users",
    verifySession,
    authorizeRoles([Role.ADMIN]),
    getAllUsers,
);

//only when old approver is deactivated
router.post(
    "/create-approver",
    verifySession,
    createApproverValidator,
    authorizeRoles([Role.ADMIN]),
    createApprover,
);

router.post(
    "/create-sr-assistant",
    verifySession,
    createSrAssistantValidator,
    authorizeRoles([Role.ADMIN]),
    createSrAssistant,
);
module.exports = router;
