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
const createApiError = require("../utils/createApiError");
const ApiResponse = require("../utils/ApiResponse");

const uploadPdf = asyncHandler(async (req, res, next) => {
  //only take description if available
  console.log("req.session", req.session);
  const approver = await User.findOne({ role: Role.APPROVER });
  if (!approver) {
    throw createApiError(403, "No approver found");
  }

  if (!approver.isActive) {
    throw createApiError(403, "Approver is not active");
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
  return res.status(200).json(new ApiResponse(200, "File uploaded successfully", {
    file: {
      fileName: populatedFile.fileUniqueName,
      createdBy: populatedFile.createdBy.fullName,
      assignedTo: approver.fullName,
      title: populatedFile.title,
      description: populatedFile.description,
    },
  }));
});
 
const downloadPdf = asyncHandler(async (req, res, next) => {
  const fileName = req.params.filename;
  console.log("fileName", fileName);
  const file = await File.findOne({ fileUniqueName: fileName });
  if (!file) {
    throw createApiError(404, "File not found");
  }
  await req.session.populate("user");

  

  if (
    req.session.user.role === Role.ASSISTANT &&
    file.createdBy.toString() !== req.session.user.id
  ) {
    throw createApiError(403, "You are not authorized to download this file");
  }

  const filePath = path.join(appConfig.baseUploadDir, file.fileUniqueName);
  if (!fs.existsSync(filePath)) {
    throw createApiError(404, "File not found");
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
    throw createApiError(400, "please provide status");
  }
  const requestedStatuses = status.toLowerCase().split("-");
  const invalidStatuses = requestedStatuses.filter(
    (status) => !fileStatuses.includes(status)
  );

  if (invalidStatuses.length > 0) {
    throw createApiError(400, `Invalid status values: ${invalidStatuses.join(", ")}`);
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
        throw createApiError(401, "Access denied");
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
      throw createApiError(403, "Unauthorized role to fetch documents");
  }

  // Apply department filter if provided
  if (department) {
    const dept = await Department.findOne({ departmentName: department });
    if (dept) {
      query.department = dept._id;
    } else {
      throw createApiError(403, `Department ${department} not found`);
    }
  }

  // Apply date range filter if provided
  if (startDate || endDate) {
    try {
      query.createdDate = {};

      if (startDate) {
        const startDateTime = new Date(startDate);
        if (isNaN(startDateTime.getTime())) {
          throw createApiError(400, "Invalid start date");
        }
        startDateTime.setUTCHours(0, 0, 0, 0);
        query.createdDate.$gte = startDateTime;
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        if (isNaN(endDateTime.getTime())) {
          throw createApiError(400, "Invalid end date");
        }
        endDateTime.setUTCHours(23, 59, 59, 999);
        query.createdDate.$lte = endDateTime;
      }

      if (
        startDate &&
        endDate &&
        query.createdDate.$gte > query.createdDate.$lte
      ) {
        throw createApiError(400, "Start date cannot be after end date");
      }
    } catch (error) {
      throw createApiError(400, error.message);
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
  return res.status(200).json(new ApiResponse(200, "documents fetched successfully", {
    documents
  }));
});

const updateFileStatus = asyncHandler(async (req, res, next) => {
  let { fileUniqueName, status, remarks } = req.body;
  if (!fileUniqueName) {
    throw createApiError(400, "Please provide fileUniqueName");
  }
  fileUniqueName = fileUniqueName.trim();
  status = status.trim().toLowerCase();
  remarks = remarks?.trim();

  // Validate status
  if (!Object.values(FileStatus).includes(status)) {
    throw createApiError(400, "Invalid status");
  }

  const file = await File.findOne({ fileUniqueName });
  if (!file) {
    throw createApiError(404, "File not found");
  }
  if (
    file.status === FileStatus.REJECTED ||
    file.status === FileStatus.CORRECTION ||
    file.status === FileStatus.APPROVED
  ) {
    throw createApiError(400, "Cannot update file status to " + status.toLowerCase());
  }

  if (status === FileStatus.CORRECTION && !remarks) {
    throw createApiError(400, "Remarks are required for correction");
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

  return res.status(200).json(new ApiResponse(200, `File ${status.toLowerCase()} successfully`, {
    file: {
      fileName: file.fileUniqueName,
      createdBy: file.createdBy.fullName,
      title: file.title,
      description: file.description,
      status: file.status,
    }}));
  
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
    throw createApiError(400, "Please provide clientPublicKey and fileUniqueName");
  }
  const file = await File.findOne({ fileUniqueName })
    .populate("createdBy")
    .select("encKey");
  if (!file) {
    throw createApiError(404, "File not found");
  }

  const { encKey } = file.createdBy;
  const publicKey = forge.pki.publicKeyFromPem(clientPublicKey);
  // Encrypt the encKey using RSA-OAEP
  const encryptedEncKey = publicKey.encrypt(encKey, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });

  return res.status(200).json(new ApiResponse(200, "Encrypted key fetched successfully",
    {
      encryptedEncKey: forge.util.encode64(encryptedEncKey),
    }
  ));
});

const getOwnEncKey = asyncHandler(async (req, res, next) => {
  const { clientPublicKey } = req.body;
  if (!clientPublicKey) {
    throw createApiError(400, "Please provide clientPublicKey");
  }
  await req.session.populate("user");
  const { encKey } = req.session.user;
  const publicKey = forge.pki.publicKeyFromPem(clientPublicKey);
  // Encrypt the encKey using RSA-OAEP
  const encryptedEncKey = publicKey.encrypt(encKey, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
  return res.status(200).json(new ApiResponse(200, "Encrypted key fetched successfully",
    {
      encryptedEncKey: forge.util.encode64(encryptedEncKey),
    }
  ));
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
