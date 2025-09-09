# 🐍 Python Scraper Microservice

A FastAPI-based microservice for scraping cyber security incidents from various sources, specifically designed for **Project CyberSuraksha**.

## 🚀 Features

- **Multi-source scraping**: CERT-In, News sources, Test data
- **MongoDB integration**: Cloud database support
- **India-focused**: Filters incidents for India only
- **Configurable**: Environment-based configuration
- **Async processing**: High-performance async scraping
- **Rate limiting**: Built-in request throttling
- **Health monitoring**: Health check endpoints

## 📋 Prerequisites

- Python 3.8+
- MongoDB Atlas account
- Virtual environment (recommended)

## 🛠️ Installation

### 1. Clone and Setup

```bash
cd python-scraper
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration

#### Option A: Automatic Setup
```bash
python setup_env.py
```

#### Option B: Manual Setup
```bash
cp env.sample .env
# Edit .env with your values
```

### 3. Environment Variables

Create a `.env` file with the following variables:

```bash
# Server Configuration
PORT=5000
HOST=0.0.0.0
DEBUG=False

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=cyber-incidents
COLLECTION_NAME=incidents

# Scraping Configuration
SCRAPING_INTERVAL=3600
MAX_CONCURRENT_REQUESTS=5
REQUEST_TIMEOUT=30
USER_AGENT=CyberSuraksha-Scraper/1.0

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:4000,https://your-frontend.vercel.app

# Logging Configuration
LOG_LEVEL=INFO
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s

# Scraping Sources Configuration
CERT_IN_ENABLED=True
NEWS_SCRAPING_ENABLED=True
TEST_DATA_ENABLED=True

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# Data Filtering
INDIA_ONLY=True
MIN_INCIDENT_AGE_DAYS=0
MAX_INCIDENT_AGE_DAYS=365
```

## 🚀 Running the Service

### Development Mode
```bash
python main.py
```

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 5000
```

### With Railway (Deployment)
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Trigger Scraping
```http
POST /scrape
Content-Type: application/json

{
  "sources": ["cert-in", "news", "test"],
  "force_refresh": false
}
```

### Get Scraping Status
```http
GET /scrape/status
```

### Get Available Sources
```http
GET /scrape/sources
```

## 🔧 Configuration

The service uses a centralized configuration system in `config.py`:

### Server Settings
- `PORT`: Server port (default: 5000)
- `HOST`: Server host (default: 0.0.0.0)
- `DEBUG`: Debug mode (default: False)

### Database Settings
- `MONGODB_URI`: MongoDB connection string
- `DB_NAME`: Database name
- `COLLECTION_NAME`: Collection name

### Scraping Settings
- `SCRAPING_INTERVAL`: Scraping interval in seconds
- `MAX_CONCURRENT_REQUESTS`: Max concurrent HTTP requests
- `REQUEST_TIMEOUT`: HTTP request timeout
- `USER_AGENT`: User agent string

### Source Control
- `CERT_IN_ENABLED`: Enable CERT-In scraping
- `NEWS_SCRAPING_ENABLED`: Enable news scraping
- `TEST_DATA_ENABLED`: Enable test data generation

### Data Filtering
- `INDIA_ONLY`: Filter for India-only incidents
- `MIN_INCIDENT_AGE_DAYS`: Minimum incident age
- `MAX_INCIDENT_AGE_DAYS`: Maximum incident age

## 🏗️ Architecture

```
python-scraper/
├── main.py                 # FastAPI application
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── env.sample            # Environment variables template
├── setup_env.py          # Environment setup script
├── railway.json          # Railway deployment config
└── src/
    ├── models/
    │   └── incident.py    # Incident data model
    ├── services/
    │   └── mongo_service.py  # MongoDB service
    └── scrapers/
        ├── cert_in_scraper.py  # CERT-In scraper
        ├── news_scraper.py     # News scraper
        └── test_scraper.py     # Test data generator
```

## 🚀 Deployment

### Railway (Recommended)
1. Connect your GitHub repository
2. Select the `python-scraper` folder
3. Set environment variables
4. Deploy

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
```

## 🧪 Testing

### Test Configuration
```bash
python -c "from config import Config; print('Config OK')"
```

### Test MongoDB Connection
```bash
python -c "from src.services.mongo_service import MongoService; MongoService()"
```

### Test API Endpoints
```bash
curl http://localhost:5000/health
curl http://localhost:5000/scrape/sources
```

## 📊 Monitoring

### Health Check
- **Endpoint**: `GET /health`
- **Response**: Service status and timestamp

### Scraping Status
- **Endpoint**: `GET /scrape/status`
- **Response**: Statistics and last update time

### Logs
- **Level**: Configurable via `LOG_LEVEL`
- **Format**: Configurable via `LOG_FORMAT`
- **Output**: Console and file logging

## 🔒 Security

- **CORS**: Configurable origins
- **Rate Limiting**: Built-in request throttling
- **User Agent**: Configurable identification
- **Timeout**: Request timeout protection
- **Input Validation**: Pydantic model validation

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check `MONGODB_URI` in `.env`
   - Verify network connectivity
   - Check MongoDB Atlas whitelist

2. **Import Errors**
   - Ensure virtual environment is activated
   - Install dependencies: `pip install -r requirements.txt`

3. **CORS Errors**
   - Update `CORS_ORIGINS` in `.env`
   - Include your frontend URL

4. **Scraping Failures**
   - Check internet connectivity
   - Verify source URLs are accessible
   - Check rate limiting settings

### Debug Mode
```bash
DEBUG=True python main.py
```

## 📈 Performance

- **Async Processing**: Non-blocking I/O
- **Batch Operations**: Efficient database operations
- **Rate Limiting**: Prevents overwhelming sources
- **Connection Pooling**: Reuses HTTP connections
- **Memory Efficient**: Streams large responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of **Project CyberSuraksha** and follows the same license terms.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs
3. Test individual components
4. Create an issue on GitHub

---

**Made with ❤️ for Project CyberSuraksha**
