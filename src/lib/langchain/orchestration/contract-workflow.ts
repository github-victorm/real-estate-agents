import { z } from 'zod'
import { RunnableSequence } from '@langchain/core/runnables'
import { Document } from '@langchain/core/documents'
import { generateContract } from '../chains/contract-generation'
import { processContractDocument } from '../chains/document-processing'
import { processFeedback } from '../chains/feedback-processing'
import { analyzeContract } from '../tools/contract-analysis'
import { searchContracts } from '../tools/similarity-search'

// Define workflow options type
interface WorkflowOptions {
  includeSimilarContracts: boolean;
  validateResults: boolean;
  maxRetries: number;
}

const DEFAULT_OPTIONS: WorkflowOptions = {
  includeSimilarContracts: true,
  validateResults: true,
  maxRetries: 3,
}

// Define workflow input schema
const workflowInputSchema = z.object({
  action: z.enum(['generate', 'process', 'analyze']),
  data: z.object({
    contractInput: z.any().optional(),
    documentFile: z.any().optional(),
    analysisParams: z.any().optional(),
  }),
  options: z.object({
    includeSimilarContracts: z.boolean().default(true),
    validateResults: z.boolean().default(true),
    maxRetries: z.number().default(3),
  }).optional(),
})

type WorkflowInput = z.infer<typeof workflowInputSchema>

// Define workflow state
interface WorkflowState {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  currentStep: string
  results: any
  error?: string
  startTime: Date
  endTime?: Date
}

// Create the workflow orchestrator
export class ContractWorkflowOrchestrator {
  private state: WorkflowState
  private retryCount: number = 0

  constructor() {
    this.state = {
      status: 'pending',
      currentStep: 'initialization',
      results: {},
      startTime: new Date(),
    }
  }

  // Main workflow execution
  async execute(input: WorkflowInput): Promise<WorkflowState> {
    try {
      // Validate input and merge with default options
      const validatedInput = workflowInputSchema.parse(input)
      const { action, data, options: inputOptions } = validatedInput
      const options: WorkflowOptions = { ...DEFAULT_OPTIONS, ...inputOptions }

      this.updateState('processing', action)

      // Execute appropriate workflow based on action
      switch (action) {
        case 'generate':
          await this.executeGenerationWorkflow(data.contractInput, options)
          break
        case 'process':
          await this.executeProcessingWorkflow(data.documentFile, options)
          break
        case 'analyze':
          await this.executeAnalysisWorkflow(data.analysisParams, options)
          break
        default:
          throw new Error(`Unsupported action: ${action}`)
      }

      this.completeWorkflow()
      return this.state

    } catch (error: unknown) {
      const options = workflowInputSchema.parse(input).options
      return await this.handleError(error, input, options?.maxRetries ?? DEFAULT_OPTIONS.maxRetries)
    }
  }

  // Generation workflow
  private async executeGenerationWorkflow(
    input: any,
    options: WorkflowOptions
  ) {
    this.updateState('processing', 'contract_generation')

    // Step 1: Find similar contracts if requested
    const similarContracts: Array<{ pageContent: string; metadata: Record<string, any> }> = []
    if (options.includeSimilarContracts) {
      const searchResults = await searchContracts({
        query: `${input.propertyDetails.propertyType} ${input.propertyDetails.address}`,
        options: { 
          limit: 3,
          minScore: 0.7,
          includeMetadata: true,
        }
      })
      similarContracts.push(...searchResults.map(result => result.document))
    }

    // Step 2: Generate contract
    const contract = await generateContract({
      ...input,
      similarContracts,
    })

    // Step 3: Analyze generated contract if validation is requested
    if (options.validateResults) {
      this.updateState('processing', 'contract_validation')
      const analysis = await analyzeContract(
        contract.sections.map(s => s.content).join('\n'),
        input.jurisdiction,
        { validateRules: true }
      )
      this.state.results.analysis = analysis
    }

    this.state.results.contract = contract
  }

  // Processing workflow
  private async executeProcessingWorkflow(
    file: File,
    options: WorkflowOptions
  ) {
    this.updateState('processing', 'document_processing')

    // Step 1: Process document
    const { metadata, chunks } = await processContractDocument(file)

    // Step 2: Analyze processed document if validation is requested
    if (options.validateResults) {
      this.updateState('processing', 'document_validation')
      const analysis = await analyzeContract(
        chunks[0].pageContent,
        metadata.type || 'unknown',
        { validateRules: true }
      )
      this.state.results.analysis = analysis
    }

    this.state.results.metadata = metadata
    this.state.results.chunks = chunks
  }

  // Analysis workflow
  private async executeAnalysisWorkflow(
    params: any,
    options: WorkflowOptions
  ) {
    this.updateState('processing', 'contract_analysis')

    // Step 1: Analyze contract
    const analysis = await analyzeContract(
      params.contractText,
      params.jurisdiction,
      {
        compareWithSimilar: options.includeSimilarContracts,
        validateRules: options.validateResults,
      }
    )

    this.state.results.analysis = analysis
  }

  // Error handling with retry logic
  private async handleError(
    error: unknown,
    input: WorkflowInput,
    maxRetries: number
  ): Promise<WorkflowState> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    // Check if we should retry
    if (this.retryCount < maxRetries) {
      this.retryCount++
      console.log(`Retrying workflow (${this.retryCount}/${maxRetries})...`)
      return this.execute(input)
    }

    // If max retries reached, update state and return
    this.state.status = 'failed'
    this.state.error = `Workflow failed after ${maxRetries} attempts: ${errorMessage}`
    this.state.endTime = new Date()
    return this.state
  }

  // Helper to update workflow state
  private updateState(status: WorkflowState['status'], step: string) {
    this.state.status = status
    this.state.currentStep = step
  }

  // Helper to complete workflow
  private completeWorkflow() {
    this.state.status = 'completed'
    this.state.endTime = new Date()
  }
}

// Helper function to create and execute a workflow
export async function executeContractWorkflow(
  input: WorkflowInput
): Promise<WorkflowState> {
  const orchestrator = new ContractWorkflowOrchestrator()
  return orchestrator.execute(input)
} 