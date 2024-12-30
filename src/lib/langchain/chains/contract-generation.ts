import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { chatModel } from '../config';
import type { Property, Party } from '@/types/contracts';

// Create a prompt template for contract generation
const contractPrompt = ChatPromptTemplate.fromTemplate(`
You are a professional real estate contract generator. Generate a detailed contract based on the following information:

Property Details:
- Address: {address}
- City: {city}
- State: {state}
- Property Type: {propertyType}
- Price: {price}

Buyer: {buyerName}
Seller: {sellerName}
Agent: {agentName}

Please generate a professional real estate contract that includes:
1. Property description
2. Purchase price and payment terms
3. Closing date and conditions
4. Contingencies
5. Representations and warranties
6. Default and remedies
7. Governing law

Use formal legal language but keep it clear and understandable.
`);

// Create the contract generation chain
export const contractGenerationChain = contractPrompt
  .pipe(chatModel)
  .pipe(new StringOutputParser());

// Helper function to generate a contract
export async function generateContract(
  property: Property,
  price: number,
  parties: Party[]
) {
  const buyer = parties.find(p => p.role === 'buyer');
  const seller = parties.find(p => p.role === 'seller');
  const agent = parties.find(p => p.role === 'agent');

  if (!buyer || !seller || !agent) {
    throw new Error('Missing required parties for contract generation');
  }

  const result = await contractGenerationChain.invoke({
    address: property.street,
    city: property.city,
    state: property.state,
    propertyType: property.propertyType,
    price: price.toLocaleString(),
    buyerName: buyer.name,
    sellerName: seller.name,
    agentName: agent.name,
  });

  return result;
} 