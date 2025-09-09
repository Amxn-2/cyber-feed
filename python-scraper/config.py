"""
Configuration management for Python scraper
"""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for the Python scraper"""
    
    # Server Configuration
    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "0.0.0.0")
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # MongoDB Configuration
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://aman:Aman1234@cluster0.azcw7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    DB_NAME = os.getenv("DB_NAME", "cyber-incidents")
    COLLECTION_NAME = os.getenv("COLLECTION_NAME", "incidents")
    
    # Scraping Configuration
    SCRAPING_INTERVAL = int(os.getenv("SCRAPING_INTERVAL", 3600))  # 1 hour
    MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", 5))
    REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 30))
    USER_AGENT = os.getenv("USER_AGENT", "CyberSuraksha-Scraper/1.0")
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:4000").split(",")
    
    # Logging Configuration
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    
    # Scraping Sources Configuration
    CERT_IN_ENABLED = os.getenv("CERT_IN_ENABLED", "True").lower() == "true"
    NEWS_SCRAPING_ENABLED = os.getenv("NEWS_SCRAPING_ENABLED", "True").lower() == "true"
    TEST_DATA_ENABLED = os.getenv("TEST_DATA_ENABLED", "True").lower() == "true"
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", 100))
    RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", 3600))  # 1 hour
    
    # Data Filtering
    INDIA_ONLY = os.getenv("INDIA_ONLY", "True").lower() == "true"
    MIN_INCIDENT_AGE_DAYS = int(os.getenv("MIN_INCIDENT_AGE_DAYS", 0))
    MAX_INCIDENT_AGE_DAYS = int(os.getenv("MAX_INCIDENT_AGE_DAYS", 365))
    
    @classmethod
    def get_cors_origins(cls) -> List[str]:
        """Get CORS origins as a list"""
        return [origin.strip() for origin in cls.CORS_ORIGINS if origin.strip()]
    
    @classmethod
    def get_mongodb_uri(cls) -> str:
        """Get MongoDB URI with fallback"""
        return cls.MONGODB_URI
    
    @classmethod
    def get_database_name(cls) -> str:
        """Get database name"""
        return cls.DB_NAME
    
    @classmethod
    def get_collection_name(cls) -> str:
        """Get collection name"""
        return cls.COLLECTION_NAME
