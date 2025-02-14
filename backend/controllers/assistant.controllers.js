const User = require("../models/user.model");
const config = require("../config/appConfig");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { hashPassword, verifyPassword } = require("../utils/hashPassword");
const { transporter, MailOptions } = require("../utils/sendEmail");
const asyncHandler = require("../utils/asyncHandler");
const { Role } = require("../utils/enums");

const createAssistant = asyncHandler(async (req, res, next) => {
    let { username, password, fullName, email, mobileNo } = req.body;
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();
    mobileNo = mobileNo.trim().toLowerCase();
    fullName = fullName.trim().toLowerCase();
    const existingVerifiedUser = await User.findOne({
        $or: [{ username }, { email }, { mobileNo }],
        isVerified: true,
    });
    if (existingVerifiedUser) {
        const key =
            existingVerifiedUser.username === username
                ? "username"
                : existingVerifiedUser.email === email
                ? "email"
                : "mobileNo";
        const error = new Error(`duplicate user found with ${key}`);
        error.statusCode = 400;
        return next(error);
    }
    await User.deleteMany({
        $or: [{ username }, { email }, { mobileNo }],
        isVerified: false,
    });
    const seniorAssistant = await User.findOne({
        username: req.user.username,
        isVerified: true,
    });
    const assignedApprover = seniorAssistant.assignedApprover;
    // const privateKey = crypto
    //     .randomBytes(32)
    //     .toString("base64")
    //     .replace(/[+/]/g, (m) => (m === "+" ? "-" : "_"));

    const encKey = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await hashPassword(password); // Using argon2 to hash the password

    const newUser = await new User({
        username,
        password: hashedPassword,
        fullName,
        email,
        mobileNo,
        encKey,
        role: Role.ASSISTANT,
        assignedApprover,
        isVerified: true,
    }).save();

    const approver = await User.findById(assignedApprover);
    approver.assistants.push(newUser._id);
    await approver.save();
    newUser.save().then(async () => {
        const mailOptions = new MailOptions(
            config.authEmail,
            email,
            "Your account credentials",
            `<b>You are now an assistant colleague for ${seniorAssistant.fullName}</b><p>Your account credentials for document approval system</p><p><b>Username:</b> ${username}</p><p><b>Password:</b> ${password}</p>`
        );
        await transporter.sendMail(mailOptions);
        //save new user in senior assistant's assistants list
        seniorAssistant.createdAssistants.push(newUser._id);
        await seniorAssistant.save();
        return res.status(200).json({
            status: true,
            message: "Assistant created successfully",
            data: {
                username,
                email,
                role: Role.ASSISTANT,
                fullName,
            },
        });
    });
});

const createApprover = asyncHandler(async (req, res, next) => {
    const seniorAssistant = await User.findOne({
        username: req.user.username,
        isVerified: true,
    });
    if (seniorAssistant.assignedApprover) {
        const error = new Error("Max Approver limit reached!");
        error.statusCode = 400;
        return next(error);
    }
    let { username, password, fullName, email, mobileNo } = req.body;
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();
    mobileNo = mobileNo.trim().toLowerCase();
    fullName = fullName.trim().toLowerCase();
    console.log("username", username);
    console.log("email", email);
    console.log("mobileNo", mobileNo);
    console.log("fullName", fullName);
    const existingVerifiedUser = await User.findOne({
        $or: [{ username }, { email }, { mobileNo }],
        isVerified: true,
    });
    if (existingVerifiedUser) {
        const key =
            existingVerifiedUser.username === username
                ? "username"
                : existingVerifiedUser.email === email
                ? "email"
                : "mobileNo";
        const error = new Error(`duplicate user found with ${key}`);
        error.statusCode = 400;
        return next(error);
    }
    await User.deleteMany({
        $or: [{ username }, { email }, { mobileNo }],
        isVerified: false,
    });

    // Hash the password using argon2
    const hashedPassword = await hashPassword(password);

    const newUser = await new User({
        username,
        password: hashedPassword,
        fullName,
        email,
        mobileNo,
        role: Role.APPROVER,
        isVerified: true,
    }).save();

    newUser.assistants.push(
        seniorAssistant._id,
        ...seniorAssistant.createdAssistants
    );
    await newUser.save();

    for (let assistant of seniorAssistant.createdAssistants) {
        await User.findByIdAndUpdate(
            assistant,
            { $set: { assignedApprover: newUser._id } },
            { $new: true }
        );
    }
    seniorAssistant.assignedApprover = newUser._id;
    await seniorAssistant.save();

    const mailOptions = new MailOptions(
        config.authEmail,
        email,
        "Your account credentials",
        `<b>You are now an approver for ${seniorAssistant.fullName}</b><p>Your account credentials for document approval system</p><p><b>Username:</b> ${username}</p><p><b>Password:</b> ${password}</p>`
    );
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
        status: true,
        message: "Approver created successfully",
        data: {
            username,
            email,
            role: Role.APPROVER,
            fullName,
        },
    });
});

const createUser = asyncHandler(async (req, res, next) => {
    const { role } = req.body;
    if (role === Role.ASSISTANT) {
        await createAssistant(req, res, next);
    } else if (role === Role.APPROVER) {
        await createApprover(req, res, next);
    }
});

const getCreatedAssistants = asyncHandler(async (req, res, next) => {
    const seniorAssistant = await req.user.populate({
        path: "createdAssistants",
        select: "-password -encKey",
    });
    if (seniorAssistant.createdAssistants.length === 0) {
        const error = new Error("No assistants created");
        error.statusCode = 400;
        return next(error);
    }
    return res.status(200).json({
        status: true,
        message: "Assistants fetched successfully",
        assistants: seniorAssistant.createdAssistants,
    });
});

const getApprover = asyncHandler(async (req, res, next) => {
    const seniorAssistant = await req.user.populate({
        path: "assignedApprover",
        select: "-password -encKey",
    });
    if (!seniorAssistant.assignedApprover) {
        const error = new Error("No approver assigned");
        error.statusCode = 400;
        return next(error);
    }
    return res.status(200).json({
        status: true,
        message: "Approver fetched successfully",
        approver: seniorAssistant.assignedApprover,
    });
});

module.exports = {
    createUser,
    getCreatedAssistants,
    getApprover,
};
