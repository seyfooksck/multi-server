const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const config = require('../../system/config/index');
const systemLogger = require('../logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.SMTP.HOST,
            port: config.SMTP.PORT,
            secure: config.SMTP.SECURE, // true for 465, false for other ports
            auth: {
                user: config.SMTP.USER,
                pass: config.SMTP.PASS,
            },
        });
    }

    /**
     * Send an email using an EJS template
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} templateName - Name of the template file in src/views/email (without .ejs)
     * @param {object} data - Data to pass to the template
     */
    async sendEmail(to, subject, templateName, data) {
        try {
            const templatePath = path.join(__dirname, '../../views/email', `${templateName}.ejs`);

            // Render the email template
            const html = await ejs.renderFile(templatePath, data);

            // Send mail with defined transport object
            const info = await this.transporter.sendMail({
                from: config.SMTP.FROM, // sender address
                to: to, // list of receivers
                subject: subject, // Subject line
                html: html, // html body
            });

            systemLogger.success(`Email sent: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            systemLogger.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();
