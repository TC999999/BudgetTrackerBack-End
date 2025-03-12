const nodeMailer = require("nodemailer");

const transporter = nodeMailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NODE_MAILER_USER,
    pass: process.env.NODE_MAILER_PASS,
  },
});

async function sendResetEmail(toEmail, otp) {
  const mailOptions = {
    from: `"Budget Tracker" <${process.env.NODE_MAILER_USER}>`,
    to: toEmail,
    subject: "Budget Tracker Password Reset One Time Use Code",
    html: `
        <h2>This is your one-time-use code for your password reset. This code will expire in two minutes.</h2>
        <h1><b>${otp}</b></h1>
        `,
  };
  await transporter.sendMail(mailOptions);
}

async function sendConfirmEmail(toEmail, username) {
  const mailOptions = {
    from: `"Budget Tracker" <${process.env.NODE_MAILER_USER}>`,
    to: toEmail,
    subject: "Your Account has Been Created!",
    html: `
          <h1>Welcome to Budget Tracker, ${username}!</h1>
          <p>This is a confirmation email to inform you that your account has successfully been created.</p>
          <p>Thank you for choosing Budget Tracker.</p>
          `,
  };
  await transporter.sendMail(mailOptions);
}

async function sendIncomeEmail(toEmail, username, title, salary, totalAssets) {
  const mailOptions = {
    from: `"Budget Tracker" <${process.env.NODE_MAILER_USER}>`,
    to: toEmail,
    subject: "Received Income!",
    html: `
          <h1>Hello, ${username}!</h1>
          <p>This is a notification email letting you know that your ${title} income has been received.</p>
          <p>Your total assets have been increased by $${salary} and currently sits at</p>
          <p>$${totalAssets}.</p>
          `,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail, sendConfirmEmail, sendIncomeEmail };
