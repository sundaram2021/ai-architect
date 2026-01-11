import { createResearchTask, getResearchResults } from "@/lib/exa-client";

export async function POST(req: Request) {
  try {
    const { question, context } = await req.json();

    if (!question || !context) {
      return Response.json(
        { error: "Question and context are required" },
        { status: 400 }
      );
    }

    const result = await createResearchTask(question, context);

    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    return Response.json({
      researchId: result.researchId,
      status: "pending",
    });
  } catch (error) {
    console.error("Research API error:", error);
    return Response.json(
      { error: "Failed to create research task" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const researchId = url.searchParams.get("researchId");

  if (!researchId) {
    return Response.json({ error: "Research ID is required" }, { status: 400 });
  }

  try {
    const result = await getResearchResults(researchId);

    return Response.json({
      status: result.success ? "completed" : "pending",
      ...result,
    });
  } catch (error) {
    console.error("Research status error:", error);
    return Response.json(
      { error: "Failed to get research status" },
      { status: 500 }
    );
  }
}
