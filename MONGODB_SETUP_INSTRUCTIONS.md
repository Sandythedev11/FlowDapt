# MongoDB Atlas Setup Instructions

## 🎯 Fix: "MongoServerSelectionError - IP not whitelisted"

This is the **most common issue** when starting FlowDapt. Follow these steps to fix it.

---

## 📋 Step-by-Step Solution

### Step 1: Log into MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign in with your MongoDB Atlas account
3. You should see your cluster: **dbflowdapt**

---

### Step 2: Navigate to Network Access

1. In the left sidebar, click **"Network Access"**
2. You'll see a list of whitelisted IP addresses
3. If the list is empty or doesn't include your current IP, that's the problem!

---

### Step 3: Add IP Address

#### Option A: Allow Access from Anywhere (Development Only)

**⚠️ Use this for development/testing only!**

1. Click the **"Add IP Address"** button
2. Click **"Allow Access from Anywhere"**
3. This will add **0.0.0.0/0** to the whitelist
4. Add a comment: "Development - Allow All"
5. Click **"Confirm"**

**Pros:**
- ✅ Works from any location
- ✅ No need to update when IP changes
- ✅ Perfect for development

**Cons:**
- ⚠️ Less secure (anyone can attempt to connect)
- ⚠️ Not recommended for production

#### Option B: Add Your Current IP (Production)

**✅ Use this for production deployments**

1. Click the **"Add IP Address"** button
2. Click **"Add Current IP Address"**
3. Your current IP will be auto-detected
4. Add a comment: "Production Server" or "My Office"
5. Click **"Confirm"**

**Pros:**
- ✅ More secure
- ✅ Only your IP can connect

**Cons:**
- ⚠️ Need to update if IP changes
- ⚠️ Won't work from other locations

---

### Step 4: Wait for Changes to Propagate

**Important:** Changes take 1-2 minutes to take effect

1. Wait **2 minutes** after adding the IP
2. Don't restart your server immediately
3. MongoDB Atlas needs time to update its firewall rules

---

### Step 5: Restart Your Server

```bash
# Stop the current server (Ctrl+C)

# Start it again
cd backend
npm start
```

**Expected Output:**
```
✅ [MongoDB] Connected successfully
   Host: dbflowdapt.l5h23m6.mongodb.net
   Database: flowdapt
```

---

## ✅ Verification

### Check 1: Server Logs

Look for this in your server logs:
```
✅ [MongoDB] Connected successfully
```

If you still see errors, wait another minute and restart.

### Check 2: Health Endpoint

Visit: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "healthy",
  "services": {
    "database": {
      "connected": true,
      "state": "connected"
    }
  }
}
```

### Check 3: Test Registration

1. Go to `http://localhost:5173`
2. Try to register a new account
3. If it works, MongoDB is connected!

---

## 🔧 Still Having Issues?

### Issue: "Authentication failed"

**Error Message:**
```
❌ [MongoDB] Connection failed
   Error: bad auth Authentication failed
```

**Solution:**
1. Check your MongoDB password in `.env`
2. Your current password: `oKwf5NsczlmHCT3g`
3. Make sure there are no extra spaces
4. Verify the username is correct: `sandeepgouda209_db_user`

**Fix `.env`:**
```env
MONGO_URI=mongodb+srv://sandeepgouda209_db_user:oKwf5NsczlmHCT3g@dbflowdapt.l5h23m6.mongodb.net/flowdapt
```

---

### Issue: "ENOTFOUND" or "DNS resolution failed"

**Error Message:**
```
❌ [MongoDB] Connection failed
   Error: ENOTFOUND dbflowdapt.l5h23m6.mongodb.net
```

**Possible Causes:**
1. No internet connection
2. DNS issues
3. VPN blocking MongoDB
4. Firewall blocking port 27017

**Solutions:**
1. Check your internet connection
2. Try disabling VPN
3. Check firewall settings
4. Try from a different network

---

### Issue: Connection works sometimes but not always

**Cause:** Your IP address changed

**Solution:**
1. If using specific IP whitelist, your IP may have changed
2. Check your current IP: [https://whatismyipaddress.com](https://whatismyipaddress.com)
3. Add the new IP to MongoDB Atlas Network Access
4. Or switch to "Allow Access from Anywhere" (0.0.0.0/0) for development

---

## 📊 MongoDB Atlas Dashboard Overview

### Key Sections

1. **Clusters** - View your database clusters
2. **Network Access** - Manage IP whitelist (THIS IS WHERE YOU FIX THE ERROR)
3. **Database Access** - Manage database users and passwords
4. **Metrics** - View connection and performance metrics

### Useful Metrics

- **Connections**: See active connections
- **Operations**: Database operations per second
- **Network**: Data transfer

---

## 🔐 Security Best Practices

### Development
- ✅ Use 0.0.0.0/0 for convenience
- ✅ Keep credentials in `.env` (never commit)
- ✅ Use strong passwords

### Production
- ✅ Whitelist only specific IPs
- ✅ Use environment variables
- ✅ Enable MongoDB Atlas encryption
- ✅ Regular password rotation
- ✅ Monitor access logs

---

## 📞 Quick Reference

### Your MongoDB Details

```
Cluster: dbflowdapt
Username: sandeepgouda209_db_user
Password: oKwf5NsczlmHCT3g
Database: flowdapt
Connection String: mongodb+srv://sandeepgouda209_db_user:oKwf5NsczlmHCT3g@dbflowdapt.l5h23m6.mongodb.net/flowdapt
```

### Important Links

- MongoDB Atlas: https://cloud.mongodb.com
- Network Access: https://cloud.mongodb.com/v2#/org/YOUR_ORG/access/network
- Documentation: https://www.mongodb.com/docs/atlas/

---

## ✅ Success Checklist

After following these steps, verify:

- [ ] IP address added to MongoDB Atlas Network Access
- [ ] Waited 2 minutes for changes to propagate
- [ ] Server restarted
- [ ] Server logs show "✅ [MongoDB] Connected successfully"
- [ ] `/api/health` shows database connected
- [ ] Registration/login works in the app

**All checked?** Your MongoDB connection is working! 🎉

---

## 🎯 Summary

**The Problem:**
MongoDB Atlas blocks connections from IP addresses that aren't whitelisted.

**The Solution:**
Add your IP address (or 0.0.0.0/0) to the Network Access whitelist in MongoDB Atlas.

**Time Required:**
5 minutes (including 2-minute propagation wait)

**Difficulty:**
Easy - just a few clicks in MongoDB Atlas dashboard

---

**Last Updated:** December 16, 2025
