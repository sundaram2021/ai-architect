import Exa from "exa-js";
import type {
  ResearchAgentInput,
  ResearchAgentOutput,
  ResearchOption,
} from "./agent-types";

let exaClient: Exa | null = null;

function getExaClient(): Exa {
  if (!exaClient) {
    exaClient = new Exa(process.env.EXA_API_KEY);
  }
  return exaClient;
}

const RESEARCH_CONFIG = {
  model: "exa-research" as const,
  pollIntervalMs: 3000,
  timeoutMs: 120000,
};

const EXA_OUTPUT_SCHEMA = {
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

export async function executeResearch(
  input: ResearchAgentInput
): Promise<ResearchAgentOutput> {
  try {
    const instructions = buildResearchInstructions(input);
    const exa = getExaClient();

    const createResponse = await exa.research.create({
      instructions,
      model: RESEARCH_CONFIG.model,
      outputSchema: EXA_OUTPUT_SCHEMA,
    });

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

    const output = (task as { output?: { parsed?: ExaResearchData } }).output;
    const data = output?.parsed;

    if (!data) {
      throw new Error("No parsed data in research output");
    }

    return formatResearchOutput(input, data);
  } catch (error) {
    console.error("Research agent error:", error);
    return getFallbackResults(input);
  }
}

function buildResearchInstructions(input: ResearchAgentInput): string {
  return `
Research and compare technology options for the following architectural decision:

TOPIC: ${input.topic}
QUERY: ${input.query}
CONTEXT: ${input.context}

Please analyze the top 2-4 technology options for this decision. For each option:
1. Provide a clear, one-sentence description
2. List 2-5 key advantages
3. List 2-5 key disadvantages
4. Describe best use cases

Focus on practical, production-ready solutions used in modern software architecture.
Consider factors like: scalability, maintainability, cost, learning curve, and ecosystem support.
Provide a clear recommendation with reasoning based on the given context.
`.trim();
}

function formatResearchOutput(
  input: ResearchAgentInput,
  data: ExaResearchData
): ResearchAgentOutput {
  const options: ResearchOption[] = data.options.slice(0, 4).map((opt) => ({
    id: opt.name.toLowerCase().replace(/\s+/g, "-"),
    name: opt.name,
    summary: opt.description,
    pros: opt.advantages.slice(0, 5),
    cons: opt.disadvantages.slice(0, 5),
    bestFor: opt.bestUseCases.slice(0, 3).join(", "),
    citations: [],
  }));

  return {
    topic: input.topic,
    question: `Which ${input.topic} should we use?`,
    options,
    recommendation: `${data.recommendation}. ${data.reasoning}`,
  };
}

function getFallbackResults(input: ResearchAgentInput): ResearchAgentOutput {
  const topicLower = input.topic.toLowerCase();

  if (topicLower.includes("database") || topicLower.includes("sql")) {
    return {
      topic: input.topic,
      question: "Which database should we use?",
      options: [
        {
          id: "postgresql",
          name: "PostgreSQL",
          summary:
            "Robust relational database with excellent ACID compliance and advanced features",
          pros: [
            "Strong data integrity and ACID compliance",
            "Complex query support with powerful SQL",
            "Mature ecosystem with excellent tooling",
            "Great for structured data with relationships",
          ],
          cons: [
            "Horizontal scaling can be challenging",
            "Schema migrations required for changes",
            "May be overkill for simple key-value data",
          ],
          bestFor:
            "Applications with complex relationships, financial systems, reporting",
        },
        {
          id: "mongodb",
          name: "MongoDB",
          summary:
            "Flexible document database ideal for rapid development and scaling",
          pros: [
            "Schema flexibility for evolving data",
            "Easy horizontal scaling with sharding",
            "Great for unstructured/semi-structured data",
            "Fast development iteration",
          ],
          cons: [
            "Weaker consistency guarantees",
            "No complex joins without aggregation",
            "Can lead to data duplication",
          ],
          bestFor: "Content management, real-time analytics, rapid prototyping",
        },
      ],
      recommendation:
        "PostgreSQL for data integrity needs, MongoDB for flexibility. Based on general expertise (research unavailable).",
    };
  }

  if (topicLower.includes("cache") || topicLower.includes("redis")) {
    return {
      topic: input.topic,
      question: "Which caching solution should we use?",
      options: [
        {
          id: "redis",
          name: "Redis",
          summary:
            "In-memory data store with rich data structures and persistence options",
          pros: [
            "Extremely fast read/write operations",
            "Rich data structures (lists, sets, hashes)",
            "Pub/sub messaging support",
            "Persistence options available",
          ],
          cons: [
            "Memory-bound (expensive at scale)",
            "Single-threaded command execution",
            "Clustering complexity",
          ],
          bestFor:
            "Session storage, real-time leaderboards, pub/sub messaging, rate limiting",
        },
        {
          id: "memcached",
          name: "Memcached",
          summary: "Simple, high-performance distributed memory caching system",
          pros: [
            "Very fast for simple key-value",
            "Multi-threaded design",
            "Predictable performance",
            "Simple to operate",
          ],
          cons: [
            "No persistence",
            "Limited data types (strings only)",
            "No built-in clustering",
          ],
          bestFor:
            "Simple key-value caching, database query caching, session storage",
        },
      ],
      recommendation:
        "Redis for feature-rich caching, Memcached for simple high-throughput. Based on general expertise (research unavailable).",
    };
  }

  if (
    topicLower.includes("queue") ||
    topicLower.includes("message") ||
    topicLower.includes("kafka")
  ) {
    return {
      topic: input.topic,
      question: "Which message queue should we use?",
      options: [
        {
          id: "kafka",
          name: "Apache Kafka",
          summary:
            "Distributed event streaming platform for high-throughput data pipelines",
          pros: [
            "Extremely high throughput",
            "Durable message storage with replay",
            "Strong ordering guarantees",
            "Great for event sourcing",
          ],
          cons: [
            "Operational complexity",
            "Higher latency than in-memory queues",
            "Steeper learning curve",
          ],
          bestFor:
            "Event streaming, log aggregation, real-time analytics pipelines",
        },
        {
          id: "rabbitmq",
          name: "RabbitMQ",
          summary:
            "Reliable message broker with flexible routing and multiple protocols",
          pros: [
            "Flexible routing with exchanges",
            "Multiple protocol support (AMQP, MQTT)",
            "Easy to set up and operate",
            "Good for complex routing patterns",
          ],
          cons: [
            "Lower throughput than Kafka",
            "No built-in message replay",
            "Single point of failure without clustering",
          ],
          bestFor: "Task queues, microservice communication, complex routing",
        },
      ],
      recommendation:
        "Kafka for high-throughput streaming, RabbitMQ for traditional messaging. Based on general expertise (research unavailable).",
    };
  }

  return {
    topic: input.topic,
    question: `Which ${input.topic} technology should we use?`,
    options: [
      {
        id: "option-1",
        name: "Popular Option",
        summary:
          "Research is currently unavailable. Please try again or provide more context.",
        pros: ["Unable to research at this time"],
        cons: ["Research unavailable"],
        bestFor: "Please try again",
      },
    ],
    recommendation:
      "Research failed. Please try again with more specific requirements.",
  };
}
