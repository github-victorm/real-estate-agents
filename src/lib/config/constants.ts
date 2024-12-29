// OpenAI Model Constants
export const MODEL_NAME = 'gpt-4o'
export const MODEL_TEMPERATURE = 0.7

// Database Table Names
export const DB_TABLES = {
  CONTRACTS: 'contracts',
  CONTRACT_EMBEDDINGS: 'contract_embeddings',
  FEEDBACK: 'feedback',
} as const

// Vector Search Constants
export const VECTOR_SEARCH = {
  DEFAULT_LIMIT: 5,
  SIMILARITY_THRESHOLD: 0.8,
  QUERY_NAME: 'match_documents',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  MISSING_OPENAI_KEY: 'Missing OpenAI API Key',
  MISSING_SUPABASE_CONFIG: 'Missing Supabase environment variables',
} as const

// Contract Generation Constants
export const CONTRACT_DEFAULTS = {
  MAX_TOKENS: 4000,
  MIN_TOKENS: 1000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // milliseconds
} as const

// Feedback Rating Options
export const FEEDBACK_RATINGS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
} as const
