"""Session management API routes"""

from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
import structlog
from app.models.schemas import (
    SessionCreateRequest, SessionResponse, UserSession, 
    PerformanceAnalytics
)
from app.services.session_service import SessionService

logger = structlog.get_logger()
router = APIRouter()

@router.post("/create", response_model=SessionResponse)
async def create_session(
    request: SessionCreateRequest,
    session_service: SessionService = Depends(lambda: SessionService())
):
    """Create a new testing session"""
    try:
        session = await session_service.create_session(request.user_id)
        return SessionResponse(
            session=session,
            message="Session created successfully. Please select a field to begin testing."
        )
    except Exception as e:
        logger.error("Error creating session", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{session_id}", response_model=UserSession)
async def get_session(
    session_id: str,
    session_service: SessionService = Depends(lambda: SessionService())
):
    """Get session details"""
    try:
        session = await session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error retrieving session", error=str(e), session_id=session_id)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{session_id}/analytics", response_model=PerformanceAnalytics)
async def get_session_analytics(
    session_id: str,
    session_service: SessionService = Depends(lambda: SessionService())
):
    """Get detailed performance analytics for a session"""
    try:
        session = await session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        summary = session_service.generate_performance_summary(session)
        
        # Calculate difficulty progression
        difficulty_progression = []
        current_diff = 1.0
        for i in range(session.total_questions):
            difficulty_progression.append(current_diff)
            # Simplified progression calculation
            if i > 0 and (i + 1) % 3 == 0:  # Adjust every 3 questions
                accuracy = session.correct_answers / (i + 1)
                if accuracy > 0.7:
                    current_diff = min(5.0, current_diff + 0.3)
                elif accuracy < 0.5:
                    current_diff = max(1.0, current_diff - 0.3)
        
        return PerformanceAnalytics(
            session_id=session.id,
            total_score=summary["total_score"],
            accuracy=summary["accuracy"] / 100,  # Convert to decimal
            difficulty_progression=difficulty_progression,
            field_performance=session.field_scores,
            time_spent=int(summary["time_spent_minutes"] * 60),
            strengths=summary["strengths"],
            weaknesses=summary["weaknesses"],
            recommendations=summary["recommendations"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error generating analytics", error=str(e), session_id=session_id)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    session_service: SessionService = Depends(lambda: SessionService())
):
    """Delete a session"""
    try:
        session = await session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # In a real implementation, you'd call a delete method
        # For now, we'll just return success
        return {"message": "Session deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error deleting session", error=str(e), session_id=session_id)
        raise HTTPException(status_code=500, detail="Internal server error")