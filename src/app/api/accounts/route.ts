import { fetchSocialAccounts } from "@/lib/postbridge";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || undefined;
    const accounts = await fetchSocialAccounts(key);
    // Filter for Twitter/X platforms
    const twitterAccounts = accounts.filter((a) =>
      ["twitter", "x"].includes(a.platform?.toLowerCase?.() || "")
    );
    return new Response(JSON.stringify({ accounts: twitterAccounts }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed" }), {
      status: 500,
    });
  }
}

