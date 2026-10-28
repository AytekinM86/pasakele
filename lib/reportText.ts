import type { EmotionKey, LangCode, Role, Theme } from "./data";

// Words for the downloadable report and book, in the child's story language.
type ReportText = {
  locale: string;
  title: (name: string, age: number) => string;
  stories: string; period: string; storyLang: string; prepared: string; forWhom: string;
  consent: string; summary: string; themes: string; theme: string; count: string;
  feelings: string; date: string; story: string; characters: string; character: string; role: string;
  language: string; allFull: string; foreign: (n: number) => string; said: string; otherLang: string; homeWord: string; meaning: string;
  storiesH: string; book: string; bookLine: (n: number, age: number) => string;
  langName: Record<LangCode, string>; theme_: Record<Theme, string>; emo: Record<EmotionKey, string>; role_: Record<Role, string>;
  concern: { watch: string; talk: string };
};

export const REPORT: Record<LangCode, ReportText> = {
  az: {
    locale: "az-Latn-AZ",
    title: (n, a) => `Nağıl hesabatı: ${n}, ${a} yaş`,
    stories: "Nağıllar", period: "Dövr", storyLang: "Nağıl dili", prepared: "Hazırlanıb", forWhom: "Kimin üçün",
    consent: "Valideynin və ya qəyyumun razılığı ilə paylaşılıb. Pasakėlė uşağın uydurduğu nağıllarda təkrarlanan mövzuları təsvir edir. Bu, diaqnoz və ya klinik qiymətləndirmə deyil.",
    summary: "Xülasə", themes: "Mövzular", theme: "Mövzu", count: "Nağıl sayı",
    feelings: "Hər nağılda hisslər (0–3)", date: "Tarix", story: "Nağıl", characters: "Personajlar", character: "Personaj", role: "Rolu",
    language: "Dil", allFull: "Bütün nağıllar tam seçilmiş dildə danışılıb.", foreign: n => `Başqa dildə deyilən sözlər (${n}):`,
    said: "Deyilən söz", otherLang: "Hansı dildə", homeWord: "Nağıl dilində", meaning: "Mənası",
    storiesH: "Nağıllar", book: "Nağıllar", bookLine: (n, a) => `${n} nağıl · ${a} yaş`,
    langName: { az: "Azərbaycan dili", en: "İngilis dili", lt: "Litva dili", ru: "Rus dili" },
    theme_: { friendship: "dostluq", family: "ailə", adventure: "macəra", magic: "sehr", animals: "heyvanlar", kindness: "mehribanlıq", courage: "cəsarət", fear: "qorxu", loneliness: "tənhalıq", loss: "itki", conflict: "münaqişə", school: "məktəb", home: "ev", "being different": "fərqli olmaq" },
    emo: { joy: "Sevinc", calm: "Sakitlik", curiosity: "Maraq", fear: "Qorxu", sadness: "Kədər", anger: "Qəzəb" },
    role_: { hero: "qəhrəman", friend: "dost", family: "ailə", helper: "köməkçi", villain: "qorxulu personaj", other: "digər" },
    concern: { watch: "diqqət", talk: "uşaqla danışın" },
  },
  en: {
    locale: "en-GB",
    title: (n, a) => `Story report: ${n}, age ${a}`,
    stories: "Stories", period: "Period", storyLang: "Story language", prepared: "Prepared", forWhom: "Prepared for",
    consent: "Shared with the parent's or guardian's consent. Pasakėlė describes patterns in stories the child invented. It is not a diagnosis or a clinical assessment.",
    summary: "Summary", themes: "Themes", theme: "Theme", count: "Stories",
    feelings: "Feelings per story (0–3)", date: "Date", story: "Story", characters: "Characters", character: "Character", role: "Role",
    language: "Language", allFull: "All stories were told fully in the chosen language.", foreign: n => `Words said in another language (${n}):`,
    said: "Said", otherLang: "Language", homeWord: "In the story language", meaning: "Meaning",
    storiesH: "Stories", book: "Stories", bookLine: (n, a) => `${n} ${n === 1 ? "story" : "stories"} · age ${a}`,
    langName: { az: "Azerbaijani", en: "English", lt: "Lithuanian", ru: "Russian" },
    theme_: { friendship: "friendship", family: "family", adventure: "adventure", magic: "magic", animals: "animals", kindness: "kindness", courage: "courage", fear: "fear", loneliness: "loneliness", loss: "loss", conflict: "conflict", school: "school", home: "home", "being different": "being different" },
    emo: { joy: "Joy", calm: "Calm", curiosity: "Curiosity", fear: "Fear", sadness: "Sadness", anger: "Anger" },
    role_: { hero: "hero", friend: "friend", family: "family", helper: "helper", villain: "scary character", other: "other" },
    concern: { watch: "watch", talk: "talk with your child" },
  },
  lt: {
    locale: "lt-LT",
    title: (n, a) => `Pasakų ataskaita: ${n}, ${a} m.`,
    stories: "Pasakos", period: "Laikotarpis", storyLang: "Pasakų kalba", prepared: "Parengta", forWhom: "Kam skirta",
    consent: "Pateikta tėvų ar globėjų sutikimu. Pasakėlė aprašo pasikartojančias temas vaiko sugalvotose pasakose. Tai nėra diagnozė ar klinikinis vertinimas.",
    summary: "Santrauka", themes: "Temos", theme: "Tema", count: "Pasakų skaičius",
    feelings: "Jausmai kiekvienoje pasakoje (0–3)", date: "Data", story: "Pasaka", characters: "Veikėjai", character: "Veikėjas", role: "Vaidmuo",
    language: "Kalba", allFull: "Visos pasakos papasakotos tik pasirinkta kalba.", foreign: n => `Kita kalba pasakyti žodžiai (${n}):`,
    said: "Pasakytas žodis", otherLang: "Kalba", homeWord: "Pasakos kalba", meaning: "Reikšmė",
    storiesH: "Pasakos", book: "Pasakos", bookLine: (n, a) => `Pasakų: ${n} · ${a} m.`,
    langName: { az: "Azerbaidžaniečių", en: "Anglų", lt: "Lietuvių", ru: "Rusų" },
    theme_: { friendship: "draugystė", family: "šeima", adventure: "nuotykiai", magic: "magija", animals: "gyvūnai", kindness: "gerumas", courage: "drąsa", fear: "baimė", loneliness: "vienatvė", loss: "netektis", conflict: "konfliktas", school: "mokykla", home: "namai", "being different": "kitoniškumas" },
    emo: { joy: "Džiaugsmas", calm: "Ramybė", curiosity: "Smalsumas", fear: "Baimė", sadness: "Liūdesys", anger: "Pyktis" },
    role_: { hero: "herojus", friend: "draugas", family: "šeima", helper: "pagalbininkas", villain: "baisus veikėjas", other: "kita" },
    concern: { watch: "stebėti", talk: "pasikalbėkite su vaiku" },
  },
  ru: {
    locale: "ru-RU",
    title: (n, a) => `Отчёт по сказкам: ${n}, ${a} лет`,
    stories: "Сказки", period: "Период", storyLang: "Язык сказок", prepared: "Подготовлено", forWhom: "Для кого",
    consent: "Передано с согласия родителя или опекуна. Pasakėlė описывает повторяющиеся темы в сказках, которые придумал ребёнок. Это не диагноз и не клиническая оценка.",
    summary: "Краткий итог", themes: "Темы", theme: "Тема", count: "Число сказок",
    feelings: "Чувства в каждой сказке (0–3)", date: "Дата", story: "Сказка", characters: "Персонажи", character: "Персонаж", role: "Роль",
    language: "Язык", allFull: "Все сказки рассказаны полностью на выбранном языке.", foreign: n => `Слова на другом языке (${n}):`,
    said: "Сказанное слово", otherLang: "Язык", homeWord: "На языке сказки", meaning: "Значение",
    storiesH: "Сказки", book: "Сказки", bookLine: (n, a) => `Сказок: ${n} · ${a} лет`,
    langName: { az: "Азербайджанский", en: "Английский", lt: "Литовский", ru: "Русский" },
    theme_: { friendship: "дружба", family: "семья", adventure: "приключения", magic: "волшебство", animals: "животные", kindness: "доброта", courage: "смелость", fear: "страх", loneliness: "одиночество", loss: "потеря", conflict: "конфликт", school: "школа", home: "дом", "being different": "непохожесть" },
    emo: { joy: "Радость", calm: "Спокойствие", curiosity: "Любопытство", fear: "Страх", sadness: "Грусть", anger: "Злость" },
    role_: { hero: "герой", friend: "друг", family: "семья", helper: "помощник", villain: "страшный персонаж", other: "другое" },
    concern: { watch: "наблюдать", talk: "поговорите с ребёнком" },
  },
};

// The AI names the other language in English ("Lithuanian"); show it in the report's language.
const ENGLISH_TO_CODE: Record<string, LangCode> = { azerbaijani: "az", english: "en", lithuanian: "lt", russian: "ru" };
export const otherLangName = (t: ReportText, english: string) => {
  const code = ENGLISH_TO_CODE[english.trim().toLowerCase()];
  return code ? t.langName[code] : english;
};
