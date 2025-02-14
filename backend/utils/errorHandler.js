const fs = require("fs");
const errorHandler = (error, req, res, next) => {
    console.log("=========================");
    console.log(error.stack);
    console.log("=========================");
    const statusCode = error.statusCode || 500;
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Failed to delete file:", err);
        });
    }
    res.status(statusCode).json({
        status: false,
        message: error.message,
    });
};

module.exports = errorHandler;
