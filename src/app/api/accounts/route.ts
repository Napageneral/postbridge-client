import { fetchSocialAccounts } from "@/lib/postbridge";

export async function GET() {
  try {
    const accounts = await fetchSocialAccounts();
    return new Response(JSON.stringify({ accounts }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed" }), {
      status: 500,
    });
  }
}


