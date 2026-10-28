import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { client, ANALYSIS_MODEL, ChildSchema, TurnSchema, StorySchema, storyPrompt, apiError } from "@/lib/ai";
import { denied } from "@/lib/access";

const Body = z.object({ child: ChildSchema, transcript: z.array(TurnSchema).min(1).max(60) });

// Turns a finished conversation into a picture book plus gentle analysis for the parent.
export async function POST(request: Request) {
  const blocked = denied(request);
  if (blocked) return blocked;
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const { child, transcript } = parsed.data;

  try {
    const response = await client.messages.parse({
      model: ANALYSIS_MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium", format: zodOutputFormat(StorySchema) },
      messages: [{ role: "user", content: storyPrompt(child, transcript) }],
    });
    if (!response.parsed_output) return Response.json({ error: "The book couldn't be made. Try again." }, { status: 502 });
    return Response.json(response.parsed_output);
  } catch (error) {
    const e = apiError(error);
    return Response.json({ error: e.message }, { status: e.status });
  }
}
