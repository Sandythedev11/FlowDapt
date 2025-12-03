const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Create transporter using existing SMTP config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// @route   POST /api/feedback/submit
// @desc    Submit user feedback via email
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { feedback } = req.body;

    // Validation
    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ message: 'Feedback is required' });
    }

    if (feedback.trim().length < 10) {
      return res.status(400).json({ message: 'Feedback must be at least 10 characters long' });
    }

    // Get user info
    const userName = req.user.name || 'Unknown User';
    const userEmail = req.user.email || 'No email provided';
    const timestamp = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    // Email content
    const emailHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
      .wrapper { padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
      .content { padding: 30px; }
      .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
      .info-box strong { color: #667eea; }
      .feedback-box { background: #e7f3ff; border: 2px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 8px; }
      .feedback-text { white-space: pre-wrap; word-wrap: break-word; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee; }
      .footer p { margin: 5px 0; color: #666; font-size: 13px; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <h1>📬 New Feedback Received</h1>
          <p>FlowDapt User Feedback System</p>
        </div>
        
        <div class="content">
          <h2 style="color: #667eea; margin-top: 0;">User Information</h2>
          
          <div class="info-box">
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Date & Time:</strong> ${timestamp}</p>
          </div>

          <h2 style="color: #667eea;">Feedback Message</h2>
          
          <div class="feedback-box">
            <p class="feedback-text">${feedback.trim()}</p>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This feedback was submitted through the FlowDapt platform feedback system.
          </p>
        </div>

        <div class="footer">
          <p><strong>FlowDapt Analytics Platform</strong></p>
          <p>Automated Feedback Notification</p>
        </div>
      </div>
    </div>
  </body>
</html>
    `;

    // Plain text version
    const emailText = `
NEW FEEDBACK RECEIVED - FlowDapt

User Information:
-----------------
Name: ${userName}
Email: ${userEmail}
Date & Time: ${timestamp}

Feedback Message:
-----------------
${feedback.trim()}

---
This feedback was submitted through the FlowDapt platform feedback system.
    `;

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || `FlowDapt <${process.env.SMTP_USER}>`,
      to: 'sandeepgouda209@gmail.com',
      subject: `FlowDapt Feedback from ${userName}`,
      text: emailText,
      html: emailHTML,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ [FEEDBACK] Email sent successfully');
    console.log(`   From: ${userName} (${userEmail})`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Timestamp: ${timestamp}`);

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('❌ [FEEDBACK] Error sending feedback email:', error);
    
    // Check if it's an SMTP error
    if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
      return res.status(500).json({
        message: 'Email service is currently unavailable. Please try again later.',
        error: 'SMTP connection failed'
      });
    }

    res.status(500).json({
      message: 'Failed to submit feedback. Please try again.',
      error: error.message
    });
  }
});

module.exports = router;
