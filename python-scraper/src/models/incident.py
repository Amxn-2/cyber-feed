"""
Incident data model for cyber security incidents
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class IncidentModel(BaseModel):
    """Cyber security incident model"""
    
    id: Optional[str] = Field(None, alias="_id")
    title: str = Field(..., description="Incident title")
    description: str = Field(..., description="Incident description")
    url: Optional[str] = Field(None, description="Source URL")
    published_date: datetime = Field(..., description="Publication date")
    source: str = Field(..., description="Source name")
    category: str = Field(..., description="Incident category")
    severity: str = Field(..., description="Severity level")
    location: str = Field(default="India", description="Geographic location")
    hash: str = Field(..., description="Unique hash for deduplication")
    tags: Optional[List[str]] = Field(default=[], description="Incident tags")
    is_verified: bool = Field(default=False, description="Verification status")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "validate_by_name": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat(),
            ObjectId: str
        }
    }
        
    def to_dict(self) -> dict:
        """Convert to dictionary for MongoDB storage"""
        data = self.model_dump(by_alias=True, exclude_unset=True)
        if "_id" in data and data["_id"] is None:
            del data["_id"]
        return data
    
    @classmethod
    def from_dict(cls, data: dict) -> "IncidentModel":
        """Create from dictionary"""
        if "_id" in data:
            data["_id"] = str(data["_id"])
        return cls(**data)
