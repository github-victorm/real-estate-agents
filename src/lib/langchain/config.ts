import { OpenAI } from '@langchain/openai'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { OpenAIEmbeddings } from '@langchain/openai'
import { supabase } from '../supabase/client'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key')
}

// Initialize OpenAI
export const openai = new OpenAI({
  modelName: 'gpt-4-1106-preview',
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
})

// Initialize embeddings
export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
})

// Initialize vector store
export const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: 'contract_embeddings',
  queryName: 'match_documents',
})

// Helper function to generate embeddings for a contract
export async function generateContractEmbeddings(
  contractId: string,
  content: string
) {
  const embeddingVector = await embeddings.embedQuery(content)
  
  const { data, error } = await supabase
    .from('contract_embeddings')
    .insert([
      {
        contract_id: contractId,
        content,
        embedding: embeddingVector,
      },
    ])
    .select()
  
  if (error) throw error
  return data[0]
}

// Helper function to find similar contracts
export async function findSimilarContracts(query: string, limit = 5) {
  const queryEmbedding = await embeddings.embedQuery(query)
  const results = await vectorStore.similaritySearchVectorWithScore(queryEmbedding, limit)
  return results.map(([doc, score]: [any, number]) => ({ document: doc, score }))
} 