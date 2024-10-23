const nodemailer = require('nodemailer');


const transporter: any = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com', 
    port: Number(process.env.SMTP_PORT) || 587, 
    secure: false, 
    auth: {
        user: process.env.SMTP_USER || 'shiva.krishna@g7cr.com', 
        pass: process.env.SMTP_PASS || 'Shivanew@123', 
    },
});


async function sendEmail(recipientEmail: string, subject: string, text: string, html: string): Promise<void> {
    const mailOptions = {
        from: '"FileManager App" <shiva.krishna@g7cr.com>', 
        to: recipientEmail, 
        subject: subject, 
        text: text,
        html: html, 
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}

export  { sendEmail };
