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

    role: {
        type: String,
        enum: [Role.ASSISTANT, Role.APPROVER, Role.ADMIN],
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
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
