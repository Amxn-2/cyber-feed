import sys
import os
from pathlib import Path
from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import List, Optional
import logging
import asyncio

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import sys
import os
from pathlib import Path

# Add current directory to Python path
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

# Import our models and services
from models import (
    CyberIncident, IncidentCreate, IncidentFilter, Analytics, SystemStatus, 
    AIAnalysis, Location, Coordinates
)
from data_sources import DataCollector
from ai_analyzer import AIAnalyzer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize services
data_collector = DataCollector()
ai_analyzer = AIAnalyzer()

# FastAPI app
app = FastAPI(title="CyberWatch India API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Global state
system_status = SystemStatus()
collection_in_progress = False

@api_router.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "CyberWatch India API is operational",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "healthy"
    }

@api_router.get("/incidents", response_model=List[CyberIncident])
async def get_incidents(
    severity: Optional[str] = None,
    category: Optional[str] = None,
    india_specific_only: bool = False,
    search_term: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    sort_by: str = "timestamp",
    sort_order: str = "desc"
):
    """Get filtered incidents"""
    try:
        # Build filter query
        filter_query = {}
        
        if severity:
            filter_query["severity"] = severity
        if category:
            filter_query["category"] = category
        if india_specific_only:
            filter_query["is_india_specific"] = True
        if search_term:
            filter_query["$or"] = [
                {"title": {"$regex": search_term, "$options": "i"}},
                {"description": {"$regex": search_term, "$options": "i"}},
                {"tags": {"$regex": search_term, "$options": "i"}}
            ]
        
        # Sort configuration
        sort_direction = -1 if sort_order == "desc" else 1
        sort_config = [(sort_by, sort_direction)]
        
        # Execute query
        cursor = db.incidents.find(filter_query).sort(sort_config).skip(offset).limit(limit)
        incidents = await cursor.to_list(length=limit)
        
        # Convert MongoDB documents to Pydantic models
        result = []
        for incident in incidents:
            # Convert MongoDB _id to string if present
            if '_id' in incident:
                del incident['_id']
            
            # Convert datetime strings back to datetime objects if needed
            if isinstance(incident.get('timestamp'), str):
                incident['timestamp'] = datetime.fromisoformat(incident['timestamp'].replace('Z', '+00:00'))
            if isinstance(incident.get('last_updated'), str):
                incident['last_updated'] = datetime.fromisoformat(incident['last_updated'].replace('Z', '+00:00'))
            
            result.append(CyberIncident(**incident))
        
        logger.info(f"Retrieved {len(result)} incidents with filters: {filter_query}")
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving incidents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving incidents: {str(e)}")

@api_router.get("/incidents/{incident_id}", response_model=CyberIncident)
async def get_incident(incident_id: str):
    """Get specific incident by ID"""
    try:
        incident = await db.incidents.find_one({"id": incident_id})
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        # Remove MongoDB _id
        if '_id' in incident:
            del incident['_id']
        
        return CyberIncident(**incident)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving incident {incident_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving incident: {str(e)}")

@api_router.get("/analytics", response_model=Analytics)
async def get_analytics():
    """Get comprehensive analytics"""
    try:
        # Get total counts
        total_incidents = await db.incidents.count_documents({})
        critical_incidents = await db.incidents.count_documents({"severity": "critical"})
        high_incidents = await db.incidents.count_documents({"severity": "high"})
        medium_incidents = await db.incidents.count_documents({"severity": "medium"})
        low_incidents = await db.incidents.count_documents({"severity": "low"})
        
        # Get daily incidents for last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        daily_pipeline = [
            {"$match": {"timestamp": {"$gte": thirty_days_ago}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                "total": {"$sum": 1},
                "critical": {"$sum": {"$cond": [{"$eq": ["$severity", "critical"]}, 1, 0]}},
                "high": {"$sum": {"$cond": [{"$eq": ["$severity", "high"]}, 1, 0]}},
                "medium": {"$sum": {"$cond": [{"$eq": ["$severity", "medium"]}, 1, 0]}},
                "low": {"$sum": {"$cond": [{"$eq": ["$severity", "low"]}, 1, 0]}}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        daily_results = await db.incidents.aggregate(daily_pipeline).to_list(length=None)
        daily_incidents = [
            {
                "date": result["_id"],
                "total": result["total"],
                "critical": result["critical"],
                "high": result["high"],
                "medium": result["medium"],
                "low": result["low"]
            }
            for result in daily_results
        ]
        
        # Get category distribution
        category_pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        category_results = await db.incidents.aggregate(category_pipeline).to_list(length=None)
        category_distribution = [
            {"name": result["_id"], "value": result["count"]}
            for result in category_results
        ]
        
        # Get state distribution
        state_pipeline = [
            {"$match": {"location.state": {"$ne": None}}},
            {"$group": {
                "_id": "$location.state",
                "incidents": {"$sum": 1},
                "critical": {"$sum": {"$cond": [{"$eq": ["$severity", "critical"]}, 1, 0]}}
            }},
            {"$sort": {"incidents": -1}},
            {"$limit": 10}
        ]
        state_results = await db.incidents.aggregate(state_pipeline).to_list(length=None)
        state_distribution = [
            {
                "state": result["_id"],
                "incidents": result["incidents"],
                "critical": result["critical"]
            }
            for result in state_results
        ]
        
        # Get top threat actors
        actor_pipeline = [
            {"$match": {"threat_actor": {"$ne": None}}},
            {"$group": {"_id": "$threat_actor", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        actor_results = await db.incidents.aggregate(actor_pipeline).to_list(length=None)
        top_threat_actors = [
            {"actor": result["_id"], "count": result["count"]}
            for result in actor_results
        ]
        
        analytics = Analytics(
            total_incidents=total_incidents,
            critical_incidents=critical_incidents,
            high_incidents=high_incidents,
            medium_incidents=medium_incidents,
            low_incidents=low_incidents,
            daily_incidents=daily_incidents,
            category_distribution=category_distribution,
            state_distribution=state_distribution,
            top_threat_actors=top_threat_actors
        )
        
        logger.info(f"Generated analytics for {total_incidents} incidents")
        return analytics
        
    except Exception as e:
        logger.error(f"Error generating analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating analytics: {str(e)}")

@api_router.get("/map-data")
async def get_map_data(
    severity: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 1000
):
    """Get incident data for mapping"""
    try:
        filter_query = {"location.coordinates": {"$ne": None}}
        
        if severity:
            filter_query["severity"] = severity
        if category:
            filter_query["category"] = category
        
        cursor = db.incidents.find(
            filter_query,
            {
                "id": 1, "title": 1, "severity": 1, "category": 1,
                "location": 1, "timestamp": 1, "ai_analysis.risk_score": 1,
                "affected_systems": 1, "threat_actor": 1
            }
        ).limit(limit)
        
        incidents = await cursor.to_list(length=limit)
        
        # Clean up the data for frontend
        for incident in incidents:
            if '_id' in incident:
                del incident['_id']
        
        logger.info(f"Retrieved {len(incidents)} incidents for mapping")
        return incidents
        
    except Exception as e:
        logger.error(f"Error retrieving map data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving map data: {str(e)}")

@api_router.get("/status", response_model=SystemStatus)
async def get_system_status():
    """Get current system status"""
    try:
        # Update incident count for today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        incidents_today = await db.incidents.count_documents({
            "timestamp": {"$gte": today_start}
        })
        
        # Update system status
        system_status.incidents_processed_today = incidents_today
        system_status.data_sources_active = data_collector.active_sources
        system_status.total_data_sources = data_collector.total_sources
        system_status.last_update = datetime.utcnow()
        system_status.collection_status = "active" if not collection_in_progress else "collecting"
        
        return system_status
        
    except Exception as e:
        logger.error(f"Error getting system status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting system status: {str(e)}")

@api_router.post("/collect-incidents")
async def trigger_data_collection(background_tasks: BackgroundTasks):
    """Manually trigger data collection"""
    global collection_in_progress
    
    if collection_in_progress:
        raise HTTPException(status_code=409, detail="Collection already in progress")
    
    background_tasks.add_task(collect_and_process_incidents)
    return {"message": "Data collection started", "status": "initiated"}

async def collect_and_process_incidents():
    """Background task to collect and process incidents"""
    global collection_in_progress
    collection_in_progress = True
    
    try:
        logger.info("Starting data collection process")
        
        # Collect raw incidents from sources
        raw_incidents = await data_collector.collect_all_incidents()
        logger.info(f"Collected {len(raw_incidents)} raw incidents")
        
        processed_count = 0
        for raw_incident in raw_incidents:
            try:
                # Check if incident already exists (by title and source)
                existing = await db.incidents.find_one({
                    "title": raw_incident['title'],
                    "source": raw_incident['source']
                })
                
                if existing:
                    continue  # Skip duplicates
                
                # Analyze incident with AI
                category, severity, ai_analysis, is_india_specific, location, tags = await ai_analyzer.analyze_incident(raw_incident)
                
                # Create full incident object
                incident = CyberIncident(
                    title=raw_incident['title'],
                    description=raw_incident['description'],
                    severity=severity,
                    category=category,
                    source=raw_incident['source'],
                    source_url=raw_incident.get('source_url'),
                    ai_analysis=ai_analysis,
                    is_india_specific=is_india_specific,
                    tags=tags,
                    raw_content=raw_incident.get('raw_content'),
                    timestamp=raw_incident.get('timestamp', datetime.utcnow())
                )
                
                # Add location if available
                if location:
                    incident.location = Location(
                        city=location.get('city'),
                        state=location.get('state'),
                        country=location.get('country', 'India'),
                        coordinates=Coordinates(**location['coordinates']) if location.get('coordinates') else None
                    )
                
                # Set affected systems based on severity
                if severity == 'critical':
                    incident.affected_systems = ai_analysis.risk_score * 100
                elif severity == 'high':
                    incident.affected_systems = ai_analysis.risk_score * 50
                else:
                    incident.affected_systems = ai_analysis.risk_score * 10
                
                # Save to database
                incident_dict = incident.dict()
                await db.incidents.insert_one(incident_dict)
                processed_count += 1
                
            except Exception as e:
                logger.error(f"Error processing incident: {str(e)}")
                continue
        
        logger.info(f"Processed and saved {processed_count} new incidents")
        
        # Update system status
        system_status.last_update = datetime.utcnow()
        system_status.data_sources_active = data_collector.active_sources
        
    except Exception as e:
        logger.error(f"Error in data collection process: {str(e)}")
    finally:
        collection_in_progress = False

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Startup event to initialize data collection"""
    logger.info("CyberWatch India API starting up")
    
    # Create database indexes for better performance
    try:
        await db.incidents.create_index("timestamp")
        await db.incidents.create_index("severity")
        await db.incidents.create_index("category")
        await db.incidents.create_index("is_india_specific")
        await db.incidents.create_index([("title", "text"), ("description", "text")])
        logger.info("Database indexes created")
    except Exception as e:
        logger.warning(f"Error creating indexes: {str(e)}")
    
    # Start initial data collection
    asyncio.create_task(collect_and_process_incidents())

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    client.close()
    logger.info("CyberWatch India API shutting down")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)