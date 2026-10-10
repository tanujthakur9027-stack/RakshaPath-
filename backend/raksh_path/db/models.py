"""
Database Models & Pydantic Schemas for Raksh Path
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Pydantic Schemas for API Requests & Responses

class IncidentCreate(BaseModel):
    lat: float = Field(..., description="Latitude of the emergency incident")
    lon: float = Field(..., description="Longitude of the emergency incident")
    incident_type: str = Field(
        default="medical_emergency",
        description="Type: medical_emergency, trapped_citizens, water_rescue, structural_collapse, trauma_severe"
    )
    severity: int = Field(default=3, ge=1, le=5, description="Severity from 1 (minor) to 5 (critical)")
    required_specialty: Optional[str] = Field(default="general", description="Hospital specialty: general, trauma, icu, pediatric")
    description: Optional[str] = Field(default="Monsoon flood emergency incident", description="Details or notes")
    region_id: Optional[str] = Field(default="prayagraj", description="Region / District ID")

class ScenarioAdvanceRequest(BaseModel):
    hours_delta: float = Field(default=1.0, ge=0.1, le=6.0, description="Hours to advance timeline")

class ScenarioSelectRequest(BaseModel):
    scenario_id: str = Field(..., description="Scenario ID: light_monsoon, heavy_monsoon, extreme_surge")
    start_hour: Optional[float] = Field(default=0.0, ge=0.0, le=6.0)

class BlockedRoadReportRequest(BaseModel):
    u_node: str = Field(..., description="Starting intersection node ID")
    v_node: str = Field(..., description="Ending intersection node ID")
    reason: str = Field(default="Submerged road / Debris blockage", description="Crew observation")
    reporter_callsign: str = Field(default="CREW-01", description="Emergency vehicle or crew callsign")

class OverrideDispatchRequest(BaseModel):
    incident_id: str
    unit_id: str
    hospital_id: str
