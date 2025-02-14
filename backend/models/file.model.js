const mongoose = require("mongoose");
const { FileStatus } = require("../utils/enums");
const FileSchema = new mongoose.Schema(
    {
        fileUniqueName: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        hidden: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: [
                FileStatus.APPROVED,
                FileStatus.REJECTED,
                FileStatus.CORRECTION,
                FileStatus.PENDING,
            ],
            default: FileStatus.PENDING,
            required: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        remarks: {
            type: String,
        },
        description: {
            type: String,
        },
        title: {
            type: String,
            required: true,
        },
        createdDate: {
            type: Date,
            default: Date.now,
        },
        approvedDate: {
            type: Date,
        },
        rejectedDate: {
            type: Date,
        },
        correctionDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

const File = mongoose.model("File", FileSchema);
module.exports = File;
