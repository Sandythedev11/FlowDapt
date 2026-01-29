# 🚀 FlowDapt Deployment Guide for Render.com

## Complete Guide for Deploying Both Frontend and Backend on Render.com

---

## 📋 **Prerequisites**

- GitHub account with FlowDapt repository
- Render.com account (free tier available)
- MongoDB Atlas account (already configured)
- Gmail SMTP credentials
- Google Gemini API key

---

## 🎯 **Deployment Overview**

We'll deploy:
1. **Backend** - Node.js/Express API on Render.com
2. **Frontend** - React/Vite app on Render.com (Static Site)

**Current Status:**
- ✅ Backend deployed: https://flowdapt.onrender.com
- ⏳ Frontend: To be deployed

---

## 🔧 **STEP 1: Backend Deployment (Already Done)**

Your backend is already running at: https://flowdapt.onrender.com

### Verify Backend is Working

```bash
curl https://flowdapt.onrender.com/api/health
```

Expected response:
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

### Backend Environment Variables (Already Configured)

Make sure these are set in Render.com dashboard:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://sandeepgouda209_db_user:oKwf5NsczlmHCT3g@dbflowdapt.l5h23m6.mongodb.net/flowdapt
JWT_SECRET=d9f1c273ba4ce98f7fb2c1a4f0e91bead23f56aa8c7e49f3b18d9452cfb9721fc8d5b0a439af17d2cf83b11c2d6487ed
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sandeepgouda209@gmail.com
SMTP_PASS=gvkfeyfclbhkxsqg
SMTP_FROM=FlowDapt <sandeepgouda209@gmail.com>
GEMINI_API_KEY=AIzaSyAfDJz8_C3Lm7NxQuCNTeQBUwFtI56f8_g
FRONTEND_URL=https://your-frontend-url.onrender.com
LOG_LEVEL=info
```

**⚠️ Important:** Update `FRONTEND_URL` after deploying frontend!

---

## 🎨 **STEP 2: Frontend Deployment on Render.com**

### 2.1 Prepare Frontend for Deployment

The frontend `.env` file has been updated to:
```env
VITE_API_URL=https://flowdapt.onrender.com
```

### 2.2 Create Frontend Service on Render.com

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click "New +" → "Static Site"

2. **Connect GitHub Repository**
   - Select your GitHub account
   - Choose repository: `Sandythedev11/FlowDapt`
   - Click "Connect"

3. **Configure Build Settings**

   **Name:** `flowdapt-frontend` (or your preferred name)
   
   **Branch:** `main`
   
   **Root Directory:** `frontend`
   
   **Build Command:**
   ```bash
   npm install && npm run build
   ```
   
   **Publish Directory:** `dist`

4. **Add Environment Variables**
   
   Click "Advanced" → "Add Environment Variable"
   
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://flowdapt.onrender.com` |

5. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment (5-10 minutes)
   - Note your frontend URL: `https://flowdapt-frontend.onrender.com` (or similar)

### 2.3 Update Backend CORS

After frontend is deployed, update backend environment variable:

1. Go to backend service in Render dashboard
2. Go to "Environment" tab
3. Update `FRONTEND_URL` to your frontend URL:
   ```
   FRONTEND_URL=https://flowdapt-frontend.onrender.com
   ```
4. Save changes (backend will auto-redeploy)

---

## 🔄 **STEP 3: Update Local Configuration**

### Update Frontend .env

```bash
# frontend/.env
VITE_API_URL=https://flowdapt.onrender.com
```

### Update Backend .env

```bash
# backend/.env
FRONTEND_URL=https://flowdapt-frontend.onrender.com
```

---

## 📊 **STEP 4: Verify Deployment**

### 4.1 Test Backend

```bash
# Health check
curl https://flowdapt.onrender.com/api/health

# Test CORS
curl -H "Origin: https://flowdapt-frontend.onrender.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://flowdapt.onrender.com/api/auth/login
```

### 4.2 Test Frontend

1. Visit your frontend URL: `https://flowdapt-frontend.onrender.com`
2. Try to register a new account
3. Check email for verification OTP
4. Login and upload a file
5. Test AI queries
6. Verify all features work

### 4.3 Check Logs

**Backend Logs:**
- Go to Render dashboard → Backend service → "Logs" tab
- Look for startup messages and any errors

**Frontend Logs:**
- Go to Render dashboard → Frontend service → "Logs" tab
- Check build logs for any issues

---

## 🔧 **STEP 5: Configure Custom Domain (Optional)**

### For Backend

1. Go to backend service → "Settings" tab
2. Scroll to "Custom Domain"
3. Click "Add Custom Domain"
4. Enter your domain: `api.yourdomain.com`
5. Add CNAME record to your DNS:
   ```
   CNAME api.yourdomain.com → flowdapt.onrender.com
   ```

### For Frontend

1. Go to frontend service → "Settings" tab
2. Scroll to "Custom Domain"
3. Click "Add Custom Domain"
4. Enter your domain: `yourdomain.com` or `www.yourdomain.com`
5. Add CNAME record to your DNS:
   ```
   CNAME www.yourdomain.com → flowdapt-frontend.onrender.com
   ```

**After adding custom domains:**
- Update `VITE_API_URL` in frontend to `https://api.yourdomain.com`
- Update `FRONTEND_URL` in backend to `https://yourdomain.com`

---

## 🔐 **STEP 6: Security Checklist**

- [ ] HTTPS enabled (automatic on Render)
- [ ] Environment variables set correctly
- [ ] CORS configured with frontend URL
- [ ] MongoDB IP whitelist includes Render IPs (or use 0.0.0.0/0)
- [ ] Gmail SMTP working
- [ ] Gemini API key valid
- [ ] Rate limiting active
- [ ] AI quotas enforced
- [ ] Storage quotas enforced

---

## 📊 **STEP 7: Monitoring**

### Render.com Built-in Monitoring

**Backend:**
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

**Frontend:**
- Build status
- Deploy history
- Bandwidth usage

### External Monitoring (Recommended)

1. **Sentry** (Error Tracking)
   - Sign up: https://sentry.io
   - Add DSN to backend environment variables
   - Monitor errors in real-time

2. **UptimeRobot** (Uptime Monitoring)
   - Sign up: https://uptimerobot.com
   - Monitor: `https://flowdapt.onrender.com/api/health`
   - Get alerts for downtime

---

## 💰 **STEP 8: Cost Management**

### Render.com Pricing

**Free Tier:**
- ✅ Static sites: Unlimited
- ✅ Web services: 750 hours/month
- ⚠️ Services spin down after 15 min inactivity
- ⚠️ Cold starts (30-60 seconds)

**Starter Plan ($7/month per service):**
- ✅ Always on (no spin down)
- ✅ Faster performance
- ✅ More resources

**Recommendation:**
- Start with free tier for testing
- Upgrade backend to Starter when ready for production
- Keep frontend on free tier (static sites don't spin down)

### Total Monthly Costs

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Backend (Render) | $0 | $7/month |
| Frontend (Render) | $0 | $0 |
| MongoDB Atlas | $0-25 | $25-57 |
| Gemini API | $20-50 | $100-200 |
| **Total** | **$20-75** | **$132-264** |

---

## 🚨 **Troubleshooting**

### Backend Issues

**Issue:** Service won't start
```bash
# Check logs in Render dashboard
# Common causes:
# - Missing environment variables
# - MongoDB connection failed
# - Port binding issues
```

**Solution:**
1. Verify all environment variables are set
2. Check MongoDB Atlas IP whitelist
3. Ensure PORT is set to 5000 or use Render's PORT

**Issue:** CORS errors
```bash
# Error: Access to fetch at 'https://flowdapt.onrender.com' from origin 'https://frontend.onrender.com' has been blocked
```

**Solution:**
1. Update `FRONTEND_URL` in backend environment variables
2. Redeploy backend
3. Clear browser cache

### Frontend Issues

**Issue:** Build fails
```bash
# Check build logs in Render dashboard
```

**Solution:**
1. Verify `package.json` has correct build script
2. Check for TypeScript errors
3. Ensure all dependencies are in `package.json`

**Issue:** API calls fail
```bash
# Error: Failed to fetch
```

**Solution:**
1. Verify `VITE_API_URL` is set correctly
2. Check backend is running
3. Test backend health endpoint
4. Check browser console for CORS errors

### Database Issues

**Issue:** MongoDB connection timeout
```bash
# Error: MongoServerSelectionError
```

**Solution:**
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Use `0.0.0.0/0` to allow all IPs
4. Or add Render's IP ranges

---

## 🔄 **STEP 9: Continuous Deployment**

### Auto-Deploy on Git Push

Render automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Render detects changes and auto-deploys
4. Monitor deployment in Render dashboard

### Manual Deploy

If auto-deploy is disabled:
1. Go to Render dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"

---

## ✅ **STEP 10: Post-Deployment Checklist**

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] File upload works
- [ ] AI queries work
- [ ] Charts render correctly
- [ ] Report export works
- [ ] Feedback submission works
- [ ] Rate limiting works
- [ ] AI quotas enforced
- [ ] Storage quotas enforced
- [ ] Logs are being generated
- [ ] No CORS errors
- [ ] No console errors

---

## 📞 **Support**

### Render.com Support
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### FlowDapt Support
- GitHub Issues: https://github.com/Sandythedev11/FlowDapt/issues
- Email: sandeepgouda209@gmail.com

---

## 🎉 **Success!**

Your FlowDapt platform is now deployed on Render.com!

**URLs:**
- Backend: https://flowdapt.onrender.com
- Frontend: https://flowdapt-frontend.onrender.com (update with your actual URL)
- Health Check: https://flowdapt.onrender.com/api/health

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring (Sentry, UptimeRobot)
3. Monitor costs for first week
4. Consider upgrading to paid tier for production
5. Add custom domain (optional)

---

**Deployment Date:** January 29, 2025
**Version:** 2.0.0 (Production-Hardened)
**Status:** ✅ Ready for Production
