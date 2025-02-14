const User = require("../models/user.model");
const { hashPassword } = require("../utils/hashPassword");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");

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

module.exports = { register };
