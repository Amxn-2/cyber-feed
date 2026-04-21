from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import logging
from datetime import datetime
import os
from dotenv import load_dotenv
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from src.scrapers.cert_in_scraper import CertInScraper
from src.scrapers.news_scraper import NewsScraper
from src.scrapers.test_scraper import TestScraper
from src.services.mongo_service import MongoService
from src.models.incident import IncidentModel
from config import Config

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format=Config.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Initialize services
mongo_service = MongoService()
scheduler = AsyncIOScheduler()

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    scheduler.add_job(
        run_scrapers, 
        trigger=CronTrigger(hour="0,6,12,18"),
        id="scheduled_scrape",
        replace_existing=True
    )
    scheduler.start()
    logger.info("APScheduler started: Scheduled to run every 6 hours.")
    
    # Optionally run an initial scrape on startup if DB is empty
    stats = mongo_service.get_incident_stats()
    if stats.get("total", 0) == 0:
        logger.info("First run detected. Triggering initial scrape...")
        asyncio.create_task(run_scrapers())
    
    yield
    
    # Shutdown logic
    scheduler.shutdown()
    logger.info("APScheduler shut down.")

app = FastAPI(
    title="Cyber Incident Scraper",
    description="Microservice for scraping cyber security incidents",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def run_scrapers(sources=None):
    """Internal function to run scrapers"""
    try:
        enabled_sources = []
        if Config.CERT_IN_ENABLED:
            enabled_sources.append("cert-in")
        if Config.NEWS_SCRAPING_ENABLED:
            enabled_sources.append("news")
            
        sources = sources or enabled_sources
        incidents_collected = 0
        
        logger.info(f"Background scrape starting for sources: {sources}")
        
        for source in sources:
            try:
                if source == "cert-in":
                    scraper = CertInScraper()
                    count = await scraper.scrape_and_save()
                    incidents_collected += count
                elif source == "news":
                    scraper = NewsScraper()
                    count = await scraper.scrape_and_save()
                    incidents_collected += count
                elif source == "test":
                    scraper = TestScraper()
                    count = await scraper.scrape_and_save()
                    incidents_collected += count
            except Exception as e:
                logger.error(f"Error scraping {source}: {str(e)}")
                continue
                
        logger.info(f"Background scrape completed. Collected: {incidents_collected}")
        return incidents_collected
    except Exception as e:
        logger.error(f"Background scrape failed: {str(e)}")
        return 0

# No-op (logic moved to lifespan)

class ScrapeRequest(BaseModel):
    sources: Optional[List[str]] = None
    force_refresh: bool = False

class ScrapeResponse(BaseModel):
    success: bool
    message: str
    incidents_collected: int
    sources_processed: List[str]
    timestamp: str

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "OK",
        "service": "cyber-incident-scraper",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/scrape", response_model=ScrapeResponse)
async def scrape_incidents(request: ScrapeRequest, background_tasks: BackgroundTasks):
    """Trigger incident scraping from various sources"""
    try:
        sources = request.sources
        # We use a wrapper to run scrapers and return result immediately or in background
        # For actual API call, we'll run it synchronously (await) so user gets feedback
        count = await run_scrapers(sources)
        
        return ScrapeResponse(
            success=True,
            message=f"Successfully scraped {count} incidents",
            incidents_collected=count,
            sources_processed=sources or ["enabled_sources"],
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Scraping failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scrape/status")
async def get_scrape_status():
    """Get current scraping status and statistics"""
    try:
        stats = await mongo_service.get_incident_stats()
        return {
            "success": True,
            "total_incidents": stats.get("total", 0),
            "recent_incidents": stats.get("recent", 0),
            "sources": stats.get("sources", []),
            "last_updated": stats.get("last_updated"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get scrape status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scrape/sources")
async def get_available_sources():
    """Get list of available scraping sources"""
    return {
        "success": True,
        "sources": [
            {
                "id": "cert-in",
                "name": "CERT-In",
                "description": "Indian Computer Emergency Response Team advisories",
                "enabled": True
            },
            {
                "id": "news",
                "name": "News Sources",
                "description": "Cyber security news from various sources",
                "enabled": True
            },
            {
                "id": "test",
                "name": "Test Data",
                "description": "Generate test incidents for development",
                "enabled": Config.TEST_DATA_ENABLED
            }
        ],
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=Config.HOST, 
        port=Config.PORT,
        log_level=Config.LOG_LEVEL.lower(),
        access_log=True
    )
