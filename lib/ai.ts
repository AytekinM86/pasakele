import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { COMPANIONS, COMPANION_IDS, LANGS, THEMES, type CompanionId, type LangCode } from "./data";

// Server-only: the key is read from ANTHROPIC_API_KEY (.env.local locally, Vercel env vars in production).
export const client = new Anthropic();

// Fast model for the owl's live replies, stronger model for analysing a finished story.
export const CHAT_MODEL = process.env.CHAT_MODEL || "claude-haiku-5-5";
export const ANALYSIS_MODEL = process.env.ANALYSIS_MODEL || "claude-sonnet-5-5";

export const ChildSchema = z.object({
  name: z.string().min(1).max(30),
  age: z.number().int().min(3).max(12),
  lang: z.enum(["az", "en", "lt", "ru"]),
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
  return `You are ${name}, ${persona}, who LISTENS to stories invented by a ${child.age}-year-old child named ${child.name}. Your character shows only in your warm tone and word choice; do not start replies with sound effects or catchphrases (no "vroom", "woof" and the like), and do not talk about yourself. Speak ${L} only, at a ${child.age}-year-old's level, in a calm, natural storyteller voice.
Write plain text only: no markdown, no asterisks, no bold, no lists. Your words are read aloud to the child.
The child is the author. Never take over the story or add your own plot. Reply with 1-2 very short sentences: a warm reaction to what they said, then ONE simple open question that helps them continue (what happened next, how a character felt, what something looked like). Use the child's own character names. Never guess feelings or add details the child didn't say (if they say the dragon is big, don't call it lonely); ask instead. Vary how you start each reply. Children often type without special letters or in dialect (e.g. "yeke" = yekə = big, "cox" = çox); read them that way, and when unsure what a word means, repeat the child's own word instead of replacing it.
Never introduce scary, violent or sad content yourself. If the child's story mentions someone hurting them, being touched in a bad way, wanting to hurt themselves, or being in danger at home, stay calm and kind, say it's important to tell a grown-up they trust, and do not ask probing questions.
If the child uses a word from another language (for example Lithuanian or English inside a ${L} story), never correct them. In your reply, naturally use the ${L} word for it once, so they hear it.
${knownCharacters.length ? `Characters from ${child.name}'s earlier stories: ${knownCharacters.join(", ")}. If one comes back, greet them like an old friend.` : ""}
If the child says the story is finished, praise it and say you'll turn it into a book.`;
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
  return `A ${child.age}-year-old child invented a story while talking to a listening story friend. Conversation (Child = author):
${transcript.map(m => (m.role === "user" ? "Child: " : "Story friend: ") + m.content).join("\n")}

Fill in the fields:
- title: short, in ${L}.
- pages: 3-5 pages retelling the CHILD's story in ${L}, one or two sentences each, close to the child's own words and ideas, lightly polished, nothing added. characters: 1-3 single emoji for the characters or objects on that page.
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
