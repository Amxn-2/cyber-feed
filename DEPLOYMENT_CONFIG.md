# 🚀 Deployment Configuration Guide

## Environment Variables for Production

### Backend (Node.js) - Railway
```bash
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyber-incidents?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
PYTHON_SCRAPER_URL=https://your-python-scraper-url.railway.app
CORS_ORIGIN=https://your-frontend-url.vercel.app
LOG_LEVEL=info
```

### Python Scraper - Railway
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

### Frontend (Next.js) - Vercel
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_PYTHON_SCRAPER_URL=https://your-python-scraper-url.railway.app
```

## Service URLs After Deployment

1. **Frontend**: `https://cyber-feed.vercel.app`
2. **Backend**: `https://cyber-backend.railway.app`
3. **Python Scraper**: `https://cyber-python.railway.app`

## Health Check Endpoints

- **Backend**: `https://your-backend-url.railway.app/api/health`
- **Python Scraper**: `https://your-python-scraper-url.railway.app/health`
