const Notification = require("../models/notification.model");
const asyncHandler = require("../utils/asyncHandler");
const createApiError = require("../utils/createApiError");
const ApiResponse = require("../utils/ApiResponse");

const getNotifications = asyncHandler(async (req, res, next) => {
    await req.session.populate("user");
    const notifications = await Notification.find({
        to: req.session.user._id,
        seen: false,
    })
        .populate("to", "fullName username")
        .sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(200, "Notifications fetched successfully", {
            notifications,
        }),
    );
});

const markNotificationsAsSeen = asyncHandler(async (req, res, next) => {
    await req.session.populate("user");
    await Notification.updateMany(
        {
            to: req.session.user._id,
            seen: false,
        },
        { $set: { seen: true } },
    );
    return res
        .status(200)
        .json(new ApiResponse(200, "Notifications marked as seen"));
});

module.exports = {
    getNotifications,
    markNotificationsAsSeen,
};
