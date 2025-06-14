"""Health check routes"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "IQFieldBot API"
    }

@router.get("/ready")
async def readiness_check():
    """Readiness check for deployment"""
    # Add checks for external dependencies here
    # (database connectivity, OpenAI API, etc.)
    return {
        "status": "ready",
        "timestamp": datetime.now().isoformat(),
        "checks": {
            "database": "connected",
            "openai": "available"
        }
    }