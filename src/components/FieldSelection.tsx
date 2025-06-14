import React from 'react';
import { Calculator, Brain, Code, Languages, Eye, CheckCircle } from 'lucide-react';
import { Field, FieldScore } from '../types';

interface FieldSelectionProps {
  selectedField: Field | null;
  onFieldSelect: (field: Field) => void;
  fieldScores: Record<Field, FieldScore>;
  disabled?: boolean;
}

const fieldConfig = {
  math: {
    icon: Calculator,
    title: 'Mathematics',
    description: 'Algebra, geometry, calculus, and number theory',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  logic: {
    icon: Brain,
    title: 'Logic & Reasoning',
    description: 'Pattern recognition, deductive reasoning, puzzles',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  programming: {
    icon: Code,
    title: 'Programming',
    description: 'Algorithms, data structures, coding challenges',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  language: {
    icon: Languages,
    title: 'Language & Verbal',
    description: 'Vocabulary, comprehension, linguistic patterns',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  'visual-patterns': {
    icon: Eye,
    title: 'Visual Patterns',
    description: 'Spatial reasoning, visual sequences, geometry',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  }
};

const FieldSelection: React.FC<FieldSelectionProps> = ({
  selectedField,
  onFieldSelect,
  fieldScores,
  disabled = false
}) => {
  const getAccuracy = (field: Field): number => {
    const score = fieldScores[field];
    return score && score.total > 0 ? (score.correct / score.total) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Select Your Field</h2>
        <p className="text-sm text-gray-600">
          Choose the area you'd like to be tested on. Questions will adapt to your performance.
        </p>
      </div>

      <div className="space-y-3">
        {(Object.keys(fieldConfig) as Field[]).map((field) => {
          const config = fieldConfig[field];
          const Icon = config.icon;
          const isSelected = selectedField === field;
          const accuracy = getAccuracy(field);
          const hasScore = fieldScores[field]?.total > 0;

          return (
            <button
              key={field}
              onClick={() => !disabled && onFieldSelect(field)}
              disabled={disabled}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? `${config.borderColor} ${config.bgColor} ring-2 ring-opacity-20`
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${config.color} flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {config.title}
                    </h3>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                    {config.description}
                  </p>
                  
                  {hasScore && (
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {fieldScores[field].correct}/{fieldScores[field].total} correct
                      </div>
                      <div className={`text-xs font-medium ${
                        accuracy >= 70 ? 'text-green-600' : 
                        accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {accuracy.toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedField && (
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">
              Field Selected: {fieldConfig[selectedField].title}
            </span>
          </div>
          <p className="text-xs text-indigo-700">
            Questions will be tailored to this field and adapt based on your performance.
          </p>
        </div>
      )}
    </div>
  );
};

export default FieldSelection;