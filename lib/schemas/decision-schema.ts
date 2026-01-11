import { z } from "zod";

// Schema for research output from Exa API
export const researchOptionSchema = z.object({
  name: z.string(),
  description: z.string(),
  advantages: z.array(z.string()),
  disadvantages: z.array(z.string()),
  bestUseCases: z.array(z.string()),
  considerations: z.array(z.string()),
});

export const researchOutputSchema = z.object({
  question: z.string(),
  options: z.array(researchOptionSchema),
  recommendation: z.string(),
  reasoning: z.string(),
});

export type ResearchOutput = z.infer<typeof researchOutputSchema>;

// Schema for AI decision detection
export const decisionDetectionSchema = z.object({
  needsDecision: z.boolean(),
  decisionType: z.string().optional(),
  question: z.string().optional(),
  context: z.string().optional(),
  searchQuery: z.string().optional(),
});

export type DecisionDetection = z.infer<typeof decisionDetectionSchema>;

// Schema for conversation analysis
export const conversationAnalysisSchema = z.object({
  mode: z.enum(["continue", "decision", "architecture"]),
  message: z.string(),
  followUpQuestion: z.string().optional(),
  decisionNeeded: z
    .object({
      type: z.string(),
      question: z.string(),
      context: z.string(),
      searchQuery: z.string(),
    })
    .optional(),
  readyForArchitecture: z.boolean(),
  missingRequirements: z.array(z.string()).optional(),
});

export type ConversationAnalysis = z.infer<typeof conversationAnalysisSchema>;

// Schema for incremental architecture updates
export const architectureUpdateSchema = z.object({
  action: z.enum(["add", "remove", "modify"]),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.string(),
        description: z.string().optional(),
        position: z.object({
          x: z.number(),
          y: z.number(),
        }),
      })
    )
    .optional(),
  edges: z
    .array(
      z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        label: z.string().optional(),
      })
    )
    .optional(),
  summary: z.string(),
});

export type ArchitectureUpdate = z.infer<typeof architectureUpdateSchema>;
