import re
import requests
import logging

logger = logging.getLogger(__name__)

class CveExtractor:
    def __init__(self):
        # Regex for CVE-YYYY-NNNNN
        self.cve_pattern = r'CVE-\d{4}-\d{4,7}'

    def extract_cves(self, text):
        """Extract all CVE IDs from text"""
        if not text:
            return []
        
        matches = re.findall(self.cve_pattern, text, re.IGNORECASE)
        # Normalize to uppercase and remove duplicates
        cves = sorted(list(set([m.upper() for m in matches])))
        return cves

    def fetch_cve_details(self, cve_id):
        """
        Fetch CVE details from NVD API
        Note: In a production environment, you should use an API key 
        and handle rate limiting. This is a basic implementation.
        """
        try:
            url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve_id}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                vulnerabilities = data.get('vulnerabilities', [])
                if not vulnerabilities:
                    return None
                
                cve_data = vulnerabilities[0].get('cve', {})
                metrics = cve_data.get('metrics', {})
                
                # Try to get CVSS v3.1 score first, then v3.0, then v2
                cvss_score = 0
                if 'cvssMetricV31' in metrics:
                    cvss_score = metrics['cvssMetricV31'][0]['cvssData']['baseScore']
                elif 'cvssMetricV30' in metrics:
                    cvss_score = metrics['cvssMetricV30'][0]['cvssData']['baseScore']
                
                return {
                    "id": cve_id,
                    "cvss_score": cvss_score,
                    "description": cve_data.get('descriptions', [{}])[0].get('value', ''),
                    "published": cve_data.get('published', '')
                }
        except Exception as e:
            logger.error(f"Error fetching CVE details for {cve_id}: {e}")
            
        return None

if __name__ == "__main__":
    # Quick test
    extractor = CveExtractor()
    test_text = "Security advisory for CVE-2021-44228 affecting Apache Log4j servers."
    cves = extractor.extract_cves(test_text)
    print(f"Text: {test_text}")
    print(f"Extracted: {cves}")
    
    if cves:
        print(f"Fetching details for {cves[0]}...")
        # details = extractor.fetch_cve_details(cves[0])
        # print(f"Details: {details}")
        print("(NVD API call skipped in test script to avoid network activity during build)")
