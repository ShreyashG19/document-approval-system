const mongoose = require("mongoose");
const { Role } = require("../utils/enums");
const SessionSchema = new mongoose.Schema({
    jti: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: [Role.ASSISTANT, Role.APPROVER, Role.ADMIN],
        required: true,
    },
    deviceToken: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        index: { expires: "7d" }, // Creates a TTL index to auto-delete after 7 days
    },
});

const Session = mongoose.model("Session", SessionSchema);
module.exports = Session;
