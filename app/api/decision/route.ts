import type { ChatResponse, ConversationContext } from "@/types";

export async function POST(req: Request) {
  try {
    const { decisionId, optionId, optionTitle, conversationContext } =
      await req.json();

    if (!decisionId || !optionId) {
      return Response.json(
        { error: "Decision ID and option ID are required" },
        { status: 400 }
      );
    }

    const context: ConversationContext = conversationContext || {
      requirements: [],
      decisions: [],
      currentPhase: "deciding",
    };

    context.decisions.push({
      question: decisionId,
      selectedOption: optionTitle || optionId,
      reasoning: "User selected",
    });
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
