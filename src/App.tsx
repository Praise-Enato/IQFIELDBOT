import React, { useState, useEffect, useRef } from 'react';
import { Brain, MessageCircle, Trophy, Target, BarChart3, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import FieldSelection from './components/FieldSelection';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import { Question, Field, UserSession, ChatMessage } from './types';
import { questionBank } from './data/questionBank';
import { generateQuestion, evaluateAnswer, calculateDifficulty } from './utils/questionLogic';

function App() {
  const [session, setSession] = useState<UserSession>({
    id: Date.now().toString(),
    selectedField: null,
    currentQuestion: null,
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    difficulty: 1,
    fieldScores: {},
    startTime: Date.now(),
    isComplete: false
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm IQFieldBot, your personalized intelligence testing assistant. I'll adapt questions to your preferred field and adjust difficulty based on your performance. Ready to begin?",
      timestamp: Date.now()
    }
  ]);

  const [currentView, setCurrentView] = useState<'chat' | 'analytics'>('chat');
  const [isLoading, setIsLoading] = useState(false);

  const handleFieldSelection = (field: Field) => {
    setSession(prev => ({
      ...prev,
      selectedField: field,
      fieldScores: { ...prev.fieldScores, [field]: { correct: 0, total: 0 } }
    }));

    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: `Excellent choice! I'll now present you with ${field} challenges. Let's start with your first question.`,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, welcomeMessage]);
    
    // Generate first question
    setTimeout(() => {
      generateNextQuestion(field, 1);
    }, 1000);
  };

  const generateNextQuestion = (field: Field, difficulty: number) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const question = generateQuestion(field, difficulty);
      setSession(prev => ({
        ...prev,
        currentQuestion: question,
        difficulty
      }));

      const questionMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'question',
        content: question.question,
        question: question,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, questionMessage]);
      setIsLoading(false);
    }, 500);
  };

  const handleAnswerSubmit = (answer: string) => {
    if (!session.currentQuestion || !session.selectedField) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: answer,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);

    const isCorrect = evaluateAnswer(session.currentQuestion, answer);
    const newScore = session.score + (isCorrect ? session.currentQuestion.points : 0);
    const newCorrectAnswers = session.correctAnswers + (isCorrect ? 1 : 0);
    const newTotalQuestions = session.totalQuestions + 1;

    // Update field scores
    const fieldScores = { ...session.fieldScores };
    if (fieldScores[session.selectedField]) {
      fieldScores[session.selectedField].total++;
      if (isCorrect) {
        fieldScores[session.selectedField].correct++;
      }
    }

    // Calculate new difficulty
    const newDifficulty = calculateDifficulty(newCorrectAnswers, newTotalQuestions, session.difficulty);

    setSession(prev => ({
      ...prev,
      score: newScore,
      correctAnswers: newCorrectAnswers,
      totalQuestions: newTotalQuestions,
      fieldScores,
      difficulty: newDifficulty,
      currentQuestion: null
    }));

    // Show feedback
    const feedbackMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: isCorrect 
        ? `Correct! ${session.currentQuestion.explanation || 'Well done!'} (+${session.currentQuestion.points} points)`
        : `Incorrect. ${session.currentQuestion.explanation || `The correct answer was: ${session.currentQuestion.correctAnswer}`}`,
      isCorrect,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, feedbackMessage]);

    // Generate next question or end session
    if (newTotalQuestions >= 10) {
      setTimeout(() => {
        const endMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'bot',
          content: `Session complete! You've answered ${newCorrectAnswers}/${newTotalQuestions} questions correctly with a total score of ${newScore} points. View your detailed analytics below.`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, endMessage]);
        setSession(prev => ({ ...prev, isComplete: true }));
      }, 1500);
    } else {
      setTimeout(() => {
        generateNextQuestion(session.selectedField, newDifficulty);
      }, 2000);
    }
  };

  const resetSession = () => {
    setSession({
      id: Date.now().toString(),
      selectedField: null,
      currentQuestion: null,
      score: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      difficulty: 1,
      fieldScores: {},
      startTime: Date.now(),
      isComplete: false
    });
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: "Welcome back! Ready for another personalized IQ challenge? Let's test your skills again.",
        timestamp: Date.now()
      }
    ]);
    setCurrentView('chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IQFieldBot</h1>
                <p className="text-sm text-gray-600">Personalized Intelligence Testing</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {session.selectedField && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{session.score}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>{session.correctAnswers}/{session.totalQuestions}</span>
                  </div>
                </div>
              )}
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('chat')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    currentView === 'chat'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Chat
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    currentView === 'analytics'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {currentView === 'chat' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Field Selection Sidebar */}
            <div className="lg:col-span-1">
              <FieldSelection
                selectedField={session.selectedField}
                onFieldSelect={handleFieldSelection}
                fieldScores={session.fieldScores}
                disabled={!!session.currentQuestion}
              />
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <ChatInterface
                messages={messages}
                onAnswerSubmit={handleAnswerSubmit}
                currentQuestion={session.currentQuestion}
                isLoading={isLoading}
                onReset={resetSession}
                sessionComplete={session.isComplete}
              />
            </div>
          </div>
        ) : (
          <PerformanceAnalytics
            session={session}
            onReset={resetSession}
          />
        )}
      </main>
    </div>
  );
}

export default App;