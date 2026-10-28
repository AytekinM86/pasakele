import type { Child, Insight, Story } from "./data";

// Everything is kept in this browser only (localStorage). Reads and writes never throw.
const get = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem("pk:" + k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const set = (k: string, v: unknown) => { try { localStorage.setItem("pk:" + k, JSON.stringify(v)); } catch { /* storage full or blocked */ } };

export const store = {
  child: () => get<Child | null>("child", null),
  saveChild: (c: Child) => set("child", c),
  stories: () => get<Story[]>("stories", []),
  saveStories: (s: Story[]) => set("stories", s),
  insight: () => get<Insight | null>("insight", null),
  saveInsight: (i: Insight) => set("insight", i),
  speak: () => get<boolean>("speak", true),
  saveSpeak: (v: boolean) => set("speak", v),
};
