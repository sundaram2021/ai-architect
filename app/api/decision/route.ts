import type { ChatResponse, ConversationContext } from "@/types";

export async function POST(req: Request) {
  try {
    const { decisionId, optionId, optionTitle, messages, conversationContext } =
      await req.json();

    if (!decisionId || !optionId) {
      return Response.json(
        { error: "Decision ID and option ID are required" },
        { status: 400 }
      );
    }

    // Update conversation context with the decision
    const context: ConversationContext = conversationContext || {
      requirements: [],
      decisions: [],
      currentPhase: "deciding",
    };

    // Add this decision to context
    context.decisions.push({
      question: decisionId,
      selectedOption: optionTitle || optionId,
      reasoning: "User selected",
    });

    // Build conversation summary for potential architecture generation
    const _conversationSummary =
      messages
        ?.filter((m: { role: string }) => m.role === "user")
        .map((m: { content: string }) => m.content)
        .join("\n") || "";

    // Determine if we should generate architecture or continue
    // For now, after each decision, we'll check if there are more decisions needed
    // or if we can proceed to architecture

    const _decisionsSummary = context.decisions
      .map((d) => `${d.question}: ${d.selectedOption}`)
      .join("\n");

    // Generate a response acknowledging the decision
    const responseText = `Great choice! You've selected ${
      optionTitle || optionId
    }. This will be incorporated into your architecture design.`;

    return Response.json({
      mode: "continue",
      text: responseText,
      conversationContext: context,
    } satisfies ChatResponse & { conversationContext: ConversationContext });
  } catch (error) {
    console.error("Decision API error:", error);
    return Response.json(
      {
        mode: "continue",
        text: "I had trouble recording that decision. Could you try selecting again?",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
