import { gateway } from "@ai-sdk/gateway";
import { generateObject } from "ai";
import { designAgentOutputSchema } from "@/lib/schemas/agent-schemas";
import type { DesignAgentInput, DesignAgentOutput } from "./agent-types";

const DESIGN_SYSTEM_PROMPT = `You are a Design Agent - an expert system architect that converts requirements into visual architecture diagrams.

## YOUR ROLE
You receive structured requirements from the Orchestrating Agent and output a tier-based architecture diagram.
You do NOT interact with users directly. Your output is used to render a canvas visualization.

## TIER SYSTEM (CRITICAL)
You MUST assign each node a tier (1-5) for automatic layout:
- Tier 1: CLIENTS - Web browsers, mobile apps, desktop apps, external users
- Tier 2: EDGE - CDN, DNS, WAF, external APIs, push notification services
- Tier 3: GATEWAY - Load balancers, API gateways, reverse proxies, auth services
- Tier 4: SERVICES - Application servers, microservices, workers, background jobs
- Tier 5: DATA - Databases, caches, message queues, object storage

## NODE TYPES
Use these exact types for proper icon rendering:
- "client" - Web/Mobile/Desktop clients
- "cdn" - CDN, DNS, WAF
- "gateway" - API Gateway, Load Balancer
- "server" - Web servers, application servers
- "service" - Microservices, workers
- "api" - REST/GraphQL endpoints
- "queue" - Message queues (Kafka, RabbitMQ, SQS)
- "cache" - Cache layers (Redis, Memcached)
- "database" - SQL/NoSQL databases
- "storage" - Object storage (S3, GCS, Azure Blob)
- "auth" - Authentication services
- "monitoring" - Monitoring, logging, tracing
- "external" - Third-party services

## TECHNOLOGY FIELD
Always specify the technology when known:
- Databases: "postgresql", "mongodb", "mysql", "dynamodb", "redis"
- Queues: "kafka", "rabbitmq", "sqs", "redis-streams"
- Gateways: "nginx", "kong", "aws-alb", "cloudflare"
- Clients: "react", "nextjs", "flutter", "ios", "android"
- Services: "nodejs", "python", "go", "java"

## OUTPUT RULES

1. MINIMUM NODES: 5 (a meaningful architecture needs at least 5 components)
2. MAXIMUM NODES: 15 (keep it focused and readable)
3. EDGE CONNECTIONS: Every node (except tier 1) should have at least one incoming connection
4. ID FORMAT: Use kebab-case (e.g., "user-service", "postgres-primary")
5. LABEL FORMAT: Use technology name or clear component name
6. SUMMARY: 2-3 sentences describing the architecture

## EXAMPLE OUTPUT

For a chat application with PostgreSQL, Redis cache, and React frontend:

{
  "nodes": [
    { "id": "web-client", "label": "React App", "type": "client", "tier": 1, "technology": "react" },
    { "id": "mobile-client", "label": "Mobile App", "type": "client", "tier": 1, "technology": "flutter" },
    { "id": "cdn", "label": "CloudFlare", "type": "cdn", "tier": 2, "technology": "cloudflare" },
    { "id": "api-gateway", "label": "API Gateway", "type": "gateway", "tier": 3, "technology": "kong" },
    { "id": "chat-service", "label": "Chat Service", "type": "service", "tier": 4, "technology": "nodejs" },
    { "id": "user-service", "label": "User Service", "type": "service", "tier": 4, "technology": "nodejs" },
    { "id": "redis-cache", "label": "Redis", "type": "cache", "tier": 5, "technology": "redis" },
    { "id": "postgres-db", "label": "PostgreSQL", "type": "database", "tier": 5, "technology": "postgresql" }
  ],
  "edges": [
    { "id": "e1", "source": "web-client", "target": "cdn" },
    { "id": "e2", "source": "mobile-client", "target": "cdn" },
    { "id": "e3", "source": "cdn", "target": "api-gateway" },
    { "id": "e4", "source": "api-gateway", "target": "chat-service" },
    { "id": "e5", "source": "api-gateway", "target": "user-service" },
    { "id": "e6", "source": "chat-service", "target": "redis-cache" },
    { "id": "e7", "source": "chat-service", "target": "postgres-db" },
    { "id": "e8", "source": "user-service", "target": "postgres-db" }
  ],
  "summary": "A scalable chat architecture with React and Flutter clients, Kong API gateway for routing, dedicated chat and user microservices, Redis for real-time message caching, and PostgreSQL for persistent storage."
}

## WHAT NOT TO DO (ANTI-PATTERNS)

1. DON'T create generic labels like "Database 1" or "Service A" - be specific
2. DON'T skip tiers - if you have tier 1 and tier 4, include tier 3
3. DON'T create disconnected nodes - every component should connect to something
4. DON'T overcomplicate - a chat app doesn't need 15 microservices
5. DON'T forget the technology field - it's used for icon rendering
6. DON'T use absolute positions - only use tiers (1-5)
7. DON'T create duplicate IDs - each node must have a unique ID`;

export async function generateDesign(
  input: DesignAgentInput
): Promise<DesignAgentOutput> {
  const prompt = buildDesignPrompt(input);

  const { object } = await generateObject({
    model: gateway("google/gemini-2.0-flash"),
    schema: designAgentOutputSchema,
    system: DESIGN_SYSTEM_PROMPT,
    prompt,
  });

  return validateDesign(object);
}

function buildDesignPrompt(input: DesignAgentInput): string {
  const decisionsText =
    input.decisions.length > 0
      ? input.decisions
          .map(
            (d) =>
              `- ${d.topic}: ${d.choice}${
                d.reasoning ? ` (${d.reasoning})` : ""
              }`
          )
          .join("\n")
      : "No specific technology decisions made - use sensible defaults";

  const constraintsText =
    input.constraints && input.constraints.length > 0
      ? input.constraints.map((c) => `- ${c}`).join("\n")
      : "No specific constraints";

  return `
Generate an architecture diagram for the following system:

## System Type
${input.systemType}

## Scale
${input.scale}

## Requirements
${input.requirements.map((r) => `- ${r}`).join("\n")}

## Technology Decisions
${decisionsText}

## Constraints
${constraintsText}

Create a clear, production-ready architecture with appropriate components and connections.
Use the tier system (1-5) for positioning and specify technologies for each component.
`;
}

function validateDesign(design: DesignAgentOutput): DesignAgentOutput {
  const nodeIds = new Set(design.nodes.map((n) => n.id));

  const validEdges = design.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  const validNodes = design.nodes.map((node) => ({
    ...node,
    tier: Math.min(5, Math.max(1, node.tier || 4)) as 1 | 2 | 3 | 4 | 5,
  }));

  return {
    nodes: validNodes,
    edges: validEdges,
    summary: design.summary,
  };
}
