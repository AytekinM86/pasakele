// Full-body, chibi-style story characters for book pages. Each is an SVG (100x140 box, feet at the bottom)
// that paint() draws onto the page canvas. The AI picks these ids per page; anything else falls back to an emoji.

const INK = "#1d2a36", SKIN = "#ffd9c2", CHEEK = "#ff9fb8";

const face = (y = 44, cheeks = true) =>
  `<circle cx="42" cy="${y}" r="3.2" fill="${INK}"/><circle cx="58" cy="${y}" r="3.2" fill="${INK}"/>` +
  `<circle cx="43" cy="${y - 1}" r="1" fill="#fff"/><circle cx="59" cy="${y - 1}" r="1" fill="#fff"/>` +
  (cheeks ? `<circle cx="35" cy="${y + 8}" r="4.5" fill="${CHEEK}" opacity=".6"/><circle cx="65" cy="${y + 8}" r="4.5" fill="${CHEEK}" opacity=".6"/>` : "") +
  `<path d="M44 ${y + 10} Q50 ${y + 15} 56 ${y + 10}" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;

type PersonOpts = { hair: string; style: "long" | "short" | "bun" | "sides" | "curl"; top: string; bottom?: string; dress?: boolean; shoes?: string; extra?: string };
function person(o: PersonOpts) {
  const back = o.style === "long" ? `<path d="M24 44 Q20 82 32 94 H68 Q80 82 76 44 Z" fill="${o.hair}"/>` : "";
  const front = {
    long: `<path d="M26 42 Q28 14 50 14 Q72 14 74 42 Q66 26 50 28 Q36 26 26 42 Z" fill="${o.hair}"/>`,
    short: `<path d="M26 42 Q24 16 50 16 Q76 16 74 42 Q70 30 60 30 Q54 22 44 28 Q32 28 26 42 Z" fill="${o.hair}"/>`,
    bun: `<circle cx="50" cy="14" r="9" fill="${o.hair}"/><path d="M26 42 Q26 18 50 18 Q74 18 74 42 Q66 28 50 28 Q34 28 26 42 Z" fill="${o.hair}"/>`,
    sides: `<path d="M26 46 Q22 30 32 24 L35 42 Z M74 46 Q78 30 68 24 L65 42 Z" fill="${o.hair}"/>`,
    curl: `<path d="M50 19 q7 -7 1 -12" stroke="${o.hair}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  }[o.style];
  const body = o.dress
    ? `<path d="M38 66 H62 L76 112 Q50 120 24 112 Z" fill="${o.top}"/>`
    : `<rect x="32" y="66" width="36" height="32" rx="10" fill="${o.top}"/><rect x="34" y="94" width="32" height="16" rx="5" fill="${o.bottom || "#3a5a8c"}"/>`;
  return `${back}
    <rect x="39" y="106" width="9" height="24" rx="4.5" fill="${SKIN}"/><rect x="52" y="106" width="9" height="24" rx="4.5" fill="${SKIN}"/>
    <ellipse cx="42" cy="132" rx="8" ry="5" fill="${o.shoes || "#5a3b2e"}"/><ellipse cx="58" cy="132" rx="8" ry="5" fill="${o.shoes || "#5a3b2e"}"/>
    <rect x="22" y="68" width="10" height="30" rx="5" fill="${o.top}" transform="rotate(14 27 70)"/><rect x="68" y="68" width="10" height="30" rx="5" fill="${o.top}" transform="rotate(-14 73 70)"/>
    <circle cx="22" cy="97" r="5.5" fill="${SKIN}"/><circle cx="78" cy="97" r="5.5" fill="${SKIN}"/>
    ${body}
    <rect x="45" y="60" width="10" height="9" fill="${SKIN}"/>
    <circle cx="50" cy="42" r="24" fill="${SKIN}"/>
    ${front}${face()}${o.extra || ""}`;
}
const GLASSES = `<circle cx="42" cy="44" r="7" fill="none" stroke="#555" stroke-width="2"/><circle cx="58" cy="44" r="7" fill="none" stroke="#555" stroke-width="2"/><path d="M49 44 h2" stroke="#555" stroke-width="2"/>`;
const CROWN = `<path d="M34 22 L38 8 L45 17 L50 4 L55 17 L62 8 L66 22 Z" fill="#ffd25e" stroke="#e8a800" stroke-width="1.5"/>`;
const BOW = `<path d="M66 20 l11 -7 v15 z M66 20 l-9 -7 v15 z" fill="#f27fb2"/><circle cx="66" cy="20" r="3.5" fill="#ffd1e4"/>`;

// Sitting animal, front view: body, head, ears and details are passed in.
const animal = (c: string, belly: string, ears: string, extra = "", tail = "") =>
  `${tail}<ellipse cx="50" cy="104" rx="25" ry="26" fill="${c}"/><ellipse cx="50" cy="110" rx="14" ry="16" fill="${belly}"/>
   <ellipse cx="39" cy="129" rx="9" ry="5.5" fill="${c}"/><ellipse cx="61" cy="129" rx="9" ry="5.5" fill="${c}"/>
   ${ears}<circle cx="50" cy="56" r="26" fill="${c}"/>${extra}`;
const animalFace = (nose = "#ff7a8a") => face(54, true).replace(/M44 64 Q50 69 56 64/, "M45 66 Q50 70 55 66") + `<ellipse cx="50" cy="61" rx="3.5" ry="2.6" fill="${nose}"/>`;

const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140">${body}</svg>`;

export const FIGURES: Record<string, { svg: string; size: number }> = {
  girl: { size: 1, svg: svg(person({ hair: "#8a5a2b", style: "long", top: "#f27fb2", dress: true, extra: BOW })) },
  boy: { size: 1, svg: svg(person({ hair: "#4a3020", style: "short", top: "#3a86ff", bottom: "#2b4a7a" })) },
  mom: { size: 1.18, svg: svg(person({ hair: "#6b3f22", style: "long", top: "#9b6dd6", dress: true })) },
  dad: { size: 1.22, svg: svg(person({ hair: "#2f2a26", style: "short", top: "#2c9b6a", bottom: "#33415c" })) },
  grandma: { size: 1.1, svg: svg(person({ hair: "#c8c8d0", style: "bun", top: "#d65a7a", dress: true, extra: GLASSES })) },
  grandpa: { size: 1.12, svg: svg(person({ hair: "#c8c8d0", style: "sides", top: "#8a6a4a", bottom: "#4a4a5a", extra: GLASSES + `<path d="M42 53 Q50 49 58 53 Q50 57 42 53 Z" fill="#c8c8d0"/>` })) },
  baby: { size: 0.72, svg: svg(person({ hair: "#8a5a2b", style: "curl", top: "#ffd25e", bottom: "#ffd25e", shoes: "#ffb3c7" })) },
  princess: { size: 1.02, svg: svg(person({ hair: "#e8b84a", style: "long", top: "#b77de8", dress: true, extra: CROWN })) },

  cat: { size: 0.85, svg: svg(animal("#f4a24c", "#ffe2bf",
    `<path d="M28 46 L29 20 L46 34 Z M72 46 L71 20 L54 34 Z" fill="#f4a24c"/><path d="M32 40 L33 27 L41 34 Z M68 40 L67 27 L59 34 Z" fill="#ffb3c7"/>`,
    animalFace() + `<path d="M30 60 h-12 M30 64 l-11 4 M70 60 h12 M70 64 l11 4" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`,
    `<path d="M70 120 Q96 116 88 88" stroke="#f4a24c" stroke-width="9" fill="none" stroke-linecap="round"/>`)) },
  dog: { size: 0.9, svg: svg(animal("#e8b878", "#fff1dc",
    `<ellipse cx="25" cy="58" rx="10" ry="22" fill="#8a5a2b" transform="rotate(18 25 58)"/><ellipse cx="75" cy="58" rx="10" ry="22" fill="#8a5a2b" transform="rotate(-18 75 58)"/>`,
    `<ellipse cx="50" cy="66" rx="14" ry="11" fill="#fff1dc"/>` + animalFace(INK) + `<circle cx="64" cy="44" r="7" fill="#8a5a2b" opacity=".45"/>`,
    `<path d="M72 118 Q92 108 88 92" stroke="#e8b878" stroke-width="8" fill="none" stroke-linecap="round"/>`)) },
  bunny: { size: 0.9, svg: svg(animal("#f2f2f5", "#ffffff",
    `<ellipse cx="38" cy="18" rx="8" ry="24" fill="#f2f2f5" stroke="#d6d6de" stroke-width="1.5"/><ellipse cx="62" cy="18" rx="8" ry="24" fill="#f2f2f5" stroke="#d6d6de" stroke-width="1.5"/><ellipse cx="38" cy="18" rx="3.5" ry="16" fill="#ffb3c7"/><ellipse cx="62" cy="18" rx="3.5" ry="16" fill="#ffb3c7"/>`,
    animalFace() + `<rect x="47" y="66" width="6" height="6" rx="1.5" fill="#fff" stroke="#d6d6de"/>`)) },
  bear: { size: 1, svg: svg(animal("#9a6a43", "#d9b48a",
    `<circle cx="30" cy="36" r="10" fill="#9a6a43"/><circle cx="70" cy="36" r="10" fill="#9a6a43"/><circle cx="30" cy="36" r="5" fill="#d9b48a"/><circle cx="70" cy="36" r="5" fill="#d9b48a"/>`,
    `<ellipse cx="50" cy="65" rx="13" ry="10" fill="#d9b48a"/>` + animalFace(INK))) },
  fox: { size: 0.9, svg: svg(animal("#f07a2a", "#fff4ea",
    `<path d="M26 46 L26 16 L46 34 Z M74 46 L74 16 L54 34 Z" fill="#f07a2a"/><path d="M26 22 L26 16 L32 21 Z M74 22 L74 16 L68 21 Z" fill="${INK}"/>`,
    `<path d="M30 60 Q50 86 70 60 Q60 68 50 66 Q40 68 30 60 Z" fill="#fff4ea"/>` + animalFace(INK),
    `<path d="M70 122 Q100 112 90 80" stroke="#f07a2a" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="90" cy="80" r="7" fill="#fff4ea"/>`)) },
  mouse: { size: 0.65, svg: svg(animal("#b8bcc8", "#e6e8ee",
    `<circle cx="28" cy="38" r="15" fill="#b8bcc8"/><circle cx="72" cy="38" r="15" fill="#b8bcc8"/><circle cx="28" cy="38" r="9" fill="#ffb3c7"/><circle cx="72" cy="38" r="9" fill="#ffb3c7"/>`,
    animalFace(),
    `<path d="M72 124 Q98 126 94 102" stroke="#ff9fb8" stroke-width="3" fill="none" stroke-linecap="round"/>`)) },
  bird: { size: 0.6, svg: svg(`<ellipse cx="50" cy="92" rx="32" ry="34" fill="#4fa3f0"/><ellipse cx="50" cy="104" rx="20" ry="20" fill="#cfe8ff"/>
    <path d="M20 94 Q6 80 18 70 Q30 82 30 96 Z" fill="#2f86d6"/><path d="M80 94 Q94 80 82 70 Q70 82 70 96 Z" fill="#2f86d6"/>
    <path d="M40 126 v10 M60 126 v10" stroke="#f2a33a" stroke-width="3" stroke-linecap="round"/>
    ${face(82, true).replace(/<path d="M44 92[^>]*>/, "")}<path d="M45 90 L55 90 L50 99 Z" fill="#f2a33a"/>`) },
  owl: { size: 0.9, svg: svg(`<path d="M24 46 L18 22 L40 36 Z M76 46 L82 22 L60 36 Z" fill="#16807f"/>
    <ellipse cx="50" cy="88" rx="38" ry="46" fill="#16807f"/><ellipse cx="50" cy="104" rx="24" ry="28" fill="#d3eeec"/>
    <circle cx="35" cy="66" r="14" fill="#fff"/><circle cx="65" cy="66" r="14" fill="#fff"/><circle cx="37" cy="68" r="6" fill="${INK}"/><circle cx="67" cy="68" r="6" fill="${INK}"/>
    <path d="M45 78 L50 88 L55 78 Z" fill="#ffc93c"/><path d="M34 134 l5 -7 l5 7 M56 134 l5 -7 l5 7" stroke="#ffc93c" stroke-width="3.5" fill="none" stroke-linecap="round"/>`) },
  dragon: { size: 1.1, svg: svg(`<path d="M28 92 L2 62 L12 98 Z M72 92 L98 62 L88 98 Z" fill="#c98bf0"/>
    ${animal("#9b59d6", "#e7cdfa", `<path d="M34 36 L30 16 L42 30 Z M66 36 L70 16 L58 30 Z" fill="#ffd25e"/>`,
      `<ellipse cx="50" cy="66" rx="14" ry="10" fill="#b77de8"/><circle cx="45" cy="64" r="1.8" fill="${INK}"/><circle cx="55" cy="64" r="1.8" fill="${INK}"/>` + face(50, true).replace(/<path d="M44 60[^>]*>/, "") + `<path d="M43 70 Q50 76 57 70" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      `<path d="M72 118 Q100 118 96 96 l6 -2 l-4 8" stroke="#9b59d6" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)}`) },
  dinosaur: { size: 1, svg: svg(`<path d="M34 30 l6 -12 l6 12 z M46 25 l6 -13 l6 13 z M58 30 l6 -12 l6 12 z" fill="#ff9f43"/>
    ${animal("#5cbf6a", "#c8f0b8", "", `<circle cx="42" cy="50" r="7" fill="#fff"/><circle cx="58" cy="50" r="7" fill="#fff"/><circle cx="43" cy="52" r="3.5" fill="${INK}"/><circle cx="59" cy="52" r="3.5" fill="${INK}"/><path d="M38 66 Q50 76 62 66" stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`,
      `<path d="M72 118 Q98 122 98 104" stroke="#5cbf6a" stroke-width="12" fill="none" stroke-linecap="round"/>`)}`) },
  unicorn: { size: 1.05, svg: svg(`<path d="M24 50 Q14 80 28 104 Q30 78 38 62 Z" fill="#c9a0ff"/>
    ${animal("#ffffff", "#ffe3ef", `<path d="M32 40 l-4 -14 l12 8 z M68 40 l4 -14 l-12 8 z" fill="#fff" stroke="#e0dbe8" stroke-width="1.5"/>`,
      `<path d="M45 32 L50 4 L55 32 Z" fill="#ffd25e"/><ellipse cx="50" cy="68" rx="14" ry="9" fill="#ffe3ef"/>` + animalFace("#ff9fb8"))}`.replace(/fill="#ffffff"/g, 'fill="#ffffff" stroke="#e0dbe8" stroke-width="1.5"')) },
  horse: { size: 1.1, svg: svg(`<path d="M26 44 Q16 76 30 100 Q32 74 40 58 Z" fill="#5a3b2e"/>
    ${animal("#b0784a", "#e6c29c", `<path d="M34 40 l-3 -14 l11 8 z M66 40 l3 -14 l-11 8 z" fill="#b0784a"/>`,
      `<ellipse cx="50" cy="70" rx="15" ry="10" fill="#e6c29c"/>` + animalFace(INK))}`) },
  fish: { size: 0.7, svg: svg(`<path d="M80 92 L100 74 L100 110 Z" fill="#ff8a3d"/><ellipse cx="48" cy="92" rx="36" ry="24" fill="#ffa24c"/>
    <path d="M40 70 Q50 58 62 70" fill="#ff8a3d"/><circle cx="30" cy="88" r="5" fill="#fff"/><circle cx="29" cy="88" r="2.6" fill="${INK}"/>
    <path d="M18 98 Q24 102 30 98" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M52 80 q6 12 0 24 M64 82 q6 10 0 20" stroke="#ff8a3d" stroke-width="3" fill="none"/>`) },
  car: { size: 1.1, svg: svg(`<path d="M6 116 Q6 98 22 96 L34 78 Q38 72 46 72 H66 Q74 72 78 80 L88 96 Q98 98 98 116 Z" fill="#e63946"/>
    <path d="M40 80 H56 V95 H32 Z M60 80 H70 Q74 80 76 86 L80 95 H60 Z" fill="#bfe6ff"/><circle cx="94" cy="104" r="3.5" fill="#ffe680"/>
    <circle cx="28" cy="118" r="12" fill="${INK}"/><circle cx="76" cy="118" r="12" fill="${INK}"/><circle cx="28" cy="118" r="5" fill="#ccc"/><circle cx="76" cy="118" r="5" fill="#ccc"/>`) },
  truck: { size: 1.25, svg: svg(`<rect x="2" y="66" width="62" height="48" rx="4" fill="#3fae4a"/><rect x="6" y="70" width="54" height="6" rx="2" fill="#5cc966"/>
    <path d="M66 74 H84 Q92 74 94 84 L98 114 H66 Z" fill="#ff9f1c"/><rect x="72" y="80" width="17" height="14" rx="3" fill="#bfe6ff"/>
    <rect x="2" y="112" width="96" height="6" fill="#555"/><circle cx="96" cy="106" r="3" fill="#ffe680"/>
    <circle cx="18" cy="122" r="11" fill="${INK}"/><circle cx="44" cy="122" r="11" fill="${INK}"/><circle cx="82" cy="122" r="11" fill="${INK}"/>
    <circle cx="18" cy="122" r="4.5" fill="#ccc"/><circle cx="44" cy="122" r="4.5" fill="#ccc"/><circle cx="82" cy="122" r="4.5" fill="#ccc"/>`) },
  bus: { size: 1.3, svg: svg(`<rect x="2" y="62" width="96" height="54" rx="10" fill="#ffc93c"/>
    <rect x="8" y="70" width="16" height="16" rx="3" fill="#bfe6ff"/><rect x="28" y="70" width="16" height="16" rx="3" fill="#bfe6ff"/><rect x="48" y="70" width="16" height="16" rx="3" fill="#bfe6ff"/><rect x="70" y="70" width="22" height="26" rx="3" fill="#bfe6ff"/>
    <rect x="2" y="98" width="96" height="5" fill="#e8a800"/><circle cx="24" cy="120" r="11" fill="${INK}"/><circle cx="76" cy="120" r="11" fill="${INK}"/><circle cx="24" cy="120" r="4.5" fill="#ccc"/><circle cx="76" cy="120" r="4.5" fill="#ccc"/>`) },
  robot: { size: 1, svg: svg(`<path d="M50 14 V4" stroke="#8892a6" stroke-width="3"/><circle cx="50" cy="4" r="4" fill="#ff5d5d"/>
    <rect x="24" y="14" width="52" height="42" rx="10" fill="#b8c2d6"/><rect x="31" y="22" width="38" height="24" rx="6" fill="#1d2a36"/>
    <circle cx="42" cy="34" r="4" fill="#5cf2c8"/><circle cx="58" cy="34" r="4" fill="#5cf2c8"/><path d="M45 41 Q50 44 55 41" stroke="#5cf2c8" stroke-width="2" fill="none"/>
    <rect x="30" y="60" width="40" height="44" rx="8" fill="#97a3bb"/><circle cx="50" cy="80" r="7" fill="#ffd25e"/>
    <rect x="16" y="64" width="10" height="30" rx="5" fill="#b8c2d6"/><rect x="74" y="64" width="10" height="30" rx="5" fill="#b8c2d6"/>
    <rect x="36" y="104" width="10" height="24" rx="4" fill="#b8c2d6"/><rect x="54" y="104" width="10" height="24" rx="4" fill="#b8c2d6"/>
    <rect x="32" y="126" width="16" height="8" rx="3" fill="#6b7489"/><rect x="52" y="126" width="16" height="8" rx="3" fill="#6b7489"/>`) },
};
export const FIGURE_IDS = Object.keys(FIGURES);

// Loaded images, shared by every canvas. load() resolves once all figures can be drawn.
const cache: Record<string, HTMLImageElement> = {};
export function figureImage(id: string): HTMLImageElement | null {
  const f = FIGURES[id];
  if (!f || typeof Image === "undefined") return null;
  if (!cache[id]) { const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(f.svg); cache[id] = img; }
  return cache[id];
}
export function loadFigures(ids: string[]): Promise<void> {
  return Promise.all(ids.map(id => figureImage(id)).filter((i): i is HTMLImageElement => !!i)
    .map(img => img.complete && img.naturalWidth ? Promise.resolve() : new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r(); }))).then(() => {});
}
