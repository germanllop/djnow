require('dotenv').config()
const nodemailer = require("nodemailer")

var transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

module.exports = transporter