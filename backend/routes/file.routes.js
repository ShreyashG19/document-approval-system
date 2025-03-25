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
    verifySession,
    authorizeRoles,
} = require("../middlewares/auth.middlewares");

router.post(
    "/upload-pdf",
    upload.single("pdfFile"),
    verifySession,
    authorizeRoles([Role.ASSISTANT]),
    verifyFileAtrributes,
    uploadPdf,
);

router.get(
    "/download-pdf/:filename",
    verifySession,
    authorizeRoles([Role.ASSISTANT, Role.APPROVER, Role.ADMIN]),
    downloadPdf,
);

router.get(
    "/get-documents",
    verifySession,
    authorizeRoles([Role.ADMIN, Role.APPROVER, Role.ASSISTANT]),
    getDocumentsByQuery,
);

router.post(
    "/approve",
    verifySession,
    authorizeRoles([Role.APPROVER]),
    approveDocument,
);

router.post(
    "/reject",
    verifySession,
    authorizeRoles([Role.APPROVER]),
    rejectDocument,
);

router.post(
    "/correction",
    verifySession,
    authorizeRoles([Role.APPROVER]),
    requestCorrection,
);

router.post(
    "/get-enc-key",
    verifySession,
    authorizeRoles([Role.ASSISTANT, Role.APPROVER, Role.ADMIN]),
    getEncKey,
);

module.exports = router;
