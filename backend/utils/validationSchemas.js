const Joi = require("joi");
const {Role} = require("./enums");

const usernameSchema = Joi.string()
    .pattern(/^[A-Za-z0-9_]{5,10}$/)
    .messages({
        "string.pattern.base":
            "Username must be atleast 5 characters long, and can contain only letters, numbers, and underscores",
        "string.empty": "Username is required",
        "string.min": "Username must be at least 5 characters long",
        "string.max": "Username must not exceed 30 characters",
    });

const fullNameSchema = Joi.string()
    .pattern(/^[A-Za-z\s]{5,50}$/)
    .custom((value, helpers) => {
        const words = value.trim().split(/\s+/);
        if (words.length < 2) {
            return helpers.error("string.minWords");
        }
        return value;
    })
    .messages({
        "string.pattern.base": "Full name must contain only letters and spaces",
        "string.minWords": "Full name must include both first and last name",
        "string.empty": "Full name is required",
        "string.min": "Full name must be at least 5 characters long",
        "string.max": "Full name must not exceed 50 characters",
    });

const emailSchema = Joi.string().email().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email address is required",
});

const passwordSchema = Joi.string()
    .min(8)
    .max(30)
    .pattern(/(?=.*[A-Z])/, "uppercase letter") // At least 1 uppercase letter
    .pattern(/(?=.*[@$!%*?&])/, "special character") // At least 1 special character
    .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password must not exceed 30 characters",
        "string.pattern.uppercase":
            "Password must contain at least one uppercase letter",
        "string.pattern.special":
            "Password must contain at least one special character (@$!%*?&)",
    });

const mobileNoSchema = Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
        "string.pattern.base": "Mobile number must be valid 10 digits",
        "string.empty": "Mobile number is required",
    });

const roleSchema = Joi.string().valid(Role.ASSISTANT, Role.APPROVER).messages({
    "any.only": `Role must be one of the assistant or approver`,
    "string.empty": "Role is required",
});

module.exports = {
    usernameSchema,
    fullNameSchema,
    emailSchema,
    passwordSchema,
    mobileNoSchema,
    roleSchema,
};
