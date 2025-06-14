"""Database abstraction layer"""

import json
from abc import ABC, abstractmethod
from typing import Dict, Optional
import structlog
from app.core.config import settings

logger = structlog.get_logger()

class DatabaseInterface(ABC):
    """Abstract database interface"""
    
    @abstractmethod
    async def get_session(self, session_id: str) -> Optional[Dict]:
        pass
    
    @abstractmethod
    async def save_session(self, session_id: str, session_data: Dict) -> bool:
        pass
    
    @abstractmethod
    async def delete_session(self, session_id: str) -> bool:
        pass

class InMemoryDatabase(DatabaseInterface):
    """In-memory database for development/testing"""
    
    def __init__(self):
        self.sessions: Dict[str, Dict] = {}
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        return self.sessions.get(session_id)
    
    async def save_session(self, session_id: str, session_data: Dict) -> bool:
        self.sessions[session_id] = session_data
        return True
    
    async def delete_session(self, session_id: str) -> bool:
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

class DynamoDBDatabase(DatabaseInterface):
    """DynamoDB database implementation"""
    
    def __init__(self):
        import boto3
        self.dynamodb = boto3.resource('dynamodb', region_name=settings.DYNAMODB_REGION)
        self.table = self.dynamodb.Table(settings.DYNAMODB_TABLE_NAME)
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        try:
            response = self.table.get_item(Key={'session_id': session_id})
            if 'Item' in response:
                return response['Item']['session_data']
            return None
        except Exception as e:
            logger.error("DynamoDB get error", error=str(e), session_id=session_id)
            return None
    
    async def save_session(self, session_id: str, session_data: Dict) -> bool:
        try:
            self.table.put_item(
                Item={
                    'session_id': session_id,
                    'session_data': session_data,
                    'ttl': int((datetime.now() + timedelta(hours=24)).timestamp())
                }
            )
            return True
        except Exception as e:
            logger.error("DynamoDB save error", error=str(e), session_id=session_id)
            return False
    
    async def delete_session(self, session_id: str) -> bool:
        try:
            self.table.delete_item(Key={'session_id': session_id})
            return True
        except Exception as e:
            logger.error("DynamoDB delete error", error=str(e), session_id=session_id)
            return False

class RedisDatabase(DatabaseInterface):
    """Redis database implementation for session caching"""
    
    def __init__(self):
        import redis.asyncio as redis
        self.redis = redis.from_url(settings.REDIS_URL)
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        try:
            data = await self.redis.get(f"session:{session_id}")
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error("Redis get error", error=str(e), session_id=session_id)
            return None
    
    async def save_session(self, session_id: str, session_data: Dict) -> bool:
        try:
            await self.redis.setex(
                f"session:{session_id}",
                settings.REDIS_TTL,
                json.dumps(session_data)
            )
            return True
        except Exception as e:
            logger.error("Redis save error", error=str(e), session_id=session_id)
            return False
    
    async def delete_session(self, session_id: str) -> bool:
        try:
            await self.redis.delete(f"session:{session_id}")
            return True
        except Exception as e:
            logger.error("Redis delete error", error=str(e), session_id=session_id)
            return False

# Database instance
_database: Optional[DatabaseInterface] = None

def get_database() -> DatabaseInterface:
    """Get database instance"""
    global _database
    if _database is None:
        raise RuntimeError("Database not initialized")
    return _database

async def init_database():
    """Initialize database connection"""
    global _database
    
    if settings.USE_DYNAMODB:
        _database = DynamoDBDatabase()
        logger.info("Initialized DynamoDB connection")
    else:
        _database = InMemoryDatabase()
        logger.info("Initialized in-memory database")
    
    # TODO: Add Redis caching layer if needed