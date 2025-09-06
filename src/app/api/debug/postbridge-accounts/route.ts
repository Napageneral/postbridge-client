import { getEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const env = getEnv();
    const url = `${env.POSTBRIDGE_BASE_URL.replace(/\/$/, "")}/v1/social-accounts`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${env.POSTBRIDGE_API_KEY}`,
        "x-api-key": env.POSTBRIDGE_API_KEY,
      },
      cache: "no-store",
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {}
    const sample = Array.isArray(json) ? json.slice(0, 3) : json?.items?.slice?.(0, 3) ?? null;
    return new Response(
      JSON.stringify({
        ok: res.ok,
        status: res.status,
        url,
        bodyPreview: text.slice(0, 800),
        sample,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "debug failed" }), { status: 500 });
  }
}

