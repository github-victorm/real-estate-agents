import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { chatModel } from '../config';
import { z } from 'zod';

// Define the structure for contract analysis output
const analysisOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the contract'),
  keyTerms: z.array(z.string()).describe('List of important terms and conditions'),
  risks: z.array(z.string()).describe('Potential risks or concerns'),
  recommendations: z.array(z.string()).describe('Recommendations for improvement'),
  completeness: z.number().min(0).max(100).describe('Completeness score of the contract'),
});

// Create output parser
const outputParser = StructuredOutputParser.fromZodSchema(analysisOutputSchema);

// Create analysis prompt
const analysisPrompt = ChatPromptTemplate.fromTemplate(`
You are a professional real estate contract analyzer. Review the following contract and provide a structured analysis.

Contract:
{contract}

Analyze the contract and provide:
1. A brief summary
2. Key terms and conditions
3. Potential risks or concerns
4. Recommendations for improvement
5. Completeness score (0-100)

${outputParser.getFormatInstructions()}
`);

// Create the contract analysis chain
export const contractAnalysisChain = analysisPrompt
  .pipe(chatModel)
  .pipe(outputParser);

// Helper function to analyze a contract
export async function analyzeContract(contractContent: string) {
  try {
    const analysis = await contractAnalysisChain.invoke({
      contract: contractContent,
    });

    return analysis;
  } catch (error) {
    console.error('Error analyzing contract:', error);
    throw new Error('Failed to analyze contract');
  }
} 