import feedparser
import aiohttp
import asyncio
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging
import re
from urllib.parse import urljoin, urlparse

logger = logging.getLogger(__name__)

class DataSource:
    def __init__(self, name: str, url: str, source_type: str):
        self.name = name
        self.url = url
        self.source_type = source_type  # 'rss', 'web_scrape', 'api'
        
    async def fetch_incidents(self, session: aiohttp.ClientSession) -> List[Dict]:
        """Fetch incidents from this data source"""
        try:
            if self.source_type == 'rss':
                return await self._fetch_rss_feed(session)
            elif self.source_type == 'web_scrape':
                return await self._fetch_web_content(session)
            else:
                logger.warning(f"Unsupported source type: {self.source_type}")
                return []
        except Exception as e:
            logger.error(f"Error fetching from {self.name}: {str(e)}")
            return []
    
    async def _fetch_rss_feed(self, session: aiohttp.ClientSession) -> List[Dict]:
        """Fetch and parse RSS feed"""
        try:
            async with session.get(self.url, timeout=30) as response:
                if response.status == 200:
                    content = await response.text()
                    feed = feedparser.parse(content)
                    
                    incidents = []
                    for entry in feed.entries[:20]:  # Limit to latest 20 entries
                        incident = {
                            'title': entry.get('title', 'Unknown Title'),
                            'description': self._clean_description(entry.get('summary', entry.get('description', ''))),
                            'source': self.name,
                            'source_url': entry.get('link', self.url),
                            'raw_content': entry.get('summary', '') + entry.get('description', ''),
                            'timestamp': self._parse_timestamp(entry.get('published', entry.get('updated'))),
                        }
                        incidents.append(incident)
                    
                    logger.info(f"Fetched {len(incidents)} incidents from {self.name}")
                    return incidents
                else:
                    logger.error(f"HTTP {response.status} for {self.name}")
                    return []
        except Exception as e:
            logger.error(f"RSS fetch error for {self.name}: {str(e)}")
            return []
    
    async def _fetch_web_content(self, session: aiohttp.ClientSession) -> List[Dict]:
        """Fetch and scrape web content"""
        try:
            async with session.get(self.url, timeout=30) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    incidents = []
                    if 'cert-in.org.in' in self.url:
                        incidents = self._scrape_cert_in(soup)
                    elif 'meity.gov.in' in self.url:
                        incidents = self._scrape_meity(soup)
                    
                    for incident in incidents:
                        incident['source'] = self.name
                        incident['source_url'] = self.url
                    
                    logger.info(f"Scraped {len(incidents)} incidents from {self.name}")
                    return incidents
                else:
                    logger.error(f"HTTP {response.status} for {self.name}")
                    return []
        except Exception as e:
            logger.error(f"Web scrape error for {self.name}: {str(e)}")
            return []
    
    def _scrape_cert_in(self, soup: BeautifulSoup) -> List[Dict]:
        """Scrape CERT-In advisories"""
        incidents = []
        
        # Look for advisory links and content
        advisory_links = soup.find_all('a', href=re.compile(r'advisory|alert|warning', re.I))
        
        for link in advisory_links[:10]:  # Limit to 10 latest
            title = link.get_text(strip=True)
            if len(title) > 10:  # Filter out short/empty titles
                incident = {
                    'title': f"CERT-In Advisory: {title}",
                    'description': self._extract_advisory_description(link),
                    'timestamp': datetime.utcnow(),
                    'raw_content': str(link.parent) if link.parent else str(link)
                }
                incidents.append(incident)
        
        return incidents
    
    def _scrape_meity(self, soup: BeautifulSoup) -> List[Dict]:
        """Scrape MeitY cybersecurity updates"""
        incidents = []
        
        # Look for news/press releases related to cybersecurity
        news_items = soup.find_all(['div', 'article', 'li'], class_=re.compile(r'news|press|update|item', re.I))
        
        for item in news_items[:5]:  # Limit to 5 latest
            title_elem = item.find(['h1', 'h2', 'h3', 'h4', 'a'])
            if title_elem:
                title = title_elem.get_text(strip=True)
                if any(keyword in title.lower() for keyword in ['cyber', 'security', 'threat', 'attack', 'breach']):
                    incident = {
                        'title': f"Government Update: {title}",
                        'description': self._extract_item_description(item),
                        'timestamp': datetime.utcnow(),
                        'raw_content': item.get_text(strip=True)
                    }
                    incidents.append(incident)
        
        return incidents
    
    def _extract_advisory_description(self, link_elem) -> str:
        """Extract description from advisory link context"""
        parent = link_elem.parent
        if parent:
            text = parent.get_text(strip=True)
            # Try to extract meaningful description
            sentences = text.split('.')
            return '. '.join(sentences[:3]) + '.' if len(sentences) > 1 else text[:200]
        return "CERT-In security advisory - please check the source for full details."
    
    def _extract_item_description(self, item_elem) -> str:
        """Extract description from news item"""
        text = item_elem.get_text(strip=True)
        # Clean and truncate
        text = re.sub(r'\s+', ' ', text)
        return text[:300] + '...' if len(text) > 300 else text
    
    def _clean_description(self, description: str) -> str:
        """Clean and format description text"""
        if not description:
            return "No description available"
        
        # Remove HTML tags
        soup = BeautifulSoup(description, 'html.parser')
        text = soup.get_text()
        
        # Clean whitespace and newlines
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Truncate if too long
        if len(text) > 500:
            text = text[:500] + '...'
        
        return text
    
    def _parse_timestamp(self, timestamp_str: Optional[str]) -> datetime:
        """Parse timestamp from various formats"""
        if not timestamp_str:
            return datetime.utcnow()
        
        try:
            # Try parsing common RSS timestamp formats
            from dateutil import parser
            return parser.parse(timestamp_str)
        except:
            # Fallback to current time
            return datetime.utcnow()

class DataCollector:
    def __init__(self):
        self.sources = [
            # Government Sources (Web Scraping)
            DataSource("CERT-In", "https://www.cert-in.org.in/", "web_scrape"),
            DataSource("MeitY Cyber Security", "https://www.meity.gov.in/", "web_scrape"),
            # RSS Feeds
            DataSource("The Hacker News", "https://feeds.feedburner.com/TheHackersNews", "rss"),
            DataSource("Bleeping Computer", "https://www.bleepingcomputer.com/feed/", "rss"),
            DataSource("Security Week", "https://www.securityweek.com/feed/", "rss"),
            DataSource("Threatpost", "https://threatpost.com/feed/", "rss"),
            DataSource("Dark Reading", "https://www.darkreading.com/rss/all.xml", "rss"),
            DataSource("InfoSecurity Magazine", "https://www.infosecurity-magazine.com/rss/news/", "rss"),
            DataSource("CSO Online", "https://www.csoonline.com/index.rss", "rss"),
            DataSource("Krebs on Security", "https://krebsonsecurity.com/feed/", "rss"),
        ]
        
        self.active_sources = 0
        self.total_sources = len(self.sources)
    
    async def collect_all_incidents(self) -> List[Dict]:
        """Collect incidents from all configured sources"""
        all_incidents = []
        self.active_sources = 0
        
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            tasks = []
            for source in self.sources:
                task = self._fetch_with_retry(source, session)
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Source {self.sources[i].name} failed: {result}")
                elif isinstance(result, list):
                    all_incidents.extend(result)
                    if result:  # If we got incidents, source is active
                        self.active_sources += 1
        
        logger.info(f"Collected {len(all_incidents)} total incidents from {self.active_sources}/{self.total_sources} sources")
        return all_incidents
    
    async def _fetch_with_retry(self, source: DataSource, session: aiohttp.ClientSession, max_retries: int = 2) -> List[Dict]:
        """Fetch incidents with retry logic"""
        for attempt in range(max_retries + 1):
            try:
                incidents = await source.fetch_incidents(session)
                return incidents
            except Exception as e:
                if attempt < max_retries:
                    logger.warning(f"Retry {attempt + 1} for {source.name}: {e}")
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"Final failure for {source.name}: {e}")
                    return []
    
    def get_status(self) -> Dict:
        """Get collector status"""
        return {
            "active_sources": self.active_sources,
            "total_sources": self.total_sources,
            "sources": [{"name": s.name, "type": s.source_type, "url": s.url} for s in self.sources]
        }