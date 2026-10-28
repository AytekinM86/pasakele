import { z } from "zod";
import { client, CHAT_MODEL, ChildSchema, CompanionSchema, TurnSchema, listenerSystem, turnReminder, apiError } from "@/lib/ai";
import { denied } from "@/lib/access";

const Body = z.object({
  child: ChildSchema,
  companion: CompanionSchema,
  messages: z.array(TurnSchema).min(1).max(40),
  knownCharacters: z.array(z.string().max(60)).max(15).default([]),
});

// Streams the owl's short reply as plain text.
export async function POST(request: Request) {
  const blocked = denied(request);
  if (blocked) return blocked;
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const { child, companion, messages, knownCharacters } = parsed.data;
  if (messages[0].role !== "user" || messages.at(-1)!.role !== "user") return Response.json({ error: "Invalid request." }, { status: 400 });

  try {
    const stream = client.messages.stream({
      model: CHAT_MODEL,
      max_tokens: 1024,
      output_config: { effort: "low" },
      system: listenerSystem(child, knownCharacters, companion),
      // A short operator reminder after the child's latest line keeps long chats as short and gentle as the first turns.
      messages: [...messages, { role: "system", content: turnReminder(child) }],
    });
    await stream.withResponse(); // surfaces auth / rate-limit errors before we start the response

    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") controller.enqueue(encoder.encode(event.delta.text));
          }
        } catch {
          controller.enqueue(encoder.encode("…"));
        }
        controller.close();
      },
      cancel() { stream.abort(); },
    });
    return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
  } catch (error) {
    const e = apiError(error);
    return Response.json({ error: e.message }, { status: e.status });
  }
}
