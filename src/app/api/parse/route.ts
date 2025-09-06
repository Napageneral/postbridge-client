import { NextRequest } from "next/server";
import { z } from "zod";
import { extractTweetsFromText } from "@/lib/llm";

const Body = z.object({ text: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { text } = Body.parse(json);
    const tweets = await extractTweetsFromText(text);
    return new Response(JSON.stringify({ tweets }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    const message = err?.message || "Invalid request";
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
}


