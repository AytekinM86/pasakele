import type { LangCode, Story } from "./data";
import { FIGURES, FIGURE_IDS, figureFor } from "./figures";

// Rewards stay gentle on purpose: nothing is ever lost, no streaks, no scores.
// Stickers come from the characters in the child's own stories; friends get presents as the bookshelf grows.

export const GIFTS = [
  { id: "sparkle", at: 1 }, { id: "balloon", at: 3 }, { id: "medal", at: 5 }, { id: "crown", at: 8 }, { id: "rainbow", at: 12 },
] as const;
export type GiftId = (typeof GIFTS)[number]["id"];

export const giftsFor = (books: number): GiftId[] => GIFTS.filter(g => books >= g.at).map(g => g.id);
export const nextGiftIn = (books: number) => { const g = GIFTS.find(g => books < g.at); return g ? g.at - books : 0; };

// Sticker ids collected from all stories' pictures (only drawn figures count, not emoji).
export const stickersFrom = (stories: Story[]) =>
  new Set(stories.flatMap(s => s.pages.flatMap(p => p.characters.map(c => figureFor(c) || ""))).filter(id => FIGURES[id]));
export const ALL_STICKERS = FIGURE_IDS;
export const stickerSrc = (id: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(FIGURES[id].svg);

// "1-ci, 3-cü, 6-cı, 9-cu kitab": Azerbaijani ordinal ending by the number's last sound.
function azOrdinal(n: number) {
  const last = n % 10, tens = n % 100;
  const byDigit: Record<number, string> = { 1: "ci", 2: "ci", 3: "cü", 4: "cü", 5: "ci", 6: "cı", 7: "ci", 8: "ci", 9: "cu" };
  const byTens: Record<number, string> = { 0: "cü", 10: "cu", 20: "ci", 30: "cu", 40: "cı", 50: "ci", 60: "cı", 70: "ci", 80: "ci", 90: "cı" };
  return `${n}-${last ? byDigit[last] : byTens[tens]}`;
}
const enOrdinal = (n: number) => n + (n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] || "th");

export const REWARD_TX: Record<LangCode, {
  albumBtn: string; albumH: string; albumP: string; collected: (k: number, of: number) => string;
  nthBook: (n: number) => string; newStickers: string; present: (friend: string, gift: string) => string;
  nextGift: (k: number) => string; gifts: Record<GiftId, string>;
}> = {
  az: {
    albumBtn: "Stiker albomum", albumH: "Stiker albomum", albumP: "Hər nağıldan sonra nağıldakı personajlar stikerə çevrilir.", collected: (k, of) => `${k} / ${of} stiker`,
    nthBook: n => `Bu, sənin ${azOrdinal(n)} kitabındır!`, newStickers: "Yeni stikerlər:", present: (f, g) => `${f} üçün hədiyyə: ${g}!`,
    nextGift: k => `Növbəti hədiyyəyə ${k} nağıl qaldı`,
    gifts: { sparkle: "parıltılı ulduzlar", balloon: "şar", medal: "medal", crown: "tac", rainbow: "göy qurşağı" },
  },
  en: {
    albumBtn: "My sticker album", albumH: "My sticker album", albumP: "After every story, its characters become stickers.", collected: (k, of) => `${k} / ${of} stickers`,
    nthBook: n => `This is your ${enOrdinal(n)} book!`, newStickers: "New stickers:", present: (f, g) => `A present for ${f}: ${g}!`,
    nextGift: k => `${k} more ${k === 1 ? "story" : "stories"} to the next present`,
    gifts: { sparkle: "sparkly stars", balloon: "a balloon", medal: "a medal", crown: "a crown", rainbow: "a rainbow" },
  },
  lt: {
    albumBtn: "Mano lipdukų albumas", albumH: "Mano lipdukų albumas", albumP: "Po kiekvienos pasakos jos veikėjai tampa lipdukais.", collected: (k, of) => `${k} / ${of} lipdukų`,
    nthBook: n => `Tai tavo ${n}-oji knyga!`, newStickers: "Nauji lipdukai:", present: (f, g) => `Dovana draugui ${f}: ${g}!`,
    nextGift: k => `Iki kitos dovanos liko pasakų: ${k}`,
    gifts: { sparkle: "žvaigždutės", balloon: "balionas", medal: "medalis", crown: "karūna", rainbow: "vaivorykštė" },
  },
  ru: {
    albumBtn: "Мой альбом наклеек", albumH: "Мой альбом наклеек", albumP: "После каждой сказки её герои становятся наклейками.", collected: (k, of) => `${k} / ${of} наклеек`,
    nthBook: n => `Это твоя ${n}-я книжка!`, newStickers: "Новые наклейки:", present: (f, g) => `Подарок для ${f}: ${g}!`,
    nextGift: k => `До следующего подарка сказок: ${k}`,
    gifts: { sparkle: "звёздочки", balloon: "шарик", medal: "медаль", crown: "корона", rainbow: "радуга" },
  },
};
