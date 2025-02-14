require("dotenv").config();

const config = {
    port: process.env.PORT || 5000,
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    authEmail: process.env.AUTH_EMAIL,
    authPass: process.env.AUTH_PASS,
    baseUploadDir: process.env.BASE_UPLOAD_DIR,
    sessionSecret: process.env.SESSION_SECRET,
};

// List of required environment variables
const requiredEnvVars = [
    "MONGODB_URI",
    "JWT_SECRET",
    "AUTH_EMAIL",
    "AUTH_PASS",
    "BASE_UPLOAD_DIR",
    "SESSION_SECRET",
];

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(
        `ERROR: The following required environment variables are missing: ${missingEnvVars.join(
            ", "
        )}`
    );
    process.exit(1); // Exit with a failure code
}

module.exports = config;
