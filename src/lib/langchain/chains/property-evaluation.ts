import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { chatModel } from '../config';
import type { Property } from '@/types/contracts';

// Create a prompt template for property evaluation
const propertyEvaluationPrompt = ChatPromptTemplate.fromTemplate(`
You are a professional real estate appraiser. Evaluate the following property and provide a detailed analysis:

Property Details:
- Address: {address}
- City: {city}
- State: {state}
- Property Type: {propertyType}
- Square Footage: {squareFootage}
- Year Built: {yearBuilt}
- Bedrooms: {bedrooms}
- Bathrooms: {bathrooms}
- Additional Features: {features}

Market Context:
- Recent Comparable Sales: {comparableSales}
- Neighborhood Trends: {neighborhoodTrends}

Please provide:
1. Estimated Market Value Range
2. Key Value Drivers
3. Property Condition Impact
4. Market Position Analysis
5. Investment Potential
6. Recommendations for Value Enhancement

Format your response in a clear, structured manner with specific justifications for each point.
`);

// Create the property evaluation chain
export const propertyEvaluationChain = propertyEvaluationPrompt
  .pipe(chatModel)
  .pipe(new StringOutputParser());

// Helper function to evaluate a property
export async function evaluateProperty(
  property: Property,
  marketData: {
    comparableSales: string;
    neighborhoodTrends: string;
  }
) {
  try {
    const result = await propertyEvaluationChain.invoke({
      address: property.street,
      city: property.city,
      state: property.state,
      propertyType: property.propertyType,
      squareFootage: property.squareFootage,
      yearBuilt: property.yearBuilt,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      features: property.additionalFeatures?.join(', ') || 'None',
      comparableSales: marketData.comparableSales,
      neighborhoodTrends: marketData.neighborhoodTrends,
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to evaluate property: ${error.message}`);
  }
} 