import re

class MitreMapper:
    def __init__(self):
        # A dictionary of common MITRE ATT&CK techniques with their IDs and tactics
        # This is a curated subset for the project
        self.techniques_map = {
            "Phishing": {
                "id": "T1566",
                "tactic": "Initial Access",
                "keywords": [r'phish', r'email', r'spoof', r'social engineering']
            },
            "Exploit Public-Facing Application": {
                "id": "T1190",
                "tactic": "Initial Access",
                "keywords": [r'vulnerability', r'exploit', r'cve', r'web application', r'remote code execution', r'rce']
            },
            "External Remote Services": {
                "id": "T1133",
                "tactic": "Initial Access",
                "keywords": [r'vpn', r'rdp', r'remote desktop', r'ssh']
            },
            "Supply Chain Compromise": {
                "id": "T1195",
                "tactic": "Initial Access",
                "keywords": [r'supply chain', r'vendor', r'software update', r'upstream']
            },
            "PowerShell": {
                "id": "T1059.001",
                "tactic": "Execution",
                "keywords": [r'powershell', r'ps1', r'scripting']
            },
            "Scheduled Task/Job": {
                "id": "T1053",
                "tactic": "Persistence",
                "keywords": [r'scheduled task', r'cron job', r'persistence']
            },
            "Brute Force": {
                "id": "T1110",
                "tactic": "Credential Access",
                "keywords": [r'brute force', r'password guessing', r'credential stuffing']
            },
            "Adversary-in-the-Middle": {
                "id": "T1557",
                "tactic": "Credential Access",
                "keywords": [r'man-in-the-middle', r'mitm', r'interception', r'sniffing']
            },
            "Data from Local System": {
                "id": "T1005",
                "tactic": "Collection",
                "keywords": [r'data exfiltration', r'stealing', r'scraping', r'collection']
            },
            "Data Encrypted for Impact": {
                "id": "T1486",
                "tactic": "Impact",
                "keywords": [r'ransomware', r'encrypt', r'locked', r'extortion']
            },
            "Endpoint Denial of Service": {
                "id": "T1499",
                "tactic": "Impact",
                "keywords": [r'ddos', r'denial of service', r'shutdown', r'unavailable']
            }
        }

    def map_techniques(self, text):
        """Map text to MITRE techniques based on keywords"""
        mapped_techniques = []
        lower_text = text.lower()

        for name, info in self.techniques_map.items():
            for pattern in info["keywords"]:
                if re.search(pattern, lower_text):
                    technique = {
                        "id": info["id"],
                        "name": name,
                        "tactic": info["tactic"],
                        "url": f"https://attack.mitre.org/techniques/{info['id'].replace('.', '/')}/"
                    }
                    if technique not in mapped_techniques:
                        mapped_techniques.append(technique)
                    break # Move to next technique after finding one match

        return mapped_techniques

if __name__ == "__main__":
    # Quick test
    mapper = MitreMapper()
    test_text = "The attackers used a phishing campaign to gain initial access and then deployed ransomware to encrypt all server data."
    res = mapper.map_techniques(test_text)
    print(f"Text: {test_text}")
    print(f"Mapped Techniques: {res}")
