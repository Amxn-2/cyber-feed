"""
Test scraper for generating sample cyber security incidents
"""

import logging
from datetime import datetime, timedelta
from typing import List
import random
import hashlib

from ..models.incident import IncidentModel
from ..services.mongo_service import MongoService

logger = logging.getLogger(__name__)

class TestScraper:
    """Test scraper for generating sample incidents"""
    
    def __init__(self):
        self.mongo_service = MongoService()
        self.sample_incidents = [
            {
                "title": "Major Data Breach at Indian Banking Institution",
                "description": "A significant data breach has been reported at one of India's leading banking institutions, potentially affecting millions of customers' personal and financial information.",
                "url": "https://example.com/banking-breach-2024",
                "source": "CERT-In",
                "category": "Advisory",
                "severity": "High",
                "tags": ["data-breach", "banking", "financial"]
            },
            {
                "title": "Ransomware Attack Targets Indian Government Portal",
                "description": "A sophisticated ransomware attack has targeted a government portal, causing temporary disruption to citizen services.",
                "url": "https://example.com/gov-ransomware-2024",
                "source": "The Hacker News",
                "category": "News",
                "severity": "Critical",
                "tags": ["ransomware", "government", "cyber-attack"]
            },
            {
                "title": "Phishing Campaign Targets Indian IT Companies",
                "description": "Security researchers have identified a new phishing campaign specifically targeting employees of Indian IT companies with sophisticated social engineering techniques.",
                "url": "https://example.com/phishing-campaign-2024",
                "source": "Economic Times CISO",
                "category": "Alert",
                "severity": "Medium",
                "tags": ["phishing", "social-engineering", "it-companies"]
            },
            {
                "title": "Critical Vulnerability Found in Popular Indian E-commerce Platform",
                "description": "Security researchers have discovered a critical vulnerability in a widely-used Indian e-commerce platform that could allow unauthorized access to user accounts.",
                "url": "https://example.com/ecommerce-vuln-2024",
                "source": "CERT-In",
                "category": "Advisory",
                "severity": "High",
                "tags": ["vulnerability", "e-commerce", "critical"]
            },
            {
                "title": "DDoS Attack Disrupts Indian Educational Institution Services",
                "description": "A distributed denial-of-service (DDoS) attack has disrupted online services of a major Indian educational institution, affecting thousands of students.",
                "url": "https://example.com/ddos-education-2024",
                "source": "Business Standard",
                "category": "News",
                "severity": "Medium",
                "tags": ["ddos", "education", "disruption"]
            },
            {
                "title": "AI-Powered Cyber Attack Detected in Indian Financial Sector",
                "description": "Security experts have identified a new AI-powered cyber attack targeting Indian financial institutions, using machine learning to evade traditional security measures.",
                "url": "https://example.com/ai-cyber-attack-2024",
                "source": "Economic Times CISO",
                "category": "Alert",
                "severity": "High",
                "tags": ["ai", "machine-learning", "financial", "evasion"]
            },
            {
                "title": "Supply Chain Attack Compromises Indian Software Vendor",
                "description": "A supply chain attack has compromised a major Indian software vendor, potentially affecting thousands of customers who use their products.",
                "url": "https://example.com/supply-chain-attack-2024",
                "source": "The Hacker News",
                "category": "News",
                "severity": "Critical",
                "tags": ["supply-chain", "software", "vendor", "compromise"]
            },
            {
                "title": "Cryptocurrency Exchange Hack Affects Indian Investors",
                "description": "A major cryptocurrency exchange popular among Indian investors has been hacked, resulting in significant financial losses.",
                "url": "https://example.com/crypto-exchange-hack-2024",
                "source": "Economic Times CISO",
                "category": "Alert",
                "severity": "High",
                "tags": ["cryptocurrency", "exchange", "hack", "financial-loss"]
            },
            {
                "title": "Healthcare Data Breach Exposes Patient Records in Mumbai",
                "description": "A healthcare data breach in Mumbai has exposed sensitive patient records, raising concerns about medical data security.",
                "url": "https://example.com/healthcare-breach-mumbai-2024",
                "source": "CERT-In",
                "category": "Advisory",
                "severity": "High",
                "tags": ["healthcare", "data-breach", "mumbai", "patient-records"]
            },
            {
                "title": "Social Media Platform Vulnerability Affects Indian Users",
                "description": "A critical vulnerability in a popular social media platform has been discovered that could affect millions of Indian users.",
                "url": "https://example.com/social-media-vuln-2024",
                "source": "The Hacker News",
                "category": "News",
                "severity": "Medium",
                "tags": ["social-media", "vulnerability", "users", "privacy"]
            }
        ]
        
    async def scrape_and_save(self) -> int:
        """Generate test incidents and save to MongoDB"""
        try:
            incidents = self._generate_test_incidents()
            saved_count = 0
            
            for incident in incidents:
                if self.mongo_service.save_incident(incident):
                    saved_count += 1
            
            logger.info(f"Test scraper: Generated {len(incidents)} incidents, saved {saved_count}")
            return saved_count
            
        except Exception as e:
            logger.error(f"Test scraping failed: {e}")
            return 0
    
    def _generate_test_incidents(self) -> List[IncidentModel]:
        """Generate test incidents"""
        incidents = []
        
        # Generate 3-5 random incidents
        num_incidents = random.randint(3, 5)
        selected_incidents = random.sample(self.sample_incidents, num_incidents)
        
        for incident_data in selected_incidents:
            try:
                # Randomize publication date (last 7 days)
                days_ago = random.randint(1, 7)
                pub_date = datetime.utcnow() - timedelta(days=days_ago)
                
                # Generate unique hash
                content_hash = hashlib.md5(f"{incident_data['title']}{pub_date.isoformat()}".encode()).hexdigest()
                
                incident = IncidentModel(
                    title=incident_data["title"],
                    description=incident_data["description"],
                    url=incident_data["url"],
                    published_date=pub_date,
                    source=incident_data["source"],
                    category=incident_data["category"],
                    severity=incident_data["severity"],
                    location="India",
                    hash=content_hash,
                    tags=incident_data["tags"],
                    is_verified=random.choice([True, False])
                )
                
                incidents.append(incident)
                
            except Exception as e:
                logger.error(f"Error generating test incident: {e}")
                continue
        
        return incidents
