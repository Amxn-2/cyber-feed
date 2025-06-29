from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class Coordinates(BaseModel):
    lat: float
    lng: float

class Location(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    coordinates: Optional[Coordinates] = None

class AIAnalysis(BaseModel):
    risk_score: int = Field(ge=0, le=100)
    indicators: List[str] = []
    mitigation: List[str] = []
    category_confidence: float = Field(ge=0.0, le=1.0, default=0.8)
    severity_confidence: float = Field(ge=0.0, le=1.0, default=0.8)
    india_relevance_score: float = Field(ge=0.0, le=1.0, default=0.5)

class CyberIncident(BaseModel):
    id: str = Field(default_factory=lambda: f"INC-{uuid.uuid4().hex[:8].upper()}")
    title: str
    description: str
    severity: str = Field(pattern="^(low|medium|high|critical)$")
    category: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Source information
    source: str
    source_url: Optional[str] = None
    
    # Location and impact
    location: Optional[Location] = None
    affected_systems: Optional[int] = None
    threat_actor: Optional[str] = None
    
    # Analysis
    ai_analysis: Optional[AIAnalysis] = None
    is_india_specific: bool = False
    
    # Metadata
    tags: List[str] = []
    raw_content: Optional[str] = None
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class IncidentCreate(BaseModel):
    title: str
    description: str
    source: str
    source_url: Optional[str] = None
    raw_content: Optional[str] = None

class IncidentFilter(BaseModel):
    severity: Optional[str] = None
    category: Optional[str] = None
    india_specific_only: bool = False
    search_term: Optional[str] = None
    limit: int = 50
    offset: int = 0
    sort_by: str = "timestamp"
    sort_order: str = "desc"

class Analytics(BaseModel):
    total_incidents: int
    critical_incidents: int
    high_incidents: int
    medium_incidents: int
    low_incidents: int
    daily_incidents: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    state_distribution: List[Dict[str, Any]]
    top_threat_actors: List[Dict[str, Any]]

class SystemStatus(BaseModel):
    is_online: bool = True
    last_update: datetime = Field(default_factory=datetime.utcnow)
    data_sources_active: int = 0
    total_data_sources: int = 0
    incidents_processed_today: int = 0
    system_health: float = 100.0
    ai_analysis_status: str = "operational"
    collection_status: str = "active"