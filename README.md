# IQFieldBot - Personalized IQ Testing Chatbot

An AI-powered chatbot that provides personalized intelligence testing through field-specific questions with adaptive difficulty adjustment.

## Features

- **Personalized Testing**: Choose from multiple fields (math, logic, programming, language, visual patterns)
- **Adaptive Difficulty**: AI adjusts question difficulty based on your performance
- **Intelligent Question Generation**: Uses OpenAI API to create unique, engaging questions
- **Performance Analytics**: Detailed insights into strengths, weaknesses, and recommendations
- **Session Management**: Track progress across multiple testing sessions
- **Modern API**: Built with FastAPI for high performance and automatic documentation

## Quick Start

### Prerequisites

- Python 3.11+
- OpenAI API key
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iqfieldbot
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the application:
```bash
uvicorn app.main:app --reload
```

### Using Docker

```bash
docker-compose up -d
```

## API Documentation

Once running, visit:
- API Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Configuration

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `API_SECRET` | API authentication key | Required |
| `DEBUG` | Enable debug mode | `false` |
| `USE_DYNAMODB` | Use DynamoDB for storage | `false` |
| `QUESTIONS_PER_SESSION` | Questions per session | `10` |

## API Endpoints

### Session Management
- `POST /api/v1/sessions/create` - Create new session
- `GET /api/v1/sessions/{session_id}` - Get session details
- `GET /api/v1/sessions/{session_id}/analytics` - Get performance analytics

### Chat Interface
- `POST /api/v1/chat/select-field` - Select testing field
- `POST /api/v1/chat/answer` - Submit answer
- `POST /api/v1/chat/message` - Send chat message

### Health Checks
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check

## Architecture

```
app/
├── main.py              # FastAPI application
├── core/
│   ├── config.py        # Configuration settings
│   └── database.py      # Database abstraction
├── models/
│   └── schemas.py       # Pydantic models
├── services/
│   ├── question_service.py  # Question generation
│   └── session_service.py   # Session management
└── api/
    └── routes/          # API route handlers
```

## Deployment

### AWS Lambda with SAM

1. Install SAM CLI
2. Configure AWS credentials
3. Deploy:

```bash
sam build
sam deploy --guided
```

### Docker

```bash
docker build -t iqfieldbot .
docker run -p 8000:8000 --env-file .env iqfieldbot
```

## Development

### Code Quality

```bash
# Linting
ruff check app/

# Type checking  
mypy app/

# Testing
pytest
```

### Adding New Fields

1. Add field to `FieldType` enum in `schemas.py`
2. Add question templates in `question_service.py`
3. Update field-specific logic as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details