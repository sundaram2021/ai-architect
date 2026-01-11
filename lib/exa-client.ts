import Exa from "exa-js";
import type { DecisionOption } from "@/types";

// Initialize Exa client
const exa = new Exa(process.env.EXA_API_KEY);

// Research task configuration
const RESEARCH_CONFIG = {
  model: "exa-research" as const,
  pollIntervalMs: 3000,
  timeoutMs: 120000,
};

// Output schema for structured research results
const DECISION_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    options: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          advantages: { type: "array", items: { type: "string" } },
          disadvantages: { type: "array", items: { type: "string" } },
          bestUseCases: { type: "array", items: { type: "string" } },
        },
        required: [
          "name",
          "description",
          "advantages",
          "disadvantages",
          "bestUseCases",
        ],
      },
    },
    recommendation: { type: "string" },
    reasoning: { type: "string" },
  },
  required: ["options", "recommendation", "reasoning"],
};

export interface ResearchResult {
  success: boolean;
  options: DecisionOption[];
  recommendation: string;
  error?: string;
  fromCache?: boolean;
}

interface ExaResearchData {
  options: Array<{
    name: string;
    description: string;
    advantages: string[];
    disadvantages: string[];
    bestUseCases: string[];
  }>;
  recommendation: string;
  reasoning: string;
}

// Create a research task for architectural decisions
export async function createResearchTask(
  question: string,
  context: string
): Promise<{ researchId: string } | { error: string }> {
  try {
    const instructions = buildResearchInstructions(question, context);

    const response = await exa.research.create({
      instructions,
      model: RESEARCH_CONFIG.model,
      outputSchema: DECISION_OUTPUT_SCHEMA,
    });

    return { researchId: response.researchId };
  } catch (error) {
    console.error("Exa research creation error:", error);
    return { error: getErrorMessage(error) };
  }
}

// Poll and get research results
export async function getResearchResults(
  researchId: string
): Promise<ResearchResult> {
  try {
    const task = await exa.research.get(researchId);

    if (task.status === "failed" || task.status === "canceled") {
      return {
        success: false,
        options: [],
        recommendation: "",
        error: `Research ${task.status}`,
      };
    }

    if (task.status !== "completed") {
      return {
        success: false,
        options: [],
        recommendation: "",
        error: "Research still in progress",
      };
    }

    // For completed tasks, extract data from output
    const output = (task as { output?: { parsed?: ExaResearchData } }).output;
    const data = output?.parsed as ExaResearchData | undefined;

    if (!data) {
      return {
        success: false,
        options: [],
        recommendation: "",
        error: "No parsed data in research output",
      };
    }

    const options: DecisionOption[] = data.options.map((opt, index) => ({
      id: `option-${index}`,
      title: opt.name,
      summary: opt.description,
      pros: opt.advantages,
      cons: opt.disadvantages,
      bestFor: opt.bestUseCases.join(", "),
      citations: [], // Citations would be extracted from output.content if needed
    }));

    return {
      success: true,
      options,
      recommendation: data.recommendation,
    };
  } catch (error) {
    console.error("Exa research fetch error:", error);
    return {
      success: false,
      options: [],
      recommendation: "",
      error: getErrorMessage(error),
    };
  }
}

// Execute research and get results in one call (with polling)
export async function executeResearch(
  question: string,
  context: string
): Promise<ResearchResult> {
  try {
    const instructions = buildResearchInstructions(question, context);

    // Create the research task
    const createResponse = await exa.research.create({
      instructions,
      model: RESEARCH_CONFIG.model,
      outputSchema: DECISION_OUTPUT_SCHEMA,
    });

    // Poll until finished
    const task = await exa.research.pollUntilFinished(
      createResponse.researchId,
      {
        pollInterval: RESEARCH_CONFIG.pollIntervalMs,
        timeoutMs: RESEARCH_CONFIG.timeoutMs,
      }
    );

    if (task.status !== "completed") {
      throw new Error(`Research ended with status: ${task.status}`);
    }

    // For completed tasks, extract data from output
    const output = (task as { output?: { parsed?: ExaResearchData } }).output;
    const data = output?.parsed as ExaResearchData | undefined;

    if (!data) {
      throw new Error("No parsed data in research output");
    }

    const options: DecisionOption[] = data.options.map((opt, index) => ({
      id: `option-${index}`,
      title: opt.name,
      summary: opt.description,
      pros: opt.advantages,
      cons: opt.disadvantages,
      bestFor: opt.bestUseCases.join(", "),
      citations: [], // Citations extracted from output if available
    }));

    return {
      success: true,
      options,
      recommendation: data.recommendation,
    };
  } catch (error) {
    console.error("Exa research execution error:", error);
    return getFallbackResult(question, error);
  }
}

// Build research instructions
function buildResearchInstructions(question: string, context: string): string {
  return `
Research and compare options for the following architectural decision:

QUESTION: ${question}

CONTEXT: ${context}

Please analyze the top technology options for this decision. For each option:
1. Provide a clear description
2. List key advantages (at least 3)
3. List key disadvantages (at least 3)
4. Describe best use cases

Focus on practical, production-ready solutions used in modern software architecture.
Consider factors like: scalability, maintainability, cost, learning curve, and ecosystem support.

Provide a recommendation with clear reasoning based on the given context.
`.trim();
}

// Fallback results when research fails
function getFallbackResult(question: string, error: unknown): ResearchResult {
  console.warn("Using fallback for research:", question);

  // Provide generic fallback based on question type
  const questionLower = question.toLowerCase();

  if (questionLower.includes("database") || questionLower.includes("sql")) {
    return {
      success: true,
      fromCache: true,
      options: [
        {
          id: "option-0",
          title: "PostgreSQL (SQL)",
          summary:
            "Robust relational database with excellent ACID compliance and advanced features",
          pros: [
            "Strong data integrity",
            "Complex queries support",
            "Mature ecosystem",
            "Great for structured data",
          ],
          cons: [
            "Horizontal scaling challenges",
            "Schema migrations required",
            "May be overkill for simple data",
          ],
          bestFor:
            "Applications with complex relationships, financial systems, reporting",
          citations: [],
        },
        {
          id: "option-1",
          title: "MongoDB (NoSQL)",
          summary:
            "Flexible document database ideal for rapid development and scaling",
          pros: [
            "Schema flexibility",
            "Easy horizontal scaling",
            "Great for unstructured data",
            "Fast development",
          ],
          cons: [
            "Weaker consistency guarantees",
            "No complex joins",
            "Can lead to data duplication",
          ],
          bestFor: "Content management, real-time analytics, rapid prototyping",
          citations: [],
        },
      ],
      recommendation: "Based on general expertise (research unavailable)",
      error: getErrorMessage(error),
    };
  }

  if (questionLower.includes("cache") || questionLower.includes("redis")) {
    return {
      success: true,
      fromCache: true,
      options: [
        {
          id: "option-0",
          title: "Redis",
          summary:
            "In-memory data store with rich data structures and persistence options",
          pros: [
            "Extremely fast",
            "Rich data types",
            "Pub/sub support",
            "Persistence options",
          ],
          cons: ["Memory-bound", "Single-threaded", "Cost at scale"],
          bestFor: "Session storage, real-time leaderboards, pub/sub messaging",
          citations: [],
        },
        {
          id: "option-1",
          title: "Memcached",
          summary: "Simple, high-performance distributed memory caching system",
          pros: [
            "Very fast",
            "Simple to use",
            "Multi-threaded",
            "Predictable performance",
          ],
          cons: [
            "No persistence",
            "Limited data types",
            "No clustering built-in",
          ],
          bestFor: "Simple key-value caching, database query caching",
          citations: [],
        },
      ],
      recommendation: "Based on general expertise (research unavailable)",
      error: getErrorMessage(error),
    };
  }

  // Generic fallback
  return {
    success: false,
    options: [],
    recommendation: "",
    error: `Research failed: ${getErrorMessage(
      error
    )}. Please try again or provide more context.`,
  };
}

// Extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error occurred";
}
