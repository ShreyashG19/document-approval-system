const Notification = require("../models/notification.model");
const express = require("express");
const router = express.Router();
const {
    verifySession,
    authorizeRoles,
} = require("../middlewares/auth.middlewares");
const {
    getNotifications,
    markNotificationsAsSeen,
} = require("../controllers/notification.controller");
const { Role } = require("../utils/enums");

router.get(
    "/get-notifications",
    verifySession,
    authorizeRoles([Role.SENIOR_ASSISTANT, Role.ASSISTANT, Role.APPROVER]),
    getNotifications,
);

router.post(
    "/mark-seen",
    verifySession,
    authorizeRoles([Role.SENIOR_ASSISTANT, Role.ASSISTANT, Role.APPROVER]),
    markNotificationsAsSeen,
);

module.exports = router;
