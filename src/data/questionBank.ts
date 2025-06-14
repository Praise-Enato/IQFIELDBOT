import { Question, Field } from '../types';

export const questionBank: Record<Field, Question[]> = {
  math: [
    {
      id: 'math_1',
      field: 'math',
      difficulty: 1,
      question: 'What is 15 + 27?',
      type: 'number',
      correctAnswer: '42',
      explanation: '15 + 27 = 42',
      points: 2
    },
    {
      id: 'math_2',
      field: 'math',
      difficulty: 2,
      question: 'Solve for x: 2x + 5 = 13',
      type: 'number',
      correctAnswer: '4',
      explanation: '2x = 13 - 5 = 8, so x = 4',
      points: 4
    },
    {
      id: 'math_3',
      field: 'math',
      difficulty: 3,
      question: 'What is the derivative of x³ + 2x²?',
      type: 'text',
      correctAnswer: '3x² + 4x',
      explanation: 'Using the power rule: d/dx(x³) = 3x² and d/dx(2x²) = 4x',
      points: 6
    }
  ],
  logic: [
    {
      id: 'logic_1',
      field: 'logic',
      difficulty: 1,
      question: 'What comes next in the sequence: 2, 4, 8, 16, ?',
      type: 'number',
      correctAnswer: '32',
      explanation: 'Each number is doubled: 2×2=4, 4×2=8, 8×2=16, 16×2=32',
      points: 3
    },
    {
      id: 'logic_2',
      field: 'logic',
      difficulty: 2,
      question: 'If all roses are flowers and all flowers are plants, then all roses are:',
      type: 'multiple-choice',
      options: ['Animals', 'Plants', 'Trees', 'Vegetables'],
      correctAnswer: 'Plants',
      explanation: 'This is a syllogism: roses → flowers → plants, therefore roses → plants',
      points: 4
    }
  ],
  programming: [
    {
      id: 'prog_1',
      field: 'programming',
      difficulty: 1,
      question: 'What does the following code output? console.log(5 + "3")',
      type: 'text',
      correctAnswer: '53',
      explanation: 'JavaScript converts the number 5 to a string and concatenates it with "3"',
      points: 3
    },
    {
      id: 'prog_2',
      field: 'programming',
      difficulty: 2,
      question: 'What is the time complexity of binary search?',
      type: 'multiple-choice',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 'O(log n)',
      explanation: 'Binary search eliminates half the search space in each iteration',
      points: 5
    }
  ],
  language: [
    {
      id: 'lang_1',
      field: 'language',
      difficulty: 1,
      question: 'What is the plural of "child"?',
      type: 'text',
      correctAnswer: 'children',
      explanation: 'Child has an irregular plural form: children',
      points: 2
    },
    {
      id: 'lang_2',
      field: 'language',
      difficulty: 2,
      question: 'Which word is closest in meaning to "ubiquitous"?',
      type: 'multiple-choice',
      options: ['Rare', 'Everywhere', 'Ancient', 'Mysterious'],
      correctAnswer: 'Everywhere',
      explanation: 'Ubiquitous means present, appearing, or found everywhere',
      points: 4
    }
  ],
  'visual-patterns': [
    {
      id: 'visual_1',
      field: 'visual-patterns',
      difficulty: 1,
      question: 'How many sides does a hexagon have?',
      type: 'number',
      correctAnswer: '6',
      explanation: 'A hexagon is a polygon with six sides',
      points: 2
    },
    {
      id: 'visual_2',
      field: 'visual-patterns',
      difficulty: 2,
      question: 'If you rotate a square 90 degrees clockwise, what shape do you get?',
      type: 'multiple-choice',
      options: ['Triangle', 'Square', 'Rectangle', 'Circle'],
      correctAnswer: 'Square',
      explanation: 'A square rotated 90 degrees remains a square due to its symmetry',
      points: 3
    }
  ]
};