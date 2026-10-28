"use client";

import { useState } from "react";
import { EMO, HEAVY, LANGS, ROLE, THEMES, TX, type Child, type Insight, type LangCode, type Role, type Story } from "@/lib/data";
import { EXAMPLES, EXAMPLE_CHILD, EXAMPLE_INSIGHT } from "@/lib/examples";
import { bookHTML, download, reportHTML } from "@/lib/reports";
import { post } from "@/lib/api";
import { Book } from "./Pasakele";

const DAY = 864e5;
const shortDate = (t: number) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });

type Props = { child: Child | null; stories: Story[]; insight: Insight | null; onInsight: (i: Insight) => void; onChild: (c: Child) => void };

export function ParentArea(props: Props) {
  const [open, setOpen] = useState(false);
  return open ? <Dashboard {...props} /> : <Gate onOpen={() => setOpen(true)} />;
}

// A multiplication question keeps small children out of the parent area.
function Gate({ onOpen }: { onOpen: () => void }) {
  const [q] = useState(() => [6 + Math.floor(Math.random() * 4), 4 + Math.floor(Math.random() * 5)]);
  const [a, setA] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <section className="card gate"><span className="eyebrow">Grown-ups only</span><h2>Parent area</h2>
      <p className="muted">Solve this to continue: <b>{q[0]} × {q[1]}</b></p>
      <form className="row" onSubmit={e => { e.preventDefault(); if (+a === q[0] * q[1]) onOpen(); else { setMsg("That's not right. Try again."); setA(""); } }}>
        <input id="gate-a" className="gate-input" inputMode="numeric" autoComplete="off" aria-label="Answer" value={a} onChange={e => setA(e.target.value)} />
        <button className="btn teal">Open</button>
      </form>
      <p className="muted" role="alert">{msg}</p>
    </section>
  );
}

function Dashboard({ child: realChild, stories: real, insight: realInsight, onInsight, onChild }: Props) {
  const [showExample, setShowExample] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reading, setReading] = useState<Story | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const now = Date.now();

  // Real data only. The invented demo family appears only when a parent asks for it (button at the bottom).
  const useEx = showExample;
  if (!useEx && !realChild) return (
    <section className="card"><h2>No child set up yet</h2><p className="muted">Open Story time, enter your child&apos;s name and language, and come back after the first story.</p>
      <div><button className="btn" onClick={() => setShowExample(true)}>Show the demo family (invented)</button></div></section>
  );
  const list = useEx ? EXAMPLES : real;
  const child = useEx ? EXAMPLE_CHILD : realChild!;
  const ins = useEx ? EXAMPLE_INSIGHT : realInsight;

  if (reading) return <Book story={reading} tx={TX.en} speak={() => {}} canSpeak={false} onClose={() => setReading(null)} />;

  const recentCut = now - 14 * DAY, last = list.slice(-5);
  const wordsAll = new Set(list.flatMap(s => s.wordList || []));
  const kpis: [string | number, string][] = [
    [list.length, "stories"], [list.filter(s => s.createdAt > now - 7 * DAY).length, "this week"],
    [list.length ? Math.round(list.reduce((a, s) => a + (s.words || 0), 0) / list.length) : "–", "words per story"],
    [wordsAll.size || "–", "different words used"],
  ];
  const empty = (text: string) => <p className="muted">{text}</p>;
  const themeCount = THEMES.map(t => [t, list.filter(s => s.createdAt <= recentCut && s.themes.includes(t)).length, list.filter(s => s.createdAt > recentCut && s.themes.includes(t)).length] as const)
    .filter(r => r[1] + r[2]).sort((a, b) => b[1] + b[2] - (a[1] + a[2]));
  const maxT = Math.max(1, ...themeCount.map(r => r[1] + r[2]));
  const flags = HEAVY.map(t => [t, last.filter(s => s.themes.includes(t)).length] as const).filter(f => f[1] >= 2);
  const talk = list.filter(s => s.concern === "talk").at(-1);

  async function makeInsight() {
    if (!realChild) return;
    setBusy(true); setErr("");
    try {
      const res = await post("/api/insight", { child: realChild, stories: real.slice(-10).map(s => ({ createdAt: s.createdAt, title: s.title, summary: s.summary, themes: s.themes, emotions: s.emotions, parentNote: s.parentNote })) });
      const r = await res.json();
      if (!res.ok) throw new Error(r.error || "The summary couldn't be made. Try again.");
      onInsight({ ...r, createdAt: Date.now() });
    } catch (e) { if ((e as Error).message !== "🔒") setErr((e as Error).message); }
    setBusy(false);
  }

  return (
    <>
      {useEx && <div className="demo-banner" role="status"><b>DEMO · invented family, not your child.</b> Everything below is made up to show how the page works.
        <button className="btn" onClick={() => setShowExample(false)}>{realChild ? `Back to ${realChild.name}` : "Close demo"}</button></div>}
      <div><span className="eyebrow">Story insights</span>
        <h1 style={{ fontSize: "1.8rem" }}>{child.name}, age {child.age}</h1>
        {child.note && <p className="muted" style={{ fontSize: ".88rem" }}>{child.note}</p>}</div>
      {!useEx && !list.length && <p className="note">No stories yet. Everything on this page comes from {child.name}&apos;s own stories and fills in after each finished book.</p>}
      {talk && <div className="flag" role="alert"><div><b>Please talk with {child.name} about &quot;{talk.title}&quot;.</b><p>Something in this story may describe a real worry. Listen calmly. If you&apos;re concerned, contact a child psychologist or your family doctor.</p></div></div>}

      <div className="kpis">{kpis.map(([v, l]) => <div key={l} className="kpi"><b>{v}</b><span>{l}</span></div>)}</div>

      <section className="card insight"><span className="eyebrow">This month</span>
        {ins ? <><h3>{ins.headline}</h3><ul>{ins.observations.map(o => <li key={o}>{o}</li>)}</ul>
          {ins.tryThis.length > 0 && <><p><b>Try this:</b></p><ul>{ins.tryThis.map(o => <li key={o}>{o}</li>)}</ul></>}</>
          : <><h3>No summary yet</h3><p className="muted">{list.length < 2 ? `A summary needs at least 2 stories. ${child.name} has ${list.length}.` : `Generate a summary of patterns across ${child.name}'s stories.`}</p></>}
        {!useEx && <div><button className="btn teal" onClick={makeInsight} disabled={busy || list.length < 2}>{busy ? "Reading the stories…" : ins ? "Refresh summary" : "Generate summary"}</button></div>}
      </section>

      <Radar list={list} child={child} now={now} />

      {flags.map(([t, n]) => <div key={t} className="flag"><div><b>&quot;{t}&quot; appeared in {n} of the last {last.length} stories.</b><p>A gentle chat at bedtime can help: ask how the story&apos;s hero felt.</p></div></div>)}
      {err && <p className="note" role="alert">{err}</p>}

      <section className="card"><div className="row" style={{ justifyContent: "space-between" }}><h3>Themes</h3>
        <div className="legend"><span><i style={{ background: "var(--muted)", opacity: 0.45 }} />Earlier</span><span><i style={{ background: "var(--teal)" }} />Last 14 days</span></div></div>
        {!themeCount.length && empty("Themes appear after the first finished story.")}
        <div className="bars">{themeCount.map(([t, a, b]) => (
          <div key={t} style={{ display: "contents" }}><span>{t}</span>
            <div className="bar" role="img" aria-label={`${t}: ${a} earlier, ${b} recent`}><i style={{ width: `${(a / maxT) * 100}%`, background: "var(--muted)", opacity: 0.45 }} /><i style={{ width: `${(b / maxT) * 100}%`, background: HEAVY.includes(t) ? "var(--berry)" : "var(--teal)" }} /></div>
            <span className="muted tnum">{a + b}</span></div>))}</div>
      </section>

      <section className="card"><h3>Feelings in each story</h3><p className="muted" style={{ fontSize: ".88rem" }}>Bigger dot = stronger feeling. Oldest on the left.</p>
        {list.length ? <div className="scroll"><EmotionStrip list={list} /></div> : empty("Feelings appear after the first finished story.")}</section>

      <World list={list} />

      <section className="card"><h3>Stories</h3>{!list.length && empty("No finished stories yet.")}<div className="slist">
        {list.slice().reverse().map(s => (
          <div key={s.id} className="sitem">
            <span className="dt">{shortDate(s.createdAt)}</span>
            <span style={{ minWidth: 0 }}>
              <button className="stitle" aria-expanded={openId === s.id} onClick={() => setOpenId(openId === s.id ? null : s.id)}>
                <b>{s.title}</b><br /><span className="muted" style={{ fontSize: ".9rem" }}>{s.summary}</span></button>
              {openId === s.id && <span style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                <span className="note"><b>What this may show:</b> {s.parentNote}</span>
                <span className="row">{s.themes.map(t => <span key={t} className="tag">{t}</span>)}</span>
                {s.transcript && <details className="tx"><summary>Read the conversation</summary>{s.transcript.map((m, i) => <p key={i}><b>{m.role === "user" ? child.name : "Friend"}:</b> {m.content}</p>)}</details>}
                <span><button className="btn" onClick={() => setReading(s)}>Open the book</button></span></span>}
            </span>
            <span className="concern" title={s.concern} style={{ background: s.concern === "talk" ? "var(--e-ang)" : s.concern === "watch" ? "var(--e-fear)" : "var(--line)" }} />
          </div>))}
      </div></section>

      <Reports list={list} child={child} ins={ins} useEx={useEx} />
      {realChild && <Settings child={realChild} onChild={onChild} />}
      <p className="note">Pasakėlė notices patterns, it does not diagnose. Only text is kept, no voice recordings. Stories stay in this browser on this device. If something worries you, talk with your child and, if needed, a child psychologist.</p>
      {!useEx && <div><button className="btn" onClick={() => { setShowExample(true); window.scrollTo(0, 0); }}>Show the demo family (invented, for presentations)</button></div>}
    </>
  );
}

function EmotionStrip({ list }: { list: Story[] }) {
  const cw = 46, lw = 84, W = lw + list.length * cw + 10, H = EMO.length * 30 + 28;
  return (
    <svg className="strip" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Emotion intensity per story">
      {EMO.map(([k, l, c], r) => (
        <g key={k}><text x="0" y={r * 30 + 20} fontSize="12" fill="var(--muted)">{l}</text>
          <line x1={lw} x2={W - 6} y1={r * 30 + 16} y2={r * 30 + 16} stroke="var(--line)" />
          {list.map((s, i) => { const v = +(s.emotions?.[k] || 0); return v ? <circle key={s.id} cx={lw + i * cw + cw / 2} cy={r * 30 + 16} r={3 + v * 3.2} fill={`var(${c})`}><title>{`${s.title}: ${l} ${v}/3`}</title></circle> : null; })}</g>))}
      {list.map((s, i) => <text key={s.id} x={lw + i * cw + cw / 2} y={H - 4} fontSize="10" textAnchor="middle" fill="var(--muted)">{new Date(s.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "numeric" })}</text>)}
    </svg>
  );
}

// Mother-tongue radar: words said in another language inside a home-language story.
function Radar({ list, child, now }: { list: Story[]; child: Child; now: number }) {
  const home = LANGS[child.lang].english;
  const map = new Map<string, { word: string; lang: string; native: string; gloss: string; count: number; last: number }>();
  list.forEach(s => (s.foreignWords || []).forEach(w => { const k = w.word.toLowerCase(); const e = map.get(k) || { ...w, count: 0, last: 0 }; e.count++; e.last = Math.max(e.last, s.createdAt); map.set(k, e); }));
  const words = [...map.values()].sort((a, b) => b.count - a.count || b.last - a.last);
  const per = list.map(s => (s.foreignWords || []).length), max = Math.max(1, ...per);
  const langs = [...new Set(words.map(w => w.lang))].join(" and ") || "another language";
  const recent = list.filter(s => s.createdAt > now - 14 * DAY).reduce((a, s) => a + (s.foreignWords || []).length, 0);
  return (
    <section className="card"><div><span className="eyebrow">Mother-tongue radar</span>
      <h3>{words.length ? `${words.length} words came out in ${langs} instead of ${home}` : `${child.name} told every story fully in ${home}`}</h3></div>
      {words.length ? <>
        <p className="muted" style={{ fontSize: ".9rem" }}>{recent} of them in the last 14 days. These are often words from kindergarten or school. The story friend quietly uses the {home} word in its next reply, without correcting.</p>
        <div className="wordgrid">{words.map(w => <div key={w.word} className="word"><span className="from">{w.word}</span><span className="arrow" aria-hidden="true">→</span><b>{w.native}</b><span className="muted">{w.gloss}{w.count > 1 ? ` · ×${w.count}` : ""}</span></div>)}</div>
        <div><p className="muted" style={{ fontSize: ".82rem", fontWeight: 700, marginBottom: 6 }}>Words in another language per story</p>
          <div className="minibars" role="img" aria-label={`Foreign words per story, oldest to newest: ${per.join(", ")}`}>{per.map((n, i) => <span key={i} title={`${list[i].title}: ${n}`} style={{ height: 6 + (n / max) * 44, opacity: n ? 1 : 0.3 }} />)}</div></div>
        <p className="note"><b>Try this week:</b> use {words.slice(0, 3).map((w, i) => <span key={w.word}>{i ? ", " : ""}<b>{w.native}</b></span>)} at home in a game or at dinner.</p>
      </> : <p className="muted">When {child.name} mixes in words from another language, they show up here with the {home} word to practise.</p>}
    </section>
  );
}

// Story world: recurring characters by role, sized by how often they appear.
function World({ list }: { list: Story[] }) {
  const map = new Map<string, { name: string; role: Role; count: number; titles: string[] }>();
  list.forEach(s => (s.characters || []).forEach(ch => { const k = ch.name.toLowerCase(); const e = map.get(k) || { name: ch.name, role: ROLE[ch.role] ? ch.role : "other", count: 0, titles: [] }; e.count++; e.titles.push(s.title); map.set(k, e); }));
  const chars = [...map.values()];
  if (!chars.length) return <section className="card"><span className="eyebrow">Story world</span><h3>The world is still empty</h3><p className="muted">Characters from the stories will gather here.</p></section>;
  const W = 560, H = 400, cx = W / 2, cy = H / 2 - 6, radii = [58, 130, 178];
  const ringOf: Record<Role, number> = { hero: 0, friend: 1, family: 1, helper: 1, villain: 2, other: 2 };
  const byRing: (typeof chars)[] = [[], [], []]; chars.forEach(c => byRing[ringOf[c.role]].push(c));
  const nodes = byRing.flatMap((arr, ri) => arr.map((c, i) => {
    const a = (i / arr.length) * Math.PI * 2 - Math.PI / 2 + ri * 0.5, solo = arr.length === 1 && ri === 0;
    return { ...c, x: solo ? cx : cx + Math.cos(a) * radii[ri], y: solo ? cy : cy + Math.sin(a) * radii[ri] * 0.82 };
  }));
  const places: Record<string, number> = {}; list.forEach(s => s.pages.forEach(p => (places[p.setting] = (places[p.setting] || 0) + 1)));
  return (
    <section className="card"><div><span className="eyebrow">Story world</span><h3>Who lives in the stories</h3>
      <p className="muted" style={{ fontSize: ".9rem" }}>Heroes in the middle, friends and family around them, scary ones at the edge. Bigger circle = appears more often.</p></div>
      <div className="scroll"><svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 480, height: "auto", display: "block" }} role="img" aria-label="Map of story characters">
        {radii.map(r => <ellipse key={r} cx={cx} cy={cy} rx={r} ry={r * 0.82} fill="none" stroke="var(--line)" strokeDasharray="4 5" />)}
        {nodes.map(n => <g key={n.name}><circle cx={n.x} cy={n.y} r={8 + n.count * 4} fill={ROLE[n.role][1]} opacity={0.9}><title>{`${n.name}: ${n.count} ${n.count > 1 ? "stories" : "story"} (${n.titles.join(", ")})`}</title></circle>
          <text x={n.x} y={n.y + 8 + n.count * 4 + 13} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">{n.name}{n.count > 1 ? ` ×${n.count}` : ""}</text></g>)}
      </svg></div>
      <div className="legend">{(Object.keys(ROLE) as Role[]).filter(k => chars.some(c => c.role === k)).map(k => <span key={k}><i style={{ background: ROLE[k][1], borderRadius: "50%" }} />{ROLE[k][0]}</span>)}</div>
      <div className="row"><span className="muted" style={{ fontWeight: 700, fontSize: ".88rem" }}>Places:</span>{Object.entries(places).sort((a, b) => b[1] - a[1]).map(([p, n]) => <span key={p} className="tag">{p} ×{n}</span>)}</div>
    </section>
  );
}

function Reports({ list, child, ins, useEx }: { list: Story[]; child: Child; ins: Insight | null; useEx: boolean }) {
  const [consent, setConsent] = useState(false);
  const [psy, setPsy] = useState("");
  const [ordered, setOrdered] = useState(false);
  const year = new Date().getFullYear();
  return (
    <section className="card"><span className="eyebrow">Reports & keepsakes</span>
      <div className="twocol">
        <div className="sub"><h3>Report for a psychologist</h3>
          <p className="muted" style={{ fontSize: ".9rem" }}>A summary of themes, feelings, characters and language over time, to bring to a child psychologist. Nothing is sent anywhere: you download it and decide who sees it.</p>
          <label className="f">Psychologist (optional)<input id="r-psy" maxLength={60} placeholder="Name of the specialist" value={psy} onChange={e => setPsy(e.target.value)} /></label>
          <label className="check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> <span>I am {child.name}&apos;s parent or guardian and I agree to share this report with the specialist named above.</span></label>
          <div><button className="btn teal" disabled={!consent || !list.length} onClick={() => download(`pasakele-report-${child.name}.html`, reportHTML(list, child, ins, psy.trim()))}>Download report</button></div>
          <p className="muted" style={{ fontSize: ".8rem" }}>Opens in your browser. Use Print → Save as PDF to get a PDF.</p></div>
        <div className="sub"><h3>{child.name}&apos;s Book of {year}</h3>
          <div className="cover"><div className="cover-in"><small>{list.length} stories · {list.reduce((a, s) => a + s.pages.length, 0)} illustrated pages</small><b>{child.name}&apos;s Stories</b><small>{year}</small></div></div>
          <p className="muted" style={{ fontSize: ".9rem" }}>Every story from the year as one illustrated book. A gift for grandparents.</p>
          <div className="row"><button className="btn" disabled={!list.length} onClick={() => download(`${child.name}-stories-${year}.html`, bookHTML(list, child))}>Download the book</button>
            <button className="btn sun" onClick={() => setOrdered(true)}>Order hardcover · €29</button></div>
          {ordered && <p className="note">Printing isn&apos;t connected yet, so no order was placed. In the real product a print partner ships the book.</p>}</div>
      </div>
      {useEx && <p className="muted" style={{ fontSize: ".8rem" }}>These use the example family&apos;s data.</p>}
    </section>
  );
}

function Settings({ child, onChild }: { child: Child; onChild: (c: Child) => void }) {
  const [lang, setLang] = useState<LangCode>(child.lang);
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(child.age);
  const [msg, setMsg] = useState("");
  return (
    <section className="card"><h3>Child settings</h3>
      <p className="muted" style={{ fontSize: ".9rem" }}>Only grown-ups can change these. Story time has no language switch, so your child always hears the language you choose.</p>
      <form className="row" style={{ alignItems: "flex-end" }} onSubmit={e => { e.preventDefault(); if (!name.trim()) return; onChild({ name: name.trim(), age, lang }); setMsg(`Saved. Story time now uses ${LANGS[lang].label}.`); }}>
        <label className="f">Story language<select id="s-lang" value={lang} onChange={e => setLang(e.target.value as LangCode)}>{Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
        <label className="f">Name<input id="s-name" required maxLength={20} value={name} onChange={e => setName(e.target.value)} /></label>
        <label className="f">Age<select id="s-age" value={age} onChange={e => setAge(+e.target.value)}>{[3, 4, 5, 6, 7, 8, 9, 10].map(a => <option key={a}>{a}</option>)}</select></label>
        <button className="btn teal">Save</button><span className="muted" role="status">{msg}</span>
      </form>
    </section>
  );
}
