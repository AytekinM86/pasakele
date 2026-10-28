// Shared constants and types for the client and the API routes.

export type LangCode = "az" | "en" | "lt" | "ru";
export const LANGS: Record<LangCode, { label: string; bcp47: string; english: string }> = {
  az: { label: "Azərbaycanca", bcp47: "az-AZ", english: "Azerbaijani" },
  en: { label: "English", bcp47: "en-US", english: "English" },
  lt: { label: "Lietuvių", bcp47: "lt-LT", english: "Lithuanian" },
  ru: { label: "Русский", bcp47: "ru-RU", english: "Russian" },
};

export const THEMES = ["friendship", "family", "adventure", "magic", "animals", "kindness", "courage", "fear", "loneliness", "loss", "conflict", "school", "home", "being different"] as const;
export type Theme = (typeof THEMES)[number];
export const HEAVY: Theme[] = ["fear", "loneliness", "loss", "conflict"];

export const EMO = [
  ["joy", "Joy", "--e-joy"], ["calm", "Calm", "--e-calm"], ["curiosity", "Curiosity", "--e-cur"],
  ["fear", "Fear", "--e-fear"], ["sadness", "Sadness", "--e-sad"], ["anger", "Anger", "--e-ang"],
] as const;
export type EmotionKey = (typeof EMO)[number][0];

export type Role = "hero" | "friend" | "family" | "helper" | "villain" | "other";
export const ROLE: Record<Role, [string, string]> = {
  hero: ["Heroes", "var(--sun)"], friend: ["Friends", "var(--teal)"], family: ["Family", "var(--e-cur)"],
  helper: ["Helpers", "var(--e-joy)"], villain: ["Scary ones", "var(--berry)"], other: ["Others", "var(--muted)"],
};

export type Setting = "forest" | "sea" | "space" | "castle" | "city" | "home" | "meadow" | "sky";
export type Page = { text: string; setting: Setting; time: "day" | "night" | "sunset"; characters: string[] };
export type Turn = { role: "user" | "assistant"; content: string };
export type ForeignWord = { word: string; lang: string; native: string; gloss: string };
// Story friends the child can pick. All original characters (no third-party brands).
export const COMPANION_IDS = ["owl", "doll", "car", "puppy", "dino", "unicorn"] as const;
export type CompanionId = (typeof COMPANION_IDS)[number];
export const COMPANIONS: Record<CompanionId, { name: string; persona: string; is: Record<LangCode, string> }> = {
  owl: { name: "Pelėda", persona: "a gentle, curious owl", is: { az: "bayquşam", en: "a wise owl", lt: "pelėda", ru: "сова" } },
  doll: { name: "Lala", persona: "a kind, cheerful doll in a pink dress who loves tea parties, pretty dresses and princesses", is: { az: "gəlinciyəm", en: "a friendly doll", lt: "lėlė", ru: "кукла" } },
  car: { name: "Zoomy", persona: "a cheerful little race car who loves roads, speed and adventures", is: { az: "balaca yarış maşınıyam", en: "a little race car", lt: "lenktyninė mašinėlė", ru: "гоночная машинка" } },
  puppy: { name: "Bobo", persona: "a playful, friendly puppy", is: { az: "oynaq küçüyəm", en: "a playful puppy", lt: "šuniukas", ru: "щенок" } },
  dino: { name: "Dino", persona: "a friendly little dinosaur who is never scary and loves stomping and exploring", is: { az: "mehriban dinozavram", en: "a friendly dinosaur", lt: "dinozauriukas", ru: "динозаврик" } },
  unicorn: { name: "Luna", persona: "a magical, kind unicorn who loves rainbows and stars", is: { az: "sehrli təkbuynuzam", en: "a magic unicorn", lt: "vienaragis", ru: "единорог" } },
};
export const PICK_FRIEND: Record<LangCode, string> = {
  az: "Bu gün kiminlə danışmaq istəyirsən?", en: "Who do you want to talk to today?",
  lt: "Su kuo nori šiandien kalbėtis?", ru: "С кем хочешь поговорить сегодня?",
};

export type Child = { name: string; age: number; lang: LangCode; note?: string; companion?: CompanionId };
export type Story = {
  id: string; createdAt: number; lang: LangCode; title: string; pages: Page[]; summary: string;
  themes: Theme[]; emotions: Record<EmotionKey, number>; characters: { name: string; role: Role }[];
  parentNote: string; foreignWords: ForeignWord[]; concern: "none" | "watch" | "talk";
  words: number; wordList?: string[]; transcript?: Turn[]; example?: boolean;
};
export type Insight = { headline: string; observations: string[]; tryThis: string[]; createdAt?: number; example?: boolean };

export const SPINES = ["#ffd66b", "#9fdcd6", "#f7b4c6", "#b9c9ff", "#c8e6a0", "#ffc29a"];

export const STARTERS: Record<LangCode, string[]> = {
  en: ["Once upon a time there was a dragon who…", "My cat flew to the moon and…", "A tiny mouse found a magic key…"],
  az: ["Biri var idi, biri yox idi, bir əjdaha var idi…", "Pişiyim aya uçdu və…", "Balaca siçan sehrli açar tapdı…"],
  lt: ["Kartą gyveno drakonas, kuris…", "Mano katinas nuskrido į mėnulį ir…", "Mažytė pelytė rado stebuklingą raktą…"],
  ru: ["Жил-был дракон, который…", "Мой кот улетел на луну и…", "Маленькая мышка нашла волшебный ключ…"],
};

// Child-facing words in the chosen language.
export const TX: Record<LangCode, Record<string, string>> = {
  az: { tell: "Danış", ph: "Nağılını danış…", end: "Bitdi! Kitabımı düzəlt", on: "Səs: açıq", off: "Səs: bağlı", again: "Yenidən başla", shelf: "-nin kitab rəfi", making: "Kitabın hazırlanır… ✨", back: "Geri", prev: "Əvvəlki səhifə", next: "Növbəti səhifə", fin: "Son", read: "Bu səhifəni mənə oxu", more: "Dostuna bir az da danış, sonra kitabını düzəldək.", novoice: "Bu cihazda azərbaycanca səs yoxdur, ona görə dostun yazı ilə cavab verir.", mic: "Danışmaq üçün bas", listening: "Dinləyirəm…", nomic: "Bu brauzerdə mikrofonla yazı işləmir. Chrome istifadə edin və ya yazın." },
  en: { tell: "Tell", ph: "Tell your story…", end: "The end! Make my book", on: "Voice: on", off: "Voice: off", again: "Start over", shelf: "'s bookshelf", making: "Making your book… ✨", back: "Back", prev: "Back page", next: "Next page", fin: "The end", read: "Read this page to me", more: "Tell your friend a little more first, then make your book.", novoice: "This device has no English voice, so your friend answers in writing.", mic: "Tap to talk", listening: "Listening…", nomic: "Voice typing doesn't work in this browser. Use Chrome or type instead." },
  lt: { tell: "Pasakoti", ph: "Pasakok savo pasaką…", end: "Pabaiga! Padaryk mano knygą", on: "Balsas: įjungtas", off: "Balsas: išjungtas", again: "Pradėti iš naujo", shelf: " knygų lentyna", making: "Kuriama tavo knyga… ✨", back: "Atgal", prev: "Ankstesnis puslapis", next: "Kitas puslapis", fin: "Pabaiga", read: "Perskaityk man šį puslapį", more: "Papasakok draugui dar šiek tiek, tada padarysime knygą.", novoice: "Šiame įrenginyje nėra lietuviško balso, todėl draugas atsako raštu.", mic: "Paspausk ir kalbėk", listening: "Klausau…", nomic: "Šioje naršyklėje balso įvestis neveikia. Naudokite Chrome arba rašykite." },
  ru: { tell: "Рассказать", ph: "Расскажи свою сказку…", end: "Конец! Сделай мою книжку", on: "Голос: вкл", off: "Голос: выкл", again: "Начать заново", shelf: ": книжная полка", making: "Делаю твою книжку… ✨", back: "Назад", prev: "Предыдущая", next: "Дальше", fin: "Конец", read: "Прочитай мне эту страницу", more: "Расскажи другу ещё чуть-чуть, а потом сделаем книжку.", novoice: "На этом устройстве нет русского голоса, поэтому друг отвечает текстом.", mic: "Нажми и говори", listening: "Слушаю…", nomic: "Голосовой ввод не работает в этом браузере. Используйте Chrome или пишите." },
};

export function greet(lang: LangCode, child: string, c: CompanionId) {
  const { name, is } = COMPANIONS[c], what = is[lang];
  return {
    az: `Salam, ${child}! Mənim adım ${name}, mən ${what}. Mənə öz nağılını danış, mən qulaq asıram!`,
    en: `Hi ${child}! I'm ${name}, ${what}. Tell me a story you made up, I'm listening!`,
    lt: `Labas, ${child}! Aš ${name}, ${what}. Papasakok man savo pasaką, aš klausau!`,
    ru: `Привет, ${child}! Я ${name}, ${what}. Расскажи мне свою сказку, я слушаю!`,
  }[lang];
}

export const SETUP: Record<LangCode, Record<string, string>> = {
  az: { eb: "Valideyn üçün · bir dəfəlik", h: "Uşağınız üçün Pasakėlė-ni qurun", p: "Bayquş Pelėda uşağın uydurduğu nağılları dinləyir, suallar verir və hər nağılı şəkilli kitaba çevirir. Seçdiyiniz dili uşaq dəyişə bilməz. Dəyişmək üçün valideyn bölməsinə daxil olun.", n: "Uşağın adı", a: "Yaşı", l: "Nağıl dili", go: "Başla", ph: "məs. Ayla" },
  en: { eb: "For parents · one-time setup", h: "Set up Pasakėlė for your child", p: "Pelėda the owl listens to stories your child invents, asks gentle questions and turns each one into a picture book. Your child can't change the language you pick. Use the parent area to change it.", n: "Child's name", a: "Age", l: "Story language", go: "Start", ph: "e.g. Ayla" },
  lt: { eb: "Tėvams · vienkartinis nustatymas", h: "Paruoškite Pasakėlę savo vaikui", p: "Pelėda klausosi vaiko sugalvotų pasakų, užduoda klausimų ir kiekvieną paverčia paveikslėlių knyga. Vaikas negali pakeisti jūsų pasirinktos kalbos. Ją pakeisite tėvų skiltyje.", n: "Vaiko vardas", a: "Amžius", l: "Pasakų kalba", go: "Pradėti", ph: "pvz. Ayla" },
  ru: { eb: "Для родителей · настройка один раз", h: "Настройте Pasakėlė для ребёнка", p: "Сова Пелёда слушает сказки, которые придумывает ребёнок, задаёт вопросы и превращает каждую в книжку с картинками. Ребёнок не сможет сменить выбранный вами язык. Изменить его можно в разделе для родителей.", n: "Имя ребёнка", a: "Возраст", l: "Язык сказок", go: "Начать", ph: "напр. Ayla" },
};
