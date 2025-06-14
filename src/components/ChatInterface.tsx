import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ChatMessage, Question } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onAnswerSubmit: (answer: string) => void;
  currentQuestion: Question | null;
  isLoading: boolean;
  onReset: () => void;
  sessionComplete: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onAnswerSubmit,
  currentQuestion,
  isLoading,
  onReset,
  sessionComplete
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentQuestion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && currentQuestion) {
      onAnswerSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  const handleOptionSelect = (option: string) => {
    onAnswerSubmit(option);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">IQ Testing Session</h2>
            <p className="text-sm text-gray-600">
              {currentQuestion ? 'Answer the current question' : 'Waiting for next question...'}
            </p>
          </div>
          {sessionComplete && (
            <button
              onClick={onReset}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-indigo-600 text-white'
                  : message.type === 'question'
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'bot' && message.isCorrect !== undefined && (
                <div className="flex items-center space-x-2 mb-2">
                  {message.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-semibold ${
                    message.isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {message.isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
              )}
              
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {message.question && message.question.options && (
                <div className="mt-3 space-y-2">
                  {message.question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className="block w-full text-left px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-colors text-gray-900"
                      disabled={!currentQuestion || currentQuestion.id !== message.question?.id}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>
              )}
              
              {message.question && message.question.timeLimit && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>Time limit: {message.question.timeLimit}s</span>
                </div>
              )}
              
              <div className="mt-2 text-xs opacity-70">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-sm text-gray-600">Generating question...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {currentQuestion && !sessionComplete && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {currentQuestion.type === 'multiple-choice' ? (
            <div className="text-center text-sm text-gray-600">
              Select an option above to answer
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                ref={inputRef}
                type={currentQuestion.type === 'number' ? 'number' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  currentQuestion.type === 'number' 
                    ? 'Enter your numeric answer...' 
                    : 'Type your answer...'
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;