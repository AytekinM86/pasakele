import type { Page } from "./data";
import { FIGURES, figureImage } from "./figures";

// Deterministic pseudo-random numbers so each page always gets the same picture.
function rnd(seed: number) {
  let s = seed % 2147483647 || 7;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Draws a simple storybook scene (sky, ground, setting, characters) onto a canvas.
// Characters are drawn full-body figures when known (see figures.ts), otherwise emoji.
// onReady is called once a figure that wasn't loaded yet arrives, so the caller can repaint.
export function paint(cv: HTMLCanvasElement, p: Page, seed: number, onReady?: () => void) {
  const W = 800, H = 500, x = cv.getContext("2d");
  if (!x) return;
  cv.width = W; cv.height = H;
  const r = rnd(seed + 11);
  const night = p.time === "night";
  const sky = { day: ["#8fd3ff", "#d9f3ff"], night: ["#1b2050", "#3b3f86"], sunset: ["#ff9a6b", "#ffd98a"] }[p.time] || ["#8fd3ff", "#d9f3ff"];
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]); x.fillStyle = g; x.fillRect(0, 0, W, H);

  if (night || p.setting === "space") {
    x.fillStyle = "#fff";
    for (let i = 0; i < 70; i++) { x.globalAlpha = 0.4 + r() * 0.6; x.beginPath(); x.arc(r() * W, r() * H * 0.7, r() * 2 + 0.5, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    x.fillStyle = "#fff4c2"; x.beginPath(); x.arc(660, 90, 40, 0, 7); x.fill();
    x.fillStyle = sky[0]; x.beginPath(); x.arc(678, 80, 36, 0, 7); x.fill();
  } else {
    x.fillStyle = p.time === "sunset" ? "#ffefb0" : "#fff3a6"; x.beginPath(); x.arc(660, 90, 46, 0, 7); x.fill();
    x.fillStyle = "rgba(255,255,255,.9)";
    for (let i = 0; i < 3; i++) { const cx = 80 + r() * 500, cy = 50 + r() * 90; [0, 28, 56].forEach((d, j) => { x.beginPath(); x.arc(cx + d, cy - (j === 1 ? 14 : 0), 26, 0, 7); x.fill(); }); }
  }

  const ground = (c: string, y: number, amp: number) => { x.fillStyle = c; x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= W; i += 20) x.lineTo(i, y + Math.sin(i / 90 + seed) * amp); x.lineTo(W, H); x.fill(); };
  const s = p.setting;
  if (s === "sea") ["#4aa3df", "#2f86c6", "#1f6aa5"].forEach((c, i) => ground(c, 300 + i * 50, 12));
  else if (s === "space") { x.fillStyle = "#ff8fb1"; x.beginPath(); x.arc(150, 140, 55, 0, 7); x.fill(); x.strokeStyle = "#ffd36b"; x.lineWidth = 8; x.beginPath(); x.ellipse(150, 140, 90, 20, -0.3, 0, 7); x.stroke(); ground("#8a8fb8", 400, 8); }
  else if (s === "sky") ground("rgba(255,255,255,.85)", 420, 18);
  else {
    ground(night ? "#2f5a45" : "#7cc576", 330, 22); ground(night ? "#24493a" : "#5fae5c", 390, 14);
    if (s === "forest") for (let i = 0; i < 9; i++) { const tx = r() * W, ty = 300 + r() * 40, h = 90 + r() * 70; x.fillStyle = night ? "#1d3d2f" : "#2f7d4f"; x.beginPath(); x.moveTo(tx, ty - h); x.lineTo(tx - 35, ty); x.lineTo(tx + 35, ty); x.fill(); x.fillStyle = "#6b4a2b"; x.fillRect(tx - 5, ty, 10, 22); }
    if (s === "castle") { x.fillStyle = "#c9b8e8"; x.fillRect(470, 170, 200, 170); [470, 620].forEach(tx => { x.fillRect(tx, 130, 50, 210); x.fillStyle = "#e46f8f"; x.beginPath(); x.moveTo(tx - 5, 130); x.lineTo(tx + 25, 80); x.lineTo(tx + 55, 130); x.fill(); x.fillStyle = "#c9b8e8"; }); x.fillStyle = "#7a5aa8"; x.beginPath(); x.arc(570, 340, 30, Math.PI, 0); x.fill(); }
    if (s === "home") { x.fillStyle = "#ffb27a"; x.fillRect(480, 210, 190, 140); x.fillStyle = "#d65a4a"; x.beginPath(); x.moveTo(460, 215); x.lineTo(575, 130); x.lineTo(690, 215); x.fill(); x.fillStyle = night ? "#ffe680" : "#bfe6ff"; x.fillRect(505, 240, 45, 40); x.fillRect(600, 240, 45, 40); x.fillStyle = "#7a4a2b"; x.fillRect(555, 290, 40, 60); }
    if (s === "city") for (let i = 0; i < 7; i++) { const bw = 70 + r() * 40, bh = 120 + r() * 150, bx = 40 + i * 110; x.fillStyle = ["#9db4d8", "#c7a8d8", "#f0b48a", "#8fc9c0"][i % 4]; x.fillRect(bx, 340 - bh, bw, bh); x.fillStyle = night ? "#ffe680" : "rgba(255,255,255,.7)"; for (let wy = 340 - bh + 14; wy < 325; wy += 26) for (let wx = bx + 10; wx < bx + bw - 14; wx += 22) x.fillRect(wx, wy, 10, 12); }
    if (s === "meadow") for (let i = 0; i < 40; i++) { x.fillStyle = ["#ff7aa2", "#ffd34d", "#ffffff", "#b48cff"][i % 4]; x.beginPath(); x.arc(r() * W, 350 + r() * 140, 5, 0, 7); x.fill(); }
  }

  const ch = (p.characters || []).slice(0, 3), n = ch.length;
  x.textAlign = "center"; x.textBaseline = "middle";
  let waiting = false;
  ch.forEach((e, i) => {
    const cx = W * (n === 1 ? 0.38 : 0.2 + i * (0.6 / (n - 1 || 1))), groundY = 462 - (i % 2) * 22;
    const id = e.trim().toLowerCase(), fig = FIGURES[id];
    x.fillStyle = "rgba(0,0,0,.15)"; x.beginPath(); x.ellipse(cx, groundY, 58, 12, 0, 0, 7); x.fill();
    if (fig) {
      const img = figureImage(id)!;
      if (img.complete && img.naturalWidth) {
        const h = 215 * fig.size * (i === 0 ? 1 : 0.9), w = h * 100 / 140;
        x.drawImage(img, cx - w / 2, groundY - h + 4, w, h);
      } else if (!waiting && onReady) { waiting = true; img.addEventListener("load", onReady, { once: true }); }
      return;
    }
    x.fillStyle = "#000"; x.font = `${i === 0 ? 130 : 105}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; x.fillText(e, cx, groundY - 70);
  });
}
