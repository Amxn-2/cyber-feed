# 🚀 Monorepo Deployment Guide - Project CyberSuraksha

## 📁 Repository Structure
```
cyber-feed/                    # GitHub Repository
├── Frontend/                  # Next.js App → Vercel
├── Backend/                   # Node.js API → Railway
└── python-scraper/           # Python Service → Railway
```

## 🎯 Deployment Order (IMPORTANT!)

**Deploy in this exact order:**
1. **Python Scraper** (Railway)
2. **Backend** (Railway) 
3. **Frontend** (Vercel)

---

## 🐍 Step 1: Deploy Python Scraper (Railway)

### 1.1 Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**

### 1.2 Configure Repository
1. Choose your `cyber-feed` repository
2. **IMPORTANT**: In "Root Directory" field, enter: `python-scraper`
3. Click **"Deploy"**

### 1.3 Set Environment Variables
In Railway dashboard → **Variables** tab:

```bash
PORT=5000
HOST=0.0.0.0
DEBUG=False
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyber-incidents?retryWrites=true&w=majority
DB_NAME=cyber-incidents
COLLECTION_NAME=incidents
SCRAPING_INTERVAL=3600
MAX_CONCURRENT_REQUESTS=5
REQUEST_TIMEOUT=30
USER_AGENT=CyberSuraksha-Scraper/1.0
CORS_ORIGINS=https://your-frontend-url.vercel.app,https://your-backend-url.railway.app
LOG_LEVEL=INFO
CERT_IN_ENABLED=True
NEWS_SCRAPING_ENABLED=True
TEST_DATA_ENABLED=True
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
INDIA_ONLY=True
MIN_INCIDENT_AGE_DAYS=0
MAX_INCIDENT_AGE_DAYS=365
```

### 1.4 Test Python Service
- Wait for deployment to complete
- Copy the Railway URL (e.g., `https://python-scraper-production.railway.app`)
- Test: `https://your-python-url.railway.app/health`

---

## 🔗 Step 2: Deploy Backend (Railway)

### 2.1 Create Second Railway Project
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose the same `cyber-feed` repository
4. **IMPORTANT**: In "Root Directory" field, enter: `Backend`
5. Click **"Deploy"**

### 2.2 Set Environment Variables
```bash
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyber-incidents?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
PYTHON_SCRAPER_URL=https://your-python-scraper-url.railway.app
CORS_ORIGIN=https://your-frontend-url.vercel.app
LOG_LEVEL=info
```

### 2.3 Test Backend Service
- Wait for deployment
- Copy the Railway URL (e.g., `https://backend-production.railway.app`)
- Test: `https://your-backend-url.railway.app/api/health`

---

## 🌐 Step 3: Deploy Frontend (Vercel)

### 3.1 Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"New Project"**
4. Import your `cyber-feed` repository

### 3.2 Configure Root Directory
1. In the import screen, find **"Root Directory"**
2. Click **"Edit"** next to the root directory
3. Select **"Frontend"** folder
4. Click **"Continue"**

### 3.3 Set Environment Variables
In Vercel dashboard → **Settings** → **Environment Variables**:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_PYTHON_SCRAPER_URL=https://your-python-scraper-url.railway.app
```

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. Test your live site!

---

## 🔧 Railway Root Directory Configuration

### For Python Scraper:
- **Root Directory**: `python-scraper`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### For Backend:
- **Root Directory**: `Backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

## 🌐 Vercel Root Directory Configuration

### For Frontend:
- **Root Directory**: `Frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

---

## 🧪 Testing Your Deployment

### 1. Test All Services
```bash
# Python Scraper
curl https://your-python-url.railway.app/health

# Backend
curl https://your-backend-url.railway.app/api/health

# Frontend
# Visit: https://your-frontend-url.vercel.app
```

### 2. Test Data Flow
```bash
# Trigger data collection
curl -X POST https://your-backend-url.railway.app/api/collection/trigger

# Check if data appears in frontend
```

---

## 🚨 Common Monorepo Issues & Solutions

### Issue 1: "Build Failed - Can't find package.json"
**Solution**: Make sure you set the correct root directory in Railway/Vercel

### Issue 2: "Module not found" errors
**Solution**: Each service should only reference files within its own directory

### Issue 3: Environment variables not working
**Solution**: Set environment variables in the correct service (Python vs Backend)

### Issue 4: CORS errors between services
**Solution**: Update CORS_ORIGINS with actual deployed URLs

---

## 📊 Service URLs After Deployment

1. **Frontend**: `https://cyber-feed.vercel.app`
2. **Backend**: `https://cyber-backend.railway.app`
3. **Python Scraper**: `https://cyber-python.railway.app`

---

## 🎯 Pro Tips for Monorepo Deployment

1. **Deploy in order**: Python → Backend → Frontend
2. **Use specific root directories**: Don't deploy from root
3. **Test each service individually** before connecting them
4. **Update environment variables** with actual URLs after each deployment
5. **Check logs** in each platform's dashboard

---

## 🆘 Troubleshooting

### Railway Issues
- Check **"Root Directory"** is set correctly
- Verify **build commands** are appropriate for the folder
- Check **environment variables** are set

### Vercel Issues
- Ensure **"Root Directory"** is set to `Frontend`
- Check **build logs** for errors
- Verify **environment variables** are set

### General Issues
- Test each service individually
- Check network connectivity between services
- Verify MongoDB Atlas connection

---

## ✅ Success Checklist

- [ ] Python Scraper deployed and health check passes
- [ ] Backend deployed and health check passes  
- [ ] Frontend deployed and loads correctly
- [ ] All environment variables set correctly
- [ ] Data flows from Python → Backend → Frontend
- [ ] All features working in production

**Your Project CyberSuraksha is now live! 🚀**



