import { orchestrate } from "@/lib/agents/orchestrating-agent";
import { createEmptyGatheredState } from "@/lib/agents";
import type { AgentMessage, GatheredState } from "@/lib/agents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      message,
      messages = [],
      gatheredState,
      isReadyForDesign = false,
    } = body;

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sanitizedMessage = message.trim().slice(0, 2000);
    const safeGatheredState: GatheredState =
      gatheredState || createEmptyGatheredState();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendChunk = (type: string, data: unknown) => {
          try {
            const chunk = JSON.stringify({ type, data });
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          } catch (serializeError) {
            console.error("Failed to serialize chunk:", serializeError);
            const errorChunk = JSON.stringify({
              type: "error",
              data: { message: "Failed to process response" },
            });
            controller.enqueue(encoder.encode(`data: ${errorChunk}\n\n`));
          }
        };

        try {
          const agentStream = orchestrate(
            sanitizedMessage,
            messages as AgentMessage[],
            safeGatheredState,
            isReadyForDesign
          );

          for await (const chunk of agentStream) {
            sendChunk(chunk.type, chunk.data);
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          console.error("Orchestrator stream error:", error);

          let userMessage =
            "I encountered an issue processing your request. Please try again.";

          const errorString =
            error instanceof Error ? error.message : String(error);

          if (errorString.includes("JSON") || errorString.includes("parse")) {
            userMessage =
              "I had trouble formulating my response. Let me try again with a simpler approach.";
          } else if (
            errorString.includes("timeout") ||
            errorString.includes("TIMEOUT")
          ) {
            userMessage =
              "The request took too long. Please try a simpler question or break it into smaller parts.";
          } else if (
            errorString.includes("rate") ||
            errorString.includes("quota")
          ) {
            userMessage =
              "I'm experiencing high demand right now. Please wait a moment and try again.";
          }

          sendChunk("error", { message: userMessage });
          sendChunk("activity", {
            id: `error-${Date.now()}`,
            type: "error",
            message: "Error occurred",
            timestamp: Date.now(),
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Something went wrong. Please refresh and try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
