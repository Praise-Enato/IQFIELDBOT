"""Configuration settings for IQFieldBot"""

import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # API Configuration
    DEBUG: bool = Field(default=False, env="DEBUG")
    API_SECRET: str = Field(env="API_SECRET")
    REQUIRE_AUTH: bool = Field(default=True, env="REQUIRE_AUTH")
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = Field(env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4", env="OPENAI_MODEL")
    OPENAI_MAX_TOKENS: int = Field(default=500, env="OPENAI_MAX_TOKENS")
    
    # Database Configuration
    USE_DYNAMODB: bool = Field(default=False, env="USE_DYNAMODB")
    DYNAMODB_TABLE_NAME: str = Field(default="iqfieldbot-sessions", env="DYNAMODB_TABLE_NAME")
    DYNAMODB_REGION: str = Field(default="us-east-1", env="DYNAMODB_REGION")
    
    # Redis Configuration (for session caching)
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    REDIS_TTL: int = Field(default=3600, env="REDIS_TTL")  # 1 hour
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        env="ALLOWED_ORIGINS"
    )
    
    # Question Configuration
    DEFAULT_DIFFICULTY: int = Field(default=1, env="DEFAULT_DIFFICULTY")
    MAX_DIFFICULTY: int = Field(default=5, env="MAX_DIFFICULTY")
    QUESTIONS_PER_SESSION: int = Field(default=10, env="QUESTIONS_PER_SESSION")
    
    # Adaptive Algorithm Settings
    DIFFICULTY_THRESHOLD: float = Field(default=0.7, env="DIFFICULTY_THRESHOLD")
    DIFFICULTY_ADJUSTMENT: float = Field(default=0.5, env="DIFFICULTY_ADJUSTMENT")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()