import { timingSafeEqual } from "node:crypto";

// When APP_ACCESS_CODE is set (on Vercel), every API call must send the same code in x-access-code.
// This keeps strangers who find the link from spending the Claude balance. Unset locally = open.
export function denied(request: Request): Response | null {
  const expected = process.env.APP_ACCESS_CODE;
  if (!expected) return null;
  const given = request.headers.get("x-access-code") || "";
  const a = Buffer.from(given), b = Buffer.from(expected);
  if (a.length === b.length && timingSafeEqual(a, b)) return null;
  return Response.json({ error: "Family code needed.", code: "access" }, { status: 401 });
}
