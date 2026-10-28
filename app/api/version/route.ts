// Which deployment is serving: lets an open page notice a newer version and refresh itself.
export async function GET() {
  return Response.json(
    { v: process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || "dev" },
    { headers: { "cache-control": "no-store" } },
  );
}
