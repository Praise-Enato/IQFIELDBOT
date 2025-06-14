"""Chat API routes"""

import uuid
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
import structlog
from app.models.schemas import (
    ChatRequest, ChatResponse, FieldSelectionRequest, 
    AnswerRequest, AnswerResponse, FieldType, ChatMessage
)
from app.services.session_service import SessionService
from app.services.question_service import QuestionService

logger = structlog.get_logger()
router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    session_service: SessionService = Depends(lambda: SessionService()),
    question_service: QuestionService = Depends(lambda: QuestionService())
):
    """Send a message to the chatbot"""
    try:
        session = await session_service.get_session(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Add user message to session
        user_message = ChatMessage(
            id=str(uuid.uuid4()),
            type="user",
            content=request.message
        )
        session.messages.append(user_message)
        
        # Process message based on current state
        if not session.selected_field and request.field:
            # Field selection
            session.selected_field = request.field
            response_text = f"Great choice! Let's test your {request.field} skills. Here's your first question:"
            
            # Generate first question
            question = await question_service.generate_question(
                session.selected_field, 
                int(session.difficulty)
            )
            session.current_question = question
            
            # Add bot response
            bot_message = ChatMessage(
                id=str(uuid.uuid4()),
                type="question",
                content=question.question,
                question=question
            )
            session.messages.append(bot_message)
            
        else:
            response_text = "I didn't understand that. Please select a field to get started or answer the current question."
            question = None
        
        await session_service.update_session(session)
        
        return ChatResponse(
            session_id=session.id,
            response=response_text,
            question=session.current_question,
            score=session.score,
            is_complete=session.is_complete,
            difficulty=session.difficulty,
            session_stats={
                "total_questions": session.total_questions,
                "correct_answers": session.correct_answers,
                "accuracy": session.correct_answers / max(session.total_questions, 1)
            }
        )
    
    except Exception as e:
        logger.error("Error processing message", error=str(e), request=request.model_dump())
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/select-field")
async def select_field(
    request: FieldSelectionRequest,
    session_service: SessionService = Depends(lambda: SessionService()),
    question_service: QuestionService = Depends(lambda: QuestionService())
):
    """Select a field for testing"""
    try:
        session = await session_service.get_session(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session.selected_field = request.field
        
        # Initialize field score
        session_service.update_field_scores(session, request.field, is_correct=True)
        session.field_scores[request.field.value].correct = 0  # Reset initial increment
        session.field_scores[request.field.value].total = 0
        
        # Generate first question
        question = await question_service.generate_question(
            request.field, 
            int(session.difficulty)
        )
        session.current_question = question
        
        # Add messages
        field_message = ChatMessage(
            id=str(uuid.uuid4()),
            type="bot",
            content=f"Excellent! You've selected {request.field.value}. Let's begin with your first question."
        )
        session.messages.append(field_message)
        
        question_message = ChatMessage(
            id=str(uuid.uuid4()),
            type="question",
            content=question.question,
            question=question
        )
        session.messages.append(question_message)
        
        await session_service.update_session(session)
        
        return {"message": "Field selected successfully", "question": question}
    
    except Exception as e:
        logger.error("Error selecting field", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/answer", response_model=AnswerResponse)
async def submit_answer(
    request: AnswerRequest,
    session_service: SessionService = Depends(lambda: SessionService()),
    question_service: QuestionService = Depends(lambda: QuestionService())
):
    """Submit an answer to the current question"""
    try:
        session = await session_service.get_session(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if not session.current_question:
            raise HTTPException(status_code=400, detail="No active question")
        
        # Evaluate answer
        is_correct, explanation = question_service.evaluate_answer(
            session.current_question, 
            request.answer
        )
        
        # Update session stats
        session.total_questions += 1
        if is_correct:
            session.correct_answers += 1
            session.score += session.current_question.points
        
        # Update field scores
        session_service.update_field_scores(
            session, 
            session.current_question.field, 
            is_correct
        )
        
        # Add user answer message
        user_message = ChatMessage(
            id=str(uuid.uuid4()),
            type="user",
            content=request.answer
        )
        session.messages.append(user_message)
        
        # Add feedback message
        feedback_message = ChatMessage(
            id=str(uuid.uuid4()),
            type="bot",
            content=f"{'Correct!' if is_correct else 'Incorrect.'} {explanation}",
            is_correct=is_correct
        )
        session.messages.append(feedback_message)
        
        # Calculate new difficulty
        session.difficulty = session_service.calculate_adaptive_difficulty(session)
        
        # Check if session is complete
        next_question = None
        if session.total_questions >= 10:  # Configurable
            session.is_complete = True
            session.end_time = datetime.now()
            
            # Add completion message
            completion_message = ChatMessage(
                id=str(uuid.uuid4()),
                type="bot",
                content=f"Session complete! You scored {session.score} points with {session.correct_answers}/{session.total_questions} correct answers."
            )
            session.messages.append(completion_message)
        else:
            # Generate next question
            question_history = [msg.question.question for msg in session.messages if msg.question]
            next_question = await question_service.generate_question(
                session.selected_field,
                int(session.difficulty),
                question_history[-5:]  # Last 5 questions for context
            )
            session.current_question = next_question
            
            # Add next question message
            question_message = ChatMessage(
                id=str(uuid.uuid4()),
                type="question",
                content=next_question.question,
                question=next_question
            )
            session.messages.append(question_message)
        
        await session_service.update_session(session)
        
        return AnswerResponse(
            session_id=session.id,
            is_correct=is_correct,
            explanation=explanation,
            score=session.score,
            next_question=next_question,
            is_complete=session.is_complete,
            difficulty=session.difficulty
        )
    
    except Exception as e:
        logger.error("Error submitting answer", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")