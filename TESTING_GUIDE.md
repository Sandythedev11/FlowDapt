# 🧪 FlowDapt Production Features - Testing Guide

## Quick Testing Guide for All New Features

---

## 🚀 **STEP 1: START THE SERVER**

```bash
cd backend
npm start
```

**Expected Output:**
```
✅ [STARTUP] Environment variables validated
✅ [MongoDB] Connected successfully
✅ Cleanup cron jobs initialized
✅ [SMTP] Gmail SMTP server is ready
🛡️  Security: ✅ Helmet, Rate Limiting, Sanitization
📊 Monitoring: ✅ Winston Logger
🧹 Cleanup: ✅ Automated Jobs Active
```

---

## 🔐 **STEP 2: TEST RATE LIMITING**

### **Test Authentication Rate Limit (5 attempts/15min)**

```bash
# Windows PowerShell
for ($i=1; $i -le 10; $i++) {
    curl -X POST http://localhost:5000/api/auth/login `
      -H "Content-Type: application/json" `
      -d '{\"email\":\"test@test.com\",\"password\":\"wrong\"}'
    Write-Host ""
}
```

**Expected Result:**
- First 5 attempts: Return error (invalid credentials)
- 6th attempt onwards: `429 Too Many Requests` - "Too many login attempts"

### **Test General API Rate Limit (100 requests/15min)**

```bash
# Make 105 rapid requests
for ($i=1; $i -le 105; $i++) {
    curl http://localhost:5000/api/health
}
```

**Expected Result:**
- First 100 requests: Return 200 OK
- 101st request onwards: `429 Too Many Requests`

---

## 💰 **STEP 3: TEST AI QUOTAS**

### **Prerequisites:**
1. Register a new user
2. Login and get JWT token
3. Upload a CSV file

### **Test Daily AI Quota (20 queries/day for free users)**

```bash
# Replace YOUR_TOKEN with actual JWT token
$token = "YOUR_TOKEN_HERE"

# Make 21 AI queries
for ($i=1; $i -le 21; $i++) {
    Write-Host "Query $i"
    curl -X POST http://localhost:5000/api/ai/chat `
      -H "Authorization: Bearer $token" `
      -H "Content-Type: application/json" `
      -d '{\"query\":\"What is the average value?\",\"sessionId\":\"test\"}'
    Write-Host ""
}
```

**Expected Result:**
- First 20 queries: Return AI response with quota info
- 21st query: `429 Too Many Requests` - "Daily AI query limit reached"

**Response includes quota:**
```json
{
  "success": true,
  "response": "...",
  "quota": {
    "used": 20,
    "limit": 20,
    "remaining": 0
  }
}
```

---

## 📁 **STEP 4: TEST STORAGE QUOTAS**

### **Test Storage Limit (100MB for free users)**

```bash
# Upload multiple files until quota exceeded
$token = "YOUR_TOKEN_HERE"

# Upload a 10MB file 11 times (total 110MB)
for ($i=1; $i -le 11; $i++) {
    Write-Host "Upload $i"
    curl -X POST http://localhost:5000/api/upload `
      -H "Authorization: Bearer $token" `
      -F "file=@path/to/your/file.csv"
    Write-Host ""
}
```

**Expected Result:**
- First ~10 uploads: Success (depending on file size)
- When total exceeds 100MB: `429 Too Many Requests` - "Storage quota exceeded"

**Response includes storage info:**
```json
{
  "message": "File uploaded successfully",
  "storageQuota": {
    "used": 95000000,
    "limit": 104857600,
    "remaining": 9857600
  }
}
```

---

## 📊 **STEP 5: TEST LOGGING**

### **Check Logs Are Being Created**

```bash
# List log files
ls backend/logs/

# Expected files:
# - error-2025-01-29.log
# - security-2025-01-29.log
# - combined-2025-01-29.log
```

### **Monitor Logs in Real-Time**

```bash
# Watch all logs
Get-Content backend/logs/combined-*.log -Wait -Tail 50

# Watch errors only
Get-Content backend/logs/error-*.log -Wait -Tail 50

# Watch security events
Get-Content backend/logs/security-*.log -Wait -Tail 50
```

### **Trigger Security Events**

```bash
# Trigger rate limit (security event)
for ($i=1; $i -le 10; $i++) {
    curl -X POST http://localhost:5000/api/auth/login `
      -H "Content-Type: application/json" `
      -d '{\"email\":\"test@test.com\",\"password\":\"wrong\"}'
}

# Check security log
Get-Content backend/logs/security-*.log -Tail 20
```

**Expected in security log:**
```json
{
  "level": "warn",
  "message": "Security Event: Rate Limit Exceeded - Auth",
  "ip": "::1",
  "email": "test@test.com",
  "timestamp": "2025-01-29 21:00:00"
}
```

---

## 🏥 **STEP 6: TEST HEALTH CHECK**

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-29T21:00:00.000Z",
  "services": {
    "database": {
      "connected": true,
      "state": "connected",
      "readyState": 1
    },
    "email": {
      "ready": true,
      "configured": true,
      "error": null
    },
    "api": {
      "status": "operational"
    }
  }
}
```

---

## 🧹 **STEP 7: TEST CLEANUP JOBS (Optional)**

### **Manual Cleanup Test**

```bash
# In Node.js console or create a test script
node -e "
const { cleanupOldFiles } = require('./backend/utils/fileCleanup');
cleanupOldFiles().then(result => {
  console.log('Cleanup result:', result);
  process.exit(0);
});
"
```

### **Check Cron Jobs Are Scheduled**

Look for this in server startup logs:
```
✅ Cleanup cron jobs initialized
   File cleanup: Daily at 2 AM
   Quota reset: 1st of month at midnight
   Storage report: Sundays at 3 AM
```

---

## 📈 **STEP 8: TEST PERFORMANCE**

### **Test Response Compression**

```bash
# Check if responses are compressed
curl -H "Accept-Encoding: gzip" -I http://localhost:5000/api/health
```

**Expected Header:**
```
Content-Encoding: gzip
```

### **Test Database Indexes**

```bash
# In MongoDB Compass or mongo shell
db.users.getIndexes()
db.uploads.getIndexes()
```

**Expected Indexes:**
- Users: email, createdAt, subscription, isActive
- Uploads: user+createdAt, createdAt, status, fileType

---

## ✅ **VERIFICATION CHECKLIST**

After running all tests, verify:

- [ ] Server starts without errors
- [ ] Health check returns 200 OK
- [ ] Rate limiting blocks after limits
- [ ] AI quotas enforce daily limits
- [ ] Storage quotas prevent over-upload
- [ ] Logs are being created in `backend/logs/`
- [ ] Security events are logged
- [ ] Compression is working
- [ ] Database indexes exist
- [ ] Cleanup jobs are scheduled

---

## 🐛 **TROUBLESHOOTING**

### **Server Won't Start**

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or use different port
$env:PORT=5001
npm start
```

### **Rate Limiting Not Working**

**Check:**
1. Middleware is imported in `server.js`
2. Middleware is applied before routes
3. Test with rapid requests

### **Logs Not Created**

**Check:**
1. `backend/logs/` directory exists
2. Write permissions on directory
3. Logger is imported in files

### **AI Quotas Not Enforcing**

**Check:**
1. User model has `aiQuota` fields
2. Middleware is applied to `/api/ai/chat`
3. User is authenticated (has valid token)

---

## 📊 **EXPECTED RESULTS SUMMARY**

| Feature | Test | Expected Result |
|---------|------|-----------------|
| **Rate Limiting** | 10 login attempts | Block after 5 |
| **AI Quota** | 21 AI queries | Block on 21st |
| **Storage Quota** | Upload >100MB | Block when exceeded |
| **Logging** | Any request | Log file created |
| **Security Events** | Rate limit hit | Logged in security log |
| **Health Check** | GET /api/health | 200 OK with status |
| **Compression** | Any response | gzip header present |

---

## 🎉 **SUCCESS CRITERIA**

Your implementation is successful if:

✅ All rate limits enforce correctly
✅ AI quotas prevent unlimited usage
✅ Storage quotas prevent disk exhaustion
✅ Logs are created and rotated
✅ Security events are tracked
✅ Health check returns correct status
✅ No errors in server startup

---

## 📞 **NEED HELP?**

1. Check server logs: `backend/logs/combined-*.log`
2. Check error logs: `backend/logs/error-*.log`
3. Review documentation: `PRODUCTION_HARDENING_GUIDE.md`
4. Verify environment variables in `.env`

---

**Testing Guide Version:** 1.0
**Last Updated:** January 29, 2025
**Status:** ✅ Ready for Testing
