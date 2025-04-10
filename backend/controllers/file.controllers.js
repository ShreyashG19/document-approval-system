const path = require("path");
const fs = require("fs");
const File = require("../models/file.model");
const Notification = require("../models/notification.model");
const Department = require("../models/department.model");
const Session = require("../models/session.model");
const asyncHandler = require("../utils/asyncHandler");
const appConfig = require("../config/appConfig");
const { NotificationService } = require("../utils/NotificationService");
const { Role, FileStatus } = require("../utils/enums");
const forge = require("node-forge");
const crypto = require("crypto");
const User = require("../models/user.model");
const createError = require("../utils/createError");

const uploadPdf = asyncHandler(async (req, res, next) => {
  //only take description if available
  console.log("req.session", req.session);
  const approver = await User.findOne({ role: Role.APPROVER });
  if (!approver) {
    const error = new Error("No approver found");
    error.statusCode = 403;
    return next(error);
  }

  if (!approver.isActive) {
    const error = new Error("Approver is not active");
    error.statusCode = 403;
    return next(error);
  }

  // const currentUser = await User.findOne({ username: req.session.username });
  await req.session.populate("user");
  const currentUser = req.session.user;

  const { department, title, description = null } = req.body;
  const file = req.file;
  const fileUniqueName = file.filename;
  const filePath = file.path;
  const newFile = await new File({
    fileUniqueName,
    filePath,
    createdBy: currentUser._id,
    // assignedTo: req.user.assignedApprover,
    department,
    title,
    description,
    status: FileStatus.PENDING,
  }).save();

  const populatedFile = await newFile.populate([
    { path: "createdBy", select: "fullName" },
  ]);

  const notification = new Notification({
    title: newFile.title,
    body: `${newFile.title} has been uploaded`,
    to: approver._id,
    type: FileStatus.PENDING,
  });
  await notification.save();
  // await newFile.populate("assignedTo");

  const approverSessions = await Session.find({
    username: approver.username,
  });

  if (approverSessions.length > 0) {
    for (const session of approverSessions) {
      await NotificationService.sendNotification(
        session.deviceToken,
        notification.title,
        notification.body
      );
    }
  }

  // for (const token of deviceTokens) {
  //     if (token) {
  //         console.log("token", token);
  //         await NotificationService.sendNotification(
  //             token,
  //             notification.title,
  //             notification.body,
  //         );
  //         console.log("title", notification.title);
  //         console.log("body", notification.body);
  //     }
  // }

  return res.status(200).json({
    status: true,
    message: "File uploaded successfully",
    file: {
      fileName: populatedFile.fileUniqueName,
      createdBy: populatedFile.createdBy.fullName,
      assignedTo: approver.fullName,
      title: populatedFile.title,
      description: populatedFile.description,
    },
  });
});
 
const downloadPdf = asyncHandler(async (req, res, next) => {
  const fileName = req.params.filename;
  console.log("fileName", fileName);
  const file = await File.findOne({ fileUniqueName: fileName });
  if (!file) {
    const error = new Error("File not found");
    error.status = 404;
    return next(error);
  }
  await req.session.populate("user");

  

  if (
    req.session.user.role === Role.ASSISTANT &&
    file.createdBy.toString() !== req.session.user.id
  ) {
    const error = new Error("You are not authorized to download this file");
    error.status = 403;
    return next(error);
  }

  const filePath = path.join(appConfig.baseUploadDir, file.fileUniqueName);
  if (!fs.existsSync(filePath)) {
    const error = new Error("File not found");
    error.status = 404;
    return next(error);
  }
  const fileContent = fs.readFileSync(filePath, "utf8");
  res.send(fileContent);
});

const fetchDocuments = async (query, sortOptions) => {
  return await File.find(query)
    .sort(sortOptions)
    .populate("department")
    .populate("createdBy", "fullName username email role");
};

const getDocumentsByQuery = asyncHandler(async (req, res, next) => {
  let {
    department,
    startDate,
    endDate,
    sortBy,
    status,
    createdBy,
    assignedTo,
  } = req.query;
  let query = {};
  let sortOptions = {};
  const fileStatuses = [
    FileStatus.APPROVED,
    FileStatus.PENDING,
    FileStatus.REJECTED,
    FileStatus.CORRECTION,
  ];
  if (!status) {
    const error = new Error("please provide status");
    error.status = 400;
    return next(error);
  }
  const requestedStatuses = status.toLowerCase().split("-");
  const invalidStatuses = requestedStatuses.filter(
    (status) => !fileStatuses.includes(status)
  );

  if (invalidStatuses.length > 0) {
    const error = new Error(
      `Invalid status values: ${invalidStatuses.join(", ")}`
    );
    error.status = 400;
    return next(error);
  }

  // $in operator to match any of the provided statuses
  query.status = { $in: requestedStatuses };

  // if (!fileStatuses.includes(status.toLowerCase())) {
  //     const error = new Error("Invalid status");
  //     error.status = 400;
  //     return next(error);
  // }
  // query.status = status.toLowerCase();
  await req.session.populate("user");
  switch (req.session.user.role) {
    case Role.ASSISTANT:
      if (createdBy) {
        const error = new Error("Access denied");
        error.status = 401;
        return next(error);
      }
      query.createdBy = req.session.user._id;
      break;
    case Role.APPROVER:
    case Role.ADMIN:
      if (createdBy) {
        const user = await User.findOne({ username: createdBy });
        query.createdBy = user._id;
      }
      break;
    default:
      const error = new Error("Unauthorized role to fetch documents");
      error.status = 403;
      return next(error);
  }

  // Apply department filter if provided
  if (department) {
    const dept = await Department.findOne({ departmentName: department });
    if (dept) {
      query.department = dept._id;
    } else {
      const error = new Error(`Department ${department} not found`);
      error.status = 403;
      return next(error);
    }
  }

  // Apply date range filter if provided
  if (startDate || endDate) {
    try {
      query.createdDate = {};

      if (startDate) {
        const startDateTime = new Date(startDate);
        if (isNaN(startDateTime.getTime())) {
          throw new Error("Invalid start date");
        }
        startDateTime.setUTCHours(0, 0, 0, 0);
        query.createdDate.$gte = startDateTime;
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        if (isNaN(endDateTime.getTime())) {
          throw new Error("Invalid end date");
        }
        endDateTime.setUTCHours(23, 59, 59, 999);
        query.createdDate.$lte = endDateTime;
      }

      if (
        startDate &&
        endDate &&
        query.createdDate.$gte > query.createdDate.$lte
      ) {
        throw new Error("Start date cannot be after end date");
      }
    } catch (error) {
      return next({
        status: 400,
        message: error.message,
      });
    }
  }

  // Apply sorting if provided
  if (sortBy) {
    const [field, order] = sortBy.split(":");
    sortOptions[field] = order === "desc" ? -1 : 1;
  } else {
    // Default sort by createdDate descending
    sortOptions = { createdDate: -1 };
  }
  console.log("query", query);
  const documents = await fetchDocuments(query, sortOptions);
  return res.status(200).json({
    status: true,
    message: "documents fetched successfully",
    documents,
  });
});

const updateFileStatus = asyncHandler(async (req, res, next) => {
  let { fileUniqueName, status, remarks } = req.body;
  if (!fileUniqueName) {
    const error = new Error("Please provide fileUniqueName");
    error.status = 400;
    return next(error);
  }
  fileUniqueName = fileUniqueName.trim();
  status = status.trim().toLowerCase();
  remarks = remarks?.trim();

  // Validate status
  if (!Object.values(FileStatus).includes(status)) {
    const error = new Error("Invalid status");
    error.status = 400;
    return next(error);
  }

  const file = await File.findOne({ fileUniqueName });
  if (!file) {
    const error = new Error("File not found");
    error.status = 404;
    return next(error);
  }
  if (
    file.status === FileStatus.REJECTED ||
    file.status === FileStatus.CORRECTION ||
    file.status === FileStatus.APPROVED
  ) {
    const error = new Error(
      "Cannot update file status to " + status.toLowerCase()
    );
    error.status = 400;
    return next(error);
  }

  if (status === FileStatus.CORRECTION && !remarks) {
    const error = new Error("Remarks are required for correction");
    error.status = 400;
    return next(error);
  }

  // Update status and corresponding date
  file.status = status;
  file.remarks = remarks || "";

  // Update status-specific dates
  const dateFields = {
    [FileStatus.APPROVED]: "approvedDate",
    [FileStatus.REJECTED]: "rejectedDate",
    [FileStatus.CORRECTION]: "correctionDate",
  };

  if (dateFields[status]) {
    file[dateFields[status]] = new Date();
  }

  await file.save();
  const notification = new Notification({
    title: file.title,
    body: `File ${file.title} has been ${status.toLowerCase()}`,
    to: file.createdBy,
    type: status.toLowerCase(),
  });
  await notification.save();
  await file.populate("createdBy");
  const assistantSessions = await Session.find({
    username: file.createdBy.username,
  });

  if (assistantSessions.length > 0) {
    for (const session of assistantSessions) {
      await NotificationService.sendNotification(
        session.deviceToken,
        notification.title,
        notification.body
      );
    }
  }
  return res.status(200).json({
    status: true,
    message: `File ${status.toLowerCase()} successfully`,
    file: {
      fileName: file.fileUniqueName,
      createdBy: file.createdBy.fullName,
      title: file.title,
      description: file.description,
      status: file.status,
    },
  });
});

// Usage examples:
const approveDocument = asyncHandler((req, res, next) => {
  req.body.status = FileStatus.APPROVED;
  return updateFileStatus(req, res, next);
});

const rejectDocument = asyncHandler((req, res, next) => {
  req.body.status = FileStatus.REJECTED;
  return updateFileStatus(req, res, next);
});

const requestCorrection = asyncHandler((req, res, next) => {
  req.body.status = FileStatus.CORRECTION;
  return updateFileStatus(req, res, next);
});

const getEncKeyByFileName = asyncHandler(async (req, res, next) => {
  const { clientPublicKey, fileUniqueName } = req.body;
  if (!clientPublicKey || !fileUniqueName) {
    const error = new Error(
      "Please provide clientPublicKey and fileUniqueName"
    );
    error.status = 400;
    return next(error);
  }
  const file = await File.findOne({ fileUniqueName })
    .populate("createdBy")
    .select("encKey");
  if (!file) {
    const error = new Error("File not found");
    error.status = 404;
    return next(error);
  }

  const { encKey } = file.createdBy;
  const publicKey = forge.pki.publicKeyFromPem(clientPublicKey);
  // Encrypt the encKey using RSA-OAEP
  const encryptedEncKey = publicKey.encrypt(encKey, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
  return res.status(200).json({
    status: true,
    message: "Encrypted key fetched successfully",
    encryptedEncKey: forge.util.encode64(encryptedEncKey),
  });
});

const getOwnEncKey = asyncHandler(async (req, res, next) => {
  const { clientPublicKey } = req.body;
  if (!clientPublicKey) {
    const error = new Error("Please provide clientPublicKey");
    error.status = 400;
    return next(error);
  }
  await req.session.populate("user");
  const { encKey } = req.session.user;
  const publicKey = forge.pki.publicKeyFromPem(clientPublicKey);
  // Encrypt the encKey using RSA-OAEP
  const encryptedEncKey = publicKey.encrypt(encKey, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
  return res.status(200).json({
    status: true,
    message: "Encrypted key fetched successfully",
    encryptedEncKey: forge.util.encode64(encryptedEncKey),
  });
});
const getEncKey = asyncHandler(async (req, res, next) => {
  if (req.session.role === Role.APPROVER || req.session.role === Role.ADMIN) {
    return getEncKeyByFileName(req, res, next);
  } else {
    return getOwnEncKey(req, res, next);
  }
});
module.exports = {
  uploadPdf,
  downloadPdf,
  getDocumentsByQuery,
  approveDocument,
  rejectDocument,
  requestCorrection,
  getEncKey,
};
