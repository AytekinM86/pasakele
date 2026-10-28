import type { Child, Insight, Page, Role, Story, Theme, ForeignWord, EmotionKey } from "./data";

// Example family shown in the parent area until the child has told two stories. Never mixed with real stories.
export const EXAMPLE_CHILD: Child = { name: "Ayla", age: 6, lang: "az", note: "Speaks Azerbaijani at home and Lithuanian at kindergarten. Stories are shown in English for the demo." };

const DAY = 864e5;
const lt = (word: string, native: string, gloss: string): ForeignWord => ({ word, lang: "Lithuanian", native, gloss });
const P = (text: string, setting: Page["setting"], time: Page["time"], characters: string[]): Page => ({ text, setting, time, characters });

function ex(daysAgo: number, title: string, themes: Theme[], emo: [number, number, number, number, number, number], words: number,
  summary: string, parentNote: string, pages: Page[], chars: [string, Role][], foreignWords: ForeignWord[]): Story {
  const keys: EmotionKey[] = ["joy", "curiosity", "calm", "fear", "sadness", "anger"];
  const emotions = Object.fromEntries(keys.map((k, i) => [k, emo[i]])) as Record<EmotionKey, number>;
  return { id: "ex" + daysAgo, example: true, createdAt: Date.now() - daysAgo * DAY, lang: "en", title, themes, emotions, words, summary, parentNote, pages,
    characters: chars.map(([name, role]) => ({ name, role })), foreignWords, concern: "none" };
}

// emo order: joy, curiosity, calm, fear, sadness, anger
export const EXAMPLES: Story[] = [
  ex(27, "The Rainbow Cat", ["animals", "magic", "friendship"], [3, 2, 1, 0, 0, 0], 38, "A cat paints rainbows with its tail and shares them with friends.", "Playful, sharing-focused story.",
    [P("There was a cat with a rainbow tail.", "meadow", "day", ["🐱", "🌈"]), P("She painted the sky for all her friends.", "meadow", "sunset", ["🐱", "🐦", "🐶"])],
    [["Rainbow Cat", "hero"], ["Bird", "friend"], ["Puppy", "friend"]], []),
  ex(24, "The Dragon Who Loved Pancakes", ["adventure", "kindness", "family"], [3, 2, 1, 0, 0, 0], 45, "A dragon flies to grandma's house to learn to make pancakes.", "Warm family feeling, grandma appears as a helper.",
    [P("A big green dragon wanted pancakes.", "castle", "day", ["🐉", "🥞"]), P("Grandma taught him, and he didn't burn a single one.", "home", "day", ["🐉", "👵"])],
    [["Green Dragon", "hero"], ["Grandma", "family"]], []),
  ex(20, "The Princess and the Big Storm", ["courage", "family", "fear"], [2, 1, 1, 1, 0, 0], 52, "A princess helps her family through a storm.", "Some fear, resolved with courage and family support.",
    [P("The storm was so loud the windows shook.", "castle", "night", ["👸", "⛈️"]), P("She held her brother's hand and they sang until morning.", "castle", "day", ["👸", "👦"])],
    [["Princess", "hero"], ["Little brother", "family"], ["Grandma", "family"], ["The Storm", "villain"]], []),
  ex(16, "The Bunny Who Moved House", ["home", "family", "being different"], [1, 2, 1, 0, 1, 0], 49, "A bunny's family moves to a new burrow far away.", "First mention of moving. Mixed feelings about the new place.",
    [P("Bunny's family packed everything in a big carrot box.", "home", "day", ["🐰", "📦"]), P("The new burrow smelled strange.", "forest", "sunset", ["🐰"])],
    [["Bunny", "hero"], ["Grandma", "family"], ["Mum and Dad", "family"]], [lt("dėžė", "qutu", "box")]),
  ex(12, "New Forest, No Friends", ["loneliness", "animals", "friendship"], [0, 1, 0, 1, 2, 0], 61, "A fox in a new forest has nobody to play with.", "Loneliness is the main feeling. The story ends without a friend.",
    [P("The little fox walked around the new forest alone.", "forest", "sunset", ["🦊"]), P("The other animals were playing, but nobody called her.", "forest", "night", ["🦊", "🐻", "🐿️"])],
    [["Little Fox", "hero"], ["Bear", "other"], ["Squirrel", "other"]], [lt("miškas", "meşə", "forest")]),
  ex(8, "The Shadow Under the Bed", ["fear", "home", "courage"], [0, 1, 0, 3, 1, 0], 58, "A shadow lives under the bed and only comes out at night.", "Strong fear around bedtime. The child solved it with a flashlight.",
    [P("Every night a shadow came out from under the bed.", "home", "night", ["👧", "👤"]), P("She turned on her flashlight and the shadow was only a teddy.", "home", "night", ["👧", "🧸", "🔦"])],
    [["Ayla", "hero"], ["The Shadow", "villain"], ["Teddy", "friend"]], [lt("lova", "çarpayı", "bed"), lt("žibintuvėlis", "fənər", "flashlight")]),
  ex(5, "Owl School", ["school", "fear", "friendship"], [1, 1, 0, 2, 0, 0], 66, "A young owl is nervous on her first day at owl school.", "Nervousness about a new group. A teacher helps.",
    [P("Little owl's wings shook on the first day of school.", "forest", "day", ["🦉", "🏫"]), P("The teacher owl said: everyone was new once.", "forest", "day", ["🦉", "🦉"])],
    [["Little Owl", "hero"], ["Teacher Owl", "helper"], ["The Shadow", "villain"]], [lt("mokykla", "məktəb", "school"), lt("mokytoja", "müəllimə", "teacher"), lt("pertrauka", "tənəffüs", "break time")]),
  ex(2, "Mila Finds a Friend", ["friendship", "kindness", "school"], [2, 1, 2, 1, 0, 0], 74, "A girl shares her crayons and makes a new friend.", "Friendship returns. The tone is lighter than two weeks ago.",
    [P("Mila had the biggest box of crayons.", "city", "day", ["👧", "🖍️"]), P("She gave the blue one to Tomas, and now they draw together.", "city", "day", ["👧", "👦", "💙"])],
    [["Mila", "hero"], ["Tomas", "friend"], ["Teddy", "friend"], ["Teacher Owl", "helper"]], [lt("pieštukai", "karandaşlar", "pencils"), lt("draugas", "dost", "friend"), lt("mokytoja", "müəllimə", "teacher")]),
];

export const EXAMPLE_INSIGHT: Insight = {
  headline: "Fear and loneliness grew after the move. Friendship is coming back in the last week.",
  observations: [
    "Moving house first appeared 16 days ago, followed by two stories about being alone.",
    "Bedtime fear peaked 8 days ago and was solved inside the story, a healthy coping sign.",
    "Lithuanian kindergarten words (mokykla, mokytoja) now appear in her Azerbaijani stories, the school world lives in Lithuanian for her.",
  ],
  tryThis: ["Ask: \"What would the little fox need to feel at home?\"", "Play \"school\" at home in Azerbaijani: məktəb, müəllimə, tənəffüs."],
  example: true,
};
