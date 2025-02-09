const mongoose = require("mongoose");
const { Role } = require("../utils/enums");
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobileNo: {
        type: Number,
        required: true,
        unique: true,
    },
    encKey: {
        type: String,
    },
    assignedApprover: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    pastAssignedApprovers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
    },
    assistants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
    },
    createdAssistants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
    },
    pastCreatedAssistants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
    },
    role: {
        type: String,
        enum: [
            Role.SENIOR_ASSISTANT,
            Role.ASSISTANT,
            Role.APPROVER,
            Role.ADMIN,
        ],
        default: Role.SENIOR_ASSISTANT,
        required: true,
    },
    deviceTokens: {
        type: [String],
        default: [],
    },
    validJtis: {
        type: [String],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
