import { BaseEntity, Address } from './common';

// Basic property information
export type Property = Address & {
  propertyType: 'residential' | 'commercial';
};

// Parties involved in the contract
export type Party = BaseEntity & {
  name: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'agent';
};

// Contract status tracking
export type ContractStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'signed'
  | 'completed'
  | 'cancelled';

// Main contract type
export type Contract = BaseEntity & {
  property: Property;
  parties: Party[];
  status: ContractStatus;
  price: number;
  closingDate?: Date;
  terms: string[];
  documents?: string[]; // URLs to associated documents
};
