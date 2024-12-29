# Real Estate Contract Automation Platform

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Features](#features)
- [Architecture](#architecture)
- [Implementation Details](#implementation-details)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)

## Project Overview

### Goal

Build a real estate contract automation platform using Next.js, LangChain-JS, and LangGraph that dynamically generates professional offer letters/contracts by combining structured input with GPT-4o, leveraging historical offers for context, and enabling continuous improvement through user feedback.

### Key Objectives

#### 🤖 Automated Contract Generation

- Dynamic offer letter creation using GPT-4o and LangGraph workflows
- Integration with LangChain's structured output parsers for consistent formatting

#### 📚 Historical Context Integration

- Vector similarity search using LangChain's built-in vector stores
- Privacy-focused data scoping using LangChain's memory management
- Smart clause incorporation using LangChain's output parsers

#### 🔄 Dynamic Contract Refinement

- Interactive "sandbox" review with:
  - Historical example previews
  - Clause comparison tools
  - Smart modification suggestions

#### 📤 Contract Upload System

- Smart contract analysis using LangChain's document loaders
- Style extraction using LangChain's text splitters and embeddings
- Personalization through LangChain's prompt templates

#### 📈 Feedback System

- Structured feedback collection using LangChain's output schemas
- Continuous learning through LangChain's feedback store

## Tech Stack

### Core AI Components

- **LangChain-JS**: ^0.0.197
  - Document processing
  - Vector operations
  - Memory management
  - Structured output handling
- **LangGraph**: ^0.0.5

  - Workflow orchestration
  - Agent management
  - State handling

- **OpenAI**
  - GPT-4o for generation
  - Ada-002 for embeddings

### Infrastructure

- **Database**: Supabase (PostgreSQL + pgvector)
- **Backend**: Next.js 14 API routes
- **Frontend**: Next.js 14 App Router
- **Deployment**: Vercel
- **Error Monitoring**: Sentry
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- OpenAI API Key
- Supabase Account
- Sentry Account

### Environment Setup

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/real-estate-contract-automation.git
   cd real-estate-contract-automation
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   yarn install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

Required environment variables:
\`\`\`env

# OpenAI Configuration

OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4

# Supabase Configuration

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Sentry Configuration

NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_PROJECT=your_project_name
SENTRY_ORG=your_org_name

# Application Configuration

NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

4. Initialize the database:
   \`\`\`bash
   yarn setup:db
   \`\`\`

5. Start the development server:
   \`\`\`bash
   yarn dev
   \`\`\`

## Project Structure

\`\`\`
src/
├── app/ # Next.js App Router
│ ├── (auth)/ # Auth-related routes
│ │ ├── login/ # Login page
│ │ ├── register/ # Registration page
│ │ └── layout.tsx # Auth layout
│ ├── api/ # API Routes
│ │ ├── contracts/ # Contract endpoints
│ │ │ ├── generate/ # Contract generation
│ │ │ ├── analyze/ # Contract analysis
│ │ │ └── [id]/ # Contract operations
│ │ ├── auth/ # Auth endpoints
│ │ └── feedback/ # Feedback endpoints
│ ├── contracts/ # Contract pages
│ │ ├── create/ # Contract creation
│ │ ├── [id]/ # Contract details
│ │ └── history/ # Contract history
│ └── layout.tsx # Root layout
├── components/
│ ├── contracts/ # Contract components
│ │ ├── form/ # Form components
│ │ ├── preview/ # Preview components
│ │ └── shared/ # Shared contract components
│ ├── ui/ # UI components (shadcn/ui)
│ │ ├── button.tsx # Button component
│ │ ├── input.tsx # Input component
│ │ ├── dialog.tsx # Dialog component
│ │ ├── dropdown-menu.tsx # Dropdown menu component
│ │ ├── form.tsx # Form component
│ │ ├── select.tsx # Select component
│ │ └── toast.tsx # Toast component
│ └── feedback/ # Feedback components
├── lib/
│ ├── config/ # Configuration
│ │ ├── constants.ts # App constants
│ │ └── env.ts # Environment config
│ ├── langchain/ # LangChain setup
│ │ ├── chains/ # Custom chains
│ │ │ ├── contract/ # Contract chains
│ │ │ └── feedback/ # Feedback chains
│ │ ├── agents/ # Custom agents
│ │ │ ├── contract/ # Contract agents
│ │ │ └── feedback/ # Feedback agents
│ │ ├── embeddings/ # Embedding configs
│ │ ├── prompts/ # Prompt templates
│ │ └── tools/ # Custom tools
│ ├── langgraph/ # LangGraph setup
│ │ ├── nodes/ # Graph nodes
│ │ │ ├── contract/ # Contract nodes
│ │ │ └── feedback/ # Feedback nodes
│ │ ├── edges/ # Graph edges
│ │ └── workflows/ # Graph workflows
│ ├── sentry/ # Sentry configuration
│ │ ├── init.ts # Sentry initialization
│ │ └── monitoring.ts # Custom monitoring utils
│ ├── supabase/ # Supabase client
│ │ ├── client.ts # Supabase instance
│ │ └── types.ts # Database types
│ └── utils/ # Utility functions
├── hooks/ # Custom React hooks
│ ├── contracts/ # Contract hooks
│ ├── auth/ # Auth hooks
│ └── feedback/ # Feedback hooks
├── store/ # State management
│ ├── contracts/ # Contract state
│ └── feedback/ # Feedback state
├── styles/ # Global styles
│ ├── globals.css # Global CSS
│ └── themes/ # Theme configurations
├── types/ # TypeScript types
│ ├── contracts.ts # Contract types
│ ├── feedback.ts # Feedback types
│ └── common.ts # Shared types
├── middleware.ts # Next.js middleware
└── package.json # Project dependencies
\`\`\`

### Key Improvements in Structure:

1. **App Router Organization**:

   - Grouped routes by feature (auth, contracts, feedback)
   - Proper layout hierarchy
   - API routes follow REST conventions

2. **Component Architecture**:

   - Separated UI components from feature components
   - Organized by feature and reusability
   - Proper component composition structure

3. **LangChain Integration**:

   - Dedicated directories for chains, agents, and tools
   - Feature-based organization within LangChain
   - Clear separation of prompts and embeddings

4. **LangGraph Organization**:

   - Separated nodes, edges, and workflows
   - Feature-based workflow organization
   - Clear graph composition structure

5. **State Management**:

   - Dedicated store directory
   - Feature-based state organization
   - Clear separation of concerns

6. **Type Safety**:

   - Centralized types directory
   - Feature-based type organization
   - Shared types for common interfaces

7. **API Structure**:

   - RESTful endpoint organization
   - Clear route naming conventions
   - Proper HTTP method handling

8. **Utilities and Hooks**:

   - Custom hooks for reusable logic
   - Utility functions for common operations
   - Clear separation of business logic

9. **UI Components Organization**:

   - Added shadcn/ui components in the `components/ui` directory
   - Each component follows shadcn/ui's atomic design principles
   - Easy to customize and extend components

10. **Error Monitoring Setup**:
    - Added Sentry configuration in `lib/sentry`
    - Centralized error tracking initialization
    - Custom monitoring utilities

This structure provides:

- Better scalability
- Clearer feature boundaries
- Improved maintainability
- Better type safety
- Clearer dependency management
- Easier testing organization
- Better separation of concerns

## Implementation Details

### LangChain Agent Example

\`\`\`typescript
import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ContractTool } from "./tools/contract";

export const createContractAgent = async () => {
const model = new ChatOpenAI({
temperature: 0,
modelName: "gpt-4o",
});

const tools = [
new ContractTool(),
// Add more tools as needed
];

return await initializeAgentExecutorWithOptions(tools, model, {
agentType: "structured-chat-zero-shot-react-description",
verbose: true,
});
};
\`\`\`

### LangGraph Workflow Example

\`\`\`typescript
import { defineConfig } from "langgraph";
import { ContractNode } from "./nodes/contract";
import { FeedbackNode } from "./nodes/feedback";

export const contractWorkflow = defineConfig({
nodes: {
contractGeneration: new ContractNode(),
feedbackCollection: new FeedbackNode(),
},
edges: [
["contractGeneration", "feedbackCollection"],
],
});
\`\`\`

### Sentry Setup Example

```typescript
// lib/sentry/init.ts
import * as Sentry from "@sentry/nextjs";

export const initializeSentry = () => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: process.env.NODE_ENV === "development",
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: [
            "localhost",
            process.env.NEXT_PUBLIC_APP_URL,
          ],
        }),
      ],
    });
  }
};

// Custom error boundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary;
```

### UI Components Implementation

```typescript
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Example Usage in Components

```typescript
// components/contracts/form/submit-button.tsx
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import * as Sentry from "@sentry/nextjs"

export function SubmitContractButton({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const { toast } = useToast()

  const handleSubmit = async () => {
    try {
      await onSubmit()
      toast({
        title: "Success",
        description: "Contract submitted successfully",
      })
    } catch (error) {
      Sentry.captureException(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit contract. Please try again.",
      })
    }
  }

  return (
    <Button
      onClick={handleSubmit}
      size="lg"
      className="w-full"
    >
      Submit Contract
    </Button>
  )
}
```

This implementation showcases:

- Sentry initialization and error tracking
- shadcn/ui component customization
- Integration of both tools in a real component
- Error handling with toast notifications
- Type-safe component props

## Development Guide

### Core Components

#### 1. Contract Generation Chain

\`\`\`typescript
// lib/langchain/chains/contract-generation.ts
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { JsonOutputParser } from "langchain/output_parsers";

const contractTemplate = new PromptTemplate({
template: \`
You are an expert real estate contract generator.
Based on the following information, generate a professional offer letter:

    Property Details: {propertyDetails}
    Buyer Information: {buyerInfo}
    Offer Terms: {offerTerms}

    Historical Context: {historicalContext}
    Style Guidelines: {styleGuide}

    Generate a contract that includes all necessary legal clauses and follows
    the provided style guidelines while maintaining professional standards.

\`,
inputVariables: [
"propertyDetails",
"buyerInfo",
"offerTerms",
"historicalContext",
"styleGuide"
],
});

const outputParser = new JsonOutputParser();

export const createContractChain = () => {
const llm = new ChatOpenAI({
temperature: 0.2,
modelName: "gpt-4",
});

return new LLMChain({
llm,
prompt: contractTemplate,
outputParser,
verbose: true,
});
};
\`\`\`

#### 2. Vector Store Setup

\`\`\`typescript
// lib/langchain/vectorstores/contract-store.ts
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "@supabase/supabase-js";

export const initializeVectorStore = () => {
const embeddings = new OpenAIEmbeddings();
const client = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
);

return new SupabaseVectorStore(embeddings, {
client,
tableName: "contract_embeddings",
queryName: "match_contracts",
});
};
\`\`\`

#### 3. Document Processing

\`\`\`typescript
// lib/langchain/processors/document-processor.ts
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

export class ContractProcessor {
private splitter: RecursiveCharacterTextSplitter;

constructor() {
this.splitter = new RecursiveCharacterTextSplitter({
chunkSize: 1000,
chunkOverlap: 200,
});
}

async processDocument(file: File): Promise<Document[]> {
const loader = new PDFLoader(file);
const rawDocs = await loader.load();
return this.splitter.splitDocuments(rawDocs);
}
}
\`\`\`

### API Routes Implementation

#### Contract Generation Endpoint

\`\`\`typescript
// app/api/contracts/generate/route.ts
import { NextResponse } from "next/server";
import { createContractChain } from "@/lib/langchain/chains/contract-generation";
import { initializeVectorStore } from "@/lib/langchain/vectorstores/contract-store";

export async function POST(request: Request) {
try {
const { propertyDetails, buyerInfo, offerTerms } = await request.json();

    // Initialize vector store and search for similar contracts
    const vectorStore = initializeVectorStore();
    const similarContracts = await vectorStore.similaritySearch(
      JSON.stringify({ propertyDetails, offerTerms }),
      3
    );

    // Generate contract
    const chain = createContractChain();
    const result = await chain.call({
      propertyDetails,
      buyerInfo,
      offerTerms,
      historicalContext: similarContracts.map(doc => doc.pageContent).join("\\n"),
      styleGuide: "professional, clear, and concise",
    });

    return NextResponse.json({ contract: result });

} catch (error) {
console.error("Contract generation failed:", error);
return NextResponse.json(
{ error: "Failed to generate contract" },
{ status: 500 }
);
}
}
\`\`\`

## Testing

### Unit Tests

\`\`\`typescript
// **tests**/lib/langchain/chains/contract-generation.test.ts
import { createContractChain } from "@/lib/langchain/chains/contract-generation";

describe("Contract Generation Chain", () => {
it("should generate a valid contract", async () => {
const chain = createContractChain();
const result = await chain.call({
propertyDetails: {
address: "123 Test St",
price: "$500,000",
},
buyerInfo: {
name: "John Doe",
email: "john@example.com",
},
offerTerms: {
closingDate: "2024-03-01",
contingencies: ["financing", "inspection"],
},
historicalContext: "",
styleGuide: "professional",
});

    expect(result).toHaveProperty("content");
    expect(result.content).toContain("123 Test St");

});
});
\`\`\`

## Deployment

### Production Deployment

1. Build the application:
   \`\`\`bash
   yarn build
   \`\`\`

2. Deploy to Vercel:
   \`\`\`bash
   vercel deploy --prod
   \`\`\`

### Environment Configuration

Ensure all environment variables are properly set in your Vercel project:

- OpenAI API configuration
- Supabase credentials
- Application URLs
- Rate limiting parameters

### Data Protection

- All contracts are encrypted at rest using Supabase Row Level Security (RLS)
- API endpoints are protected with authentication middleware
- Rate limiting is implemented on all API routes
- Sensitive data is redacted from logs

### Example RLS Policy

\`\`\`sql
-- Enable RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can only access their own contracts"
ON contracts
FOR ALL
USING (auth.uid() = user_id);
\`\`\`

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Add tests
5. Submit a pull request

### Code Style

- Follow the project's ESLint configuration
- Use TypeScript for all new code
- Maintain 100% test coverage for critical paths
- Document all public APIs

### Commit Messages

Follow conventional commits specification:
\`\`\`
feat: add contract versioning
fix: resolve PDF parsing issue
docs: update deployment guide
test: add vector store tests
\`\`\`