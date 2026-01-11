import { getResearchResults } from "@/lib/exa-client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ researchId: string }> }
) {
  try {
    const { researchId } = await params;

    if (!researchId) {
      return Response.json(
        { error: "Research ID is required" },
        { status: 400 }
      );
    }

    const result = await getResearchResults(researchId);

    return Response.json({
      researchId,
      status: result.success ? "completed" : "pending",
      ...result,
    });
  } catch (error) {
    console.error("Research fetch error:", error);
    return Response.json(
      { error: "Failed to fetch research results" },
      { status: 500 }
    );
  }
}
