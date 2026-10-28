import type { CompanionId } from "@/lib/data";
import type { GiftId } from "@/lib/rewards";

// Hand-drawn story friends. All share a 120x130 box; "owl-body" makes them bob while the friend is thinking.
const INK = "var(--ink)";

function Owl() {
  return <>
    <path d="M28 30 L22 8 L44 22 Z M92 30 L98 8 L76 22 Z" fill="var(--teal)" />
    <ellipse cx="60" cy="72" rx="44" ry="52" fill="var(--teal)" /><ellipse cx="60" cy="88" rx="28" ry="32" fill="var(--teal-soft)" />
    <circle cx="42" cy="50" r="16" fill="var(--paper)" /><circle cx="78" cy="50" r="16" fill="var(--paper)" />
    <circle cx="44" cy="52" r="7" fill={INK} /><circle cx="80" cy="52" r="7" fill={INK} />
    <rect className="lid" x="26" y="34" width="68" height="32" rx="16" fill="var(--teal)" />
    <path d="M54 62 L60 74 L66 62 Z" fill="var(--sun)" />
    <path d="M40 122 l6 -8 l6 8 M68 122 l6 -8 l6 8" stroke="var(--sun)" strokeWidth="4" fill="none" strokeLinecap="round" />
  </>;
}

function Doll() {
  return <>
    <ellipse cx="60" cy="50" rx="36" ry="38" fill="#8a5a2b" />
    <path d="M60 112 L40 112 Q38 92 46 76 H74 Q82 92 80 112 Z" fill="#f27fb2" />
    <path d="M46 76 H74 L70 84 H50 Z" fill="#ffd1e4" />
    <path d="M48 112 v12 M72 112 v12" stroke="#ffd9c2" strokeWidth="6" strokeLinecap="round" />
    <circle cx="60" cy="52" r="26" fill="#ffd9c2" />
    <path d="M34 50 Q38 22 60 22 Q82 22 86 50 Q76 34 60 34 Q46 34 34 50 Z" fill="#8a5a2b" />
    <circle cx="50" cy="54" r="3.6" fill={INK} /><circle cx="70" cy="54" r="3.6" fill={INK} />
    <circle cx="44" cy="62" r="4.5" fill="#ff9fb8" opacity=".7" /><circle cx="76" cy="62" r="4.5" fill="#ff9fb8" opacity=".7" />
    <path d="M53 64 Q60 70 67 64" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M80 22 l12 -8 v16 z M80 22 l-12 -8 v16 z" fill="#f27fb2" /><circle cx="80" cy="22" r="4" fill="#ffd1e4" />
  </>;
}

function Car() {
  return <>
    <path d="M32 62 L44 36 H76 L88 62 Z" fill="#ff8a1f" />
    <path d="M40 60 L48 42 H72 L80 60 Z" fill="#bfe6ff" />
    <rect x="56" y="36" width="8" height="24" fill="#fff" opacity=".55" />
    <rect x="14" y="58" width="92" height="46" rx="18" fill="#ff8a1f" />
    <circle cx="38" cy="78" r="11" fill="#fff" /><circle cx="82" cy="78" r="11" fill="#fff" />
    <circle cx="40" cy="80" r="5.5" fill={INK} /><circle cx="84" cy="80" r="5.5" fill={INK} />
    <path d="M48 92 Q60 101 72 92" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <rect x="18" y="100" width="20" height="18" rx="6" fill={INK} /><rect x="82" y="100" width="20" height="18" rx="6" fill={INK} />
    <circle cx="20" cy="70" r="3" fill="#ffe680" /><circle cx="100" cy="70" r="3" fill="#ffe680" />
  </>;
}

function Puppy() {
  return <>
    <ellipse cx="60" cy="106" rx="30" ry="20" fill="#e8b878" />
    <ellipse cx="28" cy="52" rx="12" ry="24" fill="#8a5a2b" transform="rotate(18 28 52)" />
    <ellipse cx="92" cy="52" rx="12" ry="24" fill="#8a5a2b" transform="rotate(-18 92 52)" />
    <circle cx="60" cy="56" r="32" fill="#e8b878" />
    <circle cx="74" cy="42" r="9" fill="#8a5a2b" opacity=".45" />
    <ellipse cx="60" cy="70" rx="17" ry="13" fill="#fff1dc" />
    <ellipse cx="60" cy="63" rx="6.5" ry="5" fill={INK} />
    <circle cx="47" cy="50" r="4.2" fill={INK} /><circle cx="73" cy="50" r="4.2" fill={INK} />
    <path d="M53 73 Q60 79 67 73" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M57 76 q3 9 6 0 z" fill="#ff7a8a" />
  </>;
}

function Dino() {
  return <>
    <path d="M40 26 l6 -13 l6 13 z M54 21 l6 -15 l6 15 z M68 26 l6 -13 l6 13 z" fill="#ff9f43" />
    <ellipse cx="60" cy="104" rx="30" ry="22" fill="#5cbf6a" />
    <ellipse cx="60" cy="108" rx="18" ry="14" fill="#c8f0b8" />
    <ellipse cx="60" cy="54" rx="36" ry="30" fill="#5cbf6a" />
    <circle cx="46" cy="48" r="8" fill="#fff" /><circle cx="74" cy="48" r="8" fill="#fff" />
    <circle cx="47" cy="50" r="4" fill={INK} /><circle cx="75" cy="50" r="4" fill={INK} />
    <circle cx="54" cy="64" r="1.8" fill={INK} /><circle cx="66" cy="64" r="1.8" fill={INK} />
    <path d="M42 70 Q60 82 78 70" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
  </>;
}

function Unicorn() {
  return <>
    <path d="M30 44 Q20 74 36 98 Q38 72 46 56 Z" fill="#c9a0ff" /><path d="M36 40 Q30 64 42 84 Q44 64 50 52 Z" fill="#ff9fcb" />
    <ellipse cx="60" cy="106" rx="28" ry="18" fill="#fff" stroke="var(--line)" strokeWidth="2" />
    <path d="M42 34 l-4 -14 l12 8 z M78 34 l4 -14 l-12 8 z" fill="#fff" stroke="var(--line)" strokeWidth="2" />
    <ellipse cx="60" cy="60" rx="30" ry="32" fill="#fff" stroke="var(--line)" strokeWidth="2" />
    <path d="M54 30 L60 4 L66 30 Z" fill="#ffd25e" /><path d="M56 22 h8 M57 14 h6" stroke="#e8a800" strokeWidth="2" />
    <circle cx="48" cy="56" r="4" fill={INK} /><circle cx="72" cy="56" r="4" fill={INK} />
    <path d="M42 50 l-4 -3 M78 50 l4 -3" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="60" cy="78" rx="16" ry="11" fill="#ffe3ef" />
    <circle cx="54" cy="77" r="1.8" fill={INK} /><circle cx="66" cy="77" r="1.8" fill={INK} />
    <circle cx="40" cy="66" r="4" fill="#ff9fb8" opacity=".6" /><circle cx="80" cy="66" r="4" fill="#ff9fb8" opacity=".6" />
  </>;
}

const DRAW: Record<CompanionId, () => React.ReactElement> = { owl: Owl, doll: Doll, car: Car, puppy: Puppy, dino: Dino, unicorn: Unicorn };

// Presents the friend has received as the child's bookshelf grows (see lib/rewards.ts).
function Gifts({ gifts, front }: { gifts: GiftId[]; front: boolean }) {
  const has = (g: GiftId) => gifts.includes(g);
  if (!front) return has("rainbow") ? <g opacity=".85" fill="none" strokeWidth="5">
    <path d="M8 118 A52 52 0 0 1 112 118" stroke="#ff7a7a" /><path d="M14 118 A46 46 0 0 1 106 118" stroke="#ffd25e" />
    <path d="M20 118 A40 40 0 0 1 100 118" stroke="#6fd19d" /><path d="M26 118 A34 34 0 0 1 94 118" stroke="#7ea6ff" /></g> : null;
  return <>
    {has("sparkle") && <g className="sparkle" fill="#ffd25e"><path d="M104 8 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" /><path d="M114 32 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 z" /></g>}
    {has("balloon") && <g className="balloon"><path d="M12 40 Q16 62 10 84" stroke="#888" strokeWidth="1.2" fill="none" /><ellipse cx="12" cy="26" rx="9" ry="12" fill="#ff5d73" /><path d="M10 37 h4 l-2 4 z" fill="#ff5d73" /><ellipse cx="9" cy="22" rx="2.5" ry="4" fill="#fff" opacity=".6" /></g>}
    {has("medal") && <g><path d="M96 92 l-5 12 h10 z M104 92 l5 12 h-10 z" fill="#3a86ff" /><circle cx="100" cy="110" r="8" fill="#ffc93c" stroke="#e8a800" strokeWidth="2" /><path d="M100 105 l1.6 3.4 3.6.4 -2.7 2.4 .8 3.6 -3.3 -1.9 -3.3 1.9 .8 -3.6 -2.7 -2.4 3.6 -.4 z" fill="#fff8d6" /></g>}
    {has("crown") && <g transform="rotate(-14 22 12)"><path d="M8 18 L11 4 L17 11 L22 2 L27 11 L33 4 L36 18 Z" fill="#ffd25e" stroke="#e8a800" strokeWidth="1.5" /><circle cx="22" cy="14" r="2" fill="#ff5d73" /></g>}
  </>;
}

export function Character({ id = "owl", className = "owl", gifts = [] }: { id?: CompanionId; className?: string; gifts?: GiftId[] }) {
  const Draw = DRAW[id] || Owl;
  return <svg className={className} viewBox="0 0 120 130" aria-hidden="true">
    <Gifts gifts={gifts} front={false} /><g className="owl-body"><Draw /></g><Gifts gifts={gifts} front />
  </svg>;
}
