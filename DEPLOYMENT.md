# 🚀 Deployment Guide - Project CyberSuraksha

## 📋 Overview
This guide will help you deploy your multi-service cyber security application to the cloud for free.

## 🏗️ Architecture
```
Frontend (Next.js) → Backend (Node.js) → Python Microservice
     ↓                    ↓                    ↓
   Vercel              Railway            Railway
   (Free)              (Free)             (Free)
```

## 🎯 Free Deployment Platforms

### 1. Frontend - Vercel (Recommended)
- **Platform**: [Vercel](https://vercel.com)
- **Cost**: Free for personal projects
- **Features**: Auto-deploy, CDN, custom domains

### 2. Backend - Railway (Recommended)
- **Platform**: [Railway](https://railway.app)
- **Cost**: $5 credit/month (usually free)
- **Features**: Auto-deploy, environment variables, MongoDB integration

### 3. Python Microservice - Railway (Recommended)
- **Platform**: [Railway](https://railway.app)
- **Cost**: Shared with backend ($5 credit/month)
- **Features**: FastAPI support, auto-deploy

## 📝 Step-by-Step Deployment

### Step 1: Deploy Python Microservice (Railway)

1. **Go to [Railway](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Choose "python-scraper" folder**
6. **Set Environment Variables:**
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyber-incidents?retryWrites=true&w=majority
   DB_NAME=cyber-incidents
   SCRAPING_INTERVAL=3600
   MAX_CONCURRENT_REQUESTS=5
   ```
7. **Deploy and note the URL** (e.g., `https://python-scraper-production.railway.app`)

### Step 2: Deploy Backend (Railway)

1. **Create another Railway project**
2. **Select "Backend" folder**
3. **Set Environment Variables:**
   ```
   PORT=4000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyber-incidents?retryWrites=true&w=majority
   GEMINI_API_KEY=your_gemini_api_key_here
   PYTHON_SCRAPER_URL=https://your-python-scraper-url.railway.app
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
4. **Deploy and note the URL** (e.g., `https://backend-production.railway.app`)

### Step 3: Deploy Frontend (Vercel)

1. **Go to [Vercel](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Import Git Repository"**
4. **Select your repository**
5. **Set Root Directory to "Frontend"**
6. **Set Environment Variables:**
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_PYTHON_SCRAPER_URL=https://your-python-scraper-url.railway.app
   ```
7. **Deploy**

## 🔧 Environment Variables Setup

### Frontend (.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_PYTHON_SCRAPER_URL=https://your-python-scraper-url.railway.app
```

### Backend (.env)
```bash
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyber-incidents?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
PYTHON_SCRAPER_URL=https://your-python-scraper-url.railway.app
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Python Scraper (.env)
```bash
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyber-incidents?retryWrites=true&w=majority
DB_NAME=cyber-incidents
SCRAPING_INTERVAL=3600
MAX_CONCURRENT_REQUESTS=5
```

## 🌐 Custom Domain (Optional)

### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records

### Railway (Backend & Python)
1. Go to Project Settings → Domains
2. Add custom domain
3. Update DNS records

## 🔍 Testing Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend Health**: `https://your-backend-url.railway.app/api/health`
3. **Python Health**: `https://your-python-scraper-url.railway.app/health`
4. **Data Collection**: `https://your-backend-url.railway.app/api/collection/trigger`

## 🚨 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check `CORS_ORIGIN` in backend
2. **API Timeouts**: Check Railway logs
3. **MongoDB Connection**: Verify `MONGODB_URI`
4. **Environment Variables**: Ensure all are set correctly

### Logs:
- **Vercel**: Project → Functions → View Function Logs
- **Railway**: Project → Deployments → View Logs

## 💰 Cost Breakdown

| Service | Platform | Cost |
|---------|----------|------|
| Frontend | Vercel | $0/month |
| Backend | Railway | $0/month (within free tier) |
| Python | Railway | $0/month (shared with backend) |
| MongoDB | Atlas | $0/month (free tier) |
| **Total** | | **$0/month** |

## 🎉 Success!

Once deployed, your **Project CyberSuraksha** will be live and accessible worldwide!

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app`
- **Python Scraper**: `https://your-python.railway.app`

## 📞 Support

If you encounter any issues:
1. Check the logs in each platform
2. Verify environment variables
3. Test each service individually
4. Check MongoDB Atlas connection

Happy deploying! 🚀
