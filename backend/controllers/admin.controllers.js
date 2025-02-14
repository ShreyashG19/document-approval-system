const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const config = require("../config/appConfig");
const { Role } = require("../utils/enums");
const { hashPassword } = require("../utils/hashPassword");
const { transporter, MailOptions } = require("../utils/sendEmail");
const getUsersByRole = asyncHandler(async (req, res, next) => {
    const { role } = req.query;
    role.trim().toLowerCase();
    if (!role) {
        const error = new Error("Role is required");
        error.statusCode = 400;
        return next(error);
    }
    if (!Object.values(Role).includes(role)) {
        const error = new Error("Invalid role");
        error.statusCode = 400;
        return next(error);
    }
    if (role === Role.ADMIN) {
        const error = new Error("Admin role is not allowed");
        error.statusCode = 400;
        return next(error);
    }
    const users = await User.find({ role })
        .select(
            "username fullName email role isActive mobileNo assignedApprover"
        )
        .populate("assignedApprover", "username fullName email");

    return res.status(200).json({
        status: true,
        message: "Users fetched successfully",
        users,
    });
});

const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find({ role: { $ne: Role.ADMIN } })
        .select(
            "username fullName email role isActive mobileNo assignedApprover"
        )
        .populate("assignedApprover", "username fullName email");
    return res.status(200).json({
        status: true,
        message: "Users fetched successfully",
        users,
    });
});

const createApprover = asyncHandler(async (req, res, next) => {
    const {
        username,
        fullName,
        email,
        mobileNo,
        password,
        role,
        seniorAssistantUsername,
    } = req.body;
    const userFound = await User.findOne({
        $or: [{ username }, { email }, { mobileNo }],
        isVerified: true,
    });
    if (userFound) {
        const key =
            userFound.username === username
                ? "username"
                : userFound.email === email
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
        username: seniorAssistantUsername,
        isActive: true,
        isVerified: true,
    });
    if (!seniorAssistant) {
        const error = new Error(
            `Senior Assistant ${seniorAssistantUsername} not found`
        );
        error.statusCode = 400;
        return next(error);
    }
    if (!seniorAssistant.isActive) {
        const error = new Error(
            `Senior Assistant ${seniorAssistant.username} is not active`
        );
        error.statusCode = 400;
        return next(error);
    }
    await seniorAssistant.populate({
        path: "createdAssistants",
        select: "-password -encKey",
    });
    await seniorAssistant.populate("assignedApprover");
    if (seniorAssistant.assignedApprover.isActive) {
        const error = new Error(
            `Max Approver limit reached for ${seniorAssistant.username}`
        );
        error.statusCode = 400;
        return next(error);
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await new User({
        username,
        password: hashedPassword,
        fullName,
        email,
        mobileNo,
        role,
        isVerified: true,
    }).save();
    //add assistants in new approver
    newUser.assistants.push(
        seniorAssistant._id,
        ...seniorAssistant.createdAssistants
    );
    await newUser.save();

    //udpate all assistant's approver
    for (let assistant of seniorAssistant.createdAssistants) {
        await User.findByIdAndUpdate(
            assistant,
            { $set: { assignedApprover: newUser._id } },
            { $new: true }
        );
    }
    seniorAssistant.assignedApprover = newUser._id;
    await seniorAssistant.save();

    //send mail
    try {
        const mailOptions = new MailOptions(
            config.authEmail,
            email,
            "Your account credentials",
            `<b>You are now an approver for ${seniorAssistant.fullName}</b><p>Your account credentials for document approval system</p><p><b>Username:</b> ${username}</p><p><b>Password:</b> ${password}</p>`
        );
        await transporter.sendMail(mailOptions);
    } catch (error) {
        //log and ignore the error it thrown
        console.error("Failed to send email:", error);
    }
    return res.status(200).json({
        status: true,
        message: "Approver created successfully",
        data: {
            username,
            email,
            role: "Approver",
            fullName,
        },
    });
});

const createSrAssistant = asyncHandler(async (req, res, next) => {
    const {
        username,
        fullName,
        email,
        mobileNo,
        password,
        role,
        oldSrAssistantUsername,
    } = req.body;
    const userFound = await User.findOne({
        $or: [{ username }, { email }, { mobileNo }],
        isVerified: true,
    });
    if (userFound) {
        const key =
            userFound.username === username
                ? "username"
                : userFound.email === email
                ? "email"
                : "mobileNo";
        const error = new Error(`duplicate user found with ${key}`);
        error.statusCode = 400;
        return next(error);
    }
    //clean up unverified users
    await User.deleteMany({
        $or: [{ username }, { email }, { mobileNo }],
        isVerified: false,
    });

    const oldSrAssistant = await User.findOne({
        username: oldSrAssistantUsername,
        isVerified: true,
    });
    //error if old sr assistant is active
    if (oldSrAssistant.isActive) {
        const error = new Error("Replacing Assistant is not deactivated");
        error.statusCode = 400;
        return next(error);
    }
    await oldSrAssistant.populate("assignedApprover", "username");
    const assignedApprover = await User.findOne({
        username: oldSrAssistant.assignedApprover.username,
        isVerified: true,
    });
    if (!assignedApprover) {
        const error = new Error("Assigned Approver not found");
        error.statusCode = 400;
        return next(error);
    }
    if (!assignedApprover.isActive) {
        const error = new Error("Assigned Approver is not active");
        error.statusCode = 400;
        return next(error);
    }
    const hashedPassword = await hashPassword(password);
    const encKey = crypto.randomBytes(32).toString("hex");
    const newSrAssistant = User.create({
        username,
        password: hashedPassword,
        fullName,
        email,
        mobileNo,
        encKey,
        role: Role.SENIOR_ASSISTANT,
        isVerified: true,
    }).save();
    //new sr assitant is assigned to old sr assistant's approver
    newSrAssistant.assignedApprover = oldSrAssistant.assignedApprover;
    //adding assistants created by old srAssistant to newSrAssistant
    newSrAssistant.createdAssistants.push(...oldSrAssistant.createdAssistants);
    await newSrAssistant.save();
    //replace new srAssistant from assistants list of approver
    await User.findByIdAndUpdate(
        assignedApprover._id,
        { $set: { "assistants.0": newSrAssistant._id } },
        { new: true }
    );
    //update past users list of old SrAssistant
    oldSrAssistant.pastAssignedApprovers.push(oldSrAssistant.assignedApprover);
    oldSrAssistant.pastCreatedAssistants.push(
        ...oldSrAssistant.createdAssistants
    );
    //remove current users from old srAssistant, now old srAssistant one will not
    //will not have rights over assistants, cant updload file
    oldSrAssistant.assignedApprover = null;
    oldSrAssistant.createdAssistants = [];
    await oldSrAssistant.save();

    try {
        const mailOptions = new MailOptions(
            config.authEmail,
            email,
            "Your account credentials",
            `<b>You are now an Senior Assistant for ${assignedApprover.fullName}</b><p>Your account credentials for document approval system</p><p><b>Username:</b> ${username}</p><p><b>Password:</b> ${password}</p>`
        );
        await transporter.sendMail(mailOptions);
    } catch (error) {
        //log and ignore the error it thrown
        console.error("Failed to send email:", error);
    }
    return res.status(200).json({
        status: true,
        message: "Sr Assistant created successfully",
        data: {
            username,
            email,
            role: "Sr Assistant",
            fullName,
        },
    });
});
module.exports = {
    getUsersByRole,
    getAllUsers,
    createApprover,
    createSrAssistant,
};
