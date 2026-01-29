# FlowDapt Troubleshooting Guide

This guide helps you diagnose and fix common issues with FlowDapt.

---

## 🔍 Quick Diagnostics

### Check Server Health

Visit: `http://localhost:5000/api/health`

This endpoint shows the status of all services:
- **Database**: MongoDB connection status
- **Email**: SMTP service status
- **API**: Server operational status

---

## 🗄️ MongoDB Connection Issues

### Error: "MongoServerSelectionError"

**Symptoms:**
- Registration/login fails with 503 error
- Server logs show "Server Selection Failed"
- Database connection timeout

**Common Causes & Solutions:**

#### 1. IP Address Not Whitelisted (Most Common)

**Solution:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Click **"Network Access"** in the left sidebar
4. Click **"Add IP Address"**
5. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
6. For production: Add your specific server IP address
7. Click **"Confirm"**
8. Wait 1-2 minutes for changes to propagate
9. Restart your server

#### 2. Incorrect Connection String

**Check your `.env` file:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

**Common mistakes:**
- Missing `<db_password>` placeholder replacement
- Wrong database name
- Incorrect cluster URL
- Special characters in password not URL-encoded

**Fix:**
- Replace `<db_password>` with your actual password
- URL-encode special characters in password
- Verify cluster URL from MongoDB Atlas

#### 3. Network/Firewall Issues

**Solution:**
- Check your internet connection
- Disable VPN temporarily
- Check firewall settings
- Try from a different network

---

## 📧 Email (SMTP) Issues

### Error: "Invalid login" or "Authentication failed"

**Symptoms:**
- Registration succeeds but no email received
- Server logs show SMTP authentication error

**Common Causes & Solutions:**

#### 1. Using Regular Password Instead of App Password

**Solution:**
1. Enable 2-Factor Authentication on your Google Account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new App Password for "Mail"
4. Copy the 16-character password (remove spaces)
5. Update `.env`:
   ```env
   SMTP_PASS=your16characterapppassword
   ```
6. Restart server

#### 2. 2-Factor Authentication Not Enabled

**Solution:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Then follow App Password steps above

#### 3. Incorrect Email Configuration

**Check your `.env` file:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=FlowDapt <your-email@gmail.com>
```

---

## 🔐 Authentication Issues

### Registration Fails with 503 Error

**Cause:** Database not connected

**Solution:**
1. Check server logs for MongoDB connection errors
2. Follow MongoDB troubleshooting steps above
3. Verify `/api/health` endpoint shows database connected

### Email Verification Code Not Received

**Possible Causes:**

1. **SMTP not configured** - Check server logs for SMTP errors
2. **Email in spam folder** - Check spam/junk folder
3. **Wrong email address** - Verify email during registration

**Solution:**
- Check `/api/health` endpoint - email service should show "ready"
- Check server logs for email delivery confirmation
- In development mode, OTP may be shown in server logs

### Login Fails After Registration

**Possible Causes:**

1. **Email not verified** - Complete email verification first
2. **Wrong password** - Check password carefully
3. **Database disconnected** - Check `/api/health`

---

## 🚀 Server Startup Issues

### Server Starts But Features Don't Work

**Check startup logs for:**
```
✅ [MongoDB] Connected successfully
✅ [SMTP] Gmail SMTP server is ready
🚀 SERVER STARTED SUCCESSFULLY
```

**If you see:**
```
❌ [MongoDB] Connection failed
⚠️  Server running in DEGRADED mode
```

**Solution:**
- Fix MongoDB connection (see MongoDB section above)
- Restart server after fixing issues

### Missing Environment Variables

**Error:** "Missing required environment variables"

**Solution:**
1. Ensure `.env` file exists in `backend/` folder
2. Copy from `.env.example` if needed
3. Fill in all required values:
   ```env
   MONGO_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   GEMINI_API_KEY=your-gemini-key
   ```

---

## 🧪 Testing Connections

### Test MongoDB Connection

```bash
# In backend directory
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ Connected')).catch(err => console.error('❌ Failed:', err.message));"
```

### Test SMTP Connection

```bash
# In backend directory
node -e "require('dotenv').config(); const nodemailer = require('nodemailer'); const t = nodemailer.createTransport({host:'smtp.gmail.com',port:587,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}); t.verify((e,s) => console.log(e ? '❌ Failed: ' + e.message : '✅ Connected'));"
```

---

## 📊 Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 503 | Service Unavailable | Database not connected - check MongoDB |
| 500 | Internal Server Error | Check server logs for details |
| 401 | Unauthorized | Invalid credentials or token |
| 400 | Bad Request | Invalid input data |

---

## 🔧 Development Mode Features

When `NODE_ENV=development`:

1. **OTP in logs** - If email fails, OTP shown in server logs
2. **Detailed errors** - More error information in responses
3. **Stack traces** - Full error stack traces included

---

## 📞 Still Having Issues?

1. **Check server logs** - Most issues show detailed error messages
2. **Visit `/api/health`** - See which services are failing
3. **Restart server** - After fixing configuration issues
4. **Check MongoDB Atlas** - Verify cluster is running
5. **Verify credentials** - Double-check all passwords and keys

---

## 🎯 Quick Checklist

Before starting the server, verify:

- [ ] `.env` file exists in `backend/` folder
- [ ] MongoDB URI is correct and password replaced
- [ ] IP address whitelisted in MongoDB Atlas (0.0.0.0/0 for dev)
- [ ] Gmail 2FA enabled
- [ ] Gmail App Password generated and set in SMTP_PASS
- [ ] All required environment variables set
- [ ] Internet connection working
- [ ] No firewall blocking MongoDB or SMTP ports

---

## 📝 Useful Commands

```bash
# Start backend server
cd backend
npm start

# Start frontend
cd frontend
npm run dev

# Check environment variables (backend)
cd backend
node -e "require('dotenv').config(); console.log(Object.keys(process.env).filter(k => !k.includes('PASSWORD') && !k.includes('SECRET')))"

# View server logs in real-time
cd backend
npm start | tee server.log
```

---

**Last Updated:** December 2025
