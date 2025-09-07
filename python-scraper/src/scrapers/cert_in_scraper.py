"""
CERT-In scraper for Indian cyber security advisories
"""

import asyncio
import aiohttp
import logging
from datetime import datetime
from typing import List, Optional
from bs4 import BeautifulSoup
import hashlib
import re
from urllib.parse import urljoin, urlparse

from ..models.incident import IncidentModel
from ..services.mongo_service import MongoService

logger = logging.getLogger(__name__)

class CertInScraper:
    """Scraper for CERT-In advisories and alerts"""
    
    def __init__(self):
        self.base_url = "https://www.cert-in.org.in"
        self.rss_url = "https://www.cert-in.org.in/rss.xml"
        self.mongo_service = MongoService()
        
    async def scrape_and_save(self) -> int:
        """Scrape CERT-In data and save to MongoDB"""
        try:
            incidents = await self.scrape_incidents()
            saved_count = 0
            
            for incident in incidents:
                if self.mongo_service.save_incident(incident):
                    saved_count += 1
            
            logger.info(f"CERT-In scraper: Collected {len(incidents)} incidents, saved {saved_count}")
            return saved_count
            
        except Exception as e:
            logger.error(f"CERT-In scraping failed: {e}")
            return 0
    
    async def scrape_incidents(self) -> List[IncidentModel]:
        """Scrape incidents from CERT-In RSS feed"""
        incidents = []
        
        try:
            async with aiohttp.ClientSession() as session:
                # Try RSS feed first
                rss_incidents = await self._scrape_rss_feed(session)
                incidents.extend(rss_incidents)
                
                # If RSS fails, try web scraping
                if not incidents:
                    web_incidents = await self._scrape_web_page(session)
                    incidents.extend(web_incidents)
                
        except Exception as e:
            logger.error(f"Failed to scrape CERT-In: {e}")
        
        return incidents
    
    async def _scrape_rss_feed(self, session: aiohttp.ClientSession) -> List[IncidentModel]:
        """Scrape RSS feed"""
        incidents = []
        
        try:
            async with session.get(self.rss_url) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'xml')
                    
                    items = soup.find_all('item')
                    for item in items:
                        try:
                            title = item.find('title').text.strip()
                            description = item.find('description').text.strip()
                            link = item.find('link').text.strip()
                            pub_date = item.find('pubDate').text.strip()
                            
                            # Parse date
                            try:
                                pub_date_obj = datetime.strptime(pub_date, '%a, %d %b %Y %H:%M:%S %Z')
                            except:
                                pub_date_obj = datetime.utcnow()
                            
                            # Determine severity and category
                            severity, category = self._classify_incident(title, description)
                            
                            # Generate hash
                            content_hash = hashlib.md5(f"{title}{description}{link}".encode()).hexdigest()
                            
                            incident = IncidentModel(
                                title=title,
                                description=description,
                                url=link,
                                published_date=pub_date_obj,
                                source="CERT-In",
                                category=category,
                                severity=severity,
                                location="India",
                                hash=content_hash,
                                tags=self._extract_tags(title, description)
                            )
                            
                            incidents.append(incident)
                            
                        except Exception as e:
                            logger.error(f"Error parsing RSS item: {e}")
                            continue
                            
        except Exception as e:
            logger.error(f"Failed to scrape RSS feed: {e}")
        
        return incidents
    
    async def _scrape_web_page(self, session: aiohttp.ClientSession) -> List[IncidentModel]:
        """Scrape web page as fallback"""
        incidents = []
        
        try:
            # Scrape advisories page
            advisories_url = f"{self.base_url}/advisories"
            async with session.get(advisories_url) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Look for advisory links
                    advisory_links = soup.find_all('a', href=re.compile(r'advisory'))
                    
                    for link in advisory_links[:10]:  # Limit to 10 most recent
                        try:
                            advisory_url = urljoin(self.base_url, link['href'])
                            incident = await self._scrape_advisory_page(session, advisory_url)
                            if incident:
                                incidents.append(incident)
                        except Exception as e:
                            logger.error(f"Error scraping advisory: {e}")
                            continue
                            
        except Exception as e:
            logger.error(f"Failed to scrape web page: {e}")
        
        return incidents
    
    async def _scrape_advisory_page(self, session: aiohttp.ClientSession, url: str) -> Optional[IncidentModel]:
        """Scrape individual advisory page"""
        try:
            async with session.get(url) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Extract title
                    title_elem = soup.find('h1') or soup.find('title')
                    title = title_elem.text.strip() if title_elem else "CERT-In Advisory"
                    
                    # Extract description
                    desc_elem = soup.find('div', class_='content') or soup.find('p')
                    description = desc_elem.text.strip() if desc_elem else "CERT-In security advisory"
                    
                    # Determine severity and category
                    severity, category = self._classify_incident(title, description)
                    
                    # Generate hash
                    content_hash = hashlib.md5(f"{title}{description}{url}".encode()).hexdigest()
                    
                    return IncidentModel(
                        title=title,
                        description=description,
                        url=url,
                        published_date=datetime.utcnow(),
                        source="CERT-In",
                        category=category,
                        severity=severity,
                        location="India",
                        hash=content_hash,
                        tags=self._extract_tags(title, description)
                    )
                    
        except Exception as e:
            logger.error(f"Error scraping advisory page {url}: {e}")
        
        return None
    
    def _classify_incident(self, title: str, description: str) -> tuple[str, str]:
        """Classify incident severity and category"""
        text = f"{title} {description}".lower()
        
        # Determine severity
        if any(word in text for word in ['critical', 'emergency', 'urgent', 'immediate']):
            severity = 'Critical'
        elif any(word in text for word in ['high', 'severe', 'serious']):
            severity = 'High'
        elif any(word in text for word in ['medium', 'moderate']):
            severity = 'Medium'
        else:
            severity = 'Low'
        
        # Determine category
        if any(word in text for word in ['advisory', 'guidance', 'recommendation']):
            category = 'Advisory'
        elif any(word in text for word in ['vulnerability', 'exploit', 'patch']):
            category = 'Vulnerability'
        elif any(word in text for word in ['attack', 'breach', 'incident']):
            category = 'Alert'
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
            'data-breach': ['breach', 'leak', 'exposed'],
            'vulnerability': ['vulnerability', 'cve', 'exploit'],
            'banking': ['bank', 'financial', 'payment'],
            'government': ['government', 'govt', 'ministry'],
            'critical-infrastructure': ['infrastructure', 'power', 'grid']
        }
        
        for tag, keywords in tag_keywords.items():
            if any(keyword in text for keyword in keywords):
                tags.append(tag)
        
        return tags
