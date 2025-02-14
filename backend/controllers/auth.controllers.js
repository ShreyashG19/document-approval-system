const User = require("../models/user.model");
const { hashPassword, verifyPassword } = require("../utils/hashPassword");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/createError");
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

    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.isActive === false) {
        throw createError(400, "User is deactivated");
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
        throw createError(401, "Invalid username or password");
    }
    if (user.sessionID) {
        req.sessionStore.destroy(user.sessionID, (err) => {
            if (err) console.error("Error destroying previous session:", err);
        });
    }

    //storing device token
    user.deviceToken = deviceToken;

    //Store the new session ID
    user.sessionID = req.sessionID;
    await user.save();

    req.session.user = user.username; // Store user info in session
    req.session.role = user.role;
    console.log("role", req.session.role);
    console.log("user", req.session.user);
    return res.status(200).json({
        success: true,
        message: "Login success!",
        user: {
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
        },
    });
});
module.exports = { register, login };
