import type { LangCode, Role, Setting } from "./data";

// Azerbaijani case endings for a child's name, following vowel harmony: Dilara → Dilaranın / Dilaraya, Aytən → Aytənin / Aytənə.
const lastVowel = (n: string) => (n.toLowerCase().match(/[aıoueəiöü](?=[^aıoueəiöü]*$)/) || ["ə"])[0];
const endsInVowel = (n: string) => /[aıoueəiöü]$/i.test(n);
export const azGen = (n: string) => n + (endsInVowel(n) ? "n" : "") + ({ a: "ın", ı: "ın", o: "un", u: "un", e: "in", ə: "in", i: "in", ö: "ün", ü: "ün" } as Record<string, string>)[lastVowel(n)];
export const azDat = (n: string) => n + (endsInVowel(n) ? "y" : "") + ("aıou".includes(lastVowel(n)) ? "a" : "ə");

// Parent-area words in the child's story language (the parent picked it, so they read it too).
export type ParentText = {
  storyTime: string; forParents: string;
  gateEb: string; gateH: string; gateQ: string; open: string; wrong: string; answer: string;
  noChildH: string; noChildP: string; showDemo: string; showDemoLong: string;
  demoBanner: string; demoBannerP: string; backTo: (n: string) => string; closeDemo: string;
  insights: string; nameAge: (n: string, a: number) => string; noStories: (n: string) => string;
  kStories: string; kWeek: string; kWords: string; kDifferent: string;
  month: string; noSummary: string; needTwo: (n: string, k: number) => string; genHint: (n: string) => string;
  tryThis: string; reading: string; refresh: string; generate: string; summaryErr: string;
  radarEb: string; radarH: (k: number) => string; radarAll: (n: string) => string; radarP: (recent: number) => string;
  radarEmpty: (n: string) => string; perStory: string; tryWeek: string; tryWeekEnd: string;
  flagH: (theme: string, k: number, of: number) => string; flagP: string; talkH: (n: string, title: string) => string; talkP: string;
  themesH: string; earlier: string; last14: string; themesEmpty: string;
  feelingsH: string; feelingsP: string; feelingsEmpty: string;
  worldEb: string; worldH: string; worldP: string; worldEmptyH: string; worldEmptyP: string; places: string;
  groups: Record<Role, string>; settings: Record<Setting, string>;
  storiesH: string; storiesEmpty: string; mayShow: string; readConvo: string; friend: string; openBook: string;
  reportsEb: string; psyH: string; psyP: string; psyLabel: string; psyPh: string; consent: (n: string) => string;
  downloadReport: string; printHint: string; bookH: (n: string, y: number) => string; coverLine: (s: number, p: number) => string;
  coverTitle: (n: string) => string; bookP: string; downloadBook: string; order: string; orderNote: string; exampleData: string;
  settingsH: string; settingsP: string; storyLang: string; name: string; age: string; save: string; saved: (l: string) => string;
  footer: string;
};

export const P: Record<LangCode, ParentText> = {
  az: {
    storyTime: "Nağıl vaxtı", forParents: "Valideynlər üçün",
    gateEb: "Yalnız böyüklər üçün", gateH: "Valideyn bölməsi", gateQ: "Davam etmək üçün həll edin:", open: "Aç", wrong: "Səhvdir. Yenidən cəhd edin.", answer: "Cavab",
    noChildH: "Hələ uşaq profili yoxdur", noChildP: "Nağıl vaxtı bölməsini açın, uşağın adını və dilini yazın, ilk nağıldan sonra bura qayıdın.",
    showDemo: "Nümunə ailəni göstər (uydurma)", showDemoLong: "Nümunə ailəni göstər (uydurma, təqdimat üçün)",
    demoBanner: "NÜMUNƏ · uydurma ailə, sizin uşağınız deyil.", demoBannerP: "Aşağıdakı hər şey səhifənin necə işlədiyini göstərmək üçün uydurulub.",
    backTo: n => `${azDat(n)} qayıt`, closeDemo: "Nümunəni bağla",
    insights: "Nağıl müşahidələri", nameAge: (n, a) => `${n}, ${a} yaş`, noStories: n => `Hələ nağıl yoxdur. Bu səhifədəki hər şey ${azGen(n)} öz nağıllarından yaranır və hər bitmiş kitabdan sonra dolur.`,
    kStories: "nağıl", kWeek: "bu həftə", kWords: "bir nağılda söz", kDifferent: "fərqli söz",
    month: "Bu ay", noSummary: "Hələ xülasə yoxdur", needTwo: (n, k) => `Xülasə üçün ən azı 2 nağıl lazımdır. ${azGen(n)} ${k} nağılı var.`, genHint: n => `${azGen(n)} nağıllarındakı təkrarlanan mövzuların xülasəsini yaradın.`,
    tryThis: "Bunu sınayın:", reading: "Nağıllar oxunur…", refresh: "Xülasəni yenilə", generate: "Xülasə yarat", summaryErr: "Xülasə yaradıla bilmədi. Yenidən cəhd edin.",
    radarEb: "Ana dili radarı", radarH: k => `${k} söz başqa dildə deyilib`, radarAll: () => "Bütün nağıllar tam seçilmiş dildə danışılıb",
    radarP: r => `Onlardan ${r}-i son 14 gündə. Bunlar çox vaxt bağçadan və ya məktəbdən gələn sözlərdir. Dost növbəti cavabında həmin sözü düzəltmədən öz dilimizdə işlədir.`,
    radarEmpty: n => `${n} nağıla başqa dildən söz qatanda, onlar burada öz dilimizdəki qarşılığı ilə görünəcək.`,
    perStory: "Hər nağılda başqa dildə sözlər", tryWeek: "Bu həftə sınayın:", tryWeekEnd: "sözlərini evdə oyunda və ya yemək zamanı işlədin.",
    flagH: (t, k, of) => `"${t}" mövzusu son ${of} nağılın ${k}-ində görünüb.`, flagP: "Yatmazdan əvvəl yumşaq söhbət kömək edə bilər: nağılın qəhrəmanının nə hiss etdiyini soruşun.",
    talkH: (n, t) => `Zəhmət olmasa, ${n} ilə "${t}" haqqında danışın.`, talkP: "Bu nağılda real narahatlıq ola bilər. Sakitcə qulaq asın. Narahatsınızsa, uşaq psixoloquna və ya ailə həkiminə müraciət edin.",
    themesH: "Mövzular", earlier: "Əvvəl", last14: "Son 14 gün", themesEmpty: "Mövzular ilk bitmiş nağıldan sonra görünəcək.",
    feelingsH: "Hər nağılda hisslər", feelingsP: "Dairə nə qədər böyükdürsə, hiss o qədər güclüdür. Ən köhnəsi soldadır.", feelingsEmpty: "Hisslər ilk bitmiş nağıldan sonra görünəcək.",
    worldEb: "Nağıl dünyası", worldH: "Nağıllarda kimlər yaşayır", worldP: "Qəhrəmanlar mərkəzdə, dostlar və ailə ətrafda, qorxulu personajlar kənarda. Dairə nə qədər böyükdürsə, personaj o qədər tez-tez görünür.",
    worldEmptyH: "Dünya hələ boşdur", worldEmptyP: "Nağıllardakı personajlar burada toplanacaq.", places: "Yerlər:",
    groups: { hero: "Qəhrəmanlar", friend: "Dostlar", family: "Ailə", helper: "Köməkçilər", villain: "Qorxulu personajlar", other: "Digərləri" },
    settings: { forest: "meşə", sea: "dəniz", space: "kosmos", castle: "qala", city: "şəhər", home: "ev", meadow: "çəmən", sky: "göy" },
    storiesH: "Nağıllar", storiesEmpty: "Hələ bitmiş nağıl yoxdur.", mayShow: "Bu nə göstərə bilər:", readConvo: "Söhbəti oxu", friend: "Dost", openBook: "Kitabı aç",
    reportsEb: "Hesabatlar və xatirələr", psyH: "Psixoloq üçün hesabat", psyP: "Mövzular, hisslər, personajlar və dilin zamanla dəyişməsi haqqında xülasə. Heç nə heç yerə göndərilmir: faylı siz yükləyirsiniz və kimin görəcəyinə özünüz qərar verirsiniz.",
    psyLabel: "Psixoloq (istəyə görə)", psyPh: "Mütəxəssisin adı", consent: n => `Mən ${azGen(n)} valideyni və ya qəyyumuyam və bu hesabatın yuxarıda adı yazılan mütəxəssislə paylaşılmasına razıyam.`,
    downloadReport: "Hesabatı yüklə", printHint: "Brauzerdə açılır. PDF üçün Print → Save as PDF seçin.",
    bookH: (n, y) => `${n}: ${y}-ci ilin kitabı`, coverLine: (s, p) => `${s} nağıl · ${p} şəkilli səhifə`, coverTitle: n => `${n}: nağıllar`,
    bookP: "İlin bütün nağılları bir şəkilli kitabda. Nənə və babalar üçün gözəl hədiyyə.", downloadBook: "Kitabı yüklə", order: "Kitab sifariş et · €29",
    orderNote: "Çap xidməti hələ qoşulmayıb, sifariş verilmədi. Real məhsulda çap partnyoru kitabı göndərəcək.", exampleData: "Bunlar nümunə ailənin məlumatlarıdır.",
    settingsH: "Uşaq ayarları", settingsP: "Bunları yalnız böyüklər dəyişə bilər. Nağıl vaxtında dil seçimi yoxdur, uşaq həmişə sizin seçdiyiniz dili eşidir.",
    storyLang: "Nağıl dili", name: "Ad", age: "Yaş", save: "Yadda saxla", saved: l => `Saxlanıldı. Nağıl dili: ${l}.`,
    footer: "Pasakėlė təkrarlanan mövzuları müşahidə edir, diaqnoz qoymur. Yalnız mətn saxlanılır, səs yazısı yoxdur. Nağıllar yalnız bu cihazdakı brauzerdə qalır. Narahat olsanız, uşaqla danışın və lazım gələrsə, uşaq psixoloquna müraciət edin.",
  },
  en: {
    storyTime: "Story time", forParents: "For parents",
    gateEb: "Grown-ups only", gateH: "Parent area", gateQ: "Solve this to continue:", open: "Open", wrong: "That's not right. Try again.", answer: "Answer",
    noChildH: "No child set up yet", noChildP: "Open Story time, enter your child's name and language, and come back after the first story.",
    showDemo: "Show the demo family (invented)", showDemoLong: "Show the demo family (invented, for presentations)",
    demoBanner: "DEMO · invented family, not your child.", demoBannerP: "Everything below is made up to show how the page works.",
    backTo: n => `Back to ${n}`, closeDemo: "Close demo",
    insights: "Story insights", nameAge: (n, a) => `${n}, age ${a}`, noStories: n => `No stories yet. Everything on this page comes from ${n}'s own stories and fills in after each finished book.`,
    kStories: "stories", kWeek: "this week", kWords: "words per story", kDifferent: "different words used",
    month: "This month", noSummary: "No summary yet", needTwo: (n, k) => `A summary needs at least 2 stories. ${n} has ${k}.`, genHint: n => `Generate a summary of patterns across ${n}'s stories.`,
    tryThis: "Try this:", reading: "Reading the stories…", refresh: "Refresh summary", generate: "Generate summary", summaryErr: "The summary couldn't be made. Try again.",
    radarEb: "Mother-tongue radar", radarH: k => `${k} words came out in another language`, radarAll: n => `${n} told every story fully in the chosen language`,
    radarP: r => `${r} of them in the last 14 days. These are often words from kindergarten or school. The story friend quietly uses the home-language word in its next reply, without correcting.`,
    radarEmpty: n => `When ${n} mixes in words from another language, they show up here with the home-language word to practise.`,
    perStory: "Words in another language per story", tryWeek: "Try this week:", tryWeekEnd: "at home in a game or at dinner.",
    flagH: (t, k, of) => `"${t}" appeared in ${k} of the last ${of} stories.`, flagP: "A gentle chat at bedtime can help: ask how the story's hero felt.",
    talkH: (n, t) => `Please talk with ${n} about "${t}".`, talkP: "Something in this story may describe a real worry. Listen calmly. If you're concerned, contact a child psychologist or your family doctor.",
    themesH: "Themes", earlier: "Earlier", last14: "Last 14 days", themesEmpty: "Themes appear after the first finished story.",
    feelingsH: "Feelings in each story", feelingsP: "Bigger dot = stronger feeling. Oldest on the left.", feelingsEmpty: "Feelings appear after the first finished story.",
    worldEb: "Story world", worldH: "Who lives in the stories", worldP: "Heroes in the middle, friends and family around them, scary ones at the edge. Bigger circle = appears more often.",
    worldEmptyH: "The world is still empty", worldEmptyP: "Characters from the stories will gather here.", places: "Places:",
    groups: { hero: "Heroes", friend: "Friends", family: "Family", helper: "Helpers", villain: "Scary ones", other: "Others" },
    settings: { forest: "forest", sea: "sea", space: "space", castle: "castle", city: "city", home: "home", meadow: "meadow", sky: "sky" },
    storiesH: "Stories", storiesEmpty: "No finished stories yet.", mayShow: "What this may show:", readConvo: "Read the conversation", friend: "Friend", openBook: "Open the book",
    reportsEb: "Reports & keepsakes", psyH: "Report for a psychologist", psyP: "A summary of themes, feelings, characters and language over time, to bring to a child psychologist. Nothing is sent anywhere: you download it and decide who sees it.",
    psyLabel: "Psychologist (optional)", psyPh: "Name of the specialist", consent: n => `I am ${n}'s parent or guardian and I agree to share this report with the specialist named above.`,
    downloadReport: "Download report", printHint: "Opens in your browser. Use Print → Save as PDF to get a PDF.",
    bookH: (n, y) => `${n}'s Book of ${y}`, coverLine: (s, p) => `${s} stories · ${p} illustrated pages`, coverTitle: n => `${n}'s Stories`,
    bookP: "Every story from the year as one illustrated book. A gift for grandparents.", downloadBook: "Download the book", order: "Order hardcover · €29",
    orderNote: "Printing isn't connected yet, so no order was placed. In the real product a print partner ships the book.", exampleData: "These use the example family's data.",
    settingsH: "Child settings", settingsP: "Only grown-ups can change these. Story time has no language switch, so your child always hears the language you choose.",
    storyLang: "Story language", name: "Name", age: "Age", save: "Save", saved: l => `Saved. Story time now uses ${l}.`,
    footer: "Pasakėlė notices patterns, it does not diagnose. Only text is kept, no voice recordings. Stories stay in this browser on this device. If something worries you, talk with your child and, if needed, a child psychologist.",
  },
  lt: {
    storyTime: "Pasakų laikas", forParents: "Tėvams",
    gateEb: "Tik suaugusiems", gateH: "Tėvų skiltis", gateQ: "Išspręskite, kad tęstumėte:", open: "Atidaryti", wrong: "Neteisingai. Bandykite dar kartą.", answer: "Atsakymas",
    noChildH: "Vaikas dar nenustatytas", noChildP: "Atidarykite Pasakų laiką, įveskite vaiko vardą ir kalbą, o po pirmos pasakos grįžkite čia.",
    showDemo: "Rodyti pavyzdinę šeimą (išgalvotą)", showDemoLong: "Rodyti pavyzdinę šeimą (išgalvotą, pristatymams)",
    demoBanner: "PAVYZDYS · išgalvota šeima, ne jūsų vaikas.", demoBannerP: "Viskas žemiau išgalvota, kad parodytų, kaip veikia puslapis.",
    backTo: n => `Grįžti: ${n}`, closeDemo: "Uždaryti pavyzdį",
    insights: "Pasakų įžvalgos", nameAge: (n, a) => `${n}, ${a} m.`, noStories: n => `Pasakų dar nėra. Viskas šiame puslapyje atsiranda iš vaiko (${n}) pasakų ir pildosi po kiekvienos baigtos knygos.`,
    kStories: "pasakos", kWeek: "šią savaitę", kWords: "žodžių pasakoje", kDifferent: "skirtingų žodžių",
    month: "Šį mėnesį", noSummary: "Santraukos dar nėra", needTwo: (_n, k) => `Santraukai reikia bent 2 pasakų. Dabar yra: ${k}.`, genHint: () => "Sukurkite pasikartojančių temų santrauką.",
    tryThis: "Pabandykite:", reading: "Skaitomos pasakos…", refresh: "Atnaujinti santrauką", generate: "Sukurti santrauką", summaryErr: "Nepavyko sukurti santraukos. Bandykite dar kartą.",
    radarEb: "Gimtosios kalbos radaras", radarH: k => `Kita kalba pasakyta žodžių: ${k}`, radarAll: () => "Visos pasakos papasakotos tik pasirinkta kalba",
    radarP: r => `Per paskutines 14 dienų: ${r}. Dažnai tai žodžiai iš darželio ar mokyklos. Draugas kitame atsakyme ramiai pavartoja gimtosios kalbos žodį, netaisydamas.`,
    radarEmpty: () => "Kai vaikas įterps žodžių kita kalba, jie atsiras čia kartu su gimtosios kalbos žodžiu.",
    perStory: "Žodžiai kita kalba kiekvienoje pasakoje", tryWeek: "Šią savaitę pabandykite:", tryWeekEnd: "vartoti namuose žaidžiant ar valgant.",
    flagH: (t, k, of) => `Tema „${t}“ pasirodė ${k} iš paskutinių ${of} pasakų.`, flagP: "Gali padėti švelnus pokalbis prieš miegą: paklauskite, ką jautė pasakos herojus.",
    talkH: (n, t) => `Pasikalbėkite su vaiku (${n}) apie „${t}“.`, talkP: "Šioje pasakoje gali būti tikras rūpestis. Ramiai išklausykite. Jei nerimaujate, kreipkitės į vaikų psichologą ar šeimos gydytoją.",
    themesH: "Temos", earlier: "Anksčiau", last14: "Paskutinės 14 dienų", themesEmpty: "Temos atsiras po pirmos baigtos pasakos.",
    feelingsH: "Jausmai kiekvienoje pasakoje", feelingsP: "Kuo didesnis taškas, tuo stipresnis jausmas. Seniausia kairėje.", feelingsEmpty: "Jausmai atsiras po pirmos baigtos pasakos.",
    worldEb: "Pasakų pasaulis", worldH: "Kas gyvena pasakose", worldP: "Herojai centre, draugai ir šeima aplink, baisūs veikėjai pakraštyje. Kuo didesnis apskritimas, tuo dažniau veikėjas pasirodo.",
    worldEmptyH: "Pasaulis dar tuščias", worldEmptyP: "Čia susirinks pasakų veikėjai.", places: "Vietos:",
    groups: { hero: "Herojai", friend: "Draugai", family: "Šeima", helper: "Pagalbininkai", villain: "Baisūs veikėjai", other: "Kiti" },
    settings: { forest: "miškas", sea: "jūra", space: "kosmosas", castle: "pilis", city: "miestas", home: "namai", meadow: "pieva", sky: "dangus" },
    storiesH: "Pasakos", storiesEmpty: "Baigtų pasakų dar nėra.", mayShow: "Ką tai gali rodyti:", readConvo: "Skaityti pokalbį", friend: "Draugas", openBook: "Atidaryti knygą",
    reportsEb: "Ataskaitos ir prisiminimai", psyH: "Ataskaita psichologui", psyP: "Temų, jausmų, veikėjų ir kalbos santrauka laikui bėgant. Niekas niekur nesiunčiama: jūs atsisiunčiate failą ir sprendžiate, kas jį matys.",
    psyLabel: "Psichologas (nebūtina)", psyPh: "Specialisto vardas", consent: n => `Esu vaiko (${n}) tėvas, mama ar globėjas ir sutinku pasidalinti šia ataskaita su nurodytu specialistu.`,
    downloadReport: "Atsisiųsti ataskaitą", printHint: "Atsidaro naršyklėje. PDF gausite pasirinkę Print → Save as PDF.",
    bookH: (n, y) => `${n}: ${y} m. knyga`, coverLine: (s, p) => `Pasakų: ${s} · iliustruotų puslapių: ${p}`, coverTitle: n => `${n}: pasakos`,
    bookP: "Visos metų pasakos vienoje iliustruotoje knygoje. Dovana seneliams.", downloadBook: "Atsisiųsti knygą", order: "Užsakyti knygą · €29",
    orderNote: "Spausdinimas dar neprijungtas, užsakymas nepateiktas. Tikrame produkte knygą išsiųs spaustuvė.", exampleData: "Tai pavyzdinės šeimos duomenys.",
    settingsH: "Vaiko nustatymai", settingsP: "Tai gali keisti tik suaugusieji. Pasakų laike kalbos keisti negalima, todėl vaikas visada girdi jūsų pasirinktą kalbą.",
    storyLang: "Pasakų kalba", name: "Vardas", age: "Amžius", save: "Išsaugoti", saved: l => `Išsaugota. Pasakų kalba: ${l}.`,
    footer: "Pasakėlė pastebi pasikartojimus, bet nediagnozuoja. Saugomas tik tekstas, balso įrašų nėra. Pasakos lieka šioje naršyklėje šiame įrenginyje. Jei kas nors neramina, pasikalbėkite su vaiku ir, jei reikia, su vaikų psichologu.",
  },
  ru: {
    storyTime: "Время сказок", forParents: "Для родителей",
    gateEb: "Только для взрослых", gateH: "Раздел для родителей", gateQ: "Решите, чтобы продолжить:", open: "Открыть", wrong: "Неверно. Попробуйте ещё раз.", answer: "Ответ",
    noChildH: "Ребёнок ещё не настроен", noChildP: "Откройте «Время сказок», введите имя и язык ребёнка и вернитесь после первой сказки.",
    showDemo: "Показать пример семьи (вымышленной)", showDemoLong: "Показать пример семьи (вымышленной, для презентаций)",
    demoBanner: "ПРИМЕР · вымышленная семья, не ваш ребёнок.", demoBannerP: "Всё ниже придумано, чтобы показать, как работает страница.",
    backTo: n => `Вернуться: ${n}`, closeDemo: "Закрыть пример",
    insights: "Наблюдения по сказкам", nameAge: (n, a) => `${n}, ${a} лет`, noStories: n => `Сказок пока нет. Всё на этой странице берётся из сказок ребёнка (${n}) и заполняется после каждой готовой книжки.`,
    kStories: "сказок", kWeek: "на этой неделе", kWords: "слов в сказке", kDifferent: "разных слов",
    month: "В этом месяце", noSummary: "Итога пока нет", needTwo: (_n, k) => `Для итога нужно хотя бы 2 сказки. Сейчас: ${k}.`, genHint: () => "Создайте итог по повторяющимся темам.",
    tryThis: "Попробуйте:", reading: "Читаю сказки…", refresh: "Обновить итог", generate: "Создать итог", summaryErr: "Не удалось создать итог. Попробуйте ещё раз.",
    radarEb: "Радар родного языка", radarH: k => `Слов на другом языке: ${k}`, radarAll: () => "Все сказки рассказаны полностью на выбранном языке",
    radarP: r => `За последние 14 дней: ${r}. Часто это слова из садика или школы. Друг в следующем ответе спокойно использует слово на родном языке, не поправляя.`,
    radarEmpty: () => "Когда ребёнок вставит слова на другом языке, они появятся здесь вместе со словом на родном языке.",
    perStory: "Слова на другом языке в каждой сказке", tryWeek: "На этой неделе попробуйте:", tryWeekEnd: "дома в игре или за едой.",
    flagH: (t, k, of) => `Тема «${t}» появилась в ${k} из последних ${of} сказок.`, flagP: "Поможет спокойный разговор перед сном: спросите, что чувствовал герой сказки.",
    talkH: (n, t) => `Пожалуйста, поговорите с ребёнком (${n}) о сказке «${t}».`, talkP: "В этой сказке может быть настоящая тревога. Спокойно выслушайте. Если вы обеспокоены, обратитесь к детскому психологу или семейному врачу.",
    themesH: "Темы", earlier: "Раньше", last14: "Последние 14 дней", themesEmpty: "Темы появятся после первой готовой сказки.",
    feelingsH: "Чувства в каждой сказке", feelingsP: "Чем больше точка, тем сильнее чувство. Самая старая слева.", feelingsEmpty: "Чувства появятся после первой готовой сказки.",
    worldEb: "Мир сказок", worldH: "Кто живёт в сказках", worldP: "Герои в центре, друзья и семья вокруг, страшные персонажи по краям. Чем больше круг, тем чаще появляется персонаж.",
    worldEmptyH: "Мир пока пуст", worldEmptyP: "Здесь соберутся персонажи из сказок.", places: "Места:",
    groups: { hero: "Герои", friend: "Друзья", family: "Семья", helper: "Помощники", villain: "Страшные", other: "Другие" },
    settings: { forest: "лес", sea: "море", space: "космос", castle: "замок", city: "город", home: "дом", meadow: "луг", sky: "небо" },
    storiesH: "Сказки", storiesEmpty: "Готовых сказок пока нет.", mayShow: "Что это может показывать:", readConvo: "Читать разговор", friend: "Друг", openBook: "Открыть книжку",
    reportsEb: "Отчёты и память", psyH: "Отчёт для психолога", psyP: "Итог по темам, чувствам, персонажам и языку за время. Ничего никуда не отправляется: вы скачиваете файл и сами решаете, кто его увидит.",
    psyLabel: "Психолог (необязательно)", psyPh: "Имя специалиста", consent: n => `Я родитель или опекун ребёнка (${n}) и согласен(на) поделиться этим отчётом с указанным специалистом.`,
    downloadReport: "Скачать отчёт", printHint: "Открывается в браузере. Для PDF выберите Print → Save as PDF.",
    bookH: (n, y) => `${n}: книга ${y} года`, coverLine: (s, p) => `Сказок: ${s} · страниц с картинками: ${p}`, coverTitle: n => `${n}: сказки`,
    bookP: "Все сказки года в одной книжке с картинками. Подарок бабушкам и дедушкам.", downloadBook: "Скачать книжку", order: "Заказать книгу · €29",
    orderNote: "Печать пока не подключена, заказ не оформлен. В настоящем продукте книгу отправит типография.", exampleData: "Это данные вымышленной семьи.",
    settingsH: "Настройки ребёнка", settingsP: "Менять их могут только взрослые. Во «Времени сказок» нет выбора языка, ребёнок всегда слышит выбранный вами язык.",
    storyLang: "Язык сказок", name: "Имя", age: "Возраст", save: "Сохранить", saved: l => `Сохранено. Язык сказок: ${l}.`,
    footer: "Pasakėlė замечает повторяющиеся темы, но не ставит диагнозов. Хранится только текст, без записей голоса. Сказки остаются в этом браузере на этом устройстве. Если что-то тревожит, поговорите с ребёнком и, при необходимости, с детским психологом.",
  },
};
