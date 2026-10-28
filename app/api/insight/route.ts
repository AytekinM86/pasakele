import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { client, ANALYSIS_MODEL, ChildSchema, InsightSchema, StorySummarySchema, insightPrompt, apiError } from "@/lib/ai";
import { denied } from "@/lib/access";

const Body = z.object({ child: ChildSchema, stories: z.array(StorySummarySchema).min(2).max(10) });

// Summarises patterns across the child's recent stories for the parent.
export async function POST(request: Request) {
  const blocked = denied(request);
  if (blocked) return blocked;
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });

  try {
    const response = await client.messages.parse({
      model: ANALYSIS_MODEL,
      max_tokens: 8000,
      output_config: { effort: "medium", format: zodOutputFormat(InsightSchema) },
      messages: [{ role: "user", content: insightPrompt(parsed.data.child, parsed.data.stories) }],
    });
    if (!response.parsed_output) return Response.json({ error: "The summary couldn't be made. Try again." }, { status: 502 });
    return Response.json(response.parsed_output);
  } catch (error) {
    const e = apiError(error);
    return Response.json({ error: e.message }, { status: e.status });
  }
}
