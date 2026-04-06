require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS middleware to allow cross-origin requests (important for local development)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'contact-mailer' });
});

app.post("/send", async (req, res) => {
  const { fullName, email, phone, message } = req.body;

  // Validate input
  if (!fullName || !email || !phone || !message) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  // Configure transporter (use Gmail App Password, not your real password)
  const gmailUser = process.env.GMAIL_USER || "hazina.mew@gmail.com";
  const gmailPass = process.env.GMAIL_PASS || "YOUR_APP_PASSWORD";

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });

  try {
    // Verify transporter configuration
    await transporter.verify();

    // 1) Must succeed: send form message to your inbox.
    await transporter.sendMail({
      from: gmailUser,
      to: gmailUser,
      replyTo: email,
      subject: "New Contact Form Submission",
      text: `
        Name: ${fullName}
        Visitor Email: ${email}
        Phone: ${phone}
        Message: ${message}
      `
    });

    // 2) Best effort: send confirmation to visitor.
    let autoReplySent = true;
    try {
      await transporter.sendMail({
        from: gmailUser,
        to: email,
        subject: "Thank you for contacting me",
        text: `Hi ${fullName},

Thank you for reaching out! I've received your message and will get back to you soon.

Best regards,
Muhaseena A`
      });
    } catch (visitorError) {
      autoReplySent = false;
      console.error('Auto-reply delivery error:', visitorError);
    }

    if (!autoReplySent) {
      return res.status(200).json({
        success: true,
        autoReplySent: false,
        message: 'Message received, but confirmation email to visitor was not delivered. Ask visitor to check spam folder.'
      });
    }

    return res.status(200).json({ success: true, autoReplySent: true, message: "Message sent successfully and confirmation email delivered." });
  } catch (error) {
    console.error("Error sending email:", error);
    const message = error.code === 'EAUTH'
      ? "Authentication failed. Use Gmail App Password in .env"
      : "Error sending message. Please check server configuration.";
    return res.status(500).json({ success: false, message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
