"""
IQFieldBot - Personalized IQ Testing Chatbot
Main FastAPI application entry point
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog
from app.core.config import settings
from app.api.routes import chat, sessions, health
from app.core.database import init_database
from app.services.question_service import QuestionService

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Security
security = HTTPBearer(auto_error=False)

async def verify_api_key(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify API key authentication"""
    if not credentials:
        if settings.REQUIRE_AUTH:
            raise HTTPException(status_code=401, detail="API key required")
        return None
    
    if credentials.credentials != settings.API_SECRET:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    return credentials.credentials

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting IQFieldBot API")
    
    # Initialize database connections
    await init_database()
    
    # Initialize question service
    question_service = QuestionService()
    app.state.question_service = question_service
    
    logger.info("IQFieldBot API started successfully")
    yield
    
    logger.info("Shutting down IQFieldBot API")

# Create FastAPI application
app = FastAPI(
    title="IQFieldBot API",
    description="Personalized IQ Testing Chatbot with Adaptive Difficulty",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(
    chat.router, 
    prefix="/api/v1/chat", 
    tags=["Chat"],
    dependencies=[Depends(verify_api_key)] if settings.REQUIRE_AUTH else []
)
app.include_router(
    sessions.router, 
    prefix="/api/v1/sessions", 
    tags=["Sessions"],
    dependencies=[Depends(verify_api_key)] if settings.REQUIRE_AUTH else []
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "IQFieldBot API",
        "version": "1.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )