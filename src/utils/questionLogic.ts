import { Question, Field } from '../types';
import { questionBank } from '../data/questionBank';

export const generateQuestion = (field: Field, difficulty: number): Question => {
  const fieldQuestions = questionBank[field] || [];
  
  // Filter questions by difficulty (±1 level tolerance)
  const suitableQuestions = fieldQuestions.filter(q => 
    Math.abs(q.difficulty - difficulty) <= 1
  );
  
  if (suitableQuestions.length === 0) {
    // Fallback to any question in the field
    const fallbackQuestions = fieldQuestions.length > 0 ? fieldQuestions : questionBank.math;
    return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
  }
  
  // Select random question from suitable ones
  const selectedQuestion = suitableQuestions[Math.floor(Math.random() * suitableQuestions.length)];
  
  // Create a new question instance with unique ID
  return {
    ...selectedQuestion,
    id: `${selectedQuestion.id}_${Date.now()}`,
    difficulty: Math.round(difficulty)
  };
};

export const evaluateAnswer = (question: Question, userAnswer: string): boolean => {
  const correctAnswer = question.correctAnswer.toLowerCase().trim();
  const userAnswerNormalized = userAnswer.toLowerCase().trim();
  
  if (question.type === 'number') {
    // For numeric answers, parse and compare as numbers
    const correctNum = parseFloat(correctAnswer);
    const userNum = parseFloat(userAnswerNormalized);
    
    if (isNaN(correctNum) || isNaN(userNum)) {
      return correctAnswer === userAnswerNormalized;
    }
    
    // Allow small floating point differences
    return Math.abs(correctNum - userNum) < 0.001;
  }
  
  if (question.type === 'multiple-choice') {
    return correctAnswer === userAnswerNormalized;
  }
  
  // For text answers, allow some flexibility
  return correctAnswer === userAnswerNormalized || 
         correctAnswer.includes(userAnswerNormalized) ||
         userAnswerNormalized.includes(correctAnswer);
};

export const calculateDifficulty = (
  correctAnswers: number, 
  totalQuestions: number, 
  currentDifficulty: number
): number => {
  if (totalQuestions === 0) return currentDifficulty;
  
  const accuracy = correctAnswers / totalQuestions;
  const difficultyThreshold = 0.7;
  const adjustmentRate = 0.3;
  
  let newDifficulty = currentDifficulty;
  
  if (accuracy > difficultyThreshold) {
    // User is doing well, increase difficulty
    newDifficulty = Math.min(5, currentDifficulty + adjustmentRate);
  } else if (accuracy < (difficultyThreshold - 0.2)) {
    // User is struggling, decrease difficulty
    newDifficulty = Math.max(1, currentDifficulty - adjustmentRate);
  }
  
  // Round to one decimal place
  return Math.round(newDifficulty * 10) / 10;
};