"use client";
/* eslint-disable @next/next/no-img-element -- stickers are tiny inline SVG data URIs, next/image adds nothing */

import { useCallback, useEffect, useRef, useState } from "react";
import { COMPANIONS, COMPANION_IDS, GENDER_TX, LANGS, PICK_FRIEND, SETUP, SPINES, STARTERS, THEMES, TX, continueGreet, detectLang, greet, type Child, type CompanionId, type Gender, type Insight, type LangCode, type Story, type Turn } from "@/lib/data";
import { Character } from "./Characters";
import { ALL_STICKERS, GIFTS, REWARD_TX, giftsFor, stickerSrc, stickersFrom, type GiftId } from "@/lib/rewards";
import { P } from "@/lib/parentText";
import { store } from "@/lib/store";
import { paint } from "@/lib/paint";
import { NEED_CODE, post } from "@/lib/api";
import { ParentArea } from "./ParentArea";

type Mode = "child" | "parent";

// Minimal typing for the browser's speech recognition (Chrome exposes it as webkitSpeechRecognition).
type Recognition = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null };
const getRecognition = (): (new () => Recognition) | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

export default function Pasakele() {
  // This component only renders in the browser (see ClientApp), so localStorage can seed state directly.
  const [mode, setMode] = useState<Mode>("child");
  const [child, setChild] = useState<Child | null>(store.child);
  const [stories, setStories] = useState<Story[]>(store.stories);
  const [insight, setInsight] = useState<Insight | null>(store.insight);
  const [speakOn, setSpeakOn] = useState(store.speak);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => ("speechSynthesis" in window ? speechSynthesis.getVoices() : []));

  // When a new version is deployed, an open page refreshes itself the next time it's idle
  // (no chat in progress, no celebration or dialog), so old screens never talk to a newer server.
  useEffect(() => {
    let first: string | null = null;
    const check = async () => {
      try {
        const { v } = await (await fetch("/api/version", { cache: "no-store" })).json();
        if (first === null) first = v;
        else if (v !== first && !document.querySelector(".bub.kid, .party, .modal-back, .book")) location.reload();
      } catch { /* offline: try again later */ }
    };
    check();
    const onShow = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onShow);
    const timer = setInterval(check, 5 * 60 * 1000);
    return () => { document.removeEventListener("visibilitychange", onShow); clearInterval(timer); };
  }, []);

  const [needCode, setNeedCode] = useState(false);
  useEffect(() => {
    const ask = () => setNeedCode(true);
    window.addEventListener(NEED_CODE, ask);
    return () => window.removeEventListener(NEED_CODE, ask);
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVoices(speechSynthesis.getVoices());
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  // The owl speaks with the ElevenLabs voice when the server has it, otherwise with a matching browser voice.
  const [serverVoice, setServerVoice] = useState(false);
  useEffect(() => { fetch("/api/speak").then(r => r.json()).then(r => setServerVoice(!!r.enabled)).catch(() => {}); }, []);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const lang: LangCode = child?.lang || "en";
  // The page language drives correct capitals in uppercase labels (Azerbaijani i → İ) and screen-reader voices.
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const voice = voices.find(v => v.lang?.toLowerCase().startsWith(lang));
  const speak = useCallback(async (t: string) => {
    if (!speakOn) return;
    audioRef.current?.pause();
    try { speechSynthesis.cancel(); } catch { /* none */ }
    if (serverVoice) {
      try {
        const res = await post("/api/speak", { text: t.slice(0, 600), lang: detectLang(t, lang) });
        if (res.ok) {
          const url = URL.createObjectURL(await res.blob());
          const audio = new Audio(url);
          audio.onended = () => URL.revokeObjectURL(url);
          audioRef.current = audio;
          await audio.play();
          return;
        }
      } catch { /* fall back to the browser voice */ }
    }
    if (!voice) return;
    try { const u = new SpeechSynthesisUtterance(t.replace(/\[[a-zA-Z ]{2,20}\]\s*/g, "")); u.voice = voice; u.lang = voice.lang; u.rate = 0.95; u.pitch = 1.15; speechSynthesis.speak(u); } catch { /* no speech */ }
  }, [voice, speakOn, serverVoice, lang]);

  const saveChild = (c: Child) => { setChild(c); store.saveChild(c); };
  const addStory = (s: Story) => { setStories(prev => { const next = [...prev, s]; store.saveStories(next); return next; }); };
  const saveInsight = (i: Insight) => { setInsight(i); store.saveInsight(i); };

  const switchMode = (m: Mode) => { setMode(m); audioRef.current?.pause(); try { speechSynthesis.cancel(); } catch { /* none */ } };

  return (
    <>
      <header className="top"><div className="top-in">
        <div className="brand"><OwlMark />Pasakėlė</div>
        <div className="modes" role="group" aria-label="Mode">
          <button aria-pressed={mode === "child"} onClick={() => switchMode("child")}>{P[lang].storyTime}</button>
          <button aria-pressed={mode === "parent"} onClick={() => switchMode("parent")}>{P[lang].forParents}</button>
        </div>
      </div></header>
      <main><div className="wrap">
        {needCode && <CodeForm lang={lang} onDone={() => setNeedCode(false)} />}
        {mode === "parent"
          ? <ParentArea child={child} stories={stories} insight={insight} onInsight={saveInsight} onChild={saveChild} />
          : !child ? <Setup onDone={saveChild} />
          : <StoryTime child={child} stories={stories} onStory={addStory} speak={speak} canSpeak={serverVoice || !!voice}
              onCompanion={c => saveChild({ ...child, companion: c })}
              speakOn={speakOn} setSpeakOn={v => { setSpeakOn(v); store.saveSpeak(v); if (!v) { audioRef.current?.pause(); try { speechSynthesis.cancel(); } catch { /* none */ } } }} />}
      </div></main>
    </>
  );
}

// Shown as a dialog over the page when the server asks for the family code (APP_ACCESS_CODE). Entered once per device by a parent.
const CODE_TX: Record<LangCode, { eb: string; h: string; p: string; save: string; after: string }> = {
  az: { eb: "Valideyn üçün", h: "Ailə kodunu daxil edin", p: "Bu kod yad adamların appdan istifadə etməsinin qarşısını alır. Hər cihazda bir dəfə daxil edilir.", save: "Yadda saxla", after: "Saxladıqdan sonra mesajı yenidən göndərin." },
  en: { eb: "For parents", h: "Enter the family code", p: "This keeps strangers from using the app. A parent enters it once on each device.", save: "Save", after: "After saving, send your message again." },
  lt: { eb: "Tėvams", h: "Įveskite šeimos kodą", p: "Kodas neleidžia svetimiems naudotis programėle. Kiekviename įrenginyje jis įvedamas vieną kartą.", save: "Išsaugoti", after: "Išsaugoję dar kartą išsiųskite žinutę." },
  ru: { eb: "Для родителей", h: "Введите семейный код", p: "Код не даёт посторонним пользоваться приложением. Вводится один раз на каждом устройстве.", save: "Сохранить", after: "После сохранения отправьте сообщение ещё раз." },
};
function CodeForm({ lang, onDone }: { lang: LangCode; onDone: () => void }) {
  const [code, setCode] = useState("");
  const t = CODE_TX[lang];
  return (
    <div className="modal-back">
      <section className="card modal" role="dialog" aria-modal="true" aria-labelledby="code-h">
        <span className="eyebrow">{t.eb}</span><h2 id="code-h">{t.h}</h2>
        <p className="muted">{t.p}</p>
        <form className="row" onSubmit={e => { e.preventDefault(); if (code.trim()) { store.saveCode(code.trim()); onDone(); } }}>
          <input id="family-code" className="gate-input" style={{ width: 200 }} type="password" autoComplete="off" autoFocus aria-label={t.h} value={code} onChange={e => setCode(e.target.value)} />
          <button className="btn teal">{t.save}</button>
        </form>
        <p className="muted" style={{ fontSize: ".85rem" }}>{t.after}</p>
      </section>
    </div>
  );
}

function OwlMark() {
  return <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="21" r="16" fill="var(--teal)" /><circle cx="14" cy="18" r="5.5" fill="var(--paper)" /><circle cx="26" cy="18" r="5.5" fill="var(--paper)" /><circle cx="14" cy="18" r="2.4" fill="var(--ink)" /><circle cx="26" cy="18" r="2.4" fill="var(--ink)" /><path d="M18 24l2 3 2-3z" fill="var(--sun)" /></svg>;
}

function Setup({ onDone }: { onDone: (c: Child) => void }) {
  const [lang, setLang] = useState<LangCode>("az");
  const [name, setName] = useState("");
  const [age, setAge] = useState(6);
  const [gender, setGender] = useState<Gender | "">("");
  const t = SETUP[lang], g = GENDER_TX[lang];
  return (
    <section className="card" style={{ alignItems: "center", textAlign: "center" }}>
      <Character id="owl" /><span className="eyebrow">{t.eb}</span><h1 style={{ fontSize: "1.9rem" }}>{t.h}</h1>
      <p className="muted" style={{ maxWidth: "50ch" }}>{t.p}</p>
      <form className="row" style={{ justifyContent: "center", alignItems: "flex-end" }}
        onSubmit={e => { e.preventDefault(); if (name.trim()) onDone({ name: name.trim(), age, lang, gender: gender || undefined }); }}>
        <label className="f">{t.l}<select id="c-lang" value={lang} onChange={e => setLang(e.target.value as LangCode)}>
          {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
        <label className="f">{t.n}<input id="c-name" required maxLength={20} value={name} onChange={e => setName(e.target.value)} placeholder={t.ph} /></label>
        <label className="f">{t.a}<select id="c-age" value={age} onChange={e => setAge(+e.target.value)}>
          {[3, 4, 5, 6, 7, 8, 9, 10].map(a => <option key={a}>{a}</option>)}</select></label>
        <label className="f">{g.label}<select id="c-gender" value={gender} onChange={e => setGender(e.target.value as Gender | "")}>
          <option value="">{g.none}</option><option value="girl">{g.girl}</option><option value="boy">{g.boy}</option></select></label>
        <button className="btn sun big" type="submit">{t.go}</button>
      </form>
    </section>
  );
}

// The owl's replies carry voice tags like [excited] for ElevenLabs. Speech keeps them; the screen shows plain text
// (no tags, no markdown marks, and no half-streamed tag at the end).
const VOICE_TAG = /\[[a-zA-Z ]{2,20}\]\s*/g;
const forSpeech = (t: string) => t.replace(/[*_#`]+/g, "").trim();
const plain = (t: string) => forSpeech(t).replace(VOICE_TAG, "").replace(/\[[a-zA-Z ]*$/, "");

const dayMonthYear = (t: number) => { const d = new Date(t); return [d.getDate(), d.getMonth() + 1].map(x => String(x).padStart(2, "0")).join(".") + "." + d.getFullYear(); };

function StoryTime({ child, stories, onStory, speak, canSpeak, speakOn, setSpeakOn, onCompanion }: {
  child: Child; stories: Story[]; onStory: (s: Story) => void; speak: (t: string) => void;
  canSpeak: boolean; speakOn: boolean; setSpeakOn: (v: boolean) => void; onCompanion: (c: CompanionId) => void;
}) {
  const tx = TX[child.lang];
  const companion: CompanionId = child.companion || "owl";
  const [chat, setChat] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [making, setMaking] = useState(false);
  const [err, setErr] = useState("");
  const [book, setBook] = useState<Story | null>(null);
  const [album, setAlbum] = useState(false);
  const [continuing, setContinuing] = useState<Story | null>(null); // the book whose next part is being told
  const previous = continuing ? { title: continuing.title, recap: continuing.pages.slice(-3).map(p => p.text).join(" ").slice(0, 1500) } : undefined;
  const [party, setParty] = useState<Celebration | null>(null);
  const rt = REWARD_TX[child.lang], gifts = giftsFor(stories.length);
  const [listening, setListening] = useState(false);
  const recRef = useRef<Recognition | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const Rec = getRecognition();

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [chat]);

  // The input grows with the text (up to the CSS max-height) so long sentences stay readable.
  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { const ta = taRef.current; if (!ta) return; ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }, [draft]);

  const known = [...new Set(stories.flatMap(s => s.characters.map(c => c.name)))].slice(-15);

  async function send(text: string) {
    text = text.trim();
    if (!text || busy) return;
    const history: Turn[] = [...chat, { role: "user", content: text }];
    setChat([...history, { role: "assistant", content: "…" }]); setDraft(""); setBusy(true); setErr("");
    try {
      const res = await post("/api/chat", { child, companion, messages: history, knownCharacters: known, previous });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => null))?.error || "The owl couldn't answer just now. Try again.");
      const reader = res.body.getReader(), dec = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += dec.decode(value, { stream: true });
        setChat([...history, { role: "assistant", content: plain(reply) }]);
      }
      const shown = plain(reply).trim() || "…";
      setChat([...history, { role: "assistant", content: shown }]);
      speak(forSpeech(reply) || shown);
    } catch (e) {
      setChat(history.slice(0, -1)); setDraft(text);
      if ((e as Error).message !== "🔒") setErr((e as Error).message); // the family-code dialog explains itself
    }
    setBusy(false);
  }

  async function finish() {
    const kidLines = chat.filter(m => m.role === "user").map(m => m.content);
    if (kidLines.join(" ").split(/\s+/).length < 8) { setErr(tx.more); return; }
    setBusy(true); setMaking(true); setErr("");
    try {
      const res = await post("/api/story", { child, transcript: chat.slice(-60), previous });
      const r = await res.json();
      if (!res.ok) throw new Error(r.error || "The book couldn't be made. Try again.");
      const words = new Set(kidLines.join(" ").toLowerCase().match(/[\p{L}']+/gu) || []);
      const now = Date.now();
      const st: Story = {
        id: "s_" + now, createdAt: now, lang: child.lang, title: String(r.title || "My story").slice(0, 80),
        pages: (r.pages || []).slice(0, 5).map((p: Story["pages"][number]) => ({ ...p, characters: (p.characters || []).slice(0, 3) })),
        summary: r.summary || "", themes: (r.themes || []).filter((t: string) => (THEMES as readonly string[]).includes(t)).slice(0, 4),
        emotions: r.emotions, characters: (r.characters || []).slice(0, 5), parentNote: r.parentNote || "",
        foreignWords: (r.foreignWords || []).slice(0, 20), concern: r.concern || "none",
        words: words.size, wordList: [...words].slice(0, 400), transcript: chat.slice(-40), prevId: continuing?.id,
      };
      if (!st.pages.length) st.pages = [{ text: kidLines.join(" "), setting: "meadow", time: "day", characters: ["⭐"] }];
      const had = stickersFrom(stories), n = stories.length + 1;
      const fresh = [...stickersFrom([st])].filter(id => !had.has(id));
      const gift = GIFTS.find(g => g.at === n)?.id;
      onStory(st); setChat([]); setContinuing(null); setBook(st); setParty({ n, fresh, gift });
      speak(rt.nthBook(n) + (gift ? " " + rt.present(COMPANIONS[companion].name, rt.gifts[gift]) : ""));
    } catch (e) { if ((e as Error).message !== "🔒") setErr((e as Error).message); }
    setBusy(false); setMaking(false);
  }

  function toggleMic() {
    if (!Rec) { setErr(tx.nomic); return; }
    if (listening) { recRef.current?.stop(); return; }
    const rec = new Rec();
    rec.lang = LANGS[child.lang].bcp47; rec.interimResults = true; rec.continuous = false;
    let finalText = "";
    rec.onresult = e => {
      let interim = ""; finalText = "";
      for (let i = 0; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript; }
      setDraft(finalText + interim);
    };
    rec.onerror = () => setErr(tx.nomic);
    rec.onend = () => { setListening(false); if (finalText.trim()) send(finalText); };
    recRef.current = rec; setErr(""); setListening(true);
    try { speechSynthesis.cancel(); } catch { /* none */ }
    rec.start();
  }

  if (book) return <Book story={book} tx={tx} speak={speak} canSpeak={canSpeak} onClose={() => { setBook(null); setParty(null); }}
    onContinue={() => { setContinuing(book); setChat([]); setBook(null); setParty(null); }}
    next={stories.find(s => s.prevId === book.id)} onNext={s => { setBook(s); setParty(null); }}
    banner={party && <Party party={party} rt={rt} friend={companion} gifts={gifts} />} />;
  const have = stickersFrom(stories);
  if (album) return <Album have={have} rt={rt} back={tx.back} onClose={() => setAlbum(false)} />;

  return (
    <div className="story-layout">
      <div className="story-center">
      {(
        <section className={`friends ${chat.length ? "compact" : ""}`} aria-labelledby="pick-h">
          <h2 id="pick-h">{PICK_FRIEND[child.lang]}</h2>
          <div className="friend-row">{COMPANION_IDS.map(id => (
            <button key={id} className="friend" aria-pressed={companion === id} onClick={() => onCompanion(id)}>
              <Character id={id} className="friend-pic" gifts={gifts} /><span>{COMPANIONS[id].name}</span>
            </button>))}</div>
        </section>
      )}
      <div className={`stage ${busy || listening ? "thinking" : ""}`}><Character id={companion} gifts={gifts} />
        <div className="chat" aria-live="polite">
          <div className="say-row"><Character id={companion} className="mini" /><div className="bub owl-say">{making ? tx.making : continuing ? continueGreet(child.lang, continuing.title) : greet(child.lang, child.name, companion)}</div></div>
          {chat.map((m, i) => m.role === "user"
            ? <div key={i} className="bub kid">{m.content}</div>
            : <div key={i} className="say-row"><Character id={companion} className="mini" /><div className="bub owl-say">{m.content}</div></div>)}
          <div ref={endRef} style={{ scrollMarginBottom: 200 }} />
        </div>
      </div>
      {!chat.length && !continuing && <div className="starters">{STARTERS[child.lang].map(s => <button key={s} className="starter" onClick={() => send(s)}>{s}</button>)}</div>}
      <div className="dock">
      <div className="composer">
        <button className={`mic ${listening ? "on" : ""}`} onClick={toggleMic} disabled={busy} aria-label={tx.mic} title={tx.mic}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
        </button>
        <textarea id="kid" ref={taRef} rows={1} value={draft} placeholder={listening ? tx.listening : tx.ph} disabled={busy}
          onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); } }} />
        <button className="btn teal" onClick={() => send(draft)} disabled={busy}>{tx.tell}</button>
      </div>
      {err && <p className="note" role="alert">{err}</p>}
      <div className="row">
        <button className="btn sun big" onClick={finish} disabled={busy || !chat.length}>{tx.end}</button>
        {canSpeak && <button className="btn" aria-pressed={speakOn} onClick={() => setSpeakOn(!speakOn)}>{speakOn ? tx.on : tx.off}</button>}
        {(chat.length > 0 || continuing) && <button className="btn" onClick={() => { setChat([]); setErr(""); setContinuing(null); }}>{tx.again}</button>}
      </div>
      </div>
      {!canSpeak && <p className="note">{tx.novoice}</p>}
      </div>

      {/* Wide screens: album on the left, bookshelf on the right. Narrow screens: both below the chat. */}
      <aside className="side side-left">
        <button className="card album-card" onClick={() => setAlbum(true)}>
          <h2>{rt.albumBtn}</h2>
          <div className="album-mini">{[...have].slice(-9).map(id => <img key={id} src={stickerSrc(id)} alt="" />)}
            {Array.from({ length: Math.max(0, 9 - have.size) }, (_, i) => <span key={i} className="slot" />)}</div>
          <span className="muted album-count">{rt.collected(have.size, ALL_STICKERS.length)}</span>
        </button>
      </aside>
      {stories.length > 0 && (
        <aside className="side side-right">
          <section className="card"><h2>{tx.shelf}</h2>
            <div className="shelf">{stories.slice().reverse().map((s, i) => (
              <button key={s.id} className="spine" style={{ background: SPINES[i % SPINES.length] }} onClick={() => setBook(s)}>
                {s.title}<small>{dayMonthYear(s.createdAt)}</small></button>))}</div>
          </section>
        </aside>
      )}
    </div>
  );
}

export function Book({ story, tx, speak, canSpeak, onClose, banner, onContinue, next, onNext }: {
  story: Story; tx: Record<string, string>; speak: (t: string) => void; canSpeak: boolean; onClose: () => void; banner?: React.ReactNode;
  onContinue?: () => void; next?: Story; onNext?: (s: Story) => void;
}) {
  const [page, setPage] = useState(0);
  const cv = useRef<HTMLCanvasElement>(null);
  const p = story.pages[page] || story.pages[0];
  useEffect(() => {
    const draw = () => { if (cv.current) paint(cv.current, p, (story.createdAt % 997) + page * 31, draw); };
    draw();
  }, [p, page, story.createdAt]);
  const last = page === story.pages.length - 1;
  return (
    <div className="book">
      <div className="row" style={{ justifyContent: "space-between" }}><button className="btn" onClick={onClose}>{tx.back}</button>{story.example && <span className="ex">Example story</span>}</div>
      {banner}
      <h1 style={{ fontSize: "clamp(1.6rem,6vw,2.3rem)" }}>{story.title}</h1>
      <article className="page"><canvas ref={cv} aria-label={`Illustration: ${p.setting} at ${p.time}`} /><p className="txt">{p.text}</p></article>
      <div className="pager">
        <button className="btn" onClick={() => setPage(page - 1)} disabled={page === 0}>{tx.prev}</button>
        <div className="dots">{story.pages.map((_, i) => <i key={i} className={i === page ? "on" : ""} />)}</div>
        <button className="btn sun" onClick={() => { if (last) onClose(); else { setPage(page + 1); speak(story.pages[page + 1].text); } }}>{last ? tx.fin : tx.next}</button>
      </div>
      <div className="row">
        {canSpeak && <button className="btn" onClick={() => speak(p.text)}>{tx.read}</button>}
        {last && next && onNext && <button className="btn teal" onClick={() => onNext(next)}>{tx.nextPart}</button>}
        {last && !next && onContinue && !story.example && <button className="btn sun" onClick={onContinue}>{tx.cont}</button>}
      </div>
    </div>
  );
}

type Celebration = { n: number; fresh: string[]; gift?: GiftId };

// Shown on top of a freshly made book: which book this is, new stickers, and a present for the friend.
function Party({ party, rt, friend, gifts }: { party: Celebration; rt: (typeof REWARD_TX)[LangCode]; friend: CompanionId; gifts: GiftId[] }) {
  return (
    <section className="party" role="status">
      <div className="confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.15}s`, background: ["#ffc93c", "#ff7a9c", "#4fc4c0", "#7ea6ff", "#9b59d6"][i % 5] }} />)}</div>
      <div className="party-in">
        {party.gift && <Character id={friend} className="party-friend" gifts={gifts} />}
        <div>
          <h2>🎉 {rt.nthBook(party.n)}</h2>
          {party.gift && <p><b>{rt.present(COMPANIONS[friend].name, rt.gifts[party.gift])}</b></p>}
          {party.fresh.length > 0 && <div className="row"><span>{rt.newStickers}</span>{party.fresh.map(id => <img key={id} className="sticker-sm" src={stickerSrc(id)} alt={id} />)}</div>}
        </div>
      </div>
    </section>
  );
}

// Every possible sticker, collected ones in colour and the rest as soft silhouettes.
function Album({ have, rt, back, onClose }: { have: Set<string>; rt: (typeof REWARD_TX)[LangCode]; back: string; onClose: () => void }) {
  return (
    <div className="book">
      <div><button className="btn" onClick={onClose}>{back}</button></div>
      <h1 style={{ fontSize: "clamp(1.6rem,6vw,2.3rem)" }}>{rt.albumH}</h1>
      <p className="muted">{rt.albumP} <b>{rt.collected(have.size, ALL_STICKERS.length)}</b></p>
      <div className="album">{ALL_STICKERS.map(id => (
        <div key={id} className={`sticker ${have.has(id) ? "got" : ""}`}><img src={stickerSrc(id)} alt={have.has(id) ? id : "?"} /></div>))}</div>
    </div>
  );
}
