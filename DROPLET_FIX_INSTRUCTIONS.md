# 🚀 Fix Backend Connection Issue - Deployment Instructions

## 📋 **Issue Summary**
The frontend is unable to connect to the backend because:
1. Wrong fallback URL (port 3002 instead of 3001)
2. Frontend built without correct `REACT_APP_BACKEND_URL`
3. Docker container not receiving proper environment variables

## ✅ **Changes Made**
1. **Fixed fallback URL** in `src/services/backendService.js` (3002 → 3001)
2. **Updated Dockerfile** to accept `REACT_APP_BACKEND_URL` as build argument
3. **Updated docker-compose.yml** to pass environment variables correctly
4. **Added debug logging** to help troubleshoot connection issues

## 🔧 **Deployment Steps**

### **1. On Local Machine (Commit Changes):**
```bash
git add .
git commit -m "Fix frontend-backend connection issue"
git push origin main
```

### **2. On DigitalOcean Droplet:**

#### **Step 1: Connect to Droplet**
```bash
ssh root@159.89.166.89
cd /root/location-eval
```

#### **Step 2: Update Code**
```bash
git pull origin main
```

#### **Step 3: Update .env File**
```bash
cat > .env << 'EOF'
# Environment Configuration for Location Evaluation Tool
NODE_ENV=production
PORT=3001

# Frontend and Backend URLs - FIXED FOR CORS ISSUE
# Using IP address to match the origin the user is accessing from
FRONTEND_URL=http://159.89.166.89:3000
REACT_APP_BACKEND_URL=https://locationai.themomosmafia.in/api

# Google Maps API Key
GOOGLE_MAPS_API_KEY=AIzaSyAAUI6vIUmLQT7qwVr_CcDI-4pZpOcEEHg

# Gemini AI API Key  
GEMINI_API_KEY=AIzaSyCoeilj_q-UgxvjZvmbdoc8Hxdyr0PoDdc

# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging level
LOG_LEVEL=info
EOF
```

#### **Step 4: Complete Rebuild**
```bash
# Stop containers
docker-compose down --volumes --remove-orphans

# Clean up Docker images and cache
docker system prune -af

# Rebuild with no cache (IMPORTANT: This ensures frontend gets correct backend URL)
docker-compose build --no-cache --pull

# Start the application
docker-compose up -d

# Check logs
docker-compose logs -f
```

## 🎯 **Expected Results**

### **Successful Logs Should Show:**
```
✅ LocationService: Evaluation configuration loaded successfully
📊 LocationService: Loaded 26 evaluation parameters
🚀 Server starting on port 3001
📍 Google Maps API: Configured
🤖 Gemini AI API: Configured
✅ Server running at http://localhost:3001/api
```

### **Frontend Console Should Show:**
```
🔍 Checking backend availability at: https://locationai.themomosmafia.in/api
🌐 Backend availability result: true
```

## 🌐 **Test Your Application**

1. **Frontend**: https://locationai.themomosmafia.in
2. **Backend API**: https://locationai.themomosmafia.in/api/health
3. **Health Check**: Should return JSON with status "ok"

## 🔍 **Troubleshooting**

If still not working, check:

1. **Container Status:**
   ```bash
   docker-compose ps
   ```

2. **Logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Network Test:**
   ```bash
   curl https://locationai.themomosmafia.in/api/health
   ```

4. **Browser Console:** Should show the correct backend URL being used

## 🚨 **Key Points**
- The `--no-cache` rebuild is **CRITICAL** - this ensures the frontend is built with the correct backend URL
- The frontend must be rebuilt whenever `REACT_APP_BACKEND_URL` changes
- Check browser console for connection debugging info

---
**The fix addresses the core issue: frontend was built with wrong backend URL and couldn't connect to the live backend service.**
