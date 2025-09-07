"""
News scraper for cyber security news from various sources
"""

import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from bs4 import BeautifulSoup
import hashlib
import re
from urllib.parse import urljoin, urlparse

from ..models.incident import IncidentModel
from ..services.mongo_service import MongoService

logger = logging.getLogger(__name__)

class NewsScraper:
    """Scraper for cyber security news from various sources"""
    
    def __init__(self):
        self.sources = [
            {
                "name": "Economic Times CISO",
                "url": "https://ciso.economictimes.indiatimes.com/news/cybercrime-fraud",
                "selectors": {
                    "articles": ".news_listing .news_item",
                    "title": ".news_title a",
                    "description": ".news_desc",
                    "link": ".news_title a",
                    "date": ".news_time"
                }
            },
            {
                "name": "The Hacker News",
                "url": "https://thehackernews.com",
                "selectors": {
                    "articles": ".post",
                    "title": ".post-title a",
                    "description": ".post-excerpt",
                    "link": ".post-title a",
                    "date": ".post-date"
                }
            }
        ]
        self.mongo_service = MongoService()
        
    async def scrape_and_save(self) -> int:
        """Scrape news data and save to MongoDB"""
        try:
            incidents = await self.scrape_incidents()
            saved_count = 0
            
            for incident in incidents:
                if self.mongo_service.save_incident(incident):
                    saved_count += 1
            
            logger.info(f"News scraper: Collected {len(incidents)} incidents, saved {saved_count}")
            return saved_count
            
        except Exception as e:
            logger.error(f"News scraping failed: {e}")
            return 0
    
    async def scrape_incidents(self) -> List[IncidentModel]:
        """Scrape incidents from news sources"""
        incidents = []
        
        for source in self.sources:
            try:
                source_incidents = await self._scrape_source(source)
                incidents.extend(source_incidents)
            except Exception as e:
                logger.error(f"Failed to scrape {source['name']}: {e}")
                continue
        
        return incidents
    
    async def _scrape_source(self, source: dict) -> List[IncidentModel]:
        """Scrape a specific news source"""
        incidents = []
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(source["url"]) as response:
                    if response.status == 200:
                        content = await response.text()
                        soup = BeautifulSoup(content, 'html.parser')
                        
                        # Find articles
                        articles = soup.select(source["selectors"]["articles"])
                        
                        for article in articles[:10]:  # Limit to 10 articles per source
                            try:
                                incident = self._parse_article(article, source)
                                if incident:
                                    incidents.append(incident)
                            except Exception as e:
                                logger.error(f"Error parsing article: {e}")
                                continue
                                
        except Exception as e:
            logger.error(f"Failed to scrape {source['name']}: {e}")
        
        return incidents
    
    def _parse_article(self, article, source: dict) -> Optional[IncidentModel]:
        """Parse individual article"""
        try:
            # Extract title
            title_elem = article.select_one(source["selectors"]["title"])
            if not title_elem:
                return None
            
            title = title_elem.get_text().strip()
            
            # Extract description
            desc_elem = article.select_one(source["selectors"]["description"])
            description = desc_elem.get_text().strip() if desc_elem else ""
            
            # Extract link
            link_elem = article.select_one(source["selectors"]["link"])
            link = link_elem.get('href') if link_elem else ""
            if link and not link.startswith('http'):
                link = urljoin(source["url"], link)
            
            # Extract date
            date_elem = article.select_one(source["selectors"]["date"])
            pub_date = self._parse_date(date_elem.get_text().strip() if date_elem else "")
            
            # Filter for India-related content
            if not self._is_india_related(title, description):
                return None
            
            # Determine severity and category
            severity, category = self._classify_incident(title, description)
            
            # Generate hash
            content_hash = hashlib.md5(f"{title}{description}{link}".encode()).hexdigest()
            
            return IncidentModel(
                title=title,
                description=description,
                url=link,
                published_date=pub_date,
                source=source["name"],
                category=category,
                severity=severity,
                location="India",
                hash=content_hash,
                tags=self._extract_tags(title, description)
            )
            
        except Exception as e:
            logger.error(f"Error parsing article: {e}")
            return None
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string to datetime object"""
        try:
            # Try different date formats
            date_formats = [
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%d',
                '%d %b %Y',
                '%b %d, %Y',
                '%d/%m/%Y'
            ]
            
            for fmt in date_formats:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
            
            # If no format matches, return current time
            return datetime.utcnow()
            
        except Exception:
            return datetime.utcnow()
    
    def _is_india_related(self, title: str, description: str) -> bool:
        """Check if content is India-related"""
        text = f"{title} {description}".lower()
        
        india_keywords = [
            'india', 'indian', 'delhi', 'mumbai', 'bangalore', 'chennai',
            'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur',
            'cert-in', 'government of india', 'ministry of', 'indian bank',
            'indian government', 'indian cyber', 'indian it', 'indian tech'
        ]
        
        return any(keyword in text for keyword in india_keywords)
    
    def _classify_incident(self, title: str, description: str) -> tuple[str, str]:
        """Classify incident severity and category"""
        text = f"{title} {description}".lower()
        
        # Determine severity
        if any(word in text for word in ['critical', 'emergency', 'urgent', 'immediate', 'severe']):
            severity = 'Critical'
        elif any(word in text for word in ['high', 'serious', 'major', 'significant']):
            severity = 'High'
        elif any(word in text for word in ['medium', 'moderate', 'minor']):
            severity = 'Medium'
        else:
            severity = 'Low'
        
        # Determine category
        if any(word in text for word in ['breach', 'leak', 'exposed', 'compromised']):
            category = 'Data Breach'
        elif any(word in text for word in ['attack', 'hack', 'ransomware', 'malware']):
            category = 'Cyber Attack'
        elif any(word in text for word in ['vulnerability', 'exploit', 'patch', 'cve']):
            category = 'Vulnerability'
        elif any(word in text for word in ['phishing', 'scam', 'fraud']):
            category = 'Fraud'
        else:
            category = 'News'
        
        return severity, category
    
    def _extract_tags(self, title: str, description: str) -> List[str]:
        """Extract relevant tags from incident content"""
        text = f"{title} {description}".lower()
        tags = []
        
        # Common cyber security tags
        tag_keywords = {
            'ransomware': ['ransomware', 'ransom'],
            'phishing': ['phishing', 'phish'],
            'malware': ['malware', 'virus', 'trojan'],
            'ddos': ['ddos', 'denial of service'],
            'data-breach': ['breach', 'leak', 'exposed', 'compromised'],
            'vulnerability': ['vulnerability', 'cve', 'exploit', 'patch'],
            'banking': ['bank', 'financial', 'payment', 'atm'],
            'government': ['government', 'govt', 'ministry', 'public'],
            'critical-infrastructure': ['infrastructure', 'power', 'grid', 'utilities'],
            'e-commerce': ['ecommerce', 'e-commerce', 'online shopping'],
            'healthcare': ['healthcare', 'hospital', 'medical'],
            'education': ['education', 'school', 'university', 'college']
        }
        
        for tag, keywords in tag_keywords.items():
            if any(keyword in text for keyword in keywords):
                tags.append(tag)
        
        return tags
