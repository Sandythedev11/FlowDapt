const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { 
  generateOTP, 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendAccountDeactivatedEmail,
  sendAccountDeletedEmail,
  sendAccountReactivatedEmail
} = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Validate name format - only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({ message: 'Name can only contain letters, spaces, hyphens, and apostrophes' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({ message: 'Name must not exceed 50 characters' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: otpExpires,
    });

    if (user) {
      // Send verification email to the user's actual email address
      console.log(`\n🚀 [REGISTRATION] New user registered: ${email}`);
      console.log(`   Initiating verification email to: ${user.email}`);
      
      const emailResult = await sendVerificationEmail(user.email, user.name, otp);
      
      if (!emailResult.success) {
        console.error(`❌ [REGISTRATION] Failed to send verification email to ${user.email}:`, emailResult.error);
        
        // In development mode, return OTP for testing when email fails
        const isDevelopment = process.env.NODE_ENV !== 'production';
        
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          message: isDevelopment 
            ? 'Registration successful. Email failed - use the OTP shown below (dev mode only).'
            : 'Registration successful but email delivery failed. Please contact support.',
          emailSent: false,
          // Only include OTP in development mode for testing
          ...(isDevelopment && { devOTP: otp, devNote: 'This OTP is only shown because email delivery failed in development mode.' }),
        });
      }

      console.log(`✅ [REGISTRATION] Verification email sent successfully to ${user.email}`);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        message: 'Registration successful. Please check your email for verification OTP.',
        emailSent: true,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Check for user with normalized email
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      console.log(`Login attempt failed: User not found for email ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password using bcrypt comparison
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`Login attempt failed: Invalid password for email ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is deactivated
    if (!user.isActive) {
      console.log(`Login attempt for deactivated account: ${normalizedEmail}`);
      return res.status(403).json({ 
        message: 'Your account is deactivated. Would you like to reactivate it?',
        isDeactivated: true,
        email: user.email
      });
    }

    console.log(`Login successful for user: ${user.email}`);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      recoveryEmail: user.recoveryEmail || null,
      recoveryEmailVerified: user.recoveryEmailVerified || false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with OTP
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    // Find user with OTP
    const user = await User.findOne({ 
      email,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: { $gt: Date.now() }
    }).select('+emailVerificationOTP +emailVerificationOTPExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    console.log(`✅ [EMAIL VERIFICATION] Email verified successfully for: ${user.email}`);
    
    // Send welcome email after successful verification
    sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error(`⚠️ [WELCOME EMAIL] Failed to send welcome email to ${user.email}:`, err);
    });

    res.json({
      message: 'Email verified successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification OTP
// @access  Public
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = otpExpires;
    await user.save();

    console.log(`\n🔄 [RESEND VERIFICATION] Resending OTP to: ${user.email}`);
    
    // Send email to the user's actual email address from database
    const emailResult = await sendVerificationEmail(user.email, user.name, otp);

    if (!emailResult.success) {
      console.error(`❌ [RESEND VERIFICATION] Failed to resend OTP to ${user.email}`);
      
      // In development mode, return OTP for testing when email fails
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
        return res.json({ 
          message: 'Email failed - use the OTP shown below (dev mode only).',
          devOTP: otp,
          devNote: 'This OTP is only shown because email delivery failed in development mode.'
        });
      }
      
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    console.log(`✅ [RESEND VERIFICATION] OTP resent successfully to ${user.email}`);
    res.json({ message: 'Verification OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset OTP
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = otpExpires;
    await user.save();

    console.log(`\n🔐 [FORGOT PASSWORD] Password reset requested for: ${user.email}`);
    
    // Send email to the user's actual email address from database
    const emailResult = await sendPasswordResetEmail(user.email, user.name, otp);

    if (!emailResult.success) {
      console.error(`❌ [FORGOT PASSWORD] Failed to send reset email to ${user.email}`);
      
      // In development mode, return OTP for testing when email fails
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
        return res.json({ 
          message: 'Email failed - use the OTP shown below (dev mode only).',
          devOTP: otp,
          devNote: 'This OTP is only shown because email delivery failed in development mode.'
        });
      }
      
      return res.status(500).json({ message: 'Failed to send password reset email' });
    }

    console.log(`✅ [FORGOT PASSWORD] Forgot password email delivered to ${user.email}`);
    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/verify-reset-otp
// @desc    Verify password reset OTP
// @access  Public
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    // Find user with valid OTP
    const user = await User.findOne({
      email,
      passwordResetOTP: otp,
      passwordResetOTPExpires: { $gt: Date.now() }
    }).select('+passwordResetOTP +passwordResetOTPExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully', email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user with valid OTP
    const user = await User.findOne({
      email,
      passwordResetOTP: otp,
      passwordResetOTPExpires: { $gt: Date.now() }
    }).select('+passwordResetOTP +passwordResetOTPExpires +password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();

    console.log(`✅ [PASSWORD RESET] Password reset successfully for: ${user.email}`);
    
    // Send password changed confirmation email
    sendPasswordChangedEmail(user.email, user.name).catch(err => {
      console.error(`⚠️ [PASSWORD CHANGED] Failed to send confirmation to ${user.email}:`, err);
    });

    res.json({ 
      message: 'Password reset successfully',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile (name)
// @access  Private
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Please provide a name' });
    }

    // Validate name format
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({ message: 'Name can only contain letters, spaces, hyphens, and apostrophes' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({ message: 'Name must not exceed 50 characters' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name.trim();
    await user.save();

    console.log(`✅ [PROFILE UPDATE] Name updated for: ${user.email}`);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/add-recovery-email
// @desc    Add recovery email and send verification
// @access  Private
router.post('/add-recovery-email', protect, async (req, res) => {
  try {
    const { recoveryEmail } = req.body;

    if (!recoveryEmail) {
      return res.status(400).json({ message: 'Please provide a recovery email' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if recovery email is same as primary email
    if (recoveryEmail.toLowerCase() === user.email) {
      return res.status(400).json({ message: 'Recovery email cannot be the same as your primary email' });
    }

    // Generate OTP for recovery email verification
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.recoveryEmail = recoveryEmail.toLowerCase();
    user.recoveryEmailVerified = false;
    user.recoveryEmailOTP = otp;
    user.recoveryEmailOTPExpires = otpExpires;
    await user.save();

    // Send verification email to recovery email
    const { sendNotificationEmail } = require('../utils/emailService');
    const emailResult = await sendNotificationEmail(
      recoveryEmail,
      user.name,
      'Verify Your Recovery Email',
      `<p>Your verification code is:</p>
       <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; margin: 20px 0;">${otp}</div>
       <p>This code will expire in 10 minutes.</p>
       <p>If you didn't request this, please ignore this email.</p>`,
      'info'
    );

    if (!emailResult.success) {
      console.error(`❌ [RECOVERY EMAIL] Failed to send verification to ${recoveryEmail}`);
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    console.log(`✅ [RECOVERY EMAIL] Verification sent to: ${recoveryEmail}`);

    res.json({ 
      message: 'Verification code sent to your recovery email',
      recoveryEmail: recoveryEmail.toLowerCase()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/verify-recovery-email
// @desc    Verify recovery email with OTP
// @access  Private
router.post('/verify-recovery-email', protect, async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'Please provide the OTP' });
    }

    const user = await User.findById(req.user._id).select('+recoveryEmailOTP +recoveryEmailOTPExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.recoveryEmail) {
      return res.status(400).json({ message: 'No recovery email to verify' });
    }

    if (user.recoveryEmailOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.recoveryEmailOTPExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.recoveryEmailVerified = true;
    user.recoveryEmailOTP = undefined;
    user.recoveryEmailOTPExpires = undefined;
    await user.save();

    console.log(`✅ [RECOVERY EMAIL] Verified for: ${user.email} -> ${user.recoveryEmail}`);

    res.json({ 
      message: 'Recovery email verified successfully',
      recoveryEmail: user.recoveryEmail
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/auth/remove-recovery-email
// @desc    Remove recovery email
// @access  Private
router.delete('/remove-recovery-email', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.recoveryEmail = undefined;
    user.recoveryEmailVerified = false;
    user.recoveryEmailOTP = undefined;
    user.recoveryEmailOTPExpires = undefined;
    await user.save();

    console.log(`✅ [RECOVERY EMAIL] Removed for: ${user.email}`);

    res.json({ message: 'Recovery email removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/deactivate-account
// @desc    Deactivate user account (requires password verification)
// @access  Private
router.post('/deactivate-account', protect, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Please provide your password' });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`❌ [DEACTIVATE] Password verification failed for: ${user.email}`);
      return res.status(401).json({ 
        message: 'Incorrect password',
        showForgotPassword: true 
      });
    }

    // Deactivate account
    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();

    console.log(`✅ [DEACTIVATE] Account deactivated for: ${user.email}`);

    // Send deactivation confirmation email
    try {
      console.log(`📧 [DEACTIVATE] Sending deactivation email to: ${user.email}`);
      const emailResult = await sendAccountDeactivatedEmail(user.email, user.name);
      if (emailResult.success) {
        console.log(`✅ [DEACTIVATE EMAIL] Confirmation sent to ${user.email}`);
      } else {
        console.error(`❌ [DEACTIVATE EMAIL] Failed: ${emailResult.error}`);
      }
    } catch (err) {
      console.error(`⚠️ [DEACTIVATE EMAIL] Exception sending to ${user.email}:`, err.message);
    }

    res.json({ 
      message: 'Account deactivated successfully. You can reactivate by logging in again.',
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/delete-account
// @desc    Permanently delete user account (requires password verification)
// @access  Private
router.post('/delete-account', protect, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Please provide your password' });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`❌ [DELETE] Password verification failed for: ${user.email}`);
      return res.status(401).json({ 
        message: 'Incorrect password',
        showForgotPassword: true 
      });
    }

    const userEmail = user.email;
    const userName = user.name;

    // Send deletion confirmation email BEFORE deleting (so we have user data)
    try {
      console.log(`📧 [DELETE] Sending deletion email to: ${userEmail}`);
      const emailResult = await sendAccountDeletedEmail(userEmail, userName);
      if (emailResult.success) {
        console.log(`✅ [DELETE EMAIL] Confirmation sent to ${userEmail}`);
      } else {
        console.error(`❌ [DELETE EMAIL] Failed: ${emailResult.error}`);
      }
    } catch (err) {
      console.error(`⚠️ [DELETE EMAIL] Exception sending to ${userEmail}:`, err.message);
    }

    // Permanently delete user
    await User.findByIdAndDelete(req.user._id);

    console.log(`✅ [DELETE] Account permanently deleted for: ${userEmail}`);

    res.json({ 
      message: 'Account deleted permanently. You can register again with the same email.',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/reactivate-account
// @desc    Reactivate a deactivated account during login
// @access  Public
router.post('/reactivate-account', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user including inactive ones
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reactivate account
    user.isActive = true;
    user.deactivatedAt = null;
    await user.save();

    console.log(`✅ [REACTIVATE] Account reactivated for: ${user.email}`);

    // Send reactivation welcome back email
    try {
      console.log(`📧 [REACTIVATE] Sending welcome back email to: ${user.email}`);
      const emailResult = await sendAccountReactivatedEmail(user.email, user.name);
      if (emailResult.success) {
        console.log(`✅ [REACTIVATE EMAIL] Welcome back sent to ${user.email}`);
      } else {
        console.error(`❌ [REACTIVATE EMAIL] Failed: ${emailResult.error}`);
      }
    } catch (err) {
      console.error(`⚠️ [REACTIVATE EMAIL] Exception sending to ${user.email}:`, err.message);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token: generateToken(user._id),
      message: 'Account reactivated successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
