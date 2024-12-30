import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { z } from 'zod'
import { searchSimilarContracts } from '../vectorstores/contract-store'

// Define clause schema
const clauseSchema = z.object({
  type: z.enum([
    'purchase_price',
    'closing_date',
    'contingencies',
    'representations',
    'warranties',
    'termination',
    'governing_law',
    'other'
  ]),
  content: z.string(),
  isRequired: z.boolean(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  suggestions: z.array(z.string()).optional(),
})

type ClauseData = z.infer<typeof clauseSchema>

// Define analysis result schema
const analysisResultSchema = z.object({
  clauses: z.array(clauseSchema),
  missingRequiredClauses: z.array(z.string()),
  riskAssessment: z.object({
    overallRisk: z.enum(['low', 'medium', 'high']),
    riskFactors: z.array(z.string()),
  }),
  comparisonResults: z.array(z.object({
    clauseType: z.string(),
    differences: z.array(z.string()),
    recommendations: z.array(z.string()),
  })),
  validationResults: z.array(z.object({
    rule: z.string(),
    passed: z.boolean(),
    details: z.string(),
  })),
})

type AnalysisResult = z.infer<typeof analysisResultSchema>

// Create clause extraction prompt
const clauseExtractionPrompt = new PromptTemplate({
  template: `You are a legal contract analyzer. Extract and analyze clauses from the following contract text:

CONTRACT TEXT:
{text}

JURISDICTION:
{jurisdiction}

Extract all clauses and analyze them following these rules:
1. Identify clause type and content
2. Determine if each clause is legally required
3. Assess risk level for each clause
4. Provide improvement suggestions if needed

Provide the analysis in the following JSON structure:
{formatInstructions}

Be thorough and precise in your analysis.`,
  inputVariables: ['text', 'jurisdiction', 'formatInstructions'],
})

// Initialize the model
const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.1,
})

// Create the analysis chain
const createAnalysisChain = () => {
  return RunnableSequence.from([
    // Step 1: Extract clauses
    async (input: { text: string; jurisdiction: string }) => {
      return {
        text: input.text,
        jurisdiction: input.jurisdiction,
        formatInstructions: JSON.stringify(analysisResultSchema.shape, null, 2),
      }
    },

    // Step 2: Process with prompt
    clauseExtractionPrompt,
    model,
    new JsonOutputParser<AnalysisResult>(),

    // Step 3: Validate results
    async (output: AnalysisResult) => {
      try {
        return analysisResultSchema.parse(output)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        throw new Error(`Analysis validation failed: ${errorMessage}`)
      }
    }
  ])
}

// Main analysis function
export async function analyzeContract(
  contractText: string,
  jurisdiction: string,
  options: {
    compareWithSimilar?: boolean;
    validateRules?: boolean;
  } = {}
): Promise<AnalysisResult> {
  try {
    const chain = createAnalysisChain()
    const baseAnalysis = await chain.invoke({ text: contractText, jurisdiction })

    // If comparison requested, find and compare with similar contracts
    if (options.compareWithSimilar) {
      const similarContracts = await searchSimilarContracts(contractText, {
        limit: 3,
        minScore: 0.8,
      })

      // Add comparison results to analysis
      if (similarContracts.length > 0) {
        const comparisonResults = await compareWithSimilarContracts(
          baseAnalysis.clauses,
          similarContracts
        )
        baseAnalysis.comparisonResults = comparisonResults
      }
    }

    // If validation requested, run validation rules
    if (options.validateRules) {
      const validationResults = await validateContractRules(
        baseAnalysis.clauses,
        jurisdiction
      )
      baseAnalysis.validationResults = validationResults
    }

    return baseAnalysis
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Contract analysis failed: ${errorMessage}`)
  }
}

// Helper function to compare clauses with similar contracts
async function compareWithSimilarContracts(
  currentClauses: ClauseData[],
  similarContracts: any[]
): Promise<AnalysisResult['comparisonResults']> {
  const comparisonPrompt = new PromptTemplate({
    template: `Compare the following contract clauses with similar contracts and identify key differences:

CURRENT CLAUSES:
{currentClauses}

SIMILAR CONTRACTS:
{similarContracts}

Provide specific differences and recommendations for each clause type.
Focus on material differences that could impact the contract's effectiveness.

Format your response as a JSON array of comparison results.`,
    inputVariables: ['currentClauses', 'similarContracts'],
  })

  const chain = RunnableSequence.from([
    comparisonPrompt,
    model,
    new JsonOutputParser(),
  ])

  const result = await chain.invoke({
    currentClauses: JSON.stringify(currentClauses, null, 2),
    similarContracts: similarContracts.map(doc => doc.pageContent).join('\n\n'),
  })

  return result
}

// Helper function to validate contract rules
async function validateContractRules(
  clauses: ClauseData[],
  jurisdiction: string
): Promise<AnalysisResult['validationResults']> {
  // Define validation rules based on jurisdiction
  const validationRules = [
    {
      name: 'required_clauses',
      check: (clauses: ClauseData[]) => {
        const requiredTypes = ['purchase_price', 'closing_date', 'contingencies']
        const missingRequired = requiredTypes.filter(
          type => !clauses.some(clause => clause.type === type)
        )
        return {
          passed: missingRequired.length === 0,
          details: missingRequired.length > 0
            ? `Missing required clauses: ${missingRequired.join(', ')}`
            : 'All required clauses present',
        }
      },
    },
    {
      name: 'high_risk_review',
      check: (clauses: ClauseData[]) => {
        const highRiskClauses = clauses.filter(clause => clause.riskLevel === 'high')
        return {
          passed: highRiskClauses.length === 0,
          details: highRiskClauses.length > 0
            ? `Found ${highRiskClauses.length} high-risk clauses that need review`
            : 'No high-risk clauses found',
        }
      },
    },
  ]

  // Run validation rules
  return validationRules.map(rule => ({
    rule: rule.name,
    ...rule.check(clauses),
  }))
} 