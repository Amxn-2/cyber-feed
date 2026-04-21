import logging
from ..ml.threat_classifier import ThreatClassifier
from ..ml.entity_extractor import EntityExtractor
from ..ml.mitre_mapper import MitreMapper
from ..ml.cve_extractor import CveExtractor

logger = logging.getLogger(__name__)

class EnrichmentService:
    def __init__(self):
        self.classifier = ThreatClassifier()
        self.entity_extractor = EntityExtractor()
        self.mitre_mapper = MitreMapper()
        self.cve_extractor = CveExtractor()

    async def enrich_incident(self, incident_data: dict) -> dict:
        """
        Enrich incident data with ML-powered intelligence
        input: dictionary of incident data
        output: enriched dictionary
        """
        text = f"{incident_data.get('title', '')} {incident_data.get('description', '')}"

        # 1. ML Classification
        try:
            ml_result = self.classifier.predict(text)
            incident_data['ml_severity'] = ml_result['severity']
            incident_data['ml_confidence'] = ml_result['confidence']
            
            # Override original severity if confidence is high
            if ml_result['confidence'] > 70:
                incident_data['severity'] = ml_result['severity']
        except Exception as e:
            logger.error(f"Enrichment error (classifier): {e}")

        # 2. Entity Extraction
        try:
            incident_data['entities'] = self.entity_extractor.extract_entities(text)
        except Exception as e:
            logger.error(f"Enrichment error (entities): {e}")

        # 3. MITRE Mapping
        try:
            incident_data['mitre_techniques'] = self.mitre_mapper.map_techniques(text)
        except Exception as e:
            logger.error(f"Enrichment error (mitre): {e}")

        # 4. CVE Extraction & Scoring
        try:
            cve_ids = self.cve_extractor.extract_cves(text)
            incident_data['cve_ids'] = cve_ids
            
            # For the first CVE found, we could fetch details (optional, could be slow)
            # if cve_ids:
            #     details = self.cve_extractor.fetch_cve_details(cve_ids[0])
            #     if details:
            #         incident_data['cvss_score'] = details['cvss_score']
        except Exception as e:
            logger.error(f"Enrichment error (cve): {e}")

        # 5. Sector Tagging
        try:
            incident_data['sector_tags'] = self._tag_sectors(text, incident_data.get('entities', {}))
        except Exception as e:
            logger.error(f"Enrichment error (sector tagging): {e}")

        return incident_data

    def _tag_sectors(self, text, entities):
        """Identify which sectors are affected based on text and entities"""
        text = text.lower()
        sectors = []
        
        sector_map = {
            "Banking & Finance": ['bank', 'finance', 'payment', 'atm', 'transaction', 'sbi', 'rbi', 'hdfc', 'icici'],
            "Healthcare": ['hospital', 'medical', 'healthcare', 'patient', 'pharmaceutical', 'aiims'],
            "Government": ['government', 'ministry', 'govt', 'public sector', 'nic', 'police', 'defense'],
            "Technology": ['software', 'it', 'cloud', 'service provider', 'tech', 'saas', 'google', 'microsoft'],
            "Critical Infrastructure": ['power', 'grid', 'water', 'energy', 'transportation', 'railway', 'airport'],
            "E-commerce": ['retail', 'shopping', 'ecommerce', 'amazon', 'flipkart', 'order', 'customer']
        }

        # Check organizations first as they are strong indicators
        orgs = [o.lower() for o in entities.get('organizations', [])]
        
        for sector, keywords in sector_map.items():
            # Check keywords in text
            if any(keyword in text for keyword in keywords):
                sectors.append(sector)
                continue
            
            # Check keywords in organizations
            if any(keyword in org for org in orgs for keyword in keywords):
                if sector not in sectors:
                    sectors.append(sector)

        return sectors

if __name__ == "__main__":
    import asyncio
    
    async def test():
        service = EnrichmentService()
        data = {
            "title": "Major data breach at State Bank of India",
            "description": "Hackers have allegedly accessed sensitive customer records from SBI servers using a SQL injection vulnerability.",
            "severity": "Unknown"
        }
        enriched = await service.enrich_incident(data)
        print(enriched)

    asyncio.run(test())
