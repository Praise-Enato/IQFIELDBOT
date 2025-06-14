// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_SECRET = import.meta.env.VITE_API_SECRET;

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_SECRET && { 'Authorization': `Bearer ${API_SECRET}` })
  }
};

export const endpoints = {
  health: '/health',
  sessions: {
    create: '/api/v1/sessions/create',
    get: (id: string) => `/api/v1/sessions/${id}`,
    analytics: (id: string) => `/api/v1/sessions/${id}/analytics`,
    delete: (id: string) => `/api/v1/sessions/${id}`
  },
  chat: {
    message: '/api/v1/chat/message',
    selectField: '/api/v1/chat/select-field',
    answer: '/api/v1/chat/answer'
  }
};