"""Session management service"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import structlog
from app.core.config import settings
from app.models.schemas import UserSession, FieldType, FieldScore, ChatMessage
from app.core.database import get_database

logger = structlog.get_logger()

class SessionService:
    """Service for managing user sessions"""
    
    def __init__(self):
        self.db = get_database()
    
    async def create_session(self, user_id: Optional[str] = None) -> UserSession:
        """Create a new user session"""
        session = UserSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            difficulty=settings.DEFAULT_DIFFICULTY
        )
        
        # Add welcome message
        welcome_message = ChatMessage(
            id=str(uuid.uuid4()),
            type="bot",
            content="Hello! I'm IQFieldBot, your personalized intelligence testing assistant. I'll adapt questions to your preferred field and adjust difficulty based on your performance. Which field would you like to be tested on?"
        )
        session.messages.append(welcome_message)
        
        await self._save_session(session)
        return session
    
    async def get_session(self, session_id: str) -> Optional[UserSession]:
        """Get session by ID"""
        try:
            session_data = await self.db.get_session(session_id)
            if session_data:
                return UserSession(**session_data)
            return None
        except Exception as e:
            logger.error("Error retrieving session", session_id=session_id, error=str(e))
            return None
    
    async def update_session(self, session: UserSession) -> bool:
        """Update session data"""
        return await self._save_session(session)
    
    async def _save_session(self, session: UserSession) -> bool:
        """Save session to storage"""
        try:
            session_data = session.model_dump()
            # Convert datetime objects to ISO strings for storage
            session_data['start_time'] = session.start_time.isoformat()
            if session.end_time:
                session_data['end_time'] = session.end_time.isoformat()
            
            # Convert messages to dict format
            session_data['messages'] = [msg.model_dump() for msg in session.messages]
            
            await self.db.save_session(session.id, session_data)
            return True
        except Exception as e:
            logger.error("Error saving session", session_id=session.id, error=str(e))
            return False
    
    def calculate_adaptive_difficulty(self, session: UserSession) -> float:
        """Calculate new difficulty based on performance"""
        if session.total_questions == 0:
            return session.difficulty
        
        accuracy = session.correct_answers / session.total_questions
        
        if accuracy > settings.DIFFICULTY_THRESHOLD:
            # User is doing well, increase difficulty
            new_difficulty = min(
                settings.MAX_DIFFICULTY,
                session.difficulty + settings.DIFFICULTY_ADJUSTMENT
            )
        elif accuracy < (settings.DIFFICULTY_THRESHOLD - 0.2):
            # User is struggling, decrease difficulty
            new_difficulty = max(
                1.0,
                session.difficulty - settings.DIFFICULTY_ADJUSTMENT
            )
        else:
            # Maintain current difficulty
            new_difficulty = session.difficulty
        
        return new_difficulty
    
    def update_field_scores(self, session: UserSession, field: FieldType, is_correct: bool):
        """Update field-specific scores"""
        field_key = field.value
        
        if field_key not in session.field_scores:
            session.field_scores[field_key] = FieldScore()
        
        field_score = session.field_scores[field_key]
        field_score.total += 1
        
        if is_correct:
            field_score.correct += 1
        
        # Update accuracy
        field_score.accuracy = field_score.correct / field_score.total if field_score.total > 0 else 0.0
    
    def generate_performance_summary(self, session: UserSession) -> Dict:
        """Generate performance summary and recommendations"""
        if session.total_questions == 0:
            return {"message": "No questions answered yet"}
        
        accuracy = session.correct_answers / session.total_questions
        time_spent = (datetime.now() - session.start_time).total_seconds()
        
        # Determine strengths and weaknesses
        strengths = []
        weaknesses = []
        
        for field, score in session.field_scores.items():
            if score.accuracy > 0.8:
                strengths.append(field.title())
            elif score.accuracy < 0.5:
                weaknesses.append(field.title())
        
        # Generate recommendations
        recommendations = []
        if accuracy < 0.6:
            recommendations.append("Focus on fundamental concepts in your chosen field")
            recommendations.append("Take more time to read questions carefully")
        elif accuracy > 0.8:
            recommendations.append("Try more challenging problems to push your limits")
            recommendations.append("Explore advanced topics in your field")
        
        if weaknesses:
            recommendations.append(f"Consider practicing more in: {', '.join(weaknesses)}")
        
        return {
            "total_score": session.score,
            "accuracy": round(accuracy * 100, 1),
            "questions_answered": session.total_questions,
            "time_spent_minutes": round(time_spent / 60, 1),
            "difficulty_reached": session.difficulty,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations,
            "field_breakdown": session.field_scores
        }