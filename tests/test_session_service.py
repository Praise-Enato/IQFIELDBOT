"""Tests for session service"""

import pytest
from unittest.mock import AsyncMock
from app.services.session_service import SessionService
from app.models.schemas import UserSession, FieldType

@pytest.fixture
def session_service():
    service = SessionService()
    service.db = AsyncMock()
    return service

@pytest.mark.asyncio
async def test_create_session(session_service):
    """Test session creation"""
    session_service.db.save_session.return_value = True
    
    session = await session_service.create_session()
    
    assert session.id is not None
    assert session.score == 0
    assert session.total_questions == 0
    assert len(session.messages) == 1  # Welcome message

def test_calculate_adaptive_difficulty_increase(session_service):
    """Test difficulty increase for good performance"""
    session = UserSession(
        id="test",
        total_questions=5,
        correct_answers=4,  # 80% accuracy
        difficulty=2.0
    )
    
    new_difficulty = session_service.calculate_adaptive_difficulty(session)
    
    assert new_difficulty > session.difficulty

def test_calculate_adaptive_difficulty_decrease(session_service):
    """Test difficulty decrease for poor performance"""
    session = UserSession(
        id="test",
        total_questions=5,
        correct_answers=2,  # 40% accuracy
        difficulty=3.0
    )
    
    new_difficulty = session_service.calculate_adaptive_difficulty(session)
    
    assert new_difficulty < session.difficulty