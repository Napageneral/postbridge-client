import OpenAI from "openai";
import { getEnv } from "@/lib/env";

export function getOpenAIClient() {
  const env = getEnv();
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export async function extractTweetsFromText(input: string): Promise<string[]> {
  const client = getOpenAIClient();
  const system = [
    "You split long text into discrete tweet candidates.",
    "Each tweet must be under 280 characters, plain text only, no numbering unless present in source, and no leading/trailing quotes.",
    "Keep original voice and specificity. Remove duplicates.",
    "Return a JSON object of the form { \"items\": string[] } only.",
  ].join(" ");
  const user = `TEXT:\n${input}\n\nReturn { \"items\": [<tweet strings>] } — nothing else.`;

  const chat = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = chat.choices?.[0]?.message?.content?.trim() || "";
  // Expect { items: [...] }, but be robust to array fallback
  let arr: unknown;
  try {
    arr = JSON.parse(content);
  } catch (_) {
    // try fallback: if model returned an object like { items: [...] }
    try {
      arr = JSON.parse(content || "{}")?.items;
    } catch {
      arr = [];
    }
  }
  const tweets: string[] = Array.isArray(arr)
    ? arr.map((s) => String(s))
    : Array.isArray((arr as any)?.items)
    ? (arr as any).items.map((s: any) => String(s))
    : [];
  return tweets
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length <= 280);
}


