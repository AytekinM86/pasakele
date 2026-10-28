import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { COMPANIONS, COMPANION_IDS, LANGS, THEMES, type CompanionId, type LangCode } from "./data";
import { FIGURE_IDS } from "./figures";

// Server-only: the key is read from ANTHROPIC_API_KEY (.env.local locally, Vercel env vars in production).
export const client = new Anthropic();

// Fast model for the owl's live replies, stronger model for analysing a finished story.
export const CHAT_MODEL = process.env.CHAT_MODEL || "claude-haiku-5-5";
export const ANALYSIS_MODEL = process.env.ANALYSIS_MODEL || "claude-sonnet-5-5";

export const ChildSchema = z.object({
  name: z.string().min(1).max(30),
  age: z.number().int().min(3).max(12),
  lang: z.enum(["az", "en", "lt", "ru"]),
  gender: z.enum(["girl", "boy"]).optional(),
});
export type Child = z.infer<typeof ChildSchema>;

export const TurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const langName = (l: LangCode) => LANGS[l].english;

export const CompanionSchema = z.enum(COMPANION_IDS).default("owl");

export function listenerSystem(child: Child, knownCharacters: string[], companion: CompanionId = "owl") {
  const L = langName(child.lang);
  const { name, persona } = COMPANIONS[companion];
  return `You are ${name}, ${persona}. A ${child.age}-year-old ${child.gender ?? "child"} named ${child.name} is telling you a story they are making up, and your job is to be a warm, attentive listener who helps them keep going. The child is the author; the story is theirs.

How you talk
- Speak ${L}, the way a loving parent or grandparent talks to a ${child.age}-year-old at home: simple, natural, everyday ${L}. Avoid stiff or translated-sounding phrases.
- Keep it short: one or two brief sentences, then stop. Your words are read aloud, so write plain text with no markdown, lists or emoji.
- Your character shows only in your warmth and word choice. No sound effects or catchphrases ("vroom", "woof"), and don't talk about yourself.
- Sound like a real friend, not a template. Don't praise every turn ("great story", "you tell it so well"); a small, specific reaction is better. Use the child's name only now and then, not in every reply. Start each reply differently.

How you react
- Respond to what the child just said, using their own words and character names, and match the feeling of that moment: if something sad or hurtful happens in the story, be gentle and caring ("Oh no, that's sad…"), never call it interesting or nice; if it's funny, enjoy it; if it's exciting, be excited.
- Then ask one simple question about a single thing, or invite them to continue ("What happened next?"). Never ask two things at once or offer choices.
- Never add details, characters, places, feelings or plot the child didn't say; if you're curious about something, ask.
- Children type without special letters or in dialect ("yeke" = yekə = big, "cox" = çox, "hamini" = hamını, "ejdaha" = əjdaha, "meseye" = meşəyə = to the forest, "agac" = ağac); read them that way, choosing the meaning that fits the story so far, and always write the correctly spelled word yourself (your words are read aloud). If you're unsure what a word means, repeat the child's word rather than replacing it.
- When it's unclear who did something (the child writes just "cried"), ask who, don't assume.
- If the child seems confused ("what?", "?", "nə?", "ką?"), ask something even simpler, like what happened next.

Language help
- If the child uses a word from another language inside a ${L} story, don't correct, translate or explain it. Just use the ${L} word naturally in your reply once, so they hear it. Example: inside a Lithuanian story the child writes "big big"; you say "Didelis didelis drakonas! Ką jis darė?"
- If the child says they don't understand you, or keeps writing whole sentences in another language, the problem is your language, not the child: say one short kind sentence in the child's language, then ask one very simple question in ${L}.

Safety
- Never introduce scary, violent or sad content yourself. Children's stories can contain fights or sadness; acknowledge those gently without making them bigger.
- If the child describes someone really hurting them, being touched in a bad way, wanting to hurt themselves, or being in danger at home, stay calm and kind, say it's important to tell a grown-up they trust, and don't ask probing questions.
${knownCharacters.length ? `\nCharacters from ${child.name}'s earlier stories: ${knownCharacters.join(", ")}. If one comes back, greet them like an old friend.\n` : ""}
When the child says the story is finished, tell them warmly that you loved it and that you'll turn it into a book.`;
}

export const StorySchema = z.object({
  title: z.string(),
  pages: z.array(z.object({
    text: z.string(),
    setting: z.enum(["forest", "sea", "space", "castle", "city", "home", "meadow", "sky"]),
    time: z.enum(["day", "night", "sunset"]),
    characters: z.array(z.string()),
  })),
  summary: z.string(),
  themes: z.array(z.enum(THEMES)),
  emotions: z.object({ joy: z.number(), calm: z.number(), curiosity: z.number(), fear: z.number(), sadness: z.number(), anger: z.number() }),
  characters: z.array(z.object({ name: z.string(), role: z.enum(["hero", "friend", "family", "helper", "villain", "other"]) })),
  parentNote: z.string(),
  foreignWords: z.array(z.object({ word: z.string(), lang: z.string(), native: z.string(), gloss: z.string() })),
  concern: z.enum(["none", "watch", "talk"]),
});

export function storyPrompt(child: Child, transcript: z.infer<typeof TurnSchema>[]) {
  const L = langName(child.lang);
  return `A ${child.age}-year-old ${child.gender ?? "child"} named ${child.name} invented a story while talking to a listening story friend. Conversation (Child = author):
${transcript.map(m => (m.role === "user" ? "Child: " : "Story friend: ") + m.content).join("\n")}

Fill in the fields:
- title: short, in ${L}.
- pages: 3-5 pages retelling the CHILD's story in ${L}, one or two sentences each, close to the child's own words and ideas, lightly polished, nothing added. characters: 1-3 picture ids for who or what is on that page, chosen from: ${FIGURE_IDS.join(", ")} (when the child tells the story as "I", draw them as ${child.gender ?? "girl or boy, whichever the story makes clear"}; a big truck like a Kamaz is truck). Only for an object that isn't in that list (a key, a cake, a tree) use a single emoji instead.
- summary: one sentence in ${L} for the parent.
- themes: 1-4 themes.
- emotions: intensity 0-3 of each feeling in the child's story.
- characters: up to 5 characters with their role.
- parentNote: 1-2 gentle sentences in ${L} on what the story suggests about the child's feelings or interests. Observational, never a diagnosis, no clinical words.
- foreignWords: words the CHILD said in a language other than ${L} (e.g. Lithuanian, English, Russian), each with the language name in English, the ${L} word and the English meaning. Ignore people's names. Empty if none.
- concern: "talk" only if the child describes real harm, abuse, self-harm or danger; "watch" if strong fear, sadness or anger dominates; otherwise "none".`;
}

export const InsightSchema = z.object({
  headline: z.string(),
  observations: z.array(z.string()),
  tryThis: z.array(z.string()),
});

export const StorySummarySchema = z.object({
  createdAt: z.number(),
  title: z.string().max(200),
  summary: z.string().max(1000),
  themes: z.array(z.string()).max(10),
  emotions: z.record(z.string(), z.number()),
  parentNote: z.string().max(1000),
});

export function insightPrompt(child: Child, stories: z.infer<typeof StorySummarySchema>[]) {
  return `You help a parent understand recurring patterns in stories their ${child.age}-year-old invents. Stories, oldest first:
${stories.map(s => `- ${new Date(s.createdAt).toISOString().slice(0, 10)} "${s.title}": ${s.summary} Themes: ${s.themes.join(", ")}. Emotions: ${JSON.stringify(s.emotions)}. Note: ${s.parentNote}`).join("\n")}
Write all text in ${langName(child.lang)}. headline: one sentence on the main pattern over time. observations: 3 short sentences referencing specific stories or dates. tryThis: 2 gentle conversation starters or activities for the parent.
Be warm and observational. Never diagnose or use clinical terms. If something worrying repeats, suggest talking with the child and, if the parent is worried, a child psychologist.`;
}

// Maps SDK errors to a short message and status the browser can show.
export function apiError(error: unknown) {
  if (!process.env.ANTHROPIC_API_KEY) return { status: 500, message: "The server has no ANTHROPIC_API_KEY. Add it in Vercel → Settings → Environment Variables, then redeploy." };
  if (error instanceof Anthropic.AuthenticationError) return { status: 500, message: "The server's Claude API key is missing or invalid." };
  if (error instanceof Anthropic.RateLimitError) return { status: 429, message: "Too many requests right now. Wait a minute and try again." };
  if (error instanceof Anthropic.BadRequestError) return { status: 400, message: "Claude couldn't process this request." };
  if (error instanceof Anthropic.APIError) return { status: 502, message: "Claude is unavailable right now. Try again in a moment." };
  return { status: 500, message: "Something went wrong on the server." };
}
