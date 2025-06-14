"""Question generation and management service"""

import json
import random
from typing import Dict, List, Optional
import openai
import structlog
from app.core.config import settings
from app.models.schemas import Question, FieldType, QuestionType

logger = structlog.get_logger()

class QuestionService:
    """Service for generating and managing questions"""
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.question_templates = self._load_question_templates()
    
    def _load_question_templates(self) -> Dict:
        """Load predefined question templates"""
        return {
            FieldType.MATH: {
                1: [
                    "What is {a} + {b}?",
                    "What is {a} × {b}?",
                    "What is {a} - {b}?"
                ],
                2: [
                    "Solve for x: {a}x + {b} = {c}",
                    "What is the square root of {a}?",
                    "What is {a}% of {b}?"
                ],
                3: [
                    "If f(x) = {a}x² + {b}x + {c}, what is f({d})?",
                    "What is the derivative of {a}x³ + {b}x²?",
                    "Solve the quadratic equation: x² + {a}x + {b} = 0"
                ]
            },
            FieldType.LOGIC: {
                1: [
                    "All cats are animals. Fluffy is a cat. Therefore, Fluffy is ___?",
                    "If A > B and B > C, then A ___ C?",
                    "What comes next in the sequence: 2, 4, 8, 16, ___?"
                ],
                2: [
                    "If some roses are flowers and all flowers are plants, what can we conclude about roses?",
                    "In a group of 100 people, 60 like coffee, 40 like tea, and 20 like both. How many like neither?",
                    "What is the missing number: 1, 1, 2, 3, 5, 8, ___?"
                ]
            }
        }
    
    async def generate_question(self, field: FieldType, difficulty: int, user_history: Optional[List[str]] = None) -> Question:
        """Generate a question based on field and difficulty"""
        try:
            # Try AI-generated question first
            if random.random() < 0.7:  # 70% chance for AI generation
                question = await self._generate_ai_question(field, difficulty, user_history)
                if question:
                    return question
            
            # Fallback to template-based generation
            return self._generate_template_question(field, difficulty)
        
        except Exception as e:
            logger.error("Error generating question", error=str(e), field=field, difficulty=difficulty)
            return self._generate_template_question(field, difficulty)
    
    async def _generate_ai_question(self, field: FieldType, difficulty: int, user_history: Optional[List[str]] = None) -> Optional[Question]:
        """Generate question using OpenAI API"""
        try:
            history_context = ""
            if user_history:
                history_context = f"Previous questions covered: {', '.join(user_history[-3:])}"
            
            prompt = f"""
            Generate a {field.value} question with difficulty level {difficulty} (1-5 scale).
            {history_context}
            
            Requirements:
            - Difficulty {difficulty}: {self._get_difficulty_description(difficulty)}
            - Field: {field.value}
            - Return JSON format with: question, type, options (if multiple choice), correct_answer, explanation, points
            - Make it engaging and educational
            - Avoid repetition of recent topics
            
            Example format:
            {{
                "question": "What is 2 + 2?",
                "type": "multiple-choice",
                "options": ["3", "4", "5", "6"],
                "correct_answer": "4",
                "explanation": "2 + 2 equals 4 through basic addition",
                "points": 2
            }}
            """
            
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert question generator for IQ tests. Generate challenging, fair, and educational questions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=settings.OPENAI_MAX_TOKENS,
                temperature=0.8
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse JSON response
            question_data = json.loads(content)
            
            return Question(
                id=f"{field.value}_{difficulty}_{random.randint(1000, 9999)}",
                field=field,
                difficulty=difficulty,
                question=question_data["question"],
                type=QuestionType(question_data["type"]),
                options=question_data.get("options"),
                correct_answer=question_data["correct_answer"],
                explanation=question_data.get("explanation"),
                points=question_data.get("points", difficulty * 2),
                time_limit=self._calculate_time_limit(difficulty)
            )
        
        except Exception as e:
            logger.warning("AI question generation failed", error=str(e))
            return None
    
    def _generate_template_question(self, field: FieldType, difficulty: int) -> Question:
        """Generate question from templates as fallback"""
        templates = self.question_templates.get(field, {})
        difficulty_templates = templates.get(min(difficulty, max(templates.keys())), templates.get(1, ["What is 1 + 1?"]))
        
        template = random.choice(difficulty_templates)
        
        # Generate random values for template
        values = {
            'a': random.randint(1, 10 * difficulty),
            'b': random.randint(1, 10 * difficulty),
            'c': random.randint(1, 10 * difficulty),
            'd': random.randint(1, 5)
        }
        
        question_text = template.format(**values)
        
        # Calculate correct answer (simplified for demo)
        correct_answer = str(self._calculate_template_answer(question_text, values))
        
        return Question(
            id=f"{field.value}_{difficulty}_{random.randint(1000, 9999)}",
            field=field,
            difficulty=difficulty,
            question=question_text,
            type=QuestionType.TEXT,
            correct_answer=correct_answer,
            explanation=f"This is a {field.value} question at difficulty level {difficulty}",
            points=difficulty * 2,
            time_limit=self._calculate_time_limit(difficulty)
        )
    
    def _get_difficulty_description(self, difficulty: int) -> str:
        """Get description for difficulty level"""
        descriptions = {
            1: "Basic level - fundamental concepts",
            2: "Intermediate level - requires some reasoning",
            3: "Advanced level - complex problem solving",
            4: "Expert level - advanced concepts and multi-step reasoning",
            5: "Master level - highly complex, creative thinking required"
        }
        return descriptions.get(difficulty, "Unknown difficulty")
    
    def _calculate_time_limit(self, difficulty: int) -> int:
        """Calculate time limit based on difficulty"""
        base_time = 30  # seconds
        return base_time + (difficulty * 15)
    
    def _calculate_template_answer(self, question: str, values: Dict) -> int:
        """Calculate answer for template questions (simplified)"""
        if "+" in question:
            return values['a'] + values['b']
        elif "×" in question or "*" in question:
            return values['a'] * values['b']
        elif "-" in question:
            return values['a'] - values['b']
        else:
            return values['a']  # Default fallback
    
    def evaluate_answer(self, question: Question, user_answer: str) -> tuple[bool, str]:
        """Evaluate user's answer"""
        try:
            # Normalize answers for comparison
            correct = question.correct_answer.strip().lower()
            user = user_answer.strip().lower()
            
            # Handle different answer types
            if question.type == QuestionType.NUMBER:
                try:
                    return abs(float(correct) - float(user)) < 0.001, question.explanation or ""
                except ValueError:
                    return False, "Please provide a numeric answer"
            
            elif question.type == QuestionType.MULTIPLE_CHOICE:
                return correct == user, question.explanation or ""
            
            else:  # TEXT
                # Allow for some flexibility in text answers
                return (correct == user or 
                       correct in user or 
                       user in correct), question.explanation or ""
        
        except Exception as e:
            logger.error("Error evaluating answer", error=str(e))
            return False, "Error evaluating answer"