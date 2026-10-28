import { EMO, titleOf, type Child, type Insight, type Role, type Story, type Theme } from "./data";
import { paint } from "./paint";
import { REPORT, otherLangName } from "./reportText";
import { FIGURE_IDS, loadFigures } from "./figures";

// dd.mm.yyyy everywhere except English: some browsers print Azerbaijani dates as 2026-10-28.
const fmtDay = (ms: number, locale: string) => {
  const d = new Date(ms);
  return locale.startsWith("en") ? d.toLocaleDateString("en-GB") : [d.getDate(), d.getMonth() + 1].map(x => String(x).padStart(2, "0")).join(".") + "." + d.getFullYear();
};
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const shell = (lang: string, title: string, body: string) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>body{font:15px/1.55 Georgia,"Times New Roman",serif;color:#1d2a36;max-width:760px;margin:0 auto;padding:32px 20px}h1,h2,h3{font-family:Arial,Helvetica,sans-serif;line-height:1.2}h1{font-size:26px;margin:0 0 4px}h2{font-size:18px;margin:28px 0 8px;border-bottom:2px solid #16807f;padding-bottom:4px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #cfdcd6;padding:5px 8px;text-align:left;vertical-align:top}th{background:#eef4f1}.muted{color:#5d6b78}.box{background:#eef4f1;border-radius:8px;padding:10px 14px}.meta{display:grid;grid-template-columns:auto 1fr;gap:2px 14px;margin:8px 0 14px}.meta b{font-family:Arial,sans-serif;font-size:13px;color:#5d6b78}.page{page-break-after:always;break-after:page;text-align:center;padding-top:20px}.page img{width:100%;max-width:640px;border-radius:12px}.page p{font-size:22px;font-family:Arial,sans-serif;margin:16px 30px}.cover{display:flex;flex-direction:column;justify-content:center;min-height:80vh;text-align:center}@media print{body{padding:0}}</style></head><body>${body}</body></html>`;

// Report a parent can hand to a child psychologist, entirely in the child's story language.
// Opens in a browser; Print -> Save as PDF makes a PDF.
export function reportHTML(list: Story[], child: Child, ins: Insight | null, psy: string) {
  const t = REPORT[child.lang];
  const day = (ms: number) => fmtDay(ms, t.locale);
  const fw = list.flatMap(s => (s.foreignWords || []).map(w => ({ ...w, title: s.title })));
  const chars: Record<string, { role: Role; n: number }> = {};
  list.forEach(s => (s.characters || []).forEach(c => { chars[c.name] = chars[c.name] || { role: c.role, n: 0 }; chars[c.name].n++; }));
  const themeN: Partial<Record<Theme, number>> = {};
  list.forEach(s => s.themes.forEach(th => (themeN[th] = (themeN[th] || 0) + 1)));
  const showMeaning = child.lang === "en"; // the AI writes meanings in English, so only show them in an English report
  const now = Date.now();

  return shell(child.lang, t.title(child.name, child.age), `
  <h1>${esc(t.title(child.name, child.age))}</h1>
  <div class="meta">
    <b>${t.stories}</b><span>${list.length}</span>
    <b>${t.period}</b><span>${day(list[0]?.createdAt ?? now)} – ${day(list.at(-1)?.createdAt ?? now)}</span>
    <b>${t.storyLang}</b><span>${t.langName[child.lang]}</span>
    <b>${t.prepared}</b><span>${day(now)} · Pasakėlė</span>
    ${psy ? `<b>${t.forWhom}</b><span>${esc(psy)}</span>` : ""}
  </div>
  <p class="box">${t.consent}</p>
  ${ins ? `<h2>${t.summary}</h2><p><b>${esc(ins.headline)}</b></p><ul>${ins.observations.map(o => `<li>${esc(o)}</li>`).join("")}</ul>` : ""}
  <h2>${t.themes}</h2><table><tr><th>${t.theme}</th><th>${t.count}</th></tr>${(Object.entries(themeN) as [Theme, number][]).sort((a, b) => b[1] - a[1]).map(([th, n]) => `<tr><td>${esc(t.theme_[th] || th)}</td><td>${n}</td></tr>`).join("")}</table>
  <h2>${t.feelings}</h2><table><tr><th>${t.date}</th><th>${t.story}</th>${EMO.map(e => `<th>${t.emo[e[0]]}</th>`).join("")}</tr>
    ${list.map(s => `<tr><td>${day(s.createdAt)}</td><td>${esc(titleOf(s, child.lang))}</td>${EMO.map(e => `<td>${s.emotions?.[e[0]] || 0}</td>`).join("")}</tr>`).join("")}</table>
  <h2>${t.characters}</h2><table><tr><th>${t.character}</th><th>${t.role}</th><th>${t.count}</th></tr>${Object.entries(chars).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(t.role_[v.role] || v.role)}</td><td>${v.n}</td></tr>`).join("")}</table>
  <h2>${t.language}</h2><p>${fw.length ? t.foreign(fw.length) : t.allFull}</p>
  ${fw.length ? `<table><tr><th>${t.said}</th><th>${t.otherLang}</th><th>${t.homeWord}</th>${showMeaning ? `<th>${t.meaning}</th>` : ""}<th>${t.story}</th></tr>${fw.map(w => `<tr><td>${esc(w.word)}</td><td>${esc(otherLangName(t, w.lang))}</td><td>${esc(w.native)}</td>${showMeaning ? `<td>${esc(w.gloss)}</td>` : ""}<td>${esc(w.title)}</td></tr>`).join("")}</table>` : ""}
  <h2>${t.storiesH}</h2>${list.map(s => `<h3>${day(s.createdAt)} · ${esc(titleOf(s, child.lang))}${s.concern !== "none" ? ` <span class="muted">(${t.concern[s.concern]})</span>` : ""}</h3><p>${esc(s.summary)}</p><p class="muted">${esc(s.parentNote)}</p>`).join("")}`);
}

// All stories as one illustrated PDF book, cover in the child's story language.
// Each A4 page is drawn on its own canvas, so even a long book never hits the browser's canvas size limit.
export async function downloadBookPdf(list: Story[], child: Child, filename: string) {
  await loadFigures(FIGURE_IDS);
  await document.fonts?.ready;
  const { jsPDF } = await import("jspdf");
  const t = REPORT[child.lang], year = new Date().getFullYear();
  const root = getComputedStyle(document.documentElement);
  const display = `${root.getPropertyValue("--font-fredoka").trim() || "Trebuchet MS"}, Arial, sans-serif`;
  const body = `${root.getPropertyValue("--font-nunito").trim() || "Arial"}, Arial, sans-serif`;

  const W = 1240, H = 1754; // A4 at 150 dpi
  const sheet = document.createElement("canvas"); sheet.width = W; sheet.height = H;
  const x = sheet.getContext("2d")!;
  const art = document.createElement("canvas");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  let first = true;
  const addSheet = () => { if (!first) pdf.addPage(); first = false; pdf.addImage(sheet.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, 210, 297); };
  const wrap = (text: string, font: string, maxW: number) => {
    x.font = font; const lines: string[] = []; let line = "";
    for (const word of text.split(/\s+/)) { const tryLine = line ? line + " " + word : word; if (x.measureText(tryLine).width > maxW && line) { lines.push(line); line = word; } else line = tryLine; }
    if (line) lines.push(line); return lines;
  };
  const centred = (lines: string[], font: string, y: number, step: number, color: string) => { x.font = font; x.fillStyle = color; x.textAlign = "center"; lines.forEach((l, i) => x.fillText(l, W / 2, y + i * step)); };

  // Cover
  x.fillStyle = "#16807f"; x.fillRect(0, 0, W, H);
  x.strokeStyle = "#ffc93c"; x.lineWidth = 10; x.strokeRect(70, 70, W - 140, H - 140);
  centred(wrap(child.name, `700 130px ${display}`, W - 260), `700 130px ${display}`, 700, 150, "#ffc93c");
  centred([`${t.book} · ${year}`], `600 64px ${display}`, 900, 80, "#ffffff");
  centred([t.bookLine(list.length, child.age)], `600 40px ${body}`, 1000, 50, "#d3eeec");
  addSheet();

  for (const s of list) {
    // Story title page
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#eef4f1"; x.fillRect(0, H / 2 - 260, W, 520);
    const titleLines = wrap(titleOf(s, child.lang), `700 92px ${display}`, W - 240);
    centred(titleLines, `700 92px ${display}`, H / 2 - (titleLines.length - 1) * 55, 110, "#1d2a36");
    centred([fmtDay(s.createdAt, t.locale)], `600 38px ${body}`, H / 2 + titleLines.length * 55 + 60, 48, "#5d6b78");
    addSheet();

    // One sheet per story page: picture on top, the child's words below
    for (const [i, p] of s.pages.entries()) {
      paint(art, p, (s.createdAt % 997) + i * 31);
      x.fillStyle = "#ffffff"; x.fillRect(0, 0, W, H);
      // Picture and text together, centred on the page.
      const pw = W - 160, ph = pw * (art.height / art.width), font = `500 66px ${display}`, step = 90;
      const lines = wrap(p.text, font, W - 220);
      const top = Math.max(100, (H - (ph + 110 + lines.length * step)) / 2);
      x.fillStyle = "#eef4f1"; x.beginPath(); x.roundRect(60, top - 20, W - 120, ph + 40, 36); x.fill();
      x.drawImage(art, 80, top, pw, ph);
      x.font = font; x.fillStyle = "#1d2a36"; x.textAlign = "center";
      lines.forEach((l, k) => x.fillText(l, W / 2, top + ph + 120 + k * step));
      x.font = `600 30px ${body}`; x.fillStyle = "#9aa6b2"; x.fillText(String(i + 1), W / 2, H - 70);
      addSheet();
    }
  }
  pdf.save(filename);
}
