import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { client, apiError } from "@/lib/ai";
import { denied } from "@/lib/access";
import { LANGS } from "@/lib/data";

// Translates the parent-facing notes of earlier stories when the parent switches the language,
// so the parent area is never half in one language and half in another.
const TRANSLATE_MODEL = process.env.TRANSLATE_MODEL || "claude-haiku-5-5";
const Body = z.object({ to: z.enum(["az", "en", "lt", "ru"]), items: z.array(z.string().max(1500)).min(1).max(200) });
const Out = z.object({ items: z.array(z.string()) });

export async function POST(request: Request) {
  const blocked = denied(request);
  if (blocked) return blocked;
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const { to, items } = parsed.data;

  try {
    const response = await client.messages.parse({
      model: TRANSLATE_MODEL,
      max_tokens: 16000,
      output_config: { effort: "low", format: zodOutputFormat(Out) },
      messages: [{ role: "user", content: `Translate each item into ${LANGS[to].english}. They are titles, short notes for a parent, and character names from stories a young child made up. Keep people's own names (like Dilara or Tomas) unchanged; translate words like "Grandma", "Child" or "Green dragon". If an item is already in ${LANGS[to].english}, return it unchanged. Return exactly ${items.length} items in the same order.

${JSON.stringify(items)}` }],
    });
    const out = response.parsed_output?.items;
    if (!out || out.length !== items.length) return Response.json({ error: "Translation failed." }, { status: 502 });
    return Response.json({ items: out });
  } catch (error) {
    const e = apiError(error);
    return Response.json({ error: e.message }, { status: e.status });
  }
}
