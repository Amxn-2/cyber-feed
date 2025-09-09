# 🚀 Complete Deployment Guide - Project CyberSuraksha

## 📋 Overview
This guide will help you deploy your **Project CyberSuraksha** to the cloud for **FREE** using Railway and Vercel.

## 🏗️ Architecture
```
Frontend (Next.js) → Backend (Node.js) → Python Microservice
     ↓                    ↓                    ↓
   Vercel              Railway            Railway
   (Free)              (Free)             (Free)
```

## 🎯 Prerequisites
- GitHub account
- MongoDB Atlas account (free tier)
- Google Gemini API key (optional)
- 30 minutes of your time

---

## 🐍 Step 1: Deploy Python Scraper (Railway)

### 1.1 Go to Railway
1. Visit [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"**

### 1.2 Deploy from GitHub
1. Select **"Deploy from GitHub repo"**
2. Choose your `cyber-feed` repository
3. Select **"python-scraper"** folder
4. Click **"Deploy"**

### 1.3 Configure Environment Variables
In Railway dashboard, go to **Variables** tab and add:

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
1. Wait for deployment to complete
2. Copy the Railway URL (e.g., `https://python-scraper-production.railway.app`)
3. Test: `https://your-python-url.railway.app/health`

---

## 🔗 Step 2: Deploy Backend (Railway)

### 2.1 Create New Railway Project
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `cyber-feed` repository
4. Select **"Backend"** folder
5. Click **"Deploy"**

### 2.2 Configure Environment Variables
Add these variables in Railway:

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
1. Wait for deployment
2. Copy the Railway URL (e.g., `https://backend-production.railway.app`)
3. Test: `https://your-backend-url.railway.app/api/health`

---

## 🌐 Step 3: Deploy Frontend (Vercel)

### 3.1 Go to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"New Project"**

### 3.2 Import Repository
1. Select your `cyber-feed` repository
2. Set **Root Directory** to `Frontend`
3. Click **"Deploy"**

### 3.3 Configure Environment Variables
In Vercel dashboard, go to **Settings** → **Environment Variables**:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_PYTHON_SCRAPER_URL=https://your-python-scraper-url.railway.app
```

### 3.4 Redeploy
1. Go to **Deployments** tab
2. Click **"Redeploy"** to apply environment variables
3. Wait for deployment to complete

---

## 🔧 Step 4: Configure MongoDB Atlas

### 4.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a new cluster

### 4.2 Get Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `cyber-incidents`

### 4.3 Configure Network Access
1. Go to **Network Access**
2. Add **"0.0.0.0/0"** to allow all IPs (for Railway)
3. Or add specific Railway IPs for better security

---

## 🧪 Step 5: Test Your Deployment

### 5.1 Test All Services
```bash
# Test Python Scraper
curl https://your-python-url.railway.app/health

# Test Backend
curl https://your-backend-url.railway.app/api/health

# Test Frontend
# Visit: https://your-frontend-url.vercel.app
```

### 5.2 Test Data Collection
```bash
# Trigger data collection
curl -X POST https://your-backend-url.railway.app/api/collection/trigger

# Check collection status
curl https://your-backend-url.railway.app/api/collection/status
```

### 5.3 Test Frontend Features
1. Visit your Vercel URL
2. Check if data loads on dashboard
3. Test incidents page
4. Test analytics pages
5. Test AI analysis (if Gemini key is configured)

---

## 🎯 Step 6: Custom Domain (Optional)

### 6.1 Vercel Custom Domain
1. Go to Vercel dashboard → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CORS_ORIGIN` in backend environment variables

### 6.2 Railway Custom Domain
1. Go to Railway project → **Settings** → **Domains**
2. Add custom domain
3. Update DNS records
4. Update environment variables with new URLs

---

## 🔍 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Frontend can't access backend
**Solution**: 
- Check `CORS_ORIGIN` in backend environment variables
- Ensure frontend URL is included
- Redeploy backend after changes

#### 2. MongoDB Connection Failed
**Problem**: Backend can't connect to MongoDB
**Solution**:
- Check `MONGODB_URI` format
- Verify network access in MongoDB Atlas
- Check username/password

#### 3. Python Service Not Responding
**Problem**: Python scraper returns 500 errors
**Solution**:
- Check Railway logs
- Verify all environment variables are set
- Test locally first

#### 4. Frontend Build Errors
**Problem**: Vercel build fails
**Solution**:
- Check build logs in Vercel
- Ensure all environment variables are set
- Test build locally: `npm run build`

### Debug Commands

```bash
# Check Railway logs
railway logs

# Check Vercel logs
vercel logs

# Test locally
cd Backend && npm start
cd python-scraper && python main.py
cd Frontend && npm run dev
```

---

## 📊 Monitoring Your Deployment

### Health Check URLs
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app/api/health`
- **Python**: `https://your-python.railway.app/health`

### Railway Monitoring
1. Go to Railway dashboard
2. Check **Metrics** tab for CPU/Memory usage
3. Check **Logs** tab for errors

### Vercel Monitoring
1. Go to Vercel dashboard
2. Check **Analytics** for traffic
3. Check **Functions** for API usage

---

## 💰 Cost Breakdown

| Service | Platform | Cost |
|---------|----------|------|
| Frontend | Vercel | $0/month |
| Backend | Railway | $0/month (free tier) |
| Python | Railway | $0/month (shared) |
| MongoDB | Atlas | $0/month (free tier) |
| **Total** | | **$0/month** |

---

## 🎉 Success!

Once deployed, your **Project CyberSuraksha** will be:
- ✅ **Globally accessible**
- ✅ **Auto-scaling**
- ✅ **Production-ready**
- ✅ **100% free**

### Your Live URLs:
- **🌐 Frontend**: `https://cyber-feed.vercel.app`
- **🔗 Backend**: `https://cyber-backend.railway.app`
- **🐍 Python**: `https://cyber-python.railway.app`

---

## 🆘 Need Help?

1. **Check logs** in Railway/Vercel dashboards
2. **Test locally** first
3. **Verify environment variables**
4. **Check MongoDB Atlas** connection
5. **Review this guide** step by step

**Happy Deploying! 🚀**
