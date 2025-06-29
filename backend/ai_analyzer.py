import google.generativeai as genai
import os
import logging
import json
from typing import Dict, List, Optional, Tuple
from models import AIAnalysis, CyberIncident
import re

logger = logging.getLogger(__name__)

class AIAnalyzer:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Indian cities and states for geographic analysis
        self.indian_locations = {
            'cities': [
                'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 
                'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
                'visakhapatnam', 'bhopal', 'patna', 'vadodara', 'ludhiana',
                'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan'
            ],
            'states': [
                'maharashtra', 'karnataka', 'tamil nadu', 'gujarat', 'rajasthan',
                'uttar pradesh', 'west bengal', 'madhya pradesh', 'bihar',
                'andhra pradesh', 'telangana', 'kerala', 'punjab', 'haryana',
                'odisha', 'jharkhand', 'chhattisgarh', 'assam', 'uttarakhand'
            ]
        }
        
        # Indian organizations and sectors
        self.indian_entities = [
            'cert-in', 'nic', 'cdac', 'isro', 'drdo', 'bsnl', 'mtnl', 'ongc',
            'ntpc', 'bhel', 'hal', 'railtel', 'pgcil', 'powergrid', 'uidai',
            'aadhaar', 'upi', 'digital india', 'meity', 'dit', 'stqc'
        ]
    
    async def analyze_incident(self, incident_data: Dict) -> Tuple[str, str, AIAnalysis, bool, Optional[Dict], List[str]]:
        """
        Analyze incident and return:
        - category
        - severity 
        - AI analysis
        - is_india_specific
        - location info
        - tags
        """
        try:
            title = incident_data.get('title', '')
            description = incident_data.get('description', '')
            raw_content = incident_data.get('raw_content', '')
            
            # Combine all text for analysis
            full_text = f"Title: {title}\nDescription: {description}\nContent: {raw_content}"
            
            # Create comprehensive analysis prompt
            prompt = self._create_analysis_prompt(full_text)
            
            # Get AI analysis
            response = await self._get_ai_response(prompt)
            
            if not response:
                return self._fallback_analysis(incident_data)
            
            # Parse AI response
            analysis_result = self._parse_ai_response(response, full_text)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
            return self._fallback_analysis(incident_data)
    
    def _create_analysis_prompt(self, text: str) -> str:
        """Create comprehensive analysis prompt for Gemini"""
        return f"""
        You are a cybersecurity expert analyzing threat intelligence. Analyze the following incident data and provide a JSON response with the specified format.

        INCIDENT DATA:
        {text}

        ANALYSIS REQUIREMENTS:
        1. Categorize the threat type
        2. Assess severity level
        3. Determine India relevance
        4. Extract location information
        5. Identify threat actors if mentioned
        6. Generate mitigation recommendations
        7. Extract key indicators
        8. Create relevant tags

        RESPONSE FORMAT (JSON only):
        {{
            "category": "one of: malware, phishing, ransomware, data_breach, apt, ddos, vulnerability, insider_threat",
            "severity": "one of: low, medium, high, critical",
            "risk_score": "integer from 0-100",
            "category_confidence": "float from 0.0-1.0",
            "severity_confidence": "float from 0.0-1.0",
            "india_relevance_score": "float from 0.0-1.0",
            "is_india_specific": "boolean",
            "location": {{
                "city": "city name if mentioned or null",
                "state": "state name if mentioned or null",
                "country": "India or other country"
            }},
            "threat_actor": "threat actor name if mentioned or null",
            "indicators": ["list of threat indicators"],
            "mitigation": ["list of mitigation recommendations"],
            "tags": ["list of relevant tags"],
            "reasoning": "brief explanation of analysis"
        }}

        ANALYSIS CRITERIA:
        - India relevance: Check for Indian cities, organizations (CERT-In, UIDAI, ISRO, etc.), .in domains, INR currency, Indian phone formats
        - Severity: Critical (nation-state attacks, infrastructure), High (data breaches, ransomware), Medium (malware, phishing), Low (minor vulnerabilities)
        - Location: Extract any geographic references, especially Indian cities/states
        - Risk score: Based on potential impact, affected systems, threat sophistication

        Provide only the JSON response, no additional text.
        """
    
    async def _get_ai_response(self, prompt: str) -> Optional[str]:
        """Get response from Gemini AI"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return None
    
    def _parse_ai_response(self, response: str, original_text: str) -> Tuple[str, str, AIAnalysis, bool, Optional[Dict], List[str]]:
        """Parse AI response and extract analysis components"""
        try:
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if not json_match:
                logger.warning("No JSON found in AI response")
                return self._fallback_analysis({'title': original_text[:100]})
            
            analysis = json.loads(json_match.group())
            
            # Extract components
            category = analysis.get('category', 'vulnerability')
            severity = analysis.get('severity', 'medium')
            
            # Create AI analysis object
            ai_analysis = AIAnalysis(
                risk_score=int(analysis.get('risk_score', 50)),
                indicators=analysis.get('indicators', []),
                mitigation=analysis.get('mitigation', []),
                category_confidence=float(analysis.get('category_confidence', 0.8)),
                severity_confidence=float(analysis.get('severity_confidence', 0.8)),
                india_relevance_score=float(analysis.get('india_relevance_score', 0.5))
            )
            
            is_india_specific = analysis.get('is_india_specific', False)
            
            # Location extraction
            location_data = analysis.get('location')
            location = None
            if location_data and (location_data.get('city') or location_data.get('state')):
                # Get coordinates for Indian cities
                coordinates = self._get_coordinates(
                    location_data.get('city'), 
                    location_data.get('state')
                )
                location = {
                    'city': location_data.get('city'),
                    'state': location_data.get('state'),
                    'country': location_data.get('country', 'India'),
                    'coordinates': coordinates
                }
            
            tags = analysis.get('tags', [])
            threat_actor = analysis.get('threat_actor')
            
            return category, severity, ai_analysis, is_india_specific, location, tags
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {str(e)}")
            return self._fallback_analysis({'title': original_text[:100]})
        except Exception as e:
            logger.error(f"Response parsing error: {str(e)}")
            return self._fallback_analysis({'title': original_text[:100]})
    
    def _fallback_analysis(self, incident_data: Dict) -> Tuple[str, str, AIAnalysis, bool, Optional[Dict], List[str]]:
        """Fallback analysis when AI fails"""
        title = incident_data.get('title', '').lower()
        description = incident_data.get('description', '').lower()
        text = f"{title} {description}"
        
        # Simple keyword-based analysis
        category = 'vulnerability'
        severity = 'medium'
        risk_score = 50
        
        # Category detection
        if any(word in text for word in ['ransomware', 'crypto', 'encryption']):
            category = 'ransomware'
            severity = 'high'
            risk_score = 80
        elif any(word in text for word in ['phishing', 'scam', 'fake']):
            category = 'phishing'
            severity = 'medium'
            risk_score = 60
        elif any(word in text for word in ['malware', 'virus', 'trojan']):
            category = 'malware'
            severity = 'high'
            risk_score = 70
        elif any(word in text for word in ['breach', 'leak', 'exposed']):
            category = 'data_breach'
            severity = 'high'
            risk_score = 85
        elif any(word in text for word in ['ddos', 'denial', 'flood']):
            category = 'ddos'
            severity = 'medium'
            risk_score = 55
        
        # India relevance detection
        is_india_specific = any(
            entity in text for entity in self.indian_entities
        ) or any(
            city in text for city in self.indian_locations['cities']
        ) or any(
            state in text for state in self.indian_locations['states']
        ) or '.in' in text or 'india' in text
        
        ai_analysis = AIAnalysis(
            risk_score=risk_score,
            indicators=['Keyword-based analysis'],
            mitigation=['Monitor for updates', 'Apply security patches'],
            category_confidence=0.6,
            severity_confidence=0.6,
            india_relevance_score=0.8 if is_india_specific else 0.3
        )
        
        tags = ['cybersecurity', 'threat', category, severity]
        if is_india_specific:
            tags.append('india')
        
        return category, severity, ai_analysis, is_india_specific, None, tags
    
    def _get_coordinates(self, city: Optional[str], state: Optional[str]) -> Optional[Dict]:
        """Get coordinates for Indian locations"""
        # Simple coordinate mapping for major Indian cities
        city_coords = {
            'mumbai': {'lat': 19.0760, 'lng': 72.8777},
            'delhi': {'lat': 28.6139, 'lng': 77.2090},
            'bangalore': {'lat': 12.9716, 'lng': 77.5946},
            'hyderabad': {'lat': 17.3850, 'lng': 78.4867},
            'chennai': {'lat': 13.0827, 'lng': 80.2707},
            'kolkata': {'lat': 22.5726, 'lng': 88.3639},
            'pune': {'lat': 18.5204, 'lng': 73.8567},
            'ahmedabad': {'lat': 23.0225, 'lng': 72.5714},
            'jaipur': {'lat': 26.9124, 'lng': 75.7873},
            'lucknow': {'lat': 26.8467, 'lng': 80.9462}
        }
        
        if city and city.lower() in city_coords:
            return city_coords[city.lower()]
        
        # Default to center of India if no specific coordinates
        return {'lat': 20.5937, 'lng': 78.9629}