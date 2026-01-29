# FlowDapt Quick Start Guide

Get FlowDapt up and running in 5 minutes!

---

## 🚀 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Gmail account with 2FA enabled

---

## 📋 Step 1: MongoDB Atlas Setup

### 1.1 Whitelist Your IP Address

**This is the most common issue!**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster: **dbflowdapt**
3. Click **"Network Access"** in the left sidebar
4. Click **"Add IP Address"**
5. **For Development:** Click **"Allow Access from Anywhere"** (0.0.0.0/0)
6. **For Production:** Add your specific server IP
7. Click **"Confirm"**
8. ⏳ Wait 1-2 minutes for changes to take effect

### 1.2 Verify Connection String

Your connection string should look like:
```
mongodb+srv://sandeepgouda209_db_user:oKwf5NsczlmHCT3g@dbflowdapt.l5h23m6.mongodb.net/flowdapt
```

✅ Password is already filled in
✅ Database name is `flowdapt`

---

## 📧 Step 2: Gmail SMTP Setup

### 2.1 Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

### 2.2 Generate App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select **"Mail"** as the app
3. Select **"Other"** as the device, name it "FlowDapt"
4. Click **"Generate"**
5. Copy the 16-character password (remove spaces)

Your current app password: `gvkfeyfclbhkxsqg`

---

## ⚙️ Step 3: Environment Configuration

Your `.env` file is already configured with:

```env
# Database
MONGO_URI=mongodb+srv://sandeepgouda209_db_user:oKwf5NsczlmHCT3g@dbflowdapt.l5h23m6.mongodb.net/flowdapt

# JWT
JWT_SECRET=d9f1c273ba4ce98f7fb2c1a4f0e91bead23f56aa8c7e49f3b18d9452cfb9721fc8d5b0a439af17d2cf83b11c2d6487ed
JWT_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sandeepgouda209@gmail.com
SMTP_PASS=gvkfeyfclbhkxsqg
SMTP_FROM=FlowDapt <sandeepgouda209@gmail.com>

# AI
GEMINI_API_KEY=AIzaSyAfDJz8_C3Lm7NxQuCNTeQBUwFtI56f8_g
```

✅ All credentials are set!

---

## 🏃 Step 4: Start the Application

### 4.1 Install Dependencies (First Time Only)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4.2 Start Backend Server

```bash
cd backend
npm start
```

**Expected Output:**
```
✅ [SMTP] Gmail SMTP server is ready to send emails
✅ [MongoDB] Connected successfully
🚀 SERVER STARTED SUCCESSFULLY 🚀
```

**If you see errors:**
- ❌ MongoDB connection failed → Check IP whitelist (Step 1.1)
- ❌ SMTP authentication failed → Check App Password (Step 2.2)

### 4.3 Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE ready in XXX ms
Local: http://localhost:5173
```

---

## ✅ Step 5: Verify Everything Works

### 5.1 Check Server Health

Open in browser: `http://localhost:5000/api/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": {
      "connected": true,
      "state": "connected"
    },
    "email": {
      "ready": true,
      "configured": true
    },
    "api": {
      "status": "operational"
    }
  }
}
```

### 5.2 Test Registration

1. Open `http://localhost:5173`
2. Click **"Register"**
3. Fill in your details
4. Submit the form
5. Check your email for verification code
6. Enter the code to verify

✅ If you receive the email, everything is working!

---

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error:** "MongoServerSelectionError" or "IP not whitelisted"

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add IP: 0.0.0.0/0 (Allow from anywhere)
3. Wait 2 minutes
4. Restart backend server

### Email Not Received

**Possible Issues:**
1. Check spam/junk folder
2. Verify SMTP_PASS is correct App Password (not regular password)
3. Check server logs for email delivery confirmation

### Server Starts in "DEGRADED" Mode

**Meaning:** Server is running but some services failed

**Solution:**
1. Check server logs for specific errors
2. Visit `/api/health` to see which service failed
3. Fix the failing service (MongoDB or SMTP)
4. Restart server

---

## 📊 Server Logs Explained

### ✅ Good Logs (Everything Working)

```
✅ [STARTUP] Environment variables validated
✅ [MongoDB] Connected successfully
✅ [SMTP] Gmail SMTP server is ready
🚀 SERVER STARTED SUCCESSFULLY 🚀
```

### ⚠️ Warning Logs (Partial Functionality)

```
✅ [MongoDB] Connected successfully
❌ [SMTP] Failed to connect to Gmail SMTP
⚠️  SMTP not ready - email features will be limited
```

**Impact:** Registration works but no emails sent

### ❌ Error Logs (Critical Issues)

```
❌ [MongoDB] Connection failed
💡 Server Selection Failed - IP address not whitelisted
⚠️  Server running in DEGRADED mode
```

**Impact:** Registration/login will fail with 503 errors

---

## 🎯 Common First-Time Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Can't register | MongoDB not connected | Whitelist IP in Atlas |
| No verification email | SMTP not configured | Use App Password, not regular password |
| 503 errors | Database unavailable | Check MongoDB connection |
| Server won't start | Missing .env | Copy from .env.example |

---

## 📞 Need Help?

1. **Check server logs** - They show detailed error messages
2. **Visit `/api/health`** - See which services are failing
3. **Read TROUBLESHOOTING.md** - Detailed solutions for all issues
4. **Restart after fixes** - Always restart server after configuration changes

---

## 🎉 Success Checklist

- [ ] MongoDB Atlas IP whitelisted (0.0.0.0/0)
- [ ] Gmail 2FA enabled
- [ ] Gmail App Password generated
- [ ] Backend server started successfully
- [ ] Frontend running on localhost:5173
- [ ] `/api/health` shows all services healthy
- [ ] Test registration successful
- [ ] Verification email received

**All checked?** You're ready to use FlowDapt! 🚀

---

**Next Steps:**
- Upload your first dataset
- Generate AI insights
- Create visualizations
- Export professional reports

---

**Last Updated:** December 2025
