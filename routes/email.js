const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Create a Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'clubsuniversity@gmail.com',
    pass: 'bedbqxuajrvcxrzp'
  }
});

// POST route to send an email
router.post('/send', function(req, res, next) {
  const { recipient, subject, text } = req.body;

  // Construct the email message
  const mailOptions = {
    from: 'clubsuniversity@gmail.com',
    to: recipient,
    subject: subject,
    text: text
  };

  // Send the email
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error(error);
      res.sendStatus(500);
    } else {
      console.log('Email sent: ' + info.response);
      res.sendStatus(200);
    }
  });
});

module.exports = router;
