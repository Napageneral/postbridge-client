import { fetchSocialAccounts } from "@/lib/postbridge";

export async function GET() {
  try {
    const accounts = await fetchSocialAccounts();
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


