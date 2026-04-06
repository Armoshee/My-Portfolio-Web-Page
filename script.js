const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// POST route for contact form
app.post("/send", async (req, res) => {
  const { fullName, email, phone, message } = req.body;

  // Configure transporter (use Gmail App Password, not your real password)
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "hazina.mew@gmail.com", // your Gmail
      pass: "YOUR_APP_PASSWORD"     // Gmail App Password
    }
  });

  try {
    // 1️⃣ Send to your inbox
    await transporter.sendMail({
      from: "hazina.mew@gmail.com",   // must match your Gmail
      to: "hazina.mew@gmail.com",     // always delivered to your inbox
      replyTo: email,                 // visitor’s email for replies
      subject: "New Contact Form Submission",
      text: `
        Name: ${fullName}
        Visitor Email: ${email}
        Phone: ${phone}
        Message: ${message}
      `
    });

    // 2️⃣ Send confirmation to visitor
    await transporter.sendMail({
      from: "hazina.mew@gmail.com",   // must match your Gmail
      to: email,                      // visitor’s email
      subject: "Thank you for contacting me",
      text: `Hi ${fullName},

Thank you for reaching out! I’ve received your message and will get back to you soon.

Best regards,
RJ`
    });

    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Error sending message." });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
