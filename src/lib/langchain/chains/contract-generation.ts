import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { z } from 'zod'
import { searchSimilarContracts } from '../vectorstores/contract-store'
import { embeddings } from '../config'

// Define the contract schema for structured output
const contractSchema = z.object({
  title: z.string(),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    isRequired: z.boolean(),
  })),
  metadata: z.object({
    type: z.string(),
    jurisdiction: z.string(),
    lastUpdated: z.string(),
    version: z.string(),
  }),
  summary: z.string(),
  warnings: z.array(z.string()).optional(),
})

// Create type from schema
type ContractOutput = z.infer<typeof contractSchema>

// Define input types
interface ContractInput {
  propertyDetails: {
    address: string
    price: string
    propertyType: string
    bedrooms?: number
    bathrooms?: number
    squareFeet?: number
    yearBuilt?: number
    lotSize?: string
  }
  buyerInfo: {
    name: string
    email: string
    phone?: string
    currentAddress?: string
  }
  offerTerms: {
    offerPrice: string
    earnestMoney: string
    closingDate: string
    contingencies: string[]
    additionalTerms?: string[]
  }
  jurisdiction: string
}

// Create the base prompt template
const contractPromptTemplate = new PromptTemplate({
  template: `You are an expert real estate contract generator.
Generate a detailed and legally compliant real estate contract based on the following information:

PROPERTY DETAILS:
{propertyDetails}

BUYER INFORMATION:
{buyerInfo}

OFFER TERMS:
{offerTerms}

JURISDICTION:
{jurisdiction}

SIMILAR CONTRACTS FOR REFERENCE:
{similarContracts}

Requirements:
1. Follow all legal requirements for {jurisdiction}
2. Include all standard clauses and disclosures
3. Structure the contract in clear sections
4. Include all necessary contingencies
5. Add any relevant warnings or special considerations

Generate a contract that follows this exact JSON structure:
{formatInstructions}

The contract must be professional, clear, and legally sound.`,
  inputVariables: ['propertyDetails', 'buyerInfo', 'offerTerms', 'jurisdiction', 'similarContracts', 'formatInstructions'],
})

// Initialize the model with specific parameters
const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.2, // Lower temperature for more consistent output
  maxTokens: 4000, // Adjust based on contract length needs
})

// Create the contract generation chain
export const createContractChain = () => {
  // Create the chain
  const chain = RunnableSequence.from([
    // Step 1: Prepare input and fetch similar contracts
    async (input: ContractInput) => {
      // Convert input to searchable string for similarity search
      const searchQuery = `${input.propertyDetails.propertyType} property at ${input.propertyDetails.address} for ${input.propertyDetails.price}`
      
      // Get similar contracts
      const similarContracts = await searchSimilarContracts(searchQuery, {
        limit: 3,
        type: input.propertyDetails.propertyType,
      })

      // Format the input for the prompt
      return {
        propertyDetails: JSON.stringify(input.propertyDetails, null, 2),
        buyerInfo: JSON.stringify(input.buyerInfo, null, 2),
        offerTerms: JSON.stringify(input.offerTerms, null, 2),
        jurisdiction: input.jurisdiction,
        similarContracts: similarContracts.length > 0
          ? similarContracts.map(doc => doc.pageContent).join('\n\n')
          : 'No similar contracts found.',
        formatInstructions: JSON.stringify(contractSchema.shape, null, 2),
      }
    },

    // Step 2: Generate contract using the prompt template
    contractPromptTemplate,
    model,
    new JsonOutputParser<ContractOutput>(),

    // Step 3: Validate and clean up the output
    async (output: ContractOutput) => {
      try {
        // Validate against schema
        const validated = contractSchema.parse(output)

        // Add generation timestamp
        validated.metadata.lastUpdated = new Date().toISOString()

        return validated
      } catch (error) {
        console.error('Contract validation failed:', error)
        throw new Error('Generated contract failed validation')
      }
    }
  ])

  return chain
}

// Helper function to generate a contract
export async function generateContract(input: ContractInput): Promise<ContractOutput> {
  try {
    const chain = createContractChain()
    const result = await chain.invoke(input)
    return result
  } catch (error) {
    console.error('Contract generation failed:', error)
    throw new Error('Failed to generate contract')
  }
}

// Helper function to validate contract input
export function validateContractInput(input: unknown): ContractInput {
  const inputSchema = z.object({
    propertyDetails: z.object({
      address: z.string(),
      price: z.string(),
      propertyType: z.string(),
      bedrooms: z.number().optional(),
      bathrooms: z.number().optional(),
      squareFeet: z.number().optional(),
      yearBuilt: z.number().optional(),
      lotSize: z.string().optional(),
    }),
    buyerInfo: z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      currentAddress: z.string().optional(),
    }),
    offerTerms: z.object({
      offerPrice: z.string(),
      earnestMoney: z.string(),
      closingDate: z.string(),
      contingencies: z.array(z.string()),
      additionalTerms: z.array(z.string()).optional(),
    }),
    jurisdiction: z.string(),
  })

  return inputSchema.parse(input)
} 