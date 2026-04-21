import asyncio
import logging
from src.scrapers.cert_in_scraper import CertInScraper
from src.scrapers.news_scraper import NewsScraper
from src.services.mongo_service import MongoService
from config import Config
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("one-shot-scraper")

async def run_scrapers_once():
    """Execute a single pass of all enabled scrapers and then exit."""
    logger.info("Starting one-shot threat ingestion...")
    
    mongo_service = MongoService()
    sources = []
    
    if Config.CERT_IN_ENABLED:
        sources.append("cert-in")
    if Config.NEWS_SCRAPING_ENABLED:
        sources.append("news")
        
    incidents_collected = 0
    
    for source in sources:
        try:
            logger.info(f"Processing source: {source}")
            if source == "cert-in":
                scraper = CertInScraper()
                count = await scraper.scrape_and_save()
                incidents_collected += count
            elif source == "news":
                scraper = NewsScraper()
                count = await scraper.scrape_and_save()
                incidents_collected += count
        except Exception as e:
            logger.error(f"Error scraping {source}: {str(e)}")
            continue
            
    logger.info(f"Ingestion complete. Total signals captured: {incidents_collected}")
    # Small sleep to ensure all connections close gracefully
    await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(run_scrapers_once())
