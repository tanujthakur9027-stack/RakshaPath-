"""
SQLite Database Connection and Persistence Layer for Raksh Path
(Structured with standard SQL tables for trivial migration to PostgreSQL / PostGIS)
"""
import sqlite3
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from raksh_path.config import DB_PATH

logger = logging.getLogger("raksh_path.database")

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    conn = get_db_connection()
    cursor = conn.cursor()

    # Incidents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            region_id TEXT NOT NULL,
            lat REAL NOT NULL,
            lon REAL NOT NULL,
            incident_type TEXT NOT NULL,
            severity INTEGER NOT NULL,
            required_specialty TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Dispatches table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS dispatches (
            id TEXT PRIMARY KEY,
            incident_id TEXT NOT NULL,
            unit_id TEXT NOT NULL,
            hospital_id TEXT NOT NULL,
            eta_minutes REAL NOT NULL,
            reliability_pct REAL NOT NULL,
            explanation TEXT,
            primary_route_json TEXT,
            backup_route_json TEXT,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (incident_id) REFERENCES incidents (id)
        )
    """)

    # Crew Blockage Reports table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS crew_reports (
            id TEXT PRIMARY KEY,
            u_node TEXT NOT NULL,
            v_node TEXT NOT NULL,
            reason TEXT NOT NULL,
            reporter TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()
    logger.info("Initialized SQLite database schema successfully.")

def save_incident(incident: Dict[str, Any]) -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO incidents (id, region_id, lat, lon, incident_type, severity, required_specialty, description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident["id"],
        incident.get("region_id", "prayagraj"),
        incident["lat"],
        incident["lon"],
        incident["incident_type"],
        incident["severity"],
        incident.get("required_specialty", "general"),
        incident.get("description", ""),
        incident.get("status", "pending")
    ))
    conn.commit()
    conn.close()

def get_all_incidents() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_incident_by_id(incident_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
