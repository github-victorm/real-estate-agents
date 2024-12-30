import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { z } from 'zod'
import { storeContractDocument } from '../vectorstores/contract-store'

// Define metadata extraction schema
const contractMetadataSchema = z.object({
  title: z.string(),
  type: z.string(),
  parties: z.array(z.object({
    name: z.string(),
    role: z.string(),
  })),
  propertyDetails: z.object({
    address: z.string(),
    price: z.string().optional(),
    propertyType: z.string(),
  }),
  dates: z.object({
    effectiveDate: z.string().optional(),
    closingDate: z.string().optional(),
    expirationDate: z.string().optional(),
  }),
  keyTerms: z.array(z.string()),
})

type ContractMetadata = z.infer<typeof contractMetadataSchema>

// Configure text splitter for chunking
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', '. ', '! ', '? '], // Custom separators for contracts
})

// Create metadata extraction prompt
const metadataExtractionPrompt = new PromptTemplate({
  template: `You are a contract analysis expert. Extract key metadata from the following contract text:

CONTRACT TEXT:
{text}

Extract the metadata following these rules:
1. Identify contract title, type, and parties involved
2. Extract property details including address and type
3. Find all relevant dates (effective, closing, expiration)
4. Identify key terms and conditions

Provide the metadata in the following JSON structure:
{formatInstructions}

Be precise and only include information explicitly stated in the text.`,
  inputVariables: ['text', 'formatInstructions'],
})

// Initialize the model
const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.1, // Low temperature for factual extraction
})

// Create the document processing chain
export const createDocumentProcessingChain = () => {
  const chain = RunnableSequence.from([
    // Step 1: Extract metadata from document
    async (input: { text: string }) => {
      const { text } = input
      
      return {
        text,
        formatInstructions: JSON.stringify(contractMetadataSchema.shape, null, 2),
      }
    },

    // Step 2: Process with prompt
    metadataExtractionPrompt,
    model,
    new JsonOutputParser<ContractMetadata>(),

    // Step 3: Validate metadata
    async (output: ContractMetadata) => {
      try {
        return contractMetadataSchema.parse(output)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        throw new Error(`Metadata validation failed: ${errorMessage}`)
      }
    }
  ])

  return chain
}

// Main function to process uploaded contract
export async function processContractDocument(file: File): Promise<{
  metadata: ContractMetadata;
  chunks: Document[];
}> {
  try {
    // Load and parse PDF
    const loader = new WebPDFLoader(file)
    const docs = await loader.load()
    
    // Split text into chunks
    const chunks = await textSplitter.splitDocuments(docs)
    
    // Extract metadata from first chunk (usually contains header info)
    const chain = createDocumentProcessingChain()
    const metadata = await chain.invoke({ text: chunks[0].pageContent })

    // Store in vector store
    await storeContractDocument(
      docs[0].pageContent,
      {
        contractId: metadata.title.toLowerCase().replace(/\s+/g, '-'),
        title: metadata.title,
        type: metadata.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    )

    return {
      metadata,
      chunks,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to process contract document: ${errorMessage}`)
  }
} 