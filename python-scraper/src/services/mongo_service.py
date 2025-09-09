"""
MongoDB service for incident data management
"""

import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson import ObjectId

from ..models.incident import IncidentModel
from config import Config

logger = logging.getLogger(__name__)

class MongoService:
    """MongoDB service for incident management"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.collection = None
        self.connect()
    
    def connect(self):
        """Connect to MongoDB"""
        try:
            mongo_uri = Config.get_mongodb_uri()
            self.client = MongoClient(mongo_uri)
            self.db = self.client[Config.get_database_name()]
            self.collection = self.db[Config.get_collection_name()]
            
            # Test connection
            self.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully")
            
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def save_incident(self, incident: IncidentModel) -> bool:
        """Save incident to MongoDB"""
        try:
            # Check if incident already exists (by hash)
            existing = self.collection.find_one({"hash": incident.hash})
            if existing:
                logger.info(f"Incident already exists: {incident.title}")
                return False
            
            # Insert new incident
            result = self.collection.insert_one(incident.to_dict())
            logger.info(f"Saved incident: {incident.title} (ID: {result.inserted_id})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save incident: {e}")
            return False
    
    def save_incidents_batch(self, incidents: List[IncidentModel]) -> int:
        """Save multiple incidents in batch"""
        try:
            saved_count = 0
            for incident in incidents:
                if self.save_incident(incident):
                    saved_count += 1
            return saved_count
        except Exception as e:
            logger.error(f"Failed to save incidents batch: {e}")
            return 0
    
    def get_incidents(self, limit: int = 100, filters: Optional[Dict] = None) -> List[Dict]:
        """Get incidents from MongoDB"""
        try:
            # Apply India-only filter if configured
            query = {}
            if Config.INDIA_ONLY:
                query["location"] = "India"
            if filters:
                query.update(filters)
            
            cursor = self.collection.find(query).sort("published_date", -1).limit(limit)
            incidents = []
            
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                incidents.append(doc)
            
            return incidents
            
        except Exception as e:
            logger.error(f"Failed to get incidents: {e}")
            return []
    
    def get_incident_stats(self) -> Dict[str, Any]:
        """Get incident statistics"""
        try:
            # Apply India-only filter if configured
            base_query = {}
            if Config.INDIA_ONLY:
                base_query["location"] = "India"
            
            # Total incidents
            total = self.collection.count_documents(base_query)
            
            # Recent incidents (last 24 hours)
            recent_date = datetime.utcnow() - timedelta(days=1)
            recent = self.collection.count_documents({
                **base_query,
                "created_at": {"$gte": recent_date}
            })
            
            # Sources
            sources = self.collection.distinct("source", base_query)
            
            # Last updated
            last_incident = self.collection.find_one(base_query, sort=[("created_at", -1)])
            last_updated = last_incident.get("created_at") if last_incident else None
            
            return {
                "total": total,
                "recent": recent,
                "sources": sources,
                "last_updated": last_updated.isoformat() if last_updated else None
            }
            
        except Exception as e:
            logger.error(f"Failed to get incident stats: {e}")
            return {"total": 0, "recent": 0, "sources": [], "last_updated": None}
    
    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")
