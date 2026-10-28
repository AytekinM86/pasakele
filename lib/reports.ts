import { EMO, LANGS, type Child, type Insight, type Story } from "./data";
import { paint } from "./paint";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const day = (t: number) => new Date(t).toLocaleDateString();

const shell = (title: string, body: string) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>body{font:15px/1.55 Georgia,"Times New Roman",serif;color:#1d2a36;max-width:760px;margin:0 auto;padding:32px 20px}h1,h2,h3{font-family:Arial,Helvetica,sans-serif;line-height:1.2}h1{font-size:26px;margin:0 0 4px}h2{font-size:18px;margin:28px 0 8px;border-bottom:2px solid #16807f;padding-bottom:4px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #cfdcd6;padding:5px 8px;text-align:left;vertical-align:top}th{background:#eef4f1}.muted{color:#5d6b78}.box{background:#eef4f1;border-radius:8px;padding:10px 14px}.page{page-break-after:always;break-after:page;text-align:center;padding-top:20px}.page img{width:100%;max-width:640px;border-radius:12px}.page p{font-size:22px;font-family:Arial,sans-serif;margin:16px 30px}.cover{display:flex;flex-direction:column;justify-content:center;min-height:80vh;text-align:center}@media print{body{padding:0}}</style></head><body>${body}</body></html>`;

// Report a parent can hand to a child psychologist. Opens in a browser; Print -> Save as PDF makes a PDF.
export function reportHTML(list: Story[], child: Child, ins: Insight | null, psy: string) {
  const L = LANGS[child.lang].english;
  const fw = list.flatMap(s => (s.foreignWords || []).map(w => ({ ...w, t: s.title })));
  const chars: Record<string, { role: string; n: number }> = {};
  list.forEach(s => (s.characters || []).forEach(c => { chars[c.name] = chars[c.name] || { role: c.role, n: 0 }; chars[c.name].n++; }));
  const themeN: Record<string, number> = {};
  list.forEach(s => s.themes.forEach(t => (themeN[t] = (themeN[t] || 0) + 1)));
  return shell(`Pasakėlė report: ${child.name}`, `
  <h1>Story report: ${esc(child.name)}, age ${child.age}</h1>
  <p class="muted">${list.length} stories, ${day(list[0]?.createdAt ?? Date.now())} to ${day(list.at(-1)?.createdAt ?? Date.now())}. Story language: ${L}. Prepared ${day(Date.now())} with Pasakėlė${psy ? ` for ${esc(psy)}` : ""}.</p>
  <p class="box">Shared with the parent's or guardian's consent. Pasakėlė describes patterns in stories the child invented. It is not a diagnosis or a clinical assessment.</p>
  ${ins ? `<h2>Summary</h2><p><b>${esc(ins.headline)}</b></p><ul>${ins.observations.map(o => `<li>${esc(o)}</li>`).join("")}</ul>` : ""}
  <h2>Themes</h2><table><tr><th>Theme</th><th>Stories</th></tr>${Object.entries(themeN).sort((a, b) => b[1] - a[1]).map(([t, n]) => `<tr><td>${t}</td><td>${n}</td></tr>`).join("")}</table>
  <h2>Feelings per story (0–3)</h2><table><tr><th>Date</th><th>Story</th>${EMO.map(e => `<th>${e[1]}</th>`).join("")}</tr>
    ${list.map(s => `<tr><td>${day(s.createdAt)}</td><td>${esc(s.title)}</td>${EMO.map(e => `<td>${s.emotions?.[e[0]] || 0}</td>`).join("")}</tr>`).join("")}</table>
  <h2>Characters</h2><table><tr><th>Character</th><th>Role</th><th>Stories</th></tr>${Object.entries(chars).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v.role)}</td><td>${v.n}</td></tr>`).join("")}</table>
  <h2>Language</h2><p>${fw.length ? `${fw.length} words were said in another language inside ${L} stories:` : `All stories were told fully in ${L}.`}</p>
  ${fw.length ? `<table><tr><th>Said</th><th>Language</th><th>${L}</th><th>Meaning</th><th>Story</th></tr>${fw.map(w => `<tr><td>${esc(w.word)}</td><td>${esc(w.lang)}</td><td>${esc(w.native)}</td><td>${esc(w.gloss)}</td><td>${esc(w.t)}</td></tr>`).join("")}</table>` : ""}
  <h2>Stories</h2>${list.map(s => `<h3>${day(s.createdAt)} · ${esc(s.title)}${s.concern !== "none" ? ` <span class="muted">(${s.concern})</span>` : ""}</h3><p>${esc(s.summary)}</p><p class="muted">${esc(s.parentNote)}</p>`).join("")}`);
}

// All stories as one illustrated book.
export function bookHTML(list: Story[], child: Child) {
  const cv = document.createElement("canvas"), year = new Date().getFullYear();
  const pages = list.map(s => `<div class="page"><h2 style="border:0">${esc(s.title)}</h2><p class="muted" style="font-size:14px">${day(s.createdAt)}</p></div>` +
    s.pages.map((p, i) => { paint(cv, p, (s.createdAt % 997) + i * 31); return `<div class="page"><img src="${cv.toDataURL("image/jpeg", 0.82)}" alt=""><p>${esc(p.text)}</p></div>`; }).join("")).join("");
  return shell(`${child.name}'s Stories ${year}`, `<div class="page cover"><h1 style="font-size:42px">${esc(child.name)}'s Stories</h1><p class="muted">${year} · ${list.length} stories told by ${esc(child.name)}, age ${child.age}</p></div>${pages}`);
}

export function download(filename: string, html: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
