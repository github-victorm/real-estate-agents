// Feedback types for contract generation and review
export type FeedbackType = 'suggestion' | 'issue' | 'improvement';

export type Feedback = {
  id: string;
  contractId: string;
  type: FeedbackType;
  content: string;
  createdAt: Date;
  resolved?: boolean;
};
