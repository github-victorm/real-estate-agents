import { z } from 'zod'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { supabase } from '../../supabase/client'
import { embeddings } from '../config'

// Define search parameters schema
const searchParamsSchema = z.object({
  query: z.string(),
  filters: z.object({
    contractType: z.string().optional(),
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
    propertyType: z.string().optional(),
    priceRange: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    jurisdiction: z.string().optional(),
  }).optional(),
  options: z.object({
    limit: z.number().default(10),
    minScore: z.number().min(0).max(1).default(0.7),
    includeMetadata: z.boolean().default(true),
  }).optional(),
})

type SearchParams = z.infer<typeof searchParamsSchema>

// Define search result schema
const searchResultSchema = z.object({
  document: z.object({
    pageContent: z.string(),
    metadata: z.record(z.any()),
  }),
  score: z.number(),
  rank: z.number(),
})

type SearchResult = z.infer<typeof searchResultSchema>

// Initialize vector store
const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: 'contract_embeddings',
  queryName: 'match_documents',
})

// Main search function
export async function searchContracts(
  params: SearchParams
): Promise<SearchResult[]> {
  try {
    // Validate search parameters
    const validatedParams = searchParamsSchema.parse(params)
    const { query, filters = {}, options = { limit: 10, minScore: 0.7, includeMetadata: true } } = validatedParams

    // Build filter function for Supabase
    const buildFilterFunction = () => {
      let filterChain = (rpc: any) => rpc.filter('metadata->archived', 'eq', false)

      if (filters.contractType) {
        filterChain = (rpc: any) => 
          filterChain(rpc).filter('metadata->type', 'eq', filters.contractType)
      }

      if (filters.dateRange?.start) {
        filterChain = (rpc: any) =>
          filterChain(rpc).filter('metadata->createdAt', 'gte', filters.dateRange!.start)
      }

      if (filters.dateRange?.end) {
        filterChain = (rpc: any) =>
          filterChain(rpc).filter('metadata->createdAt', 'lte', filters.dateRange!.end)
      }

      if (filters.propertyType) {
        filterChain = (rpc: any) =>
          filterChain(rpc).filter('metadata->propertyType', 'eq', filters.propertyType)
      }

      if (filters.jurisdiction) {
        filterChain = (rpc: any) =>
          filterChain(rpc).filter('metadata->jurisdiction', 'eq', filters.jurisdiction)
      }

      return filterChain
    }

    // Perform similarity search
    const searchResults = await vectorStore.similaritySearchWithScore(
      query,
      options.limit,
      buildFilterFunction()
    )

    // Process and rank results
    const processedResults = searchResults
      .map(([document, score], index) => ({
        document,
        score,
        rank: index + 1,
      }))
      .filter(result => result.score >= (options.minScore || 0.7))
      .sort((a, b) => b.score - a.score)

    // Validate results
    return processedResults.map(result => searchResultSchema.parse(result))
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Search operation failed: ${errorMessage}`)
  }
}

// Helper function to get search suggestions
export async function getSearchSuggestions(
  partialQuery: string,
  limit: number = 5
): Promise<string[]> {
  try {
    // Get recent similar searches from the database
    const { data: recentSearches, error } = await supabase
      .from('search_history')
      .select('query')
      .ilike('query', `%${partialQuery}%`)
      .order('frequency', { ascending: false })
      .limit(limit)

    if (error) throw error

    return recentSearches.map(search => search.query)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to get search suggestions: ${errorMessage}`)
  }
}

// Helper function to track search history
export async function trackSearchQuery(
  query: string,
  userId?: string
): Promise<void> {
  try {
    const timestamp = new Date().toISOString()

    // Update search history
    const { error } = await supabase.rpc('upsert_search_history', {
      search_query: query,
      user_id: userId,
      search_timestamp: timestamp,
    })

    if (error) throw error
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`Failed to track search query: ${errorMessage}`)
    // Don't throw error to prevent disrupting the main search flow
  }
}

// Helper function to get trending searches
export async function getTrendingSearches(
  limit: number = 5,
  timeframe: 'day' | 'week' | 'month' = 'week'
): Promise<{ query: string; frequency: number }[]> {
  try {
    const timeframes = {
      day: '1 day',
      week: '7 days',
      month: '30 days',
    }

    const { data: trendingSearches, error } = await supabase
      .from('search_history')
      .select('query, frequency')
      .gte('last_searched', `now() - interval '${timeframes[timeframe]}'`)
      .order('frequency', { ascending: false })
      .limit(limit)

    if (error) throw error

    return trendingSearches
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to get trending searches: ${errorMessage}`)
  }
} 