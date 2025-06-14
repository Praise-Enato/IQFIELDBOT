import React from 'react';
import { Trophy, Target, TrendingUp, Clock, Award, RotateCcw, Brain } from 'lucide-react';
import { UserSession, Field } from '../types';

interface PerformanceAnalyticsProps {
  session: UserSession;
  onReset: () => void;
}

const fieldNames: Record<Field, string> = {
  math: 'Mathematics',
  logic: 'Logic & Reasoning',
  programming: 'Programming',
  language: 'Language & Verbal',
  'visual-patterns': 'Visual Patterns'
};

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  session,
  onReset
}) => {
  const accuracy = session.totalQuestions > 0 ? (session.correctAnswers / session.totalQuestions) * 100 : 0;
  const timeSpent = Math.round((Date.now() - session.startTime) / 1000 / 60); // minutes
  
  const getPerformanceLevel = (accuracy: number): { level: string; color: string; description: string } => {
    if (accuracy >= 90) return { level: 'Exceptional', color: 'text-purple-600', description: 'Outstanding performance!' };
    if (accuracy >= 80) return { level: 'Excellent', color: 'text-green-600', description: 'Great job!' };
    if (accuracy >= 70) return { level: 'Good', color: 'text-blue-600', description: 'Well done!' };
    if (accuracy >= 60) return { level: 'Fair', color: 'text-yellow-600', description: 'Room for improvement' };
    return { level: 'Needs Work', color: 'text-red-600', description: 'Keep practicing!' };
  };

  const performance = getPerformanceLevel(accuracy);

  const getStrengths = (): string[] => {
    const strengths: string[] = [];
    Object.entries(session.fieldScores).forEach(([field, score]) => {
      if (score.total > 0) {
        const fieldAccuracy = (score.correct / score.total) * 100;
        if (fieldAccuracy >= 80) {
          strengths.push(fieldNames[field as Field]);
        }
      }
    });
    return strengths;
  };

  const getWeaknesses = (): string[] => {
    const weaknesses: string[] = [];
    Object.entries(session.fieldScores).forEach(([field, score]) => {
      if (score.total > 0) {
        const fieldAccuracy = (score.correct / score.total) * 100;
        if (fieldAccuracy < 60) {
          weaknesses.push(fieldNames[field as Field]);
        }
      }
    });
    return weaknesses;
  };

  const strengths = getStrengths();
  const weaknesses = getWeaknesses();

  if (session.totalQuestions === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Yet</h2>
        <p className="text-gray-600 mb-6">
          Complete some questions to see your performance analytics.
        </p>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Start Testing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Performance Analytics</h1>
            <p className="text-indigo-100">
              {session.selectedField ? `${fieldNames[session.selectedField]} Session` : 'IQ Testing Session'}
            </p>
          </div>
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-2xl font-bold text-gray-900">{session.score}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{accuracy.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Difficulty Level</p>
              <p className="text-2xl font-bold text-gray-900">{session.difficulty.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Time Spent</p>
              <p className="text-2xl font-bold text-gray-900">{timeSpent}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Award className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Overall Performance</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Performance Level</span>
                <span className={`text-sm font-bold ${performance.color}`}>
                  {performance.level}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(accuracy, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">{performance.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Questions Answered</p>
                <p className="text-lg font-bold text-gray-900">{session.totalQuestions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Correct Answers</p>
                <p className="text-lg font-bold text-green-600">{session.correctAnswers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Field Breakdown */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Field Performance</h2>
          
          <div className="space-y-3">
            {Object.entries(session.fieldScores).map(([field, score]) => {
              const fieldAccuracy = score.total > 0 ? (score.correct / score.total) * 100 : 0;
              return (
                <div key={field} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {fieldNames[field as Field]}
                    </span>
                    <span className="text-sm text-gray-600">
                      {score.correct}/{score.total} ({fieldAccuracy.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        fieldAccuracy >= 80 ? 'bg-green-500' :
                        fieldAccuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(fieldAccuracy, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {strengths.length > 0 && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <h3 className="text-lg font-bold text-green-900 mb-3">Strengths</h3>
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-center space-x-2 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {weaknesses.length > 0 && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <h3 className="text-lg font-bold text-red-900 mb-3">Areas for Improvement</h3>
            <ul className="space-y-2">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-center space-x-2 text-red-800">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h2>
        <div className="space-y-3">
          {accuracy < 60 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Focus on fundamentals:</strong> Consider reviewing basic concepts in your chosen field to build a stronger foundation.
              </p>
            </div>
          )}
          
          {accuracy >= 80 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Challenge yourself:</strong> You're performing excellently! Try exploring more advanced topics or different fields.
              </p>
            </div>
          )}
          
          {session.difficulty < 3 && accuracy > 70 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Ready for harder challenges:</strong> Your accuracy suggests you can handle more difficult questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;