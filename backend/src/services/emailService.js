const nodemailer = require("nodemailer");

const emailService = {
  async sendResetLink(toEmail, resetToken) {
    /* const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },*/
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user, //
        pass: testAccount.pass,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    let info = await transporter.sendMail({
      from: `"Support Team" <${testAccount.user}>`, //`"Support Team" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click here: ${resetLink}`,
      html: `
        <h3>Password Reset</h3>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
      `,
    });

    console.log("--------------------------------------------------");
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    console.log("--------------------------------------------------");
  },
};

module.exports = emailService;