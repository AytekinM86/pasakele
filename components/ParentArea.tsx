"use client";

import { useEffect, useRef, useState } from "react";
import { EMO, GENDER_TX, HEAVY, LANGS, ROLE, THEMES, TX, titleOf, type Child, type Gender, type Insight, type LangCode, type Role, type Setting, type Story } from "@/lib/data";
import { EXAMPLES, EXAMPLE_CHILD, EXAMPLE_INSIGHT } from "@/lib/examples";
import { downloadBookPdf, reportHTML } from "@/lib/reports";
import { downloadPdf } from "@/lib/pdf";
import { post } from "@/lib/api";
import { Book } from "./Pasakele";
import { P, type ParentText } from "@/lib/parentText";
import { REPORT } from "@/lib/reportText";

const DAY = 864e5;
// Day.month written out by hand: browsers don't all have Azerbaijani month names (they print "M10" or "10-28").
const shortDate = (t: number, locale: string) => {
  const d = new Date(t), dd = String(d.getDate()).padStart(2, "0"), mm = String(d.getMonth() + 1).padStart(2, "0");
  return locale.startsWith("en") ? new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : `${dd}.${mm}`;
};

type Props = { child: Child | null; stories: Story[]; insight: Insight | null; onInsight: (i: Insight) => void; onChild: (c: Child) => void; onStories: (s: Story[]) => void };

export function ParentArea(props: Props) {
  const [open, setOpen] = useState(false);
  const t = P[props.child?.lang || "az"];
  return open ? <Dashboard {...props} /> : <Gate t={t} onOpen={() => setOpen(true)} />;
}

// A multiplication question keeps small children out of the parent area.
function Gate({ t, onOpen }: { t: ParentText; onOpen: () => void }) {
  const [q] = useState(() => [6 + Math.floor(Math.random() * 4), 4 + Math.floor(Math.random() * 5)]);
  const [a, setA] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <section className="card gate"><span className="eyebrow">{t.gateEb}</span><h2>{t.gateH}</h2>
      <p className="muted">{t.gateQ} <b>{q[0]} × {q[1]}</b></p>
      <form className="row" onSubmit={e => { e.preventDefault(); if (+a === q[0] * q[1]) onOpen(); else { setMsg(t.wrong); setA(""); } }}>
        <input id="gate-a" className="gate-input" inputMode="numeric" autoComplete="off" aria-label={t.answer} value={a} onChange={e => setA(e.target.value)} />
        <button className="btn teal">{t.open}</button>
      </form>
      <p className="muted" role="alert">{msg}</p>
    </section>
  );
}

function Dashboard({ child: realChild, stories: real, insight: realInsight, onInsight, onChild, onStories }: Props) {
  const translating = useTranslateNotes(realChild, real, realInsight, onStories, onInsight);
  const [showExample, setShowExample] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reading, setReading] = useState<Story | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const now = Date.now();

  // Real data only. The invented demo family appears only when a parent asks for it (button at the bottom).
  const useEx = showExample;
  const t0 = P[realChild?.lang || "az"];
  if (!useEx && !realChild) return (
    <section className="card"><h2>{t0.noChildH}</h2><p className="muted">{t0.noChildP}</p>
      <div><button className="btn" onClick={() => setShowExample(true)}>{t0.showDemo}</button></div></section>
  );
  const list = useEx ? EXAMPLES : real;
  const child = useEx ? EXAMPLE_CHILD : realChild!;
  const ins = useEx ? EXAMPLE_INSIGHT : realInsight;
  const t = P[child.lang], rt = REPORT[child.lang];

  if (reading) return <Book story={reading} tx={TX[child.lang]} speak={() => {}} canSpeak={false} onClose={() => setReading(null)} />;

  const recentCut = now - 14 * DAY, last = list.slice(-5);
  const wordsAll = new Set(list.flatMap(s => s.wordList || []));
  const kpis: [string | number, string][] = [
    [list.length, t.kStories], [list.filter(s => s.createdAt > now - 7 * DAY).length, t.kWeek],
    [list.length ? Math.round(list.reduce((a, s) => a + (s.words || 0), 0) / list.length) : "–", t.kWords],
    [wordsAll.size || "–", t.kDifferent],
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
      if (!res.ok) throw new Error(r.error || t.summaryErr);
      onInsight({ ...r, createdAt: Date.now(), lang: realChild.lang });
    } catch (e) { if ((e as Error).message !== "🔒") setErr((e as Error).message); }
    setBusy(false);
  }

  return (
    <>
      {useEx && <div className="demo-banner" role="status"><b>{t.demoBanner}</b> {t.demoBannerP}
        <button className="btn" onClick={() => setShowExample(false)}>{realChild ? t.backTo(realChild.name) : t.closeDemo}</button></div>}
      <div><span className="eyebrow">{t.insights}</span>
        <h1 style={{ fontSize: "1.8rem" }}>{t.nameAge(child.name, child.age)}</h1>
        {child.note && <p className="muted" style={{ fontSize: ".88rem" }}>{child.note}</p>}</div>
      {!useEx && !list.length && <p className="note">{t.noStories(child.name)}</p>}
      {translating && <p className="note" role="status">{t.translating}</p>}
      {talk && <div className="flag" role="alert"><div><b>{t.talkH(child.name, titleOf(talk, child.lang))}</b><p>{t.talkP}</p></div></div>}

      <div className="kpis">{kpis.map(([v, l]) => <div key={l} className="kpi"><b>{v}</b><span>{l}</span></div>)}</div>

      <section className="card insight"><span className="eyebrow">{t.month}</span>
        {ins ? <><h3>{ins.headline}</h3><ul>{ins.observations.map(o => <li key={o}>{o}</li>)}</ul>
          {ins.tryThis.length > 0 && <><p><b>{t.tryThis}</b></p><ul>{ins.tryThis.map(o => <li key={o}>{o}</li>)}</ul></>}</>
          : <><h3>{t.noSummary}</h3><p className="muted">{list.length < 2 ? t.needTwo(child.name, list.length) : t.genHint(child.name)}</p></>}
        {!useEx && <div><button className="btn teal" onClick={makeInsight} disabled={busy || list.length < 2}>{busy ? t.reading : ins ? t.refresh : t.generate}</button></div>}
      </section>

      <Radar list={list} child={child} now={now} t={t} />

      {flags.map(([th, n]) => <div key={th} className="flag"><div><b>{t.flagH(rt.theme_[th], n, last.length)}</b><p>{t.flagP}</p></div></div>)}
      {err && <p className="note" role="alert">{err}</p>}

      <section className="card"><div className="row" style={{ justifyContent: "space-between" }}><h3>{t.themesH}</h3>
        <div className="legend"><span><i style={{ background: "var(--muted)", opacity: 0.45 }} />{t.earlier}</span><span><i style={{ background: "var(--teal)" }} />{t.last14}</span></div></div>
        {!themeCount.length && empty(t.themesEmpty)}
        <div className="bars">{themeCount.map(([th, a, b]) => (
          <div key={th} style={{ display: "contents" }}><span>{rt.theme_[th]}</span>
            <div className="bar" role="img" aria-label={`${rt.theme_[th]}: ${a} / ${b}`}><i style={{ width: `${(a / maxT) * 100}%`, background: "var(--muted)", opacity: 0.45 }} /><i style={{ width: `${(b / maxT) * 100}%`, background: HEAVY.includes(th) ? "var(--berry)" : "var(--teal)" }} /></div>
            <span className="muted tnum">{a + b}</span></div>))}</div>
      </section>

      <section className="card"><h3>{t.feelingsH}</h3><p className="muted" style={{ fontSize: ".88rem" }}>{t.feelingsP}</p>
        {list.length ? <div className="scroll"><EmotionStrip list={list} lang={child.lang} /></div> : empty(t.feelingsEmpty)}</section>

      <World list={list} t={t} />

      <section className="card"><h3>{t.storiesH}</h3>{!list.length && empty(t.storiesEmpty)}<div className="slist">
        {list.slice().reverse().map(s => (
          <div key={s.id} className="sitem">
            <span className="dt">{shortDate(s.createdAt, rt.locale)}</span>
            <span style={{ minWidth: 0 }}>
              <button className="stitle" aria-expanded={openId === s.id} onClick={() => setOpenId(openId === s.id ? null : s.id)}>
                <b>{titleOf(s, child.lang)}</b><br /><span className="muted" style={{ fontSize: ".9rem" }}>{s.summary}</span></button>
              {openId === s.id && <span style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                <span className="note"><b>{t.mayShow}</b> {s.parentNote}</span>
                <span className="row">{s.themes.map(th => <span key={th} className="tag">{rt.theme_[th] || th}</span>)}</span>
                {s.transcript && <details className="tx"><summary>{t.readConvo}</summary>{s.transcript.map((m, i) => <p key={i}><b>{m.role === "user" ? child.name : t.friend}:</b> {m.content}</p>)}</details>}
                <span><button className="btn" onClick={() => setReading(s)}>{t.openBook}</button></span></span>}
            </span>
            <span className="concern" title={s.concern} style={{ background: s.concern === "talk" ? "var(--e-ang)" : s.concern === "watch" ? "var(--e-fear)" : "var(--line)" }} />
          </div>))}
      </div></section>

      <Reports list={list} child={child} ins={ins} useEx={useEx} t={t} />
      {realChild && <Settings child={realChild} onChild={onChild} />}
      <p className="note">{t.footer}</p>
      {!useEx && <div><button className="btn" onClick={() => { setShowExample(true); window.scrollTo(0, 0); }}>{t.showDemoLong}</button></div>}
    </>
  );
}

// When the language changes, earlier stories' parent notes, titles and character names (and the summary)
// are translated once into the new language and saved, so the page is never in two languages.
function useTranslateNotes(child: Child | null, stories: Story[], insight: Insight | null, onStories: (s: Story[]) => void, onInsight: (i: Insight) => void) {
  const [busy, setBusy] = useState(false);
  const tried = useRef("");
  const lang = child?.lang;
  const stale = lang ? stories.filter(s => (s.notesLang || s.lang) !== lang) : [];
  const staleInsight = !!(lang && insight && !insight.example && insight.lang !== lang);
  const key = lang + ":" + stale.map(s => s.id).join(",") + (staleInsight ? ":i" : "");
  const latest = useRef({ stories, insight, onStories, onInsight, stale, staleInsight });
  useEffect(() => { latest.current = { stories, insight, onStories, onInsight, stale, staleInsight }; });
  useEffect(() => {
    const { stories, insight, onStories, onInsight, stale, staleInsight } = latest.current;
    if (!lang || (!stale.length && !staleInsight) || tried.current === key) return;
    tried.current = key;
    const items: string[] = [];
    const take = (x: string) => { items.push(x); return items.length - 1; };
    const plan = stale.map(s => ({ id: s.id, title: take(s.title), summary: take(s.summary), note: take(s.parentNote), chars: s.characters.map(c => take(c.name)) }));
    const ins = staleInsight && insight ? { headline: take(insight.headline), obs: insight.observations.map(take), tryThis: insight.tryThis.map(take) } : null;
    (async () => {
      setBusy(true);
      try {
        const res = await post("/api/translate", { to: lang, items });
        if (!res.ok) return;
        const out: string[] = (await res.json()).items;
        const byId = new Map(plan.map(p => [p.id, p]));
        onStories(stories.map(s => {
          const p = byId.get(s.id);
          return p ? { ...s, notesLang: lang, shownTitle: out[p.title], summary: out[p.summary], parentNote: out[p.note], characters: s.characters.map((c, i) => ({ ...c, name: out[p.chars[i]] })) } : s;
        }));
        if (ins && insight) onInsight({ ...insight, lang, headline: out[ins.headline], observations: ins.obs.map(i => out[i]), tryThis: ins.tryThis.map(i => out[i]) });
      } catch { /* try again next time the page opens */ }
      finally { setBusy(false); }
    })();
  }, [key, lang]);
  return busy;
}

function EmotionStrip({ list, lang }: { list: Story[]; lang: LangCode }) {
  const rt = REPORT[lang];
  const cw = 46, lw = 84, W = lw + list.length * cw + 10, H = EMO.length * 30 + 28;
  return (
    <svg className="strip" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Emotion intensity per story">
      {EMO.map(([k, , c], r) => { const l = rt.emo[k]; return (
        <g key={k}><text x="0" y={r * 30 + 20} fontSize="12" fill="var(--muted)">{l}</text>
          <line x1={lw} x2={W - 6} y1={r * 30 + 16} y2={r * 30 + 16} stroke="var(--line)" />
          {list.map((s, i) => { const v = +(s.emotions?.[k] || 0); return v ? <circle key={s.id} cx={lw + i * cw + cw / 2} cy={r * 30 + 16} r={3 + v * 3.2} fill={`var(${c})`}><title>{`${s.title}: ${l} ${v}/3`}</title></circle> : null; })}</g>); })}
      {list.map((s, i) => <text key={s.id} x={lw + i * cw + cw / 2} y={H - 4} fontSize="10" textAnchor="middle" fill="var(--muted)">{shortDate(s.createdAt, rt.locale)}</text>)}
    </svg>
  );
}

// Mother-tongue radar: words said in another language inside a home-language story.
function Radar({ list, child, now, t }: { list: Story[]; child: Child; now: number; t: ParentText }) {
  const map = new Map<string, { word: string; lang: string; native: string; gloss: string; count: number; last: number }>();
  list.forEach(s => (s.foreignWords || []).forEach(w => { const k = w.word.toLowerCase(); const e = map.get(k) || { ...w, count: 0, last: 0 }; e.count++; e.last = Math.max(e.last, s.createdAt); map.set(k, e); }));
  const words = [...map.values()].sort((a, b) => b.count - a.count || b.last - a.last);
  const per = list.map(s => (s.foreignWords || []).length), max = Math.max(1, ...per);
  const recent = list.filter(s => s.createdAt > now - 14 * DAY).reduce((a, s) => a + (s.foreignWords || []).length, 0);
  return (
    <section className="card"><div><span className="eyebrow">{t.radarEb}</span>
      <h3>{words.length ? t.radarH(words.length) : t.radarAll(child.name)}</h3></div>
      {words.length ? <>
        <p className="muted" style={{ fontSize: ".9rem" }}>{t.radarP(recent)}</p>
        <div className="wordgrid">{words.map(w => <div key={w.word} className="word"><span className="from">{w.word}</span><span className="arrow" aria-hidden="true">→</span><b>{w.native}</b><span className="muted">{child.lang === "en" ? w.gloss : ""}{w.count > 1 ? ` ×${w.count}` : ""}</span></div>)}</div>
        <div><p className="muted" style={{ fontSize: ".82rem", fontWeight: 700, marginBottom: 6 }}>{t.perStory}</p>
          <div className="minibars" role="img" aria-label={`Foreign words per story, oldest to newest: ${per.join(", ")}`}>{per.map((n, i) => <span key={i} title={`${list[i].title}: ${n}`} style={{ height: 6 + (n / max) * 44, opacity: n ? 1 : 0.3 }} />)}</div></div>
        <p className="note"><b>{t.tryWeek}</b> {words.slice(0, 3).map((w, i) => <span key={w.word}>{i ? ", " : ""}<b>{w.native}</b></span>)} {t.tryWeekEnd}</p>
      </> : <p className="muted">{t.radarEmpty(child.name)}</p>}
    </section>
  );
}

// Story world: recurring characters by role, sized by how often they appear.
function World({ list, t }: { list: Story[]; t: ParentText }) {
  const map = new Map<string, { name: string; role: Role; count: number; titles: string[] }>();
  list.forEach(s => (s.characters || []).forEach(ch => { const k = ch.name.toLowerCase(); const e = map.get(k) || { name: ch.name, role: ROLE[ch.role] ? ch.role : "other", count: 0, titles: [] }; e.count++; e.titles.push(s.title); map.set(k, e); }));
  const chars = [...map.values()];
  if (!chars.length) return <section className="card"><span className="eyebrow">{t.worldEb}</span><h3>{t.worldEmptyH}</h3><p className="muted">{t.worldEmptyP}</p></section>;
  const W = 560, H = 400, cx = W / 2, cy = H / 2 - 6, radii = [58, 130, 178];
  const ringOf: Record<Role, number> = { hero: 0, friend: 1, family: 1, helper: 1, villain: 2, other: 2 };
  const byRing: (typeof chars)[] = [[], [], []]; chars.forEach(c => byRing[ringOf[c.role]].push(c));
  const nodes = byRing.flatMap((arr, ri) => arr.map((c, i) => {
    const a = (i / arr.length) * Math.PI * 2 - Math.PI / 2 + ri * 0.5, solo = arr.length === 1 && ri === 0;
    return { ...c, x: solo ? cx : cx + Math.cos(a) * radii[ri], y: solo ? cy : cy + Math.sin(a) * radii[ri] * 0.82 };
  }));
  const places: Record<string, number> = {}; list.forEach(s => s.pages.forEach(p => (places[p.setting] = (places[p.setting] || 0) + 1)));
  return (
    <section className="card"><div><span className="eyebrow">{t.worldEb}</span><h3>{t.worldH}</h3>
      <p className="muted" style={{ fontSize: ".9rem" }}>{t.worldP}</p></div>
      <div className="scroll"><svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 480, height: "auto", display: "block" }} role="img" aria-label="Map of story characters">
        {radii.map(r => <ellipse key={r} cx={cx} cy={cy} rx={r} ry={r * 0.82} fill="none" stroke="var(--line)" strokeDasharray="4 5" />)}
        {nodes.map(n => <g key={n.name}><circle cx={n.x} cy={n.y} r={8 + n.count * 4} fill={ROLE[n.role][1]} opacity={0.9}><title>{`${n.name}: ×${n.count} (${n.titles.join(", ")})`}</title></circle>
          <text x={n.x} y={n.y + 8 + n.count * 4 + 13} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">{n.name}{n.count > 1 ? ` ×${n.count}` : ""}</text></g>)}
      </svg></div>
      <div className="legend">{(Object.keys(ROLE) as Role[]).filter(k => chars.some(c => c.role === k)).map(k => <span key={k}><i style={{ background: ROLE[k][1], borderRadius: "50%" }} />{t.groups[k]}</span>)}</div>
      <div className="row"><span className="muted" style={{ fontWeight: 700, fontSize: ".88rem" }}>{t.places}</span>{Object.entries(places).sort((a, b) => b[1] - a[1]).map(([p, n]) => <span key={p} className="tag">{t.settings[p as Setting] || p} ×{n}</span>)}</div>
    </section>
  );
}

function Reports({ list, child, ins, useEx, t }: { list: Story[]; child: Child; ins: Insight | null; useEx: boolean; t: ParentText }) {
  const [consent, setConsent] = useState(false);
  const [psy, setPsy] = useState("");
  const [making, setMaking] = useState<"" | "report" | "book">("");
  const makePdf = async (kind: "report" | "book", run: () => Promise<void>) => { setMaking(kind); try { await run(); } finally { setMaking(""); } };
  const year = new Date().getFullYear();
  return (
    <section className="card"><span className="eyebrow">{t.reportsEb}</span>
      <div className="twocol">
        <div className="sub"><h3>{t.psyH}</h3>
          <p className="muted" style={{ fontSize: ".9rem" }}>{t.psyP}</p>
          <label className="f">{t.psyLabel}<input id="r-psy" maxLength={60} placeholder={t.psyPh} value={psy} onChange={e => setPsy(e.target.value)} /></label>
          <label className="check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> <span>{t.consent(child.name)}</span></label>
          <div><button className="btn teal" disabled={!consent || !list.length || !!making} onClick={() => makePdf("report", () => downloadPdf(`pasakele-report-${child.name}.pdf`, reportHTML(list, child, ins, psy.trim())))}>{making === "report" ? t.preparing : t.downloadReport}</button></div>
          <p className="muted" style={{ fontSize: ".8rem" }}>{t.printHint}</p></div>
        <div className="sub"><h3>{t.bookH(child.name, year)}</h3>
          <div className="cover"><div className="cover-in"><small>{t.coverLine(list.length, list.reduce((a, s) => a + s.pages.length, 0))}</small><b>{t.coverTitle(child.name)}</b><small>{year}</small></div></div>
          <p className="muted" style={{ fontSize: ".9rem" }}>{t.bookP}</p>
          <div className="row"><button className="btn" disabled={!list.length || !!making} onClick={() => makePdf("book", () => downloadBookPdf(list, child, `${child.name}-stories-${year}.pdf`))}>{making === "book" ? t.preparing : t.downloadBook}</button></div></div>
      </div>
      {useEx && <p className="muted" style={{ fontSize: ".8rem" }}>{t.exampleData}</p>}
    </section>
  );
}

function Settings({ child, onChild }: { child: Child; onChild: (c: Child) => void }) {
  const t = P[child.lang];
  const [lang, setLang] = useState<LangCode>(child.lang);
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(child.age);
  const [gender, setGender] = useState<Gender | "">(child.gender || "");
  const [msg, setMsg] = useState("");
  const g = GENDER_TX[child.lang];
  return (
    <section className="card"><h3>{t.settingsH}</h3>
      <p className="muted" style={{ fontSize: ".9rem" }}>{t.settingsP}</p>
      <form className="row" style={{ alignItems: "flex-end" }} onSubmit={e => { e.preventDefault(); if (!name.trim()) return; onChild({ ...child, name: name.trim(), age, lang, gender: gender || undefined }); setMsg(P[lang].saved(LANGS[lang].label)); }}>
        <label className="f">{t.storyLang}<select id="s-lang" value={lang} onChange={e => setLang(e.target.value as LangCode)}>{Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
        <label className="f">{t.name}<input id="s-name" required maxLength={20} value={name} onChange={e => setName(e.target.value)} /></label>
        <label className="f">{t.age}<select id="s-age" value={age} onChange={e => setAge(+e.target.value)}>{[3, 4, 5, 6, 7, 8, 9, 10].map(a => <option key={a}>{a}</option>)}</select></label>
        <label className="f">{g.label}<select id="s-gender" value={gender} onChange={e => setGender(e.target.value as Gender | "")}>
          <option value="">{g.none}</option><option value="girl">{g.girl}</option><option value="boy">{g.boy}</option></select></label>
        <button className="btn teal">{t.save}</button><span className="muted" role="status">{msg}</span>
      </form>
    </section>
  );
}
