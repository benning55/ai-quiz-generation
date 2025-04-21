export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

export const API_ENDPOINTS = {
  GENERATE_QUIZ: `${API_URL}/api/generate-quiz-from-flashcards/`,
  IMPORT_FLASHCARDS: `${API_URL}/api/import-flashcards-json/`,
  USERS: `${API_URL}/api/users/`,
  CHECKOUT: `${API_URL}/api/create-checkout-session/`,
}; 