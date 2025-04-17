const nodemailer = require("nodemailer");
const config = require("../config/appConfig");
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: config.authEmail,
        pass: config.authPass,
    },
});

class MailOptions {
    constructor(from, to, subject, htmlBody) {
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.html = htmlBody;
    }
}
const sendEmail = async (mailOptions) => {
    await transporter.sendMail(mailOptions);
};

module.exports = {
    transporter,
    MailOptions,
    sendEmail,
};