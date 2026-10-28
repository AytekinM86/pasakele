// Turns one of our report/book HTML documents into a downloaded PDF, in the browser.
// The page is drawn by the browser itself, so Azerbaijani, Lithuanian and Russian letters always render.
export async function downloadPdf(filename: string, html: string) {
  const { default: html2pdf } = await import("html2pdf.js");
  const doc = new DOMParser().parseFromString(html, "text/html");
  const css = [...doc.querySelectorAll("style")].map(s => s.textContent || "").join("\n")
    .replace(/\bbody\s*\{/g, ".pdfdoc{").replace(/@media print\s*\{[^}]*\}\s*\}/g, "");

  // The page itself carries no positioning (html2pdf clones it, and a clone placed off-screen renders blank);
  // only its wrapper is moved out of sight. A4 width, always on white whatever the app's theme is.
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;left:-10000px;top:0";
  const box = document.createElement("div");
  box.className = "pdfdoc";
  box.style.cssText = "width:760px;background:#fff;color:#1d2a36;margin:0;padding:24px";
  box.innerHTML = `<style>${css}.pdfdoc .cover{min-height:900px}</style>` + doc.body.innerHTML;
  wrap.appendChild(box);
  document.body.appendChild(wrap);
  try {
    await Promise.all([...box.querySelectorAll("img")].map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
    const options = {
      margin: [10, 10, 12, 10] as [number, number, number, number],
      filename,
      image: { type: "jpeg" as const, quality: 0.92 },
      html2canvas: { scale: 2, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      // Not in html2pdf's type definitions, but supported by the library.
      pagebreak: { mode: ["css", "legacy"], avoid: ["tr", "h2", "h3", ".page img", ".box"] },
    };
    await html2pdf().set(options).from(box).save();
  } finally {
    wrap.remove();
  }
}
