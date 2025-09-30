const ApiError = require("./createApiError");
const ApiResponse = require("./ApiResponse");
const fs = require("fs");
const errorHandler = (error, req, res, next) => {
    console.log("=========================");
    console.log(error.stack);
    console.log("=========================");
    if (ApiError && error instanceof ApiError) {
        return res
            .status(error.statusCode)
            .json(new ApiResponse(error.statusCode, error.message));
    }
    const statusCode = 500;
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Failed to delete file:", err);
        });
    }
    res.status(statusCode).json(new ApiResponse(statusCode, error.message));
};

module.exports = errorHandler;
