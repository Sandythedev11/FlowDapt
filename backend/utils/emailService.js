const nodemailer = require('nodemailer');

// ============================================
// GMAIL SMTP EMAIL SERVICE - PRODUCTION READY
// ============================================

let smtpReady = false;
let smtpError = null;

// Verify SMTP credentials are present
const validateSMTPConfig = () => {
  const errors = [];
  
  if (!process.env.SMTP_USER) {
    errors.push('SMTP_USER is not set');
  }
  
  if (!process.env.SMTP_PASS) {
    errors.push('SMTP_PASS is not set');
  }
  
  if (!process.env.SMTP_HOST) {
    console.warn('⚠️  [SMTP] SMTP_HOST not set, using default: smtp.gmail.com');
  }
  
  if (errors.length > 0) {
    console.error('\n❌ [SMTP] CRITICAL: Missing SMTP configuration');
    errors.forEach(err => console.error(`   • ${err}`));
    console.error('   📧 Email functionality will not work without valid Gmail SMTP credentials\n');
    console.error('   💡 Required environment variables:');
    console.error('      SMTP_USER=your-email@gmail.com');
    console.error('      SMTP_PASS=your-app-password');
    console.error('      SMTP_HOST=smtp.gmail.com (optional)');
    console.error('      SMTP_PORT=587 (optional)\n');
    return false;
  }
  
  return true;
};

const hasValidSMTPConfig = validateSMTPConfig();

// Create reusable transporter using Gmail SMTP
const transporter = hasValidSMTPConfig ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null;

// Verify transporter connection on startup
if (transporter) {
  console.log('\n🔄 [SMTP] Verifying Gmail SMTP connection...');
  
  transporter.verify((error, success) => {
    if (error) {
      smtpReady = false;
      smtpError = error.message;
      console.error('\n❌ [SMTP] Failed to connect to Gmail SMTP');
      console.error(`   Error: ${error.message}`);
      
      if (error.message.includes('Invalid login')) {
        console.error('\n   💡 Authentication Failed - Possible causes:');
        console.error('      • Incorrect email or password');
        console.error('      • Using regular password instead of App Password');
        console.error('      • 2-Factor Authentication not enabled');
        console.error('\n   📋 Gmail App Password Setup:');
        console.error('      1. Enable 2-Factor Authentication on your Google Account');
        console.error('      2. Go to https://myaccount.google.com/apppasswords');
        console.error('      3. Generate a new App Password for "Mail"');
        console.error('      4. Use the 16-character password in SMTP_PASS');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
        console.error('\n   💡 Network Error - Check your internet connection');
      }
      
      console.error('\n   ⚠️  Email features will be unavailable until this is fixed\n');
    } else {
      smtpReady = true;
      smtpError = null;
      console.log('✅ [SMTP] Gmail SMTP server is ready to send emails');
      console.log(`   Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
      console.log(`   Port: ${process.env.SMTP_PORT || 587}`);
      console.log(`   User: ${process.env.SMTP_USER}\n`);
    }
  });
} else {
  console.error('❌ [SMTP] Transporter not created due to missing configuration\n');
}

// Get SMTP status
const getSMTPStatus = () => {
  return {
    ready: smtpReady,
    configured: hasValidSMTPConfig,
    error: smtpError,
  };
};

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.SMTP_FROM || `FlowDapt <${process.env.SMTP_USER}>`,
  appName: 'FlowDapt',
  supportEmail: process.env.SMTP_USER || 'support@flowdapt.com',
};

// ============================================
// LOGGING UTILITIES
// ============================================

const logEmailEvent = (type, status, details) => {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'success' ? '✅' : status === 'error' ? '❌' : '📧';
  
  console.log(`\n${statusIcon} [EMAIL SERVICE] ${timestamp}`);
  console.log(`   Type: ${type}`);
  console.log(`   Status: ${status.toUpperCase()}`);
  
  if (details.to) console.log(`   To: ${details.to}`);
  if (details.subject) console.log(`   Subject: ${details.subject}`);
  if (details.messageId) console.log(`   Message ID: ${details.messageId}`);
  if (details.error) console.log(`   Error: ${details.error}`);
  if (details.message) console.log(`   Message: ${details.message}`);
  
  console.log('');
};

// ============================================
// OTP GENERATION
// ============================================

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================
// EMAIL TEMPLATES
// ============================================

const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
      .wrapper { padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
      .header p { margin: 10px 0 0; opacity: 0.9; }
      .content { padding: 40px 30px; }
      .otp-box { background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); border: 2px solid #667eea; padding: 25px; text-align: center; margin: 25px 0; border-radius: 12px; }
      .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
      .otp-label { font-size: 12px; color: #666; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; }
      .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
      .info { background: #e7f3ff; border-left: 4px solid #2196f3; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
      .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
      .footer { background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eee; }
      .footer p { margin: 5px 0; color: #666; font-size: 13px; }
      .footer a { color: #667eea; text-decoration: none; }
      .divider { height: 1px; background: #eee; margin: 25px 0; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        ${content}
        <div class="footer">
          <p><strong>${EMAIL_CONFIG.appName}</strong></p>
          <p>© ${new Date().getFullYear()} ${EMAIL_CONFIG.appName}. All rights reserved.</p>
          <p>Questions? Contact us at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
        </div>
      </div>
    </div>
  </body>
</html>
`;


// ============================================
// SEND EMAIL FUNCTION (CORE) - GMAIL SMTP
// ============================================

const sendEmail = async (to, subject, html, emailType = 'general') => {
  const startTime = Date.now();
  
  // Check if SMTP is configured and ready
  if (!transporter) {
    const error = 'SMTP not configured - missing credentials';
    logEmailEvent(emailType, 'error', {
      to,
      subject,
      error,
      message: 'Email send aborted - SMTP not configured'
    });
    return { success: false, error };
  }
  
  if (!smtpReady) {
    const error = smtpError || 'SMTP connection not ready';
    logEmailEvent(emailType, 'error', {
      to,
      subject,
      error,
      message: 'Email send aborted - SMTP not ready'
    });
    return { success: false, error };
  }
  
  logEmailEvent(emailType, 'pending', {
    to,
    subject,
    message: 'Initiating email send via Gmail SMTP...'
  });

  try {
    const mailOptions = {
      from: EMAIL_CONFIG.from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    const duration = Date.now() - startTime;

    logEmailEvent(emailType, 'success', {
      to,
      subject,
      messageId: info.messageId,
      message: `Email delivered successfully via Gmail SMTP in ${duration}ms`
    });

    return { success: true, data: info, messageId: info.messageId };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logEmailEvent(emailType, 'error', {
      to,
      subject,
      error: error.message,
      message: `Email delivery failed after ${duration}ms`
    });

    return { success: false, error: error.message };
  }
};

// ============================================
// VERIFICATION EMAIL (OTP)
// ============================================

const sendVerificationEmail = async (email, name, otp) => {
  const subject = `Verify Your ${EMAIL_CONFIG.appName} Account`;
  
  const html = getBaseTemplate(`
    <div class="header">
      <h1>Welcome to ${EMAIL_CONFIG.appName}!</h1>
      <p>Let's verify your email address</p>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for registering with ${EMAIL_CONFIG.appName}. To complete your registration and secure your account, please verify your email address using the verification code below:</p>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-label">Verification Code</div>
      </div>
      <div class="info">
        <strong>⏱️ Time Sensitive:</strong> This code will expire in <strong>10 minutes</strong>.
      </div>
      <p>Enter this code on the verification page to activate your account.</p>
      <div class="divider"></div>
      <p style="color: #666; font-size: 14px;">If you didn't create an account with ${EMAIL_CONFIG.appName}, you can safely ignore this email. Someone may have entered your email address by mistake.</p>
    </div>
  `);

  console.log(`\n📧 [OTP EMAIL] Sending verification OTP to: ${email}`);
  console.log(`   User Name: ${name}`);
  console.log(`   OTP Code: ${otp}`);
  
  const result = await sendEmail(email, subject, html, 'OTP_VERIFICATION');
  
  if (result.success) {
    console.log(`✅ [OTP EMAIL] OTP email sent successfully to ${email}`);
  } else {
    console.log(`❌ [OTP EMAIL] Failed to send OTP email to ${email}`);
  }
  
  return result;
};

// ============================================
// PASSWORD RESET EMAIL
// ============================================

const sendPasswordResetEmail = async (email, name, otp) => {
  const subject = `Reset Your ${EMAIL_CONFIG.appName} Password`;
  
  const html = getBaseTemplate(`
    <div class="header">
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password</p>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset the password for your ${EMAIL_CONFIG.appName} account. Use the verification code below to proceed with resetting your password:</p>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-label">Reset Code</div>
      </div>
      <div class="info">
        <strong>⏱️ Time Sensitive:</strong> This code will expire in <strong>10 minutes</strong>.
      </div>
      <div class="warning">
        <strong>🔒 Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged and your account is secure.
      </div>
      <p>For your security, never share this code with anyone. ${EMAIL_CONFIG.appName} staff will never ask for your verification code.</p>
    </div>
  `);

  console.log(`\n🔐 [PASSWORD RESET] Sending reset OTP to: ${email}`);
  console.log(`   User Name: ${name}`);
  console.log(`   Reset Code: ${otp}`);
  
  const result = await sendEmail(email, subject, html, 'PASSWORD_RESET');
  
  if (result.success) {
    console.log(`✅ [PASSWORD RESET] Forgot password email delivered to ${email}`);
  } else {
    console.log(`❌ [PASSWORD RESET] Failed to send reset email to ${email}`);
  }
  
  return result;
};

// ============================================
// WELCOME EMAIL (After Verification)
// ============================================

const sendWelcomeEmail = async (email, name) => {
  const subject = `Welcome to ${EMAIL_CONFIG.appName} - You're All Set!`;
  
  const html = getBaseTemplate(`
    <div class="header">
      <h1>🎉 Welcome Aboard!</h1>
      <p>Your account is now verified and ready to use</p>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <div class="success">
        <strong>✅ Account Verified!</strong> Your email has been successfully verified.
      </div>
      <p>You now have full access to all ${EMAIL_CONFIG.appName} features:</p>
      <ul style="padding-left: 20px; color: #555;">
        <li>📊 Upload and analyze your data</li>
        <li>📈 Create beautiful visualizations</li>
        <li>🤖 Get AI-powered insights</li>
        <li>📁 Build comprehensive reports</li>
      </ul>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Go to Dashboard</a>
      </p>
      <p>If you have any questions, our support team is here to help!</p>
    </div>
  `);

  console.log(`\n🎉 [WELCOME EMAIL] Sending welcome email to: ${email}`);
  
  const result = await sendEmail(email, subject, html, 'WELCOME');
  
  if (result.success) {
    console.log(`✅ [WELCOME EMAIL] Welcome email delivered to ${email}`);
  }
  
  return result;
};


// ============================================
// NOTIFICATION EMAIL
// ============================================

const sendNotificationEmail = async (email, name, title, message, type = 'info') => {
  const subject = `${EMAIL_CONFIG.appName}: ${title}`;
  
  const typeStyles = {
    info: { bg: '#e7f3ff', border: '#2196f3', icon: 'ℹ️' },
    success: { bg: '#d4edda', border: '#28a745', icon: '✅' },
    warning: { bg: '#fff3cd', border: '#ffc107', icon: '⚠️' },
    error: { bg: '#f8d7da', border: '#dc3545', icon: '❌' },
  };
  
  const style = typeStyles[type] || typeStyles.info;
  
  const html = getBaseTemplate(`
    <div class="header">
      <h1>${style.icon} ${title}</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <div style="background: ${style.bg}; border-left: 4px solid ${style.border}; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        ${message}
      </div>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
    </div>
  `);

  console.log(`\n🔔 [NOTIFICATION] Sending notification to: ${email}`);
  console.log(`   Title: ${title}`);
  console.log(`   Type: ${type}`);
  
  const result = await sendEmail(email, subject, html, 'NOTIFICATION');
  
  if (result.success) {
    console.log(`✅ [NOTIFICATION] Notification delivered to ${email}`);
  }
  
  return result;
};

// ============================================
// BULK EMAIL FUNCTION
// ============================================

const sendBulkEmails = async (recipients, subject, htmlTemplate, emailType = 'BULK') => {
  console.log(`\n📬 [BULK EMAIL] Starting bulk email send`);
  console.log(`   Total Recipients: ${recipients.length}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Type: ${emailType}`);
  
  const results = {
    total: recipients.length,
    successful: 0,
    failed: 0,
    errors: [],
  };

  const startTime = Date.now();

  // Process emails in batches to avoid rate limiting
  const BATCH_SIZE = 10;
  const BATCH_DELAY = 1000; // 1 second between batches

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(recipients.length / BATCH_SIZE);
    
    console.log(`\n   📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} emails)`);

    const batchPromises = batch.map(async (recipient) => {
      const { email, name } = recipient;
      
      // Replace placeholders in template
      const personalizedHtml = htmlTemplate
        .replace(/{{name}}/g, name || 'User')
        .replace(/{{email}}/g, email);

      try {
        const result = await sendEmail(email, subject, personalizedHtml, emailType);
        
        if (result.success) {
          results.successful++;
          return { email, success: true };
        } else {
          results.failed++;
          results.errors.push({ email, error: result.error });
          return { email, success: false, error: result.error };
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ email, error: error.message });
        return { email, success: false, error: error.message };
      }
    });

    await Promise.all(batchPromises);

    // Add delay between batches (except for last batch)
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }

  const duration = Date.now() - startTime;

  console.log(`\n✅ [BULK EMAIL] Bulk notification batch completed`);
  console.log(`   Total: ${results.total}`);
  console.log(`   Successful: ${results.successful}`);
  console.log(`   Failed: ${results.failed}`);
  console.log(`   Duration: ${duration}ms`);
  
  if (results.errors.length > 0) {
    console.log(`   Errors:`);
    results.errors.forEach(err => {
      console.log(`     - ${err.email}: ${err.error}`);
    });
  }

  return results;
};

// ============================================
// PASSWORD CHANGED CONFIRMATION
// ============================================

const sendPasswordChangedEmail = async (email, name) => {
  const subject = `${EMAIL_CONFIG.appName}: Your Password Was Changed`;
  
  const html = getBaseTemplate(`
    <div class="header">
      <h1>🔐 Password Changed</h1>
      <p>Your account password has been updated</p>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <div class="success">
        <strong>✅ Password Updated!</strong> Your ${EMAIL_CONFIG.appName} account password was successfully changed.
      </div>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <div class="warning">
        <strong>🔒 Didn't make this change?</strong> If you didn't change your password, your account may be compromised. Please contact our support team immediately.
      </div>
    </div>
  `);

  console.log(`\n🔐 [PASSWORD CHANGED] Sending confirmation to: ${email}`);
  
  const result = await sendEmail(email, subject, html, 'PASSWORD_CHANGED');
  
  if (result.success) {
    console.log(`✅ [PASSWORD CHANGED] Confirmation delivered to ${email}`);
  }
  
  return result;
};

// ============================================
// ACCOUNT DEACTIVATION EMAIL
// ============================================

const sendAccountDeactivatedEmail = async (email, name) => {
  const subject = `${EMAIL_CONFIG.appName}: Your Account Has Been Deactivated`;
  
  const html = getBaseTemplate(`
    <div class="header">
      <h1>⏸️ Account Deactivated</h1>
      <p>Your account has been temporarily disabled</p>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <div class="warning">
        <strong>Account Status:</strong> Your ${EMAIL_CONFIG.appName} account has been deactivated as requested.
      </div>
      <p><strong>What this means:</strong></p>
      <ul style="padding-left: 20px; color: #555;">
        <li>You won't be able to log in until you reactivate</li>
        <li>Your data is safely preserved</li>
        <li>You can reactivate anytime by logging in</li>
      </ul>
      <div class="info">
        <strong>💡 Want to come back?</strong> Simply try to log in with your credentials and you'll be prompted to reactivate your account.
      </div>
      <p><strong>Deactivated on:</strong> ${new Date().toLocaleString()}</p>
      <div class="divider"></div>
      <p style="color: #666; font-size: 14px;">If you didn't request this deactivation, please contact our support team immediately as your account may have been compromised.</p>
    </div>
  `);

  console.log(`\n⏸️ [ACCOUNT DEACTIVATED] Sending confirmation to: ${email}`);
  
  const result = await sendEmail(email, subject, html, 'ACCOUNT_DEACTIVATED');
  
  if (result.success) {
    console.log(`✅ [ACCOUNT DEACTIVATED] Confirmation delivered to ${email}`);
  }
  
  return result;
};

// ============================================
// ACCOUNT DELETION EMAIL
// ============================================

const sendAccountDeletedEmail = async (email, name) => {
  const subject = `${EMAIL_CONFIG.appName}: Your Account Has Been Permanently Deleted`;
  
  const html = getBaseTemplate(`
    <div class="header" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">
      <h1>👋 Account Deleted</h1>
      <p>We're sorry to see you go</p>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <strong>Account Permanently Deleted:</strong> Your ${EMAIL_CONFIG.appName} account and all associated data have been permanently removed from our system.
      </div>
      <p><strong>What has been deleted:</strong></p>
      <ul style="padding-left: 20px; color: #555;">
        <li>Your account profile and settings</li>
        <li>All uploaded files and datasets</li>
        <li>Generated insights and reports</li>
        <li>AI chat history and preferences</li>
      </ul>
      <p><strong>Deleted on:</strong> ${new Date().toLocaleString()}</p>
      <div class="info">
        <strong>💡 Changed your mind?</strong> You can always create a new account using the same email address. However, your previous data cannot be recovered.
      </div>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/register" class="button">Create New Account</a>
      </p>
      <div class="divider"></div>
      <p style="color: #666; font-size: 14px;">Thank you for using ${EMAIL_CONFIG.appName}. We hope to see you again in the future!</p>
    </div>
  `);

  console.log(`\n🗑️ [ACCOUNT DELETED] Sending final confirmation to: ${email}`);
  
  const result = await sendEmail(email, subject, html, 'ACCOUNT_DELETED');
  
  if (result.success) {
    console.log(`✅ [ACCOUNT DELETED] Final confirmation delivered to ${email}`);
  }
  
  return result;
};

// ============================================
// ACCOUNT REACTIVATION EMAIL
// ============================================

const sendAccountReactivatedEmail = async (email, name) => {
  const subject = `${EMAIL_CONFIG.appName}: Welcome Back! Your Account is Reactivated`;
  
  const html = getBaseTemplate(`
    <div class="header">
      <h1>🎉 Welcome Back!</h1>
      <p>Your account has been successfully reactivated</p>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <div class="success">
        <strong>✅ Account Reactivated!</strong> Your ${EMAIL_CONFIG.appName} account is now active and ready to use.
      </div>
      <p>All your previous data, settings, and preferences have been restored. You can now:</p>
      <ul style="padding-left: 20px; color: #555;">
        <li>📊 Access your uploaded datasets</li>
        <li>📈 View your saved visualizations</li>
        <li>🤖 Generate new AI insights</li>
        <li>📁 Continue where you left off</li>
      </ul>
      <p><strong>Reactivated on:</strong> ${new Date().toLocaleString()}</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Go to Dashboard</a>
      </p>
    </div>
  `);

  console.log(`\n🎉 [ACCOUNT REACTIVATED] Sending welcome back email to: ${email}`);
  
  const result = await sendEmail(email, subject, html, 'ACCOUNT_REACTIVATED');
  
  if (result.success) {
    console.log(`✅ [ACCOUNT REACTIVATED] Welcome back email delivered to ${email}`);
  }
  
  return result;
};



// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Core functions
  generateOTP,
  sendEmail,
  
  // Transactional emails
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  
  // Account lifecycle emails
  sendAccountDeactivatedEmail,
  sendAccountDeletedEmail,
  sendAccountReactivatedEmail,
  
  // Notification emails
  sendNotificationEmail,
  
  // Bulk emails
  sendBulkEmails,
  
  // Config
  EMAIL_CONFIG,
  
  // Status checks
  getSMTPStatus,
  
  // Transporter (for testing)
  transporter,
};
