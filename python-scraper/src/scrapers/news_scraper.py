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
from config import Config

logger = logging.getLogger(__name__)

class NewsScraper:
    """Scraper for cyber security news from various sources"""
    
    def __init__(self):
        self.sources = [
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
            },
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
                "name": "Indian Express Technology",
                "url": "https://indianexpress.com/section/technology/",
                "selectors": {
                    "articles": ".articles .story",
                    "title": ".headlines a",
                    "description": ".story-content",
                    "link": ".headlines a",
                    "date": ".date"
                }
            },
            {
                "name": "Times of India Tech",
                "url": "https://timesofindia.indiatimes.com/technology",
                "selectors": {
                    "articles": ".list5_wrap .list5",
                    "title": ".list5_wrap .list5 a",
                    "description": ".list5_wrap .list5 .meta",
                    "link": ".list5_wrap .list5 a",
                    "date": ".list5_wrap .list5 .meta"
                }
            },
            {
                "name": "Cybersecurity News",
                "url": "https://cybersecuritynews.com",
                "selectors": {
                    "articles": ".post",
                    "title": ".post-title a",
                    "description": ".post-excerpt",
                    "link": ".post-title a",
                    "date": ".post-date"
                }
            },
            {
                "name": "Dark Reading",
                "url": "https://www.darkreading.com",
                "selectors": {
                    "articles": ".article-card",
                    "title": ".article-card-title a",
                    "description": ".article-card-summary",
                    "link": ".article-card-title a",
                    "date": ".article-card-date"
                }
            },
            {
                "name": "Krebs on Security",
                "url": "https://krebsonsecurity.com",
                "selectors": {
                    "articles": ".post",
                    "title": ".post-title a",
                    "description": ".post-excerpt",
                    "link": ".post-title a",
                    "date": ".post-date"
                }
            },
            {
                "name": "Bleeping Computer",
                "url": "https://www.bleepingcomputer.com",
                "selectors": {
                    "articles": ".article",
                    "title": ".article-title a",
                    "description": ".article-excerpt",
                    "link": ".article-title a",
                    "date": ".article-date"
                }
            },
            {
                "name": "Security Week",
                "url": "https://www.securityweek.com",
                "selectors": {
                    "articles": ".article-item",
                    "title": ".article-title a",
                    "description": ".article-excerpt",
                    "link": ".article-title a",
                    "date": ".article-date"
                }
            },
            {
                "name": "Threat Post",
                "url": "https://threatpost.com",
                "selectors": {
                    "articles": ".post",
                    "title": ".post-title a",
                    "description": ".post-excerpt",
                    "link": ".post-title a",
                    "date": ".post-date"
                }
            },
            {
                "name": "InfoSec Magazine",
                "url": "https://www.infosecurity-magazine.com",
                "selectors": {
                    "articles": ".article",
                    "title": ".article-title a",
                    "description": ".article-excerpt",
                    "link": ".article-title a",
                    "date": ".article-date"
                }
            },
            {
                "name": "CSO Online",
                "url": "https://www.csoonline.com",
                "selectors": {
                    "articles": ".article-card",
                    "title": ".article-card-title a",
                    "description": ".article-card-summary",
                    "link": ".article-card-title a",
                    "date": ".article-card-date"
                }
            },
            {
                "name": "SC Magazine",
                "url": "https://www.scmagazine.com",
                "selectors": {
                    "articles": ".article",
                    "title": ".article-title a",
                    "description": ".article-excerpt",
                    "link": ".article-title a",
                    "date": ".article-date"
                }
            },
            {
                "name": "Help Net Security",
                "url": "https://www.helpnetsecurity.com",
                "selectors": {
                    "articles": ".post",
                    "title": ".post-title a",
                    "description": ".post-excerpt",
                    "link": ".post-title a",
                    "date": ".post-date"
                }
            },
            {
                "name": "Bank Info Security",
                "url": "https://www.bankinfosecurity.com",
                "selectors": {
                    "articles": ".article",
                    "title": ".article-title a",
                    "description": ".article-excerpt",
                    "link": ".article-title a",
                    "date": ".article-date"
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
            timeout = aiohttp.ClientTimeout(total=Config.REQUEST_TIMEOUT)
            headers = {"User-Agent": Config.USER_AGENT}
            async with aiohttp.ClientSession(timeout=timeout, headers=headers) as session:
                async with session.get(source["url"]) as response:
                    if response.status == 200:
                        content = await response.text()
                        soup = BeautifulSoup(content, 'html.parser')
                        
                        # Find articles with multiple selector strategies
                        articles = []
                        
                        # Try primary selector
                        articles = soup.select(source["selectors"]["articles"])
                        
                        # If no articles found, try alternative selectors
                        if not articles:
                            alternative_selectors = [
                                "article", ".article", ".news-item", ".story", 
                                ".post", ".entry", ".content-item", ".news"
                            ]
                            for alt_selector in alternative_selectors:
                                articles = soup.select(alt_selector)
                                if articles:
                                    logger.info(f"Using alternative selector '{alt_selector}' for {source['name']}")
                                    break
                        
                        logger.info(f"Found {len(articles)} articles from {source['name']}")
                        
                        for article in articles[:10]:  # Limit to 10 articles per source (reduced due to more sources)
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
        """Parse individual article with flexible extraction"""
        try:
            # Extract title with multiple strategies
            title = self._extract_text(article, [
                source["selectors"]["title"],
                "h1", "h2", "h3", ".title", ".headline", "a", ".post-title"
            ])
            
            if not title or len(title) < 10:  # Skip very short titles
                return None
            
            # Extract description with multiple strategies
            description = self._extract_text(article, [
                source["selectors"]["description"],
                "p", ".excerpt", ".summary", ".content", ".description"
            ])
            
            # Extract link with multiple strategies
            link = self._extract_link(article, [
                source["selectors"]["link"],
                "a", ".title a", ".headline a", ".post-title a"
            ])
            
            if link and not link.startswith('http'):
                link = urljoin(source["url"], link)
            
            # Extract date with multiple strategies
            date_text = self._extract_text(article, [
                source["selectors"]["date"],
                ".date", ".time", ".published", ".timestamp"
            ])
            pub_date = self._parse_date(date_text)
            
            # Filter for cyber security related content
            if not self._is_cyber_security_related(title, description):
                return None
            
            # Determine severity and category
            severity, category = self._classify_incident(title, description)
            
            # Generate hash
            content_hash = hashlib.md5(f"{title}{description}{link}".encode()).hexdigest()
            
            return IncidentModel(
                title=title,
                description=description or f"Cyber security incident reported: {title}",
                url=link or source["url"],
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
    
    def _extract_text(self, element, selectors: list) -> str:
        """Extract text using multiple selector strategies"""
        for selector in selectors:
            try:
                elem = element.select_one(selector)
                if elem:
                    text = elem.get_text().strip()
                    if text:
                        return text
            except:
                continue
        return ""
    
    def _extract_link(self, element, selectors: list) -> str:
        """Extract link using multiple selector strategies"""
        for selector in selectors:
            try:
                elem = element.select_one(selector)
                if elem:
                    link = elem.get('href')
                    if link:
                        return link
            except:
                continue
        return ""
    
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
    
    def _is_cyber_security_related(self, title: str, description: str) -> bool:
        """Check if content is cyber security related"""
        text = f"{title} {description}".lower()
        
        cyber_keywords = [
            'cyber', 'security', 'hack', 'hacker', 'breach', 'data leak',
            'ransomware', 'malware', 'phishing', 'vulnerability', 'exploit',
            'attack', 'threat', 'incident', 'compromise', 'fraud', 'scam',
            'privacy', 'encryption', 'firewall', 'antivirus', 'virus',
            'trojan', 'ddos', 'botnet', 'spyware', 'adware', 'rootkit',
            'social engineering', 'identity theft', 'cybercrime', 'digital',
            'information security', 'network security', 'data protection',
            'cyber attack', 'cyber threat', 'cyber incident', 'cyber fraud',
            'data breach', 'security breach', 'system compromise'
        ]
        
        return any(keyword in text for keyword in cyber_keywords)
    
    def _is_india_related(self, title: str, description: str) -> bool:
        """Check if content is India-related or globally relevant cyber security news"""
        text = f"{title} {description}".lower()
        
        india_keywords = [
            'india', 'indian', 'delhi', 'mumbai', 'bangalore', 'chennai',
            'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'gurgaon',
            'noida', 'kerala', 'tamil nadu', 'karnataka', 'maharashtra',
            'cert-in', 'government of india', 'ministry of', 'indian bank',
            'indian government', 'indian cyber', 'indian it', 'indian tech',
            'reserve bank of india', 'rbi', 'sebi', 'irctc', 'uidai', 'aadhaar',
            'digital india', 'make in india', 'startup india', 'smart cities'
        ]
        
        # Check for India-specific content
        if any(keyword in text for keyword in india_keywords):
            return True
        
        # For international sources, include globally relevant cyber security news
        # that could impact India or be relevant to Indian organizations
        global_cyber_keywords = [
            'ransomware', 'data breach', 'cyber attack', 'malware', 'phishing',
            'vulnerability', 'zero-day', 'apt', 'nation-state', 'cyber espionage',
            'critical infrastructure', 'power grid', 'banking', 'financial',
            'healthcare', 'education', 'government', 'military', 'defense'
        ]
        
        # Include if it's globally significant cyber security news
        return any(keyword in text for keyword in global_cyber_keywords)
    
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
