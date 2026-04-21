import spacy
import re

class EntityExtractor:
    def __init__(self):
        try:
            # Load small model for efficiency
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # If model is not found, we can't do much NER
            # User will need to run 'python -m spacy download en_core_web_sm'
            print("Warning: spaCy model 'en_core_web_sm' not found.")
            self.nlp = None

    def extract_entities(self, text):
        """Extract various entities from text"""
        entities = {
            "organizations": [],
            "locations": [],
            "technologies": [],
            "threat_actors": []
        }

        if not self.nlp or not text:
            return entities

        doc = self.nlp(text)

        for ent in doc.ents:
            if ent.label_ == "ORG":
                # Clean up and filter common non-orgs if necessary
                name = ent.text.strip()
                if len(name) > 2 and name not in entities["organizations"]:
                    entities["organizations"].append(name)
            elif ent.label_ == "GPE" or ent.label_ == "LOC":
                name = ent.text.strip()
                if name not in entities["locations"]:
                    entities["locations"].append(name)

        # Custom extraction for technologies (common products/software)
        tech_keywords = [
            'windows', 'linux', 'macos', 'android', 'ios', 'cisco', 'fortinet',
            'apache', 'nginx', 'wordpress', 'vmware', 'exchange', 'sql', 'oracle',
            'kubernetes', 'docker', 'chrome', 'firefox', 'safari', 'vpn', 'router',
            'firewall', 'cloud', 'aws', 'azure', 'googleg', 'microsoft', 'intel',
            'whatsapp', 'facebook', 'instagram', 'twitter', 'telegram'
        ]
        
        lower_text = text.lower()
        for tech in tech_keywords:
            if re.search(rf'\b{tech}\b', lower_text):
                # Capitalize nicely
                tech_display = tech.capitalize()
                if tech == 'aws': tech_display = 'AWS'
                if tech == 'vpn': tech_display = 'VPN'
                if tech == 'sql': tech_display = 'SQL'
                
                if tech_display not in entities["technologies"]:
                    entities["technologies"].append(tech_display)

        # Custom extraction for threat actors (common patterns like APTxx, Lazarus, etc.)
        actor_patterns = [
            r'APT\d+', r'Lazarus Group', r'Fancy Bear', r'Cozy Bear', 
            r'LockBit', r'Conti', r'REvil', r'ALPHV', r'BlackCat',
            r'DarkSide', r'Wizard Spider', r'Sandworm', r'Guccifer'
        ]
        
        for pattern in actor_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                actor = match.group()
                if actor not in entities["threat_actors"]:
                    entities["threat_actors"].append(actor)

        return entities

if __name__ == "__main__":
    # Quick test
    extractor = EntityExtractor()
    test_text = "Microsoft warned that the Lazarus Group (APT38) is targeting financial institutions in India using a new variant of the RedLine malware affecting Windows 10 systems."
    res = extractor.extract_entities(test_text)
    print(f"Text: {test_text}")
    print(f"Entities: {res}")
