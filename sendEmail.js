const path = require("path");
const nodeMailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const { NODE_MAILER_USER, NODE_MAILER_PASS } = require("./config");

// Configure Transporter with Gmail
const transporter = nodeMailer.createTransport({
  service: "Gmail",
  auth: {
    user: NODE_MAILER_USER,
    pass: NODE_MAILER_PASS,
  },
});

// Configuring handlebars options
const hbsOptions = {
  viewEngine: {
    partialsDir: "views/partials",
    layoutsDir: "views/layouts",
    defaultLayout: "base",
  },
  viewPath: "views/emails",
};

// use handlebars as nodemailer middleware
transporter.use("compile", hbs(hbsOptions));

// send email with one time verification code to toEmail address
async function sendResetEmail(toEmail, otp) {
  const mailOptions = {
    from: `"Budget Tracker" <${NODE_MAILER_USER}>`,
    to: toEmail,
    subject: "Budget Tracker Password Reset One Time Use Code",
    template: "resetPassword",
    context: {
      otp,
    },
  };
  await transporter.sendMail(mailOptions);
}

// send email notifying a new user that their account was created successfully and welcoming them
async function sendConfirmEmail(toEmail, username) {
  const mailOptions = {
    from: `"Budget Tracker" <${NODE_MAILER_USER}>`,
    to: toEmail,
    subject: "Your Account has Been Created!",
    template: "confirm",
    context: { username },
  };
  await transporter.sendMail(mailOptions);
}

// send email notifying user that their total assets have been increased with scheduled income
async function sendIncomeEmail(toEmail, username, title, salary, totalAssets) {
  const mailOptions = {
    from: `"Budget Tracker" <${NODE_MAILER_USER}>`,
    to: toEmail,
    subject: `Received ${title} Income!`,
    template: "income",
    context: { username, title, salary, totalAssets },
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail, sendConfirmEmail, sendIncomeEmail };
