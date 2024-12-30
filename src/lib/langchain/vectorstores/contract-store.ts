import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { Document } from 'langchain/document'
import { embeddings } from '../config'
import { supabase } from '../../supabase/client'

interface ContractMetadata {
  contractId: string
  title?: string
  type?: string
  createdAt: string
  updatedAt: string
}

// Initialize vector store with custom configuration
export const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: 'contract_embeddings',
  queryName: 'match_documents',
  filter: (rpc) => rpc.filter('metadata->archived', 'eq', false)
})

// Store a new contract document with metadata
export async function storeContractDocument(
  content: string,
  metadata: ContractMetadata
) {
  try {
    const document = new Document({
      pageContent: content,
      metadata
    })

    await vectorStore.addDocuments([document])

    return {
      success: true,
      documentId: metadata.contractId
    }
  } catch (error) {
    console.error('Error storing contract document:', error)
    throw new Error('Failed to store contract document')
  }
}

// Search for similar contracts with filtering options
export async function searchSimilarContracts(
  query: string,
  options: {
    limit?: number
    type?: string
    minScore?: number
    dateRange?: { start: string; end: string }
  } = {}
) {
  const { limit = 5, type, minScore = 0.7, dateRange } = options

  try {
    let filter = (rpc: any) => rpc.filter('metadata->archived', 'eq', false)

    if (type) {
      filter = (rpc: any) => 
        rpc
          .filter('metadata->archived', 'eq', false)
          .filter('metadata->type', 'eq', type)
    }

    if (dateRange) {
      filter = (rpc: any) =>
        rpc
          .filter('metadata->archived', 'eq', false)
          .filter('metadata->createdAt', 'gte', dateRange.start)
          .filter('metadata->createdAt', 'lte', dateRange.end)
    }

    const results = await vectorStore.similaritySearch(query, limit, filter)

    // Filter results by score if needed
    return results.filter((doc) => doc.metadata.score >= minScore)
  } catch (error) {
    console.error('Error searching similar contracts:', error)
    throw new Error('Failed to search similar contracts')
  }
}

// Delete a contract document
export async function deleteContractDocument(contractId: string) {
  try {
    await supabase
      .from('contract_embeddings')
      .delete()
      .match({ 'metadata->>contractId': contractId })

    return {
      success: true,
      contractId
    }
  } catch (error) {
    console.error('Error deleting contract document:', error)
    throw new Error('Failed to delete contract document')
  }
}

// Update a contract document
export async function updateContractDocument(
  contractId: string,
  content: string,
  metadata: Partial<ContractMetadata>
) {
  try {
    // First, delete the old document
    await deleteContractDocument(contractId)

    // Then store the updated document
    await storeContractDocument(content, {
      ...metadata,
      contractId,
      updatedAt: new Date().toISOString(),
    } as ContractMetadata)

    return {
      success: true,
      contractId
    }
  } catch (error) {
    console.error('Error updating contract document:', error)
    throw new Error('Failed to update contract document')
  }
}

// Archive a contract document (soft delete)
export async function archiveContractDocument(contractId: string) {
  try {
    await supabase
      .from('contract_embeddings')
      .update({ 'metadata->archived': true })
      .match({ 'metadata->>contractId': contractId })

    return {
      success: true,
      contractId
    }
  } catch (error) {
    console.error('Error archiving contract document:', error)
    throw new Error('Failed to archive contract document')
  }
} 