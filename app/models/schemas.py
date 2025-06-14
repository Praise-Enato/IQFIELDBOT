"""Pydantic models for request/response schemas"""

from datetime import datetime
from typing import Dict, List, Optional, Union
from pydantic import BaseModel, Field
from enum import Enum

class FieldType(str, Enum):
    MATH = "math"
    LOGIC = "logic"
    PROGRAMMING = "programming"
    LANGUAGE = "language"
    VISUAL_PATTERNS = "visual-patterns"

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple-choice"
    TEXT = "text"
    NUMBER = "number"

class Question(BaseModel):
    id: str
    field: FieldType
    difficulty: int = Field(ge=1, le=5)
    question: str
    type: QuestionType
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: Optional[str] = None
    points: int = Field(ge=1, le=10)
    time_limit: Optional[int] = None  # seconds

class FieldScore(BaseModel):
    correct: int = 0
    total: int = 0
    accuracy: float = 0.0

class ChatMessage(BaseModel):
    id: str
    type: str  # 'bot', 'user', 'question'
    content: str
    question: Optional[Question] = None
    is_correct: Optional[bool] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class UserSession(BaseModel):
    id: str
    user_id: Optional[str] = None
    selected_field: Optional[FieldType] = None
    current_question: Optional[Question] = None
    score: int = 0
    total_questions: int = 0
    correct_answers: int = 0
    difficulty: float = 1.0
    field_scores: Dict[str, FieldScore] = Field(default_factory=dict)
    start_time: datetime = Field(default_factory=datetime.now)
    end_time: Optional[datetime] = None
    is_complete: bool = False
    messages: List[ChatMessage] = Field(default_factory=list)

# Request/Response Models
class ChatRequest(BaseModel):
    session_id: str
    message: str
    field: Optional[FieldType] = None

class ChatResponse(BaseModel):
    session_id: str
    response: str
    question: Optional[Question] = None
    score: int
    is_complete: bool
    difficulty: float
    session_stats: Dict[str, Union[int, float]]

class FieldSelectionRequest(BaseModel):
    session_id: str
    field: FieldType

class AnswerRequest(BaseModel):
    session_id: str
    answer: str

class AnswerResponse(BaseModel):
    session_id: str
    is_correct: bool
    explanation: str
    score: int
    next_question: Optional[Question] = None
    is_complete: bool
    difficulty: float

class SessionCreateRequest(BaseModel):
    user_id: Optional[str] = None

class SessionResponse(BaseModel):
    session: UserSession
    message: str

class PerformanceAnalytics(BaseModel):
    session_id: str
    total_score: int
    accuracy: float
    difficulty_progression: List[float]
    field_performance: Dict[str, FieldScore]
    time_spent: int  # seconds
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]