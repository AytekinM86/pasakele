import { z } from "zod";
import { denied } from "@/lib/access";

// The owl's voice: ElevenLabs text-to-speech. The key stays on the server (ELEVENLABS_API_KEY).
// Default: an Azerbaijani voice from the ElevenLabs Voice Library (says "balaca" with a proper c).
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "IVMbfLv3KqUc4qDj6Yif";
const MODEL_ID = process.env.ELEVENLABS_MODEL || "eleven_v4";

const Body = z.object({ text: z.string().min(1).max(600), lang: z.enum(["az", "en", "lt", "ru"]) });

// Tells the browser whether the server voice is set up, so it can fall back to the browser's own voice.
export async function GET() {
  return Response.json({ enabled: !!process.env.ELEVENLABS_API_KEY });
}

export async function POST(request: Request) {
  const blocked = denied(request);
  if (blocked) return blocked;
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return Response.json({ error: "Voice is not set up." }, { status: 501 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({ text: parsed.data.text, model_id: MODEL_ID, language_code: parsed.data.lang }),
  });
  if (!res.ok || !res.body) return Response.json({ error: "The owl's voice is unavailable right now." }, { status: 502 });
  return new Response(res.body, { headers: { "content-type": "audio/mpeg", "cache-control": "no-store" } });
}
