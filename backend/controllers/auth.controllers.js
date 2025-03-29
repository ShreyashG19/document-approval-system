const User = require("../models/user.model");
const Session = require("../models/session.model");
const { hashPassword, verifyPassword } = require("../utils/hashPassword");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/createError");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const register = asyncHandler(async (req, res, next) => {
    const { username, password, fullName, email, mobileNo, role } = req.body;

    //todo: do i need encKey here?
    const encKey = crypto.randomBytes(32).toString("hex");
    const hash = await hashPassword(password);
    const newUser = await User.create({
        username,
        password: hash,
        fullName,
        email,
        role,
        mobileNo,
        encKey,
    });

    await newUser.save();
    return res.status(200).json({
        status: true,
        message: "User registered successfully",
        data: {
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            fullName: newUser.fullName,
        },
    });
});

const login = asyncHandler(async (req, res) => {
    const { username, password, deviceToken } = req.body;
    let user = await User.findOne({ username });

    if (!user) {
        throw createError(401, "User not found");
    }
    if (!user.isActive) {
        throw createError(400, "User is deactivated");
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
        throw createError(401, "Invalid username or password");
    }

    const jti = uuidv4();
    const token = jwt.sign(
        {
            jti,
            username: user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
    );
    const newSession = await Session.create({
        jti,
        username: user.username,
        role: user.role,
        deviceToken: deviceToken,
        user: user._id,
    });
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 2 days
    });
    return res.status(200).json({
        success: true,
        message: "Login success!",
        user: {
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            mobileNo: user.mobileNo,
            isActive: user.isActive,
        },
    });
});

const logout = asyncHandler(async (req, res) => {
    await Session.findOneAndDelete({ jti: req.session.jti });
    res.clearCookie("token");
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

const getSession = asyncHandler(async (req, res) => {
    await req.session.populate("user");
    const user = req.session.user;
    if (!user) {
        return createError(400, "User not found");
    }
    return res.status(200).json({
        status: true,
        message: "User is logged in",
        user: {
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            mobileNo: user.mobileNo,
            isActive: user.isActive,
        },
    });
});

const terminateUserSession = async (req, username) => {
    await Session.deleteMany({ username });
};
module.exports = { register, login, logout, getSession, terminateUserSession };
