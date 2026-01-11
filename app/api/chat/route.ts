import { gateway } from "@ai-sdk/gateway";
import { generateObject } from "ai";
import { z } from "zod";
import { architectureSchema } from "@/lib/schemas";
import { executeResearch } from "@/lib/exa-client";
import { generateId } from "@/lib/utils";
import type {
  ChatResponse,
  DecisionPayload,
  ConversationContext,
} from "@/types";

// Comprehensive system prompt with examples, constraints, and fallbacks
const SYSTEM_PROMPT = `You are AI Architect, an expert system architect specializing in distributed systems, microservices, databases, cloud infrastructure, and modern software architecture patterns.

## YOUR ROLE
You help users design robust, scalable system architectures by:
1. Gathering requirements through conversation
2. Identifying key architectural decisions
3. Presenting researched options for critical choices
4. Building the architecture incrementally based on user decisions

## CONVERSATION WORKFLOW

### Phase 1: GATHERING (mode: "continue")
Ask clarifying questions to understand:
- Scale requirements (users, requests/second, data volume)
- Performance needs (latency, throughput)
- Reliability requirements (uptime, disaster recovery)
- Budget constraints
- Team expertise
- Existing infrastructure

### Phase 2: DECIDING (mode: "decision")
When you identify a critical architectural decision, you MUST flag it for research.
Critical decisions include:
- Database selection (SQL vs NoSQL vs Graph vs Time-series)
- Message queue/streaming (Kafka vs RabbitMQ vs SQS vs Redis Streams)
- Caching strategy (Redis vs Memcached vs CDN vs Application-level)
- Authentication approach (JWT vs Session vs OAuth vs SAML)
- API design (REST vs GraphQL vs gRPC)
- Deployment model (Kubernetes vs Serverless vs PaaS vs VMs)
- Cloud provider (AWS vs GCP vs Azure vs Multi-cloud)

### Phase 3: DESIGNING (mode: "architecture")
Only generate architecture when:
- Core requirements are gathered
- Critical decisions have been made by user
- You have enough context to create a complete design

## RESPONSE FORMAT

Always respond with a JSON object containing:
{
  "mode": "continue" | "decision" | "architecture",
  "message": "Your response text to the user",
  "followUpQuestion": "Optional: next question to ask",
  "decisionNeeded": {
    "type": "database | cache | queue | auth | api | deployment | cloud",
    "question": "What specific decision needs to be made",
    "context": "Why this decision matters for their use case",
    "searchQuery": "Query to research options (be specific)"
  },
  "readyForArchitecture": true | false,
  "missingRequirements": ["list", "of", "missing", "info"]
}

## EXAMPLES

### Example 1: Initial gathering
User: "I want to build a chat application"
Response: {
  "mode": "continue",
  "message": "I'd be happy to help you design a chat application architecture! To create the best design, I need to understand your requirements better.",
  "followUpQuestion": "What scale are you targeting? (e.g., number of concurrent users, messages per day)",
  "readyForArchitecture": false,
  "missingRequirements": ["scale", "real-time requirements", "message persistence needs", "user authentication method"]
}

### Example 2: Decision point identified
User: "We expect 100K concurrent users, need real-time messaging, and want to store message history"
Response: {
  "mode": "decision",
  "message": "With 100K concurrent users and real-time messaging requirements, the database choice is critical. Let me research the best options for your use case.",
  "decisionNeeded": {
    "type": "database",
    "question": "Database Selection for Real-time Chat",
    "context": "Need to handle 100K concurrent users with real-time message delivery and persistent message history. Must balance write throughput for new messages with read performance for history retrieval.",
    "searchQuery": "best database for real-time chat application high concurrency message storage 2024 comparison"
  },
  "readyForArchitecture": false
}

### Example 3: Ready for architecture
User: (after making all decisions)
Response: {
  "mode": "architecture",
  "message": "Based on your requirements and decisions, I'll now generate your chat application architecture.",
  "readyForArchitecture": true
}

## WHAT NOT TO DO

1. NEVER assume scale without asking - always ask for specifics
2. NEVER skip research for critical decisions - every major technology choice needs research
3. NEVER generate architecture before gathering basic requirements
4. NEVER recommend technologies without explaining trade-offs
5. NEVER ignore user's constraints (budget, team size, existing tech)
6. NEVER provide generic advice - always tailor to the specific use case
7. NEVER proceed with database, cache, or queue decisions without user confirmation

## HANDLING USER COMMANDS

Users may give direct commands. Handle them appropriately:
- "generate the architecture" / "show me the design" -> If enough info, mode: "architecture". If not, ask for missing requirements.
- "skip this" / "just pick one" -> Provide sensible default with explanation, continue conversation.
- "go back" / "change [decision]" -> Acknowledge and allow them to revise.
- "explain more about [option]" -> Provide detailed explanation in continue mode.
- "what do you recommend?" -> Share recommendation with reasoning, but let user decide.

## ERROR HANDLING

If user input is unclear:
{
  "mode": "continue",
  "message": "I want to make sure I understand correctly. Could you clarify [specific aspect]?",
  "followUpQuestion": "Specific clarifying question"
}

If user wants to skip a decision:
{
  "mode": "continue",
  "message": "I understand you'd like to move forward. I'll use a sensible default for [decision] - [chosen option] - which works well for most cases. We can revisit this later if needed."
}

## FALLBACK BEHAVIORS

- If research takes too long: Provide recommendations based on expertise with clear caveat
- If requirements are vague: Ask the most critical clarifying question
- If user seems stuck: Offer common patterns for their use case
- If decision has no clear winner: Present top 2-3 options with trade-offs

Remember: Your goal is to help users make informed decisions about their architecture. Quality over speed - take time to gather requirements and research options thoroughly.`;

// Schema for AI analysis response
const analysisResponseSchema = z.object({
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

// Parse conversation context from messages
function parseConversationContext(
  messages: Array<{ role: string; content: string; decision?: unknown }>
): ConversationContext {
  const context: ConversationContext = {
    requirements: [],
    decisions: [],
    currentPhase: "gathering",
  };

  for (const msg of messages) {
    if (msg.role === "user") {
      context.requirements.push(msg.content);
    }
    if (msg.decision && typeof msg.decision === "object") {
      const decision = msg.decision as {
        question?: string;
        selectedOptionId?: string;
        options?: Array<{ id: string; title: string }>;
      };
      if (decision.selectedOptionId && decision.options) {
        const selected = decision.options.find(
          (o) => o.id === decision.selectedOptionId
        );
        if (selected) {
          context.decisions.push({
            question: decision.question || "",
            selectedOption: selected.title,
            reasoning: "User selected",
          });
        }
      }
    }
  }

  if (context.decisions.length > 0) {
    context.currentPhase = "deciding";
  }

  return context;
}

// Build conversation history for AI
function buildConversationHistory(
  messages: Array<{ role: string; content: string; decision?: unknown }>,
  context: ConversationContext
): string {
  let history = "## Conversation History\n\n";

  for (const msg of messages) {
    if (msg.role === "user") {
      history += `User: ${msg.content}\n\n`;
    } else if (msg.role === "assistant") {
      history += `Assistant: ${msg.content}\n\n`;
    }
  }

  if (context.decisions.length > 0) {
    history += "\n## Decisions Made\n";
    for (const decision of context.decisions) {
      history += `- ${decision.question}: ${decision.selectedOption}\n`;
    }
  }

  return history;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, conversationContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        {
          mode: "continue",
          text: "I didn't receive your message properly. Could you try again?",
          error: "Messages array is required",
        } satisfies ChatResponse,
        { status: 400 }
      );
    }

    // Parse context from conversation
    const context = conversationContext || parseConversationContext(messages);
    const conversationHistory = buildConversationHistory(messages, context);
    const userMessage = messages[messages.length - 1]?.content || "";

    // Step 1: Analyze conversation to determine next action
    let analysis;
    try {
      const { object } = await generateObject({
        model: gateway("google/gemini-2.0-flash"),
        schema: analysisResponseSchema,
        system: SYSTEM_PROMPT,
        prompt: `${conversationHistory}\n\nUser's latest message: "${userMessage}"\n\nAnalyze this conversation and determine the appropriate response mode and content.`,
      });
      analysis = object;
    } catch (analysisError) {
      console.error("Analysis error:", analysisError);
      // Fallback: treat as continue mode
      return Response.json({
        mode: "continue",
        text: "I'm having trouble processing that. Could you tell me more about what you're trying to build?",
      } satisfies ChatResponse);
    }

    // Step 2: Handle based on mode
    if (analysis.mode === "continue") {
      return Response.json({
        mode: "continue",
        text:
          analysis.message +
          (analysis.followUpQuestion ? `\n\n${analysis.followUpQuestion}` : ""),
      } satisfies ChatResponse);
    }

    if (analysis.mode === "decision" && analysis.decisionNeeded) {
      // Execute research using Exa API
      const researchResult = await executeResearch(
        analysis.decisionNeeded.question,
        analysis.decisionNeeded.context
      );

      if (!researchResult.success && researchResult.options.length === 0) {
        // Research failed completely - ask user to provide more context or skip
        return Response.json({
          mode: "continue",
          text: `${
            analysis.message
          }\n\nI encountered an issue researching options. ${
            researchResult.error ||
            "Could you provide more specific requirements, or would you like me to proceed with a general recommendation?"
          }`,
        } satisfies ChatResponse);
      }

      // Build decision payload
      const decision: DecisionPayload = {
        id: generateId(),
        question: analysis.decisionNeeded.question,
        context: analysis.decisionNeeded.context,
        options: researchResult.options,
        status: "ready",
      };

      const researchNote = researchResult.fromCache
        ? " (Based on general expertise - detailed research unavailable)"
        : "";

      return Response.json({
        mode: "decision",
        text: analysis.message + researchNote,
        decision,
      } satisfies ChatResponse);
    }

    if (analysis.mode === "architecture") {
      // Generate full architecture
      try {
        const architecturePrompt = `
Based on the following conversation and decisions, generate a complete system architecture:

${conversationHistory}

Requirements gathered from conversation.
Decisions made: ${
          context.decisions
            .map(
              (d: { question: string; selectedOption: string }) =>
                `${d.question}: ${d.selectedOption}`
            )
            .join(", ") || "None yet - use sensible defaults"
        }

Generate a well-structured architecture with appropriate components and connections.
Position nodes clearly across the canvas (x: 0-1000, y: 0-800).
Use semantic types for nodes (client, server, database, cache, queue, gateway, service, storage, load-balancer).
Create a practical, production-ready architecture.
`;

        const { object: architecture } = await generateObject({
          model: gateway("google/gemini-2.0-flash"),
          schema: architectureSchema,
          system:
            "You are an expert system architect. Generate clear, well-structured architecture diagrams with proper node positioning and logical connections.",
          prompt: architecturePrompt,
        });

        return Response.json({
          mode: "architecture",
          text:
            architecture.summary ||
            `I've designed your architecture with ${architecture.nodes.length} components and ${architecture.edges.length} connections.`,
          architecture,
        } satisfies ChatResponse);
      } catch (archError) {
        console.error("Architecture generation error:", archError);
        return Response.json({
          mode: "continue",
          text: "I encountered an issue generating the architecture. Let me try a different approach. Could you summarize the key components you need?",
        } satisfies ChatResponse);
      }
    }

    // Fallback
    return Response.json({
      mode: "continue",
      text:
        analysis.message ||
        "I'm here to help you design your system. What would you like to build?",
    } satisfies ChatResponse);
  } catch (error) {
    console.error("Chat API error:", error);

    // Graceful error response
    return Response.json({
      mode: "continue",
      text: "I apologize, but I encountered an unexpected error. Could you try rephrasing your request?",
      error: error instanceof Error ? error.message : "Unknown error",
    } satisfies ChatResponse);
  }
}
