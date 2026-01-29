# 📋 FlowDapt Production Features - Quick Reference

## One-Page Reference for All New Features

---

## 🔐 **RATE LIMITS**

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 requests | 15 minutes |
| Login/Register | 5 attempts | 15 minutes |
| AI Queries | 20 queries | 1 hour |
| File Uploads | 10 uploads | 1 hour |
| Password Reset | 3 attempts | 1 hour |

---

## 💰 **QUOTAS**

### **AI Usage**
| Tier | Daily | Monthly |
|------|-------|---------|
| Free | 20 | 500 |
| Premium | 200 | 5000 |

### **Storage**
| Tier | Limit |
|------|-------|
| Free | 100 MB |
| Premium | 5 GB |

---

## 📊 **LOG FILES**

| File | Content | Retention |
|------|---------|-----------|
| `error-YYYY-MM-DD.log` | Errors only | 14 days |
| `security-YYYY-MM-DD.log` | Security events | 30 days |
| `combined-YYYY-MM-DD.log` | All logs | 14 days |

**Location:** `backend/logs/`

---

## 🧹 **CRON JOBS**

| Job | Schedule | Action |
|-----|----------|--------|
| File Cleanup | Daily 2 AM | Delete files >30 days (free users) |
| Quota Reset | 1st of month | Reset monthly AI quotas |
| Storage Report | Sundays 3 AM | Generate usage report |

---

## 🏥 **HEALTH CHECK**

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": { "connected": true },
    "email": { "ready": true },
    "api": { "status": "operational" }
  }
}
```

---

## 🔧 **ENVIRONMENT VARIABLES**

```env
# Required
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Optional
LOG_LEVEL=info
PORT=5000
NODE_ENV=production
```

---

## 📁 **NEW FILES**

```
backend/
├── middleware/
│   ├── rateLimiter.js       # Rate limiting
│   └── aiQuota.js           # Quotas
├── utils/
│   ├── logger.js            # Logging
│   └── fileCleanup.js       # Cleanup
└── logs/                    # Log files
```

---

## 🧪 **QUICK TESTS**

### **Test Rate Limiting**
```bash
# Make 10 rapid login attempts
for ($i=1; $i -le 10; $i++) {
    curl -X POST http://localhost:5000/api/auth/login `
      -H "Content-Type: application/json" `
      -d '{\"email\":\"test@test.com\",\"password\":\"wrong\"}'
}
```

### **Test AI Quota**
```bash
# Make 21 AI queries (replace TOKEN)
for ($i=1; $i -le 21; $i++) {
    curl -X POST http://localhost:5000/api/ai/chat `
      -H "Authorization: Bearer TOKEN" `
      -H "Content-Type: application/json" `
      -d '{\"query\":\"test\"}'
}
```

### **Monitor Logs**
```bash
Get-Content backend/logs/combined-*.log -Wait -Tail 50
```

---

## 💡 **COMMON COMMANDS**

```bash
# Start server
cd backend && npm start

# Check health
curl http://localhost:5000/api/health

# View logs
Get-Content backend/logs/combined-*.log -Tail 50

# View errors
Get-Content backend/logs/error-*.log -Tail 50

# View security events
Get-Content backend/logs/security-*.log -Tail 50

# Check log files
ls backend/logs/
```

---

## 🚨 **ERROR RESPONSES**

### **Rate Limit Exceeded**
```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```
**Status:** 429

### **AI Quota Exceeded**
```json
{
  "success": false,
  "message": "Daily AI query limit reached (20 queries).",
  "quota": {
    "used": 20,
    "limit": 20,
    "remaining": 0
  }
}
```
**Status:** 429

### **Storage Quota Exceeded**
```json
{
  "success": false,
  "message": "Storage quota exceeded.",
  "quota": {
    "usedMB": "95.5",
    "limitMB": "100.0"
  }
}
```
**Status:** 429

---

## 📈 **MONITORING**

### **What to Monitor**
- Rate limit exceeded events
- AI quota exceeded events
- Storage quota exceeded events
- Authentication failures
- File upload errors
- Database connection issues

### **Where to Look**
- `backend/logs/security-*.log` - Security events
- `backend/logs/error-*.log` - Application errors
- `/api/health` - System health

---

## 🔍 **TROUBLESHOOTING**

| Issue | Solution |
|-------|----------|
| Port in use | Kill process or use different port |
| Logs not created | Check directory permissions |
| Rate limit not working | Check middleware order |
| Quotas not enforcing | Verify User model updated |

---

## 💵 **COST ESTIMATES**

### **100 Users**
- MongoDB: $25/mo
- Backend: $5-10/mo
- AI (controlled): $20-50/mo
- **Total: $50-85/mo**

### **1000 Users**
- MongoDB: $57/mo
- Backend: $20-30/mo
- AI (controlled): $100-200/mo
- **Total: $177-287/mo**

**Savings vs Uncontrolled: 60-95%**

---

## ✅ **VERIFICATION**

Quick checklist:
- [ ] Server starts successfully
- [ ] Health check returns 200
- [ ] Logs directory exists
- [ ] Rate limiting works
- [ ] AI quotas enforce
- [ ] Storage quotas enforce

---

## 📚 **DOCUMENTATION**

- `PRODUCTION_READY_SUMMARY.md` - Overview
- `PRODUCTION_HARDENING_GUIDE.md` - Technical details
- `TESTING_GUIDE.md` - Testing instructions
- `IMPLEMENTATION_SUMMARY.md` - What changed

---

**Quick Reference Version:** 1.0
**Last Updated:** January 29, 2025
