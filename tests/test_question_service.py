"""Tests for question service"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.question_service import QuestionService
from app.models.schemas import FieldType, Question, QuestionType

@pytest.fixture
def question_service():
    service = QuestionService()
    service.client = AsyncMock()
    return service

@pytest.mark.asyncio
async def test_generate_question_success(question_service):
    """Test successful question generation"""
    # Mock OpenAI response
    mock_response = MagicMock()
    mock_response.choices[0].message.content = """
    {
        "question": "What is 2 + 2?",
        "type": "multiple-choice",
        "options": ["3", "4", "5", "6"],
        "correct_answer": "4",
        "explanation": "2 + 2 equals 4",
        "points": 2
    }
    """
    question_service.client.chat.completions.create.return_value = mock_response
    
    question = await question_service.generate_question(FieldType.MATH, 1)
    
    assert question.field == FieldType.MATH
    assert question.difficulty == 1
    assert question.question == "What is 2 + 2?"
    assert question.correct_answer == "4"

def test_evaluate_answer_correct(question_service):
    """Test correct answer evaluation"""
    question = Question(
        id="test",
        field=FieldType.MATH,
        difficulty=1,
        question="What is 2 + 2?",
        type=QuestionType.TEXT,
        correct_answer="4",
        points=2
    )
    
    is_correct, explanation = question_service.evaluate_answer(question, "4")
    assert is_correct is True

def test_evaluate_answer_incorrect(question_service):
    """Test incorrect answer evaluation"""
    question = Question(
        id="test",
        field=FieldType.MATH,
        difficulty=1,
        question="What is 2 + 2?",
        type=QuestionType.TEXT,
        correct_answer="4",
        points=2
    )
    
    is_correct, explanation = question_service.evaluate_answer(question, "5")
    assert is_correct is False