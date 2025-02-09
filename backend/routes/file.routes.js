const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const { Role } = require("../utils/enums");
const { verifyFileAtrributes } = require("../middlewares/file.middlewares");
const {
    uploadPdf,
    downloadPdf,
    getDocumentsByQuery,
    approveDocument,
    rejectDocument,
    requestCorrection,
    getEncKey,
} = require("../controllers/file.controllers");
const {
    verifyToken,
    authorizeRoles,
} = require("../middlewares/user.middlewares");

router.post(
    "/upload-pdf",
    upload.single("pdfFile"),
    verifyToken,
    authorizeRoles([Role.SENIOR_ASSISTANT, Role.ASSISTANT]),
    verifyFileAtrributes,
    uploadPdf
);

router.get(
    "/download-pdf/:filename",
    verifyToken,
    authorizeRoles([
        Role.ASSISTANT,
        Role.SENIOR_ASSISTANT,
        Role.APPROVER,
        Role.ADMIN,
    ]),
    downloadPdf
);

router.get(
    "/get-documents",
    verifyToken,
    authorizeRoles([
        Role.ADMIN,
        Role.APPROVER,
        Role.SENIOR_ASSISTANT,
        Role.ASSISTANT,
    ]),
    getDocumentsByQuery
);

router.post(
    "/approve",
    verifyToken,
    authorizeRoles([Role.APPROVER]),
    approveDocument
);

router.post(
    "/reject",
    verifyToken,
    authorizeRoles([Role.APPROVER]),
    rejectDocument
);

router.post(
    "/correction",
    verifyToken,
    authorizeRoles([Role.APPROVER]),
    requestCorrection
);

router.post(
    "/get-enc-key",
    verifyToken,
    authorizeRoles([
        Role.SENIOR_ASSISTANT,
        Role.ASSISTANT,
        Role.APPROVER,
        Role.ADMIN,
    ]),
    getEncKey
);

module.exports = router;
