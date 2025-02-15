const { transporter, MailOptions } = require("./sendEmail");

const generateOTP = () => {
    const otpLength = Math.floor(Math.random() * 3) + 6; // Randomly 6, 7, or 8 length
    const otp = `${Math.floor(
        Math.pow(10, otpLength - 1) +
            Math.random() * 9 * Math.pow(10, otpLength - 1)
    )}`;

    return otp;
};

module.exports = {
    generateOTP,
};
