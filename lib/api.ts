import { store } from "./store";

export const NEED_CODE = "pk:need-code";

// POSTs JSON to one of our API routes with the family code. A 401 asks the app to show the code form.
export async function post(path: string, body: unknown): Promise<Response> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", "x-access-code": store.code() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    window.dispatchEvent(new Event(NEED_CODE));
    throw new Error("🔒");
  }
  return res;
}
