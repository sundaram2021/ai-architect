import { gateway } from "@ai-sdk/gateway";
import { generateObject } from "ai";
import { architectureSchema } from "@/lib/schemas";

const SYSTEM_PROMPT = `You are an expert system architect AI. When users describe a system, you design a clear, well-structured architecture.

Your task is to:
1. Understand the user's system requirements
2. Design an appropriate architecture with components and connections
3. Return a JSON object with nodes (components) and edges (connections)

Guidelines for creating architectures:
- Use descriptive labels for nodes (e.g., "API Gateway", "User Database", "Auth Service")
- Use meaningful types that describe the component category (e.g., "gateway", "database", "service", "queue", "cache", "storage", "client", "load-balancer")
- Create logical connections between related components
- Position nodes in a readable layout (use x: 0-800, y: 0-600 range)
- Spread nodes horizontally and vertically for clarity
- Add brief descriptions where helpful

Be concise but thorough in your architecture designs.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const userMessage = messages[messages.length - 1]?.content || "";

    const { object: architecture } = await generateObject({
      model: gateway("google/gemini-2.0-flash"),
      schema: architectureSchema,
      system: SYSTEM_PROMPT,
      prompt: userMessage,
    });

    const responseText =
      architecture.summary ||
      `I've designed an architecture with ${architecture.nodes.length} components and ${architecture.edges.length} connections.`;

    return Response.json({
      text: responseText,
      architecture,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to generate architecture" },
      { status: 500 }
    );
  }
}
