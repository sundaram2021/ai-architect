import { z } from "zod";

export const ActivityType = z.enum([
  "analyzing",
  "clarifying",
  "researching",
  "comparing",
  "designing",
  "rendering",
  "complete",
  "error",
]);

export type ActivityType = z.infer<typeof ActivityType>;

export const activityEventSchema = z.object({
  id: z.string().describe("Unique identifier for this activity"),
  type: ActivityType,
  message: z
    .string()
    .describe("Human-readable description of current activity"),
  detail: z
    .string()
    .optional()
    .describe("Additional context (e.g., 'PostgreSQL vs MongoDB')"),
  progress: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe("Progress percentage if applicable"),
  timestamp: z.number().describe("Unix timestamp in milliseconds"),
});

export type ActivityEvent = z.infer<typeof activityEventSchema>;

export const questionOptionSchema = z.object({
  id: z.string().describe("Unique identifier for this option"),
  label: z.string().describe("Display text for the option (2-5 words)"),
  value: z.string().describe("Value to use when selected"),
});

export type QuestionOption = z.infer<typeof questionOptionSchema>;

export const clarifyingQuestionSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier for this question (e.g., 'q-scale')"),
  question: z
    .string()
    .describe("The question to ask the user (clear, concise)"),
  context: z
    .string()
    .optional()
    .describe("Why this question matters for the design"),
  options: z
    .array(questionOptionSchema)
    .min(2)
    .max(5)
    .describe("Predefined options for quick selection (2-5 options)"),
  allowCustom: z
    .boolean()
    .default(true)
    .describe("Whether to show 'Other' option with custom text input"),
  multiSelect: z
    .boolean()
    .default(false)
    .describe("Allow selecting multiple options"),
});

export type ClarifyingQuestion = z.infer<typeof clarifyingQuestionSchema>;

export const orchestratorModeSchema = z.enum([
  "clarify",
  "research",
  "design",
  "respond",
]);

export type OrchestratorMode = z.infer<typeof orchestratorModeSchema>;

export const orchestratorOutputSchema = z.object({
  mode: orchestratorModeSchema,
  message: z
    .string()
    .describe("Response message to show the user - keep it concise"),

  question: clarifyingQuestionSchema
    .optional()
    .describe("Clarifying question (required when mode='clarify')"),

  researchTopic: z
    .string()
    .optional()
    .describe(
      "SINGLE topic keyword (e.g., 'database', 'cache', 'auth') - ONE word only"
    ),
  researchQuery: z
    .string()
    .optional()
    .describe(
      "Brief search query for research (e.g., 'best database for chat apps')"
    ),
  researchContext: z
    .string()
    .optional()
    .describe("Brief context about user requirements"),

  designRequirements: z
    .object({
      systemType: z
        .string()
        .describe("Type of system (e.g., 'chat app', 'e-commerce', 'API')"),
      scale: z.string().describe("Expected scale/load"),
      requirements: z
        .array(z.string())
        .describe("List of gathered requirements"),
      decisions: z
        .array(
          z.object({
            topic: z.string(),
            choice: z.string(),
            reasoning: z.string().optional(),
          })
        )
        .describe("Technology decisions made"),
      constraints: z
        .array(z.string())
        .optional()
        .describe("Any constraints mentioned"),
    })
    .optional()
    .describe("Requirements for design agent (required when mode='design')"),

  readyForDesign: z
    .boolean()
    .default(false)
    .describe(
      "Whether enough information has been gathered to generate design"
    ),
  missingInfo: z
    .array(z.string())
    .optional()
    .describe("What information is still needed"),
});

export type OrchestratorOutput = z.infer<typeof orchestratorOutputSchema>;

export const nodeTierSchema = z
  .number()
  .int()
  .min(1)
  .max(5)
  .describe("Layout tier: 1=Clients, 2=Edge, 3=Gateway, 4=Services, 5=Data");

export const nodeTypeSchema = z.enum([
  "client",
  "cdn",
  "gateway",
  "server",
  "service",
  "api",
  "queue",
  "cache",
  "database",
  "storage",
  "auth",
  "monitoring",
  "external",
]);

export type NodeType = z.infer<typeof nodeTypeSchema>;

export const designNodeSchema = z.object({
  id: z
    .string()
    .describe(
      "Unique identifier (kebab-case, e.g., 'user-service', 'postgres-main')"
    ),
  label: z
    .string()
    .describe("Display label (technology name or component name)"),
  type: nodeTypeSchema,
  tier: nodeTierSchema,
  technology: z
    .string()
    .optional()
    .describe(
      "Specific technology (e.g., 'postgresql', 'redis', 'kafka', 'nextjs')"
    ),
  description: z
    .string()
    .optional()
    .describe("Brief description of component's role"),
});

export type DesignNode = z.infer<typeof designNodeSchema>;

export const designEdgeSchema = z.object({
  id: z.string().describe("Unique identifier for the edge"),
  source: z.string().describe("Source node ID"),
  target: z.string().describe("Target node ID"),
  label: z.string().optional().describe("Edge label (keep short: 1-2 words)"),
});

export type DesignEdge = z.infer<typeof designEdgeSchema>;

export const designAgentInputSchema = z.object({
  systemType: z.string(),
  scale: z.string(),
  requirements: z.array(z.string()),
  decisions: z.array(
    z.object({
      topic: z.string(),
      choice: z.string(),
      reasoning: z.string().optional(),
    })
  ),
  constraints: z.array(z.string()).optional(),
});

export type DesignAgentInput = z.infer<typeof designAgentInputSchema>;

export const designAgentOutputSchema = z.object({
  nodes: z
    .array(designNodeSchema)
    .min(3)
    .max(15)
    .describe("Architecture nodes (3-15 nodes for clarity)"),
  edges: z.array(designEdgeSchema).describe("Connections between nodes"),
  summary: z
    .string()
    .describe("Brief summary of the architecture (2-3 sentences)"),
});

export type DesignAgentOutput = z.infer<typeof designAgentOutputSchema>;

export const researchOptionSchema = z.object({
  id: z.string().describe("Unique identifier (lowercase, e.g., 'postgresql')"),
  name: z.string().describe("Technology name"),
  summary: z.string().describe("One-sentence summary"),
  pros: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe("Key advantages (2-5 items)"),
  cons: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe("Key disadvantages (2-5 items)"),
  bestFor: z.string().describe("Best use cases in one sentence"),
  citations: z
    .array(
      z.object({
        url: z.string(),
        title: z.string(),
        snippet: z.string().optional(),
      })
    )
    .optional()
    .describe("Source citations from research"),
});

export type ResearchOption = z.infer<typeof researchOptionSchema>;

export const researchAgentInputSchema = z.object({
  topic: z.string().describe("Decision topic (e.g., 'database', 'cache')"),
  query: z.string().describe("Search query for research"),
  context: z.string().describe("User's specific requirements and constraints"),
});

export type ResearchAgentInput = z.infer<typeof researchAgentInputSchema>;

export const researchAgentOutputSchema = z.object({
  topic: z.string(),
  question: z.string().describe("The decision question being answered"),
  options: z
    .array(researchOptionSchema)
    .min(2)
    .max(4)
    .describe("Researched options (2-4 for easy comparison)"),
  recommendation: z
    .string()
    .describe("Recommended option with brief reasoning"),
});

export type ResearchAgentOutput = z.infer<typeof researchAgentOutputSchema>;

export const streamChunkSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("activity"),
    data: activityEventSchema,
  }),
  z.object({
    type: z.literal("message"),
    data: z.object({
      content: z.string(),
      isComplete: z.boolean(),
    }),
  }),
  z.object({
    type: z.literal("question"),
    data: clarifyingQuestionSchema,
  }),
  z.object({
    type: z.literal("research"),
    data: researchAgentOutputSchema,
  }),
  z.object({
    type: z.literal("design"),
    data: designAgentOutputSchema,
  }),
  z.object({
    type: z.literal("error"),
    data: z.object({
      message: z.string(),
      code: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("done"),
    data: z.object({
      success: z.boolean(),
    }),
  }),
]);

export type StreamChunk = z.infer<typeof streamChunkSchema>;
