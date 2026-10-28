import { EMO, type Child, type Insight, type Role, type Story, type Theme } from "./data";
import { paint } from "./paint";
import { REPORT, otherLangName } from "./reportText";
import { FIGURE_IDS, loadFigures } from "./figures";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const shell = (lang: string, title: string, body: string) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>body{font:15px/1.55 Georgia,"Times New Roman",serif;color:#1d2a36;max-width:760px;margin:0 auto;padding:32px 20px}h1,h2,h3{font-family:Arial,Helvetica,sans-serif;line-height:1.2}h1{font-size:26px;margin:0 0 4px}h2{font-size:18px;margin:28px 0 8px;border-bottom:2px solid #16807f;padding-bottom:4px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #cfdcd6;padding:5px 8px;text-align:left;vertical-align:top}th{background:#eef4f1}.muted{color:#5d6b78}.box{background:#eef4f1;border-radius:8px;padding:10px 14px}.meta{display:grid;grid-template-columns:auto 1fr;gap:2px 14px;margin:8px 0 14px}.meta b{font-family:Arial,sans-serif;font-size:13px;color:#5d6b78}.page{page-break-after:always;break-after:page;text-align:center;padding-top:20px}.page img{width:100%;max-width:640px;border-radius:12px}.page p{font-size:22px;font-family:Arial,sans-serif;margin:16px 30px}.cover{display:flex;flex-direction:column;justify-content:center;min-height:80vh;text-align:center}@media print{body{padding:0}}</style></head><body>${body}</body></html>`;

// Report a parent can hand to a child psychologist, entirely in the child's story language.
// Opens in a browser; Print -> Save as PDF makes a PDF.
export function reportHTML(list: Story[], child: Child, ins: Insight | null, psy: string) {
  const t = REPORT[child.lang];
  const day = (ms: number) => new Date(ms).toLocaleDateString(t.locale);
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
    ${list.map(s => `<tr><td>${day(s.createdAt)}</td><td>${esc(s.title)}</td>${EMO.map(e => `<td>${s.emotions?.[e[0]] || 0}</td>`).join("")}</tr>`).join("")}</table>
  <h2>${t.characters}</h2><table><tr><th>${t.character}</th><th>${t.role}</th><th>${t.count}</th></tr>${Object.entries(chars).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(t.role_[v.role] || v.role)}</td><td>${v.n}</td></tr>`).join("")}</table>
  <h2>${t.language}</h2><p>${fw.length ? t.foreign(fw.length) : t.allFull}</p>
  ${fw.length ? `<table><tr><th>${t.said}</th><th>${t.otherLang}</th><th>${t.homeWord}</th>${showMeaning ? `<th>${t.meaning}</th>` : ""}<th>${t.story}</th></tr>${fw.map(w => `<tr><td>${esc(w.word)}</td><td>${esc(otherLangName(t, w.lang))}</td><td>${esc(w.native)}</td>${showMeaning ? `<td>${esc(w.gloss)}</td>` : ""}<td>${esc(w.title)}</td></tr>`).join("")}</table>` : ""}
  <h2>${t.storiesH}</h2>${list.map(s => `<h3>${day(s.createdAt)} · ${esc(s.title)}${s.concern !== "none" ? ` <span class="muted">(${t.concern[s.concern]})</span>` : ""}</h3><p>${esc(s.summary)}</p><p class="muted">${esc(s.parentNote)}</p>`).join("")}`);
}

// All stories as one illustrated book, with the cover in the child's story language.
export async function bookHTML(list: Story[], child: Child) {
  await loadFigures(FIGURE_IDS);
  const t = REPORT[child.lang];
  const day = (ms: number) => new Date(ms).toLocaleDateString(t.locale);
  const cv = document.createElement("canvas"), year = new Date().getFullYear();
  const pages = list.map(s => `<div class="page"><h2 style="border:0">${esc(s.title)}</h2><p class="muted" style="font-size:14px">${day(s.createdAt)}</p></div>` +
    s.pages.map((p, i) => { paint(cv, p, (s.createdAt % 997) + i * 31); return `<div class="page"><img src="${cv.toDataURL("image/jpeg", 0.82)}" alt=""><p>${esc(p.text)}</p></div>`; }).join("")).join("");
  return shell(child.lang, `${child.name} · ${t.book} ${year}`, `<div class="page cover"><h1 style="font-size:42px">${esc(child.name)}</h1><p style="font-size:24px;font-family:Arial,sans-serif;margin:6px 0">${t.book} · ${year}</p><p class="muted">${t.bookLine(list.length, child.age)}</p></div>${pages}`);
}

export function download(filename: string, html: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
