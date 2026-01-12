import { gateway } from "@ai-sdk/gateway";
import { generateObject } from "ai";
import { orchestratorOutputSchema } from "@/lib/schemas/agent-schemas";
import { generateDesign } from "./design-agent";
import { executeResearch } from "./research-agent";
import {
  createActivity,
  computeReadiness,
  createEmptyGatheredState,
} from "./agent-types";
import type {
  OrchestratorOutput,
  DesignAgentOutput,
  ResearchAgentOutput,
  ActivityEvent,
  AgentMessage,
  GatheredState,
} from "./agent-types";

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the Orchestrating Agent for AI Architect - an expert system that helps users design software architectures.

## YOUR ROLE
You are the ONLY agent that communicates directly with users. You coordinate between:
1. The USER - who describes what they want to build
2. The DESIGN AGENT - which creates architecture diagrams (you pass it requirements)
3. The RESEARCH AGENT - which researches technology options (you ask it for comparisons)

## YOUR WORKFLOW

### Phase 1: GATHERING REQUIREMENTS
Ask clarifying questions to understand:
- What type of system? (chat app, e-commerce, API, etc.)
- Expected scale (users, requests/second, data volume)
- Performance requirements (latency, throughput)
- Team expertise and existing infrastructure
- Budget or time constraints

Use mode: "clarify" with structured questions and quick-select options.

### Phase 2: TECHNOLOGY DECISIONS
When you identify a critical technology choice, trigger research:
- Database selection (SQL vs NoSQL)
- Caching strategy
- Message queue selection
- Authentication approach
- Deployment model

Use mode: "research" to invoke the Research Agent.

### Phase 3: ARCHITECTURE GENERATION
Once you have:
- Core requirements gathered (at least 3-4 key points)
- Critical technology decisions made
- Enough context for a complete design

Use mode: "design" to invoke the Design Agent.

## RESPONSE MODES

### mode: "clarify"
Ask a clarifying question with quick-select options.
REQUIRED: question object with options array

Example:
{
  "mode": "clarify",
  "message": "Great idea! To design the right architecture, I need to understand your scale.",
  "question": {
    "id": "q-scale",
    "question": "What's your expected user scale?",
    "context": "This determines infrastructure complexity and technology choices",
    "options": [
      { "id": "small", "label": "Small (< 1K users)", "value": "small-scale" },
      { "id": "medium", "label": "Medium (1K-100K)", "value": "medium-scale" },
      { "id": "large", "label": "Large (100K+)", "value": "large-scale" }
    ],
    "allowCustom": true,
    "multiSelect": false
  },
  "readyForDesign": false,
  "missingInfo": ["scale", "real-time requirements", "database needs"]
}

### mode: "research"
Trigger research for a technology decision.
REQUIRED: researchTopic, researchQuery, researchContext

⚠️ CRITICAL LENGTH LIMITS:
- researchTopic: SINGLE WORD or short phrase (max 50 chars). Examples: "database", "cache", "authentication"
- researchQuery: Concise search phrase (max 150 chars). Example: "best database for real-time chat high concurrency"
- researchContext: Brief user context (max 300 chars)

DO NOT list multiple topics or repeat phrases. ONE topic per research request.

Example:
{
  "mode": "research",
  "message": "Let me research the best database options for your real-time chat application.",
  "researchTopic": "database",
  "researchQuery": "best database for real-time chat high concurrency message storage 2024",
  "researchContext": "Need to handle 100K concurrent users with real-time messaging and persistent history",
  "readyForDesign": false
}

### mode: "design"
Generate the architecture diagram.
REQUIRED: designRequirements object

Example:
{
  "mode": "design",
  "message": "Perfect! I have everything I need. Generating your architecture now...",
  "designRequirements": {
    "systemType": "Real-time chat application",
    "scale": "100K+ concurrent users",
    "requirements": [
      "Real-time messaging",
      "Message persistence",
      "User presence tracking",
      "Push notifications"
    ],
    "decisions": [
      { "topic": "database", "choice": "PostgreSQL", "reasoning": "ACID compliance for user data" },
      { "topic": "cache", "choice": "Redis", "reasoning": "Real-time presence and message caching" }
    ],
    "constraints": ["Budget under $5K/month", "Team familiar with Node.js"]
  },
  "readyForDesign": true
}

### mode: "respond"
Simple acknowledgment or explanation (no action needed).

Example:
{
  "mode": "respond",
  "message": "Great choice! PostgreSQL is excellent for data integrity. Let me continue gathering requirements.",
  "readyForDesign": false
}

## QUESTION GUIDELINES

1. Ask ONE question at a time - don't overwhelm users
2. Provide 3-5 quick-select options for common answers
3. Always allow custom input (allowCustom: true)
4. Keep option labels short (2-5 words)
5. Provide context for why the question matters

Good questions to ask:
- System type: "What are you building?"
- Scale: "What's your expected user scale?"
- Performance: "What latency requirements do you have?"
- Real-time: "Do you need real-time features?"
- Data: "What types of data will you store?"
- Auth: "How will users authenticate?"
- Deployment: "Where do you want to deploy?"

## WHAT NOT TO DO (ANTI-PATTERNS)

1. DON'T ask more than one question at a time
2. DON'T skip to design without gathering requirements
3. DON'T assume scale - always ask
4. DON'T provide more than 5 options (use "Other" for flexibility)
5. DON'T trigger research for simple decisions
6. DON'T forget to track readyForDesign and missingInfo
7. DON'T use technical jargon in questions - keep them user-friendly
8. DON'T repeat questions already answered

## ⚠️ CRITICAL: FIELD LENGTH LIMITS

ALL output fields have STRICT length limits. Exceeding them will cause errors:

| Field | Max Length | Example |
|-------|------------|---------|
| message | 500 chars | "Great! Let me research database options." |
| researchTopic | 50 chars | "database" (ONE word/phrase!) |
| researchQuery | 150 chars | "best database for real-time chat" |
| researchContext | 300 chars | "Need 100K users, real-time messaging" |
| question.question | 150 chars | "What's your expected user scale?" |
| option.label | 50 chars | "Large (100K+ users)" |

NEVER generate long lists, repetitive content, or multiple topics in a single field.

## TRACKING STATE

Keep track of what you know:
- Use missingInfo to list what's still needed
- Set readyForDesign: true only when you have enough for a meaningful architecture
- Minimum requirements: system type, scale estimate, 2-3 key features`;

export async function* orchestrate(
  userMessage: string,
  conversationHistory: AgentMessage[],
  gatheredState: GatheredState = createEmptyGatheredState(),
  isReadyForDesign = false
): AsyncGenerator<{
  type:
    | "activity"
    | "message"
    | "question"
    | "research"
    | "design"
    | "error"
    | "done";
  data: unknown;
}> {
  try {
    yield {
      type: "activity",
      data: createActivity("analyzing", "Analyzing your request"),
    };

    const context = buildContext(
      conversationHistory,
      gatheredState,
      isReadyForDesign
    );

    const orchestratorOutput = await getOrchestratorDecision(
      userMessage,
      context,
      0,
      isReadyForDesign
    );

    switch (orchestratorOutput.mode) {
      case "clarify":
        yield* handleClarify(orchestratorOutput);
        break;

      case "research":
        yield* handleResearch(orchestratorOutput, gatheredState);
        break;

      case "design":
        yield* handleDesign(orchestratorOutput);
        break;

      case "respond":
        yield {
          type: "message",
          data: { content: orchestratorOutput.message, isComplete: true },
        };
        break;
    }

    yield {
      type: "activity",
      data: createActivity("complete", "Done"),
    };

    yield {
      type: "done",
      data: { success: true },
    };
  } catch (error) {
    console.error("Orchestrator error:", error);

    yield {
      type: "activity",
      data: createActivity("error", "An error occurred"),
    };

    yield {
      type: "error",
      data: {
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    };

    yield {
      type: "done",
      data: { success: false },
    };
  }
}

async function getOrchestratorDecision(
  userMessage: string,
  context: string,
  retryCount = 0,
  isReadyForDesign = false
): Promise<OrchestratorOutput> {
  const MAX_RETRIES = 2;

  const readyHint = isReadyForDesign
    ? '\n\n⚠️ CRITICAL: READY_FOR_DESIGN is TRUE. Use mode: "design" and provide designRequirements. The user has given enough information.'
    : "";

  try {
    const { object, finishReason } = await generateObject({
      model: gateway("google/gemini-2.0-flash"),
      schema: orchestratorOutputSchema,
      system: ORCHESTRATOR_SYSTEM_PROMPT,
      prompt: `${context}\n\nUser's message: "${userMessage}"\n\nDetermine the appropriate response mode and content.\n\nIMPORTANT: researchTopic must be ONE word only (e.g., "database", "auth", "cache"). Do NOT include multiple topics or long descriptions.${readyHint}`,
    });

    if (finishReason === "length") {
      console.warn(
        "Response truncated due to length, retrying with simpler prompt..."
      );
      if (retryCount < MAX_RETRIES) {
        return getOrchestratorDecision(
          userMessage,
          context,
          retryCount + 1,
          isReadyForDesign
        );
      }
      return createFallbackResponse(userMessage);
    }

    const sanitized = sanitizeOrchestratorOutput(object);
    return sanitized;
  } catch (error) {
    console.error("Orchestrator decision error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";

    const isRecoverableError =
      errorName.includes("Zod") ||
      errorMessage.includes("too_big") ||
      errorMessage.includes("schema") ||
      errorMessage.includes("JSON") ||
      errorMessage.includes("parse") ||
      errorMessage.includes("Unterminated") ||
      errorMessage.includes("No object generated");

    if (isRecoverableError) {
      console.warn(`Recoverable error detected: ${errorName}. Retrying...`);
      if (retryCount < MAX_RETRIES) {
        return getOrchestratorDecision(
          userMessage,
          context,
          retryCount + 1,
          isReadyForDesign
        );
      }
      return createFallbackResponse(userMessage);
    }

    throw error;
  }
}

function sanitizeOrchestratorOutput(
  output: OrchestratorOutput
): OrchestratorOutput {
  const sanitized = { ...output };

  if (sanitized.message && sanitized.message.length > 500) {
    sanitized.message = sanitized.message.slice(0, 497) + "...";
  }

  if (sanitized.researchTopic) {
    const firstTopic = sanitized.researchTopic
      .split(/[,\s]+/)[0] // Split by comma or space, take first
      .replace(/[^a-zA-Z0-9-]/g, "") // Remove special chars
      .toLowerCase()
      .slice(0, 30); // Max 30 chars
    sanitized.researchTopic = firstTopic || "architecture";
  }

  if (sanitized.researchQuery && sanitized.researchQuery.length > 150) {
    sanitized.researchQuery = sanitized.researchQuery.slice(0, 147) + "...";
  }

  if (sanitized.researchContext && sanitized.researchContext.length > 300) {
    sanitized.researchContext = sanitized.researchContext.slice(0, 297) + "...";
  }

  return sanitized;
}

function createFallbackResponse(userMessage: string): OrchestratorOutput {
  return {
    mode: "clarify",
    message:
      "I'd love to help you design your architecture! Let me start by understanding your project better.",
    question: {
      id: "q-project-type",
      question: "What type of application are you building?",
      context: "This helps me recommend the right architecture pattern",
      options: [
        { id: "web", label: "Web Application", value: "web-app" },
        { id: "mobile", label: "Mobile App", value: "mobile-app" },
        { id: "api", label: "API / Backend", value: "api-backend" },
        { id: "realtime", label: "Real-time System", value: "realtime-system" },
        { id: "other", label: "Something else", value: "other" },
      ],
      allowCustom: true,
      multiSelect: false,
    },
    readyForDesign: false,
    missingInfo: ["project type", "scale", "requirements"],
  };
}

function buildContext(
  history: AgentMessage[],
  gatheredState: GatheredState = createEmptyGatheredState(),
  isReadyForDesign = false
): string {
  if (history.length === 0) {
    return "This is the start of a new conversation. The user wants to design a system architecture.";
  }

  let context = "## Conversation History\n\n";

  const decisions: Array<{ topic: string; choice: string }> = [];

  for (const msg of history) {
    if (msg.role === "user") {
      context += `User: ${msg.content}\n`;

      if (msg.selectedOption) {
        context += `[Selected: ${msg.selectedOption.value}]\n`;
      }
    } else if (msg.role === "assistant") {
      context += `Assistant: ${msg.content}\n`;

      if (msg.research && msg.selectedOption) {
        decisions.push({
          topic: msg.research.topic,
          choice: msg.selectedOption.value,
        });
      }
    }
    context += "\n";
  }

  if (decisions.length > 0 || gatheredState.decisions.length > 0) {
    context += "\n## Decisions Made\n";
    const allDecisions = [...decisions, ...gatheredState.decisions];
    for (const d of allDecisions) {
      context += `- ${d.topic}: ${d.choice}\n`;
    }
  }

  if (gatheredState.requirements.length > 0) {
    context += "\n## Gathered Requirements\n";
    for (const req of gatheredState.requirements) {
      context += `- ${req}\n`;
    }
  }

  context += `\n## Readiness Status\n`;
  context += `- Questions answered: ${gatheredState.questionsAnswered}\n`;
  context += `- Requirements gathered: ${gatheredState.requirements.length}\n`;
  context += `- Decisions made: ${
    gatheredState.decisions.length + decisions.length
  }\n`;
  context += `- READY_FOR_DESIGN: ${isReadyForDesign ? "YES" : "NO"}\n`;

  if (isReadyForDesign) {
    context += `\n⚠️ IMPORTANT: The user has provided enough information. You should now use mode: "design" to generate the architecture. Do not ask more questions unless absolutely critical.\n`;
  }

  return context;
}

type StreamChunk = {
  type:
    | "activity"
    | "message"
    | "question"
    | "research"
    | "design"
    | "error"
    | "done";
  data: unknown;
};

async function* handleClarify(
  output: OrchestratorOutput
): AsyncGenerator<StreamChunk> {
  yield {
    type: "activity" as const,
    data: createActivity("clarifying", "Preparing question"),
  };

  // Yield message
  yield {
    type: "message" as const,
    data: { content: output.message, isComplete: true },
  };

  if (output.question) {
    yield {
      type: "question" as const,
      data: output.question,
    };
  }
}

async function* handleResearch(
  output: OrchestratorOutput,
  gatheredState: GatheredState
): AsyncGenerator<StreamChunk> {
  yield {
    type: "activity" as const,
    data: createActivity(
      "researching",
      `Researching ${output.researchTopic}`,
      output.researchQuery
    ),
  };

  yield {
    type: "message" as const,
    data: { content: output.message, isComplete: true },
  };

  if (output.researchTopic && output.researchQuery && output.researchContext) {
    yield {
      type: "activity" as const,
      data: createActivity("comparing", "Comparing options"),
    };

    const researchResult = await executeResearch({
      topic: output.researchTopic,
      query: output.researchQuery,
      context: output.researchContext,
    });

    yield {
      type: "research" as const,
      data: researchResult,
    };

    const updatedState: GatheredState = {
      ...gatheredState,
      decisions: [
        ...gatheredState.decisions,
        {
          topic: output.researchTopic,
          choice:
            researchResult.recommendation ||
            researchResult.options[0]?.name ||
            "pending",
        },
      ],
    };

    const readiness = computeReadiness(updatedState);
    if (readiness.ready && output.designRequirements) {
      yield* handleDesign(output);
    }
  }
}

async function* handleDesign(
  output: OrchestratorOutput
): AsyncGenerator<StreamChunk> {
  yield {
    type: "activity" as const,
    data: createActivity("designing", "Generating architecture"),
  };

  yield {
    type: "message" as const,
    data: { content: output.message, isComplete: true },
  };

  if (output.designRequirements) {
    yield {
      type: "activity" as const,
      data: createActivity("rendering", "Preparing visualization"),
    };

    const design = await generateDesign(output.designRequirements);

    yield {
      type: "design" as const,
      data: design,
    };
  }
}

export { createActivity } from "./agent-types";
export type {
  OrchestratorOutput,
  DesignAgentOutput,
  ResearchAgentOutput,
  ActivityEvent,
};
