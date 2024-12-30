import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { z } from 'zod'
import { supabase } from '../../supabase/client'

// Define feedback schema
const feedbackSchema = z.object({
  contractId: z.string(),
  rating: z.number().min(1).max(5),
  aspects: z.object({
    clarity: z.number().min(1).max(5),
    completeness: z.number().min(1).max(5),
    accuracy: z.number().min(1).max(5),
    legalCompliance: z.number().min(1).max(5),
  }),
  comments: z.string(),
  suggestedImprovements: z.array(z.string()),
  timestamp: z.string(),
})

type FeedbackData = z.infer<typeof feedbackSchema>

// Create feedback analysis prompt
const feedbackAnalysisPrompt = new PromptTemplate({
  template: `You are a contract feedback analyst. Analyze the following feedback on a contract:

FEEDBACK:
Rating: {rating}/5
Comments: {comments}
Aspects:
- Clarity: {aspects.clarity}/5
- Completeness: {aspects.completeness}/5
- Accuracy: {aspects.accuracy}/5
- Legal Compliance: {aspects.legalCompliance}/5

Analyze this feedback and provide:
1. Key improvement areas
2. Specific suggestions for enhancement
3. Priority level for each suggestion

Provide the analysis in the following JSON structure:
{formatInstructions}

Be specific and actionable in your suggestions.`,
  inputVariables: ['rating', 'comments', 'aspects.clarity', 'aspects.completeness', 'aspects.accuracy', 'aspects.legalCompliance', 'formatInstructions'],
})

// Define analysis output schema
const analysisSchema = z.object({
  improvementAreas: z.array(z.object({
    area: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    impact: z.string(),
  })),
  suggestions: z.array(z.object({
    description: z.string(),
    implementation: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
  })),
  overallAssessment: z.string(),
})

type FeedbackAnalysis = z.infer<typeof analysisSchema>

// Initialize the model
const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.3,
})

// Create the feedback processing chain
export const createFeedbackChain = () => {
  const chain = RunnableSequence.from([
    // Step 1: Prepare feedback for analysis
    async (input: FeedbackData) => {
      return {
        rating: input.rating,
        comments: input.comments,
        'aspects.clarity': input.aspects.clarity,
        'aspects.completeness': input.aspects.completeness,
        'aspects.accuracy': input.aspects.accuracy,
        'aspects.legalCompliance': input.aspects.legalCompliance,
        formatInstructions: JSON.stringify(analysisSchema.shape, null, 2),
      }
    },

    // Step 2: Analyze feedback
    feedbackAnalysisPrompt,
    model,
    new JsonOutputParser<FeedbackAnalysis>(),

    // Step 3: Validate analysis
    async (output: FeedbackAnalysis) => {
      try {
        return analysisSchema.parse(output)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        throw new Error(`Analysis validation failed: ${errorMessage}`)
      }
    }
  ])

  return chain
}

// Main function to process feedback
export async function processFeedback(feedback: FeedbackData): Promise<{
  feedback: FeedbackData;
  analysis: FeedbackAnalysis;
}> {
  try {
    // Validate feedback
    const validatedFeedback = feedbackSchema.parse(feedback)

    // Store feedback in database
    const { error: dbError } = await supabase
      .from('feedback')
      .insert([{
        contract_id: validatedFeedback.contractId,
        rating: validatedFeedback.rating,
        aspects: validatedFeedback.aspects,
        comments: validatedFeedback.comments,
        suggested_improvements: validatedFeedback.suggestedImprovements,
        timestamp: validatedFeedback.timestamp,
      }])

    if (dbError) throw new Error(`Failed to store feedback: ${dbError.message}`)

    // Analyze feedback
    const chain = createFeedbackChain()
    const analysis = await chain.invoke(validatedFeedback)

    return {
      feedback: validatedFeedback,
      analysis,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to process feedback: ${errorMessage}`)
  }
} 