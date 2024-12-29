import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for type-safe database operations
export async function getContract(id: string) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getContractEmbeddings(contractId: string) {
  const { data, error } = await supabase
    .from('contract_embeddings')
    .select('*')
    .eq('contract_id', contractId)
  
  if (error) throw error
  return data
}

export async function saveFeedback(feedback: {
  contract_id: string
  rating: string
  comment: string
  improvements?: string
}) {
  const { data, error } = await supabase
    .from('feedback')
    .insert([feedback])
    .select()
  
  if (error) throw error
  return data[0]
}
