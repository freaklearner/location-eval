# 🚀 Complete Setup Guide - The Momos Mafia Location Evaluation Tool

## 📋 Overview

This is a full-stack application with:
- **Frontend**: React.js application (Port 3000)
- **Backend**: NestJS API server (Port 3001)
- **APIs**: Google Maps Platform + Gemini AI integration

## 🛠️ Prerequisites

- **Node.js**: Version 16+ with npm
- **Google Maps API Key**: With Places API, Geocoding API enabled
- **Gemini AI API Key**: From Google AI Studio

## 📦 Installation

### 1. Install Dependencies

```bash
# Install both frontend and backend dependencies
npm run install-all

# Or install manually:
npm install                    # Frontend dependencies
cd backend && npm install      # Backend dependencies
```

### 2. Environment Configuration

#### Frontend Environment (.env)
Create `.env` in the root directory:
```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:3001/api

# Optional: For direct API fallback
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

#### Backend Environment (backend/.env)
Already created with your API keys:
```env
# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=AIzaSyAAUI6vIUmLQT7qwVr_CcDI-4pZpOcEEHg

# Gemini AI Configuration  
GEMINI_API_KEY=AIzaSyCoeilj_q-UgxvjZvmbdoc8Hxdyr0PoDdc

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## 🚀 Running the Application

### Option 1: Run Both Together (Recommended)
```bash
npm run dev
```
This starts both backend (port 3001) and frontend (port 3000) simultaneously.

### Option 2: Run Separately
```bash
# Terminal 1: Backend
npm run backend

# Terminal 2: Frontend  
npm start
```

### Option 3: Production Build
```bash
npm run build-all
```

## 🔧 Google API Configuration

### 1. Google Maps Platform Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create a new project or select existing
3. **Enable APIs**:
   - Google Maps Places API
   - Google Maps Geocoding API
   - Google Maps JavaScript API (optional)

4. **Create API Key**:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the API key
   - **Important**: Restrict the API key for security

5. **API Key Restrictions** (Important for CORS):
   ```
   Application restrictions:
   - HTTP referrers (web sites)
   - Add these referrers:
     * http://localhost:3000/*
     * http://localhost:3001/*
     * http://127.0.0.1:3000/*
     * http://127.0.0.1:3001/*
     * your-production-domain.com/*
   
   API restrictions:
   - Restrict key to specific APIs:
     ✓ Places API
     ✓ Geocoding API
   ```

### 2. Gemini AI Setup

1. **Go to Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Create API Key**: Click "Create API Key"
3. **Copy the Key**: Save it securely
4. **No CORS restrictions needed**: Gemini API is accessed server-side

## 🌐 CORS Configuration

### Current Setup (Already Configured)

The backend is configured to handle CORS properly:

```javascript
// backend/src/main.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // Add your production URLs here
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
```

### If You Need to Add Your IP Address

1. **Find Your IP Address**:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. **Add to CORS Configuration** in `backend/src/main.ts`:
   ```javascript
   origin: [
     'http://localhost:3000',
     'http://127.0.0.1:3000',
     'http://YOUR_IP_ADDRESS:3000',  // Add your IP
     // Production URLs
   ],
   ```

3. **Add to Google Maps API Restrictions**:
   - Go to Google Cloud Console → Credentials
   - Edit your API key
   - Add to HTTP referrers: `http://YOUR_IP_ADDRESS:3000/*`

## 📱 Application Architecture

### Frontend (React)
```
src/
├── components/
│   ├── LocationEvaluator.js      # Main orchestrator
│   ├── LocationInput.js          # Input form
│   ├── AnalysisProgress.js       # Progress tracking
│   └── AnalysisResults.js        # Results display
├── services/
│   └── backendService.js         # Backend API client
└── hooks/
    ├── useGoogleMapsAPI.js       # Demo mode fallback
    └── useGeminiAnalysis.js      # Demo mode fallback
```

### Backend (NestJS)
```
backend/src/
├── modules/
│   ├── location/
│   │   ├── location.service.ts   # Google Maps integration
│   │   ├── location.controller.ts # API endpoints
│   │   └── analysis.controller.ts # Combined analysis
│   └── gemini/
│       ├── gemini.service.ts     # Gemini AI integration
│       └── gemini.controller.ts  # AI endpoints
└── main.ts                       # Server entry point
```

## 🔄 API Endpoints

### Location Analysis
- `POST /api/analysis/complete` - Complete location analysis
- `GET /api/analysis/health` - Health check

### Individual Services
- `POST /api/location/analyze` - Google Maps analysis only
- `POST /api/location/nearby-businesses` - Find nearby businesses
- `POST /api/location/text-search` - Search by text
- `GET /api/location/info` - Get location info
- `POST /api/gemini/evaluate` - AI evaluation only

## 🐛 Troubleshooting

### 1. Backend Server Not Starting
```bash
cd backend
npm install
npm run start:dev
```
Check console for error messages.

### 2. CORS Errors
- Ensure backend is running on port 3001
- Check Google Maps API key restrictions
- Verify CORS configuration in `backend/src/main.ts`

### 3. API Key Issues
- **Google Maps**: Check quotas and billing in Google Cloud Console
- **Gemini**: Verify API key in Google AI Studio
- **Environment**: Ensure `.env` files are properly configured

### 4. Frontend Not Connecting to Backend
- Check `REACT_APP_BACKEND_URL` in frontend `.env`
- Verify backend health: http://localhost:3001/api/analysis/health
- Check browser network tab for failed requests

### 5. Demo Mode Fallback
If backend is unavailable, the app automatically falls back to demo mode with sample data.

## 🚦 Health Checks

### Backend Health
Visit: http://localhost:3001/api/analysis/health

Expected response:
```json
{
  "success": true,
  "message": "Analysis service is healthy",
  "services": {
    "location": "Available",
    "gemini": "Available"
  }
}
```

### Frontend Health
The app will show backend status in the UI and automatically switch between live API and demo mode.

## 🏗️ Production Deployment

### Backend Deployment
1. Build the backend: `cd backend && npm run build`
2. Set production environment variables
3. Deploy to your server (Heroku, AWS, etc.)
4. Update CORS origins for production domain

### Frontend Deployment
1. Update `REACT_APP_BACKEND_URL` to production backend URL
2. Build: `npm run build`
3. Deploy to static hosting (Netlify, Vercel, etc.)

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com

# Frontend
REACT_APP_BACKEND_URL=https://your-backend-domain.com/api
```

## 📊 Features

### ✅ Working Features
- ✅ Complete location analysis workflow
- ✅ Google Maps API integration (server-side)
- ✅ Gemini AI evaluation
- ✅ CORS handling
- ✅ Error handling and fallbacks
- ✅ Demo mode for testing
- ✅ Professional UI with progress tracking
- ✅ Export capabilities (CSV, Print)

### 🔄 Automatic Fallbacks
- Backend unavailable → Demo mode
- API quota exceeded → Graceful error handling
- Network issues → Retry logic with user feedback

## 🎯 Usage

1. **Start the application**: `npm run dev`
2. **Open browser**: http://localhost:3000
3. **Enter coordinates**: Use the form or sample locations
4. **View analysis**: Real-time progress and comprehensive results
5. **Export reports**: Print or download CSV

The system now provides **production-ready, CORS-compliant** location analysis with intelligent fallbacks! 🚀 