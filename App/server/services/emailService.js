const nodemailer = require('nodemailer');

// Create transporter
// Uses environment variables for configuration
// If not provided, it defaults to Ethereal (fake) for testing, or throws error if needed
const createTransporter = () => {
    // If we have SMTP credentials, use them
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Fallback or warning
    console.warn("SMTP keys not found in .env. Email sending via SMTP will fail or be skipped.");
    return null;
};

const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = createTransporter();

    if (!transporter) {
        throw new Error("SMTP Configuration missing. Cannot send email.");
    }

    const info = await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'Nexus App'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html: html || text // Fallback if no HTML provided
    });

    console.log("Message sent: %s", info.messageId);
    return info;
};

module.exports = { sendEmail };
