import { getEnv } from "@/lib/env";

export type SocialAccount = {
  id: string;
  platform: string; // lower-case platform identifier (e.g., "twitter", "x")
  username?: string | null;
};

export type CreatedPost = {
  id: string;
};

type CreatePostPayload = {
  scheduledAt: string; // ISO 8601
  socialAccountIds: string[];
  content: {
    default: {
      text: string;
    };
  };
};

function getHeaders(apiKeyOverride?: string) {
  const env = getEnv();
  const key = apiKeyOverride && apiKeyOverride.trim().length > 0 ? apiKeyOverride : env.POSTBRIDGE_API_KEY;
  // Try both common API key patterns
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${key}`,
    "x-api-key": key,
  } as const;
}

function getBaseUrl() {
  return "https://api.post-bridge.com";
}

export async function fetchSocialAccounts(apiKeyOverride?: string): Promise<SocialAccount[]> {
  const url = `${getBaseUrl()}/v1/social-accounts`;
  const res = await fetch(url, { headers: getHeaders(apiKeyOverride), cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch accounts: ${res.status} ${text}`);
  }
  const data = await res.json();
  // API may return { data: [...] } or { items: [...] } or an array
  const list: any[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : Array.isArray((data as any)?.items)
    ? (data as any).items
    : [];
  // Shape to minimal type
  const accounts: SocialAccount[] = list.map((a: any) => {
    const rawPlatform = String(a.platform || a.provider || a.type || "");
    const platform = rawPlatform.toLowerCase();
    const username = a.username ?? a.handle ?? a.screenName ?? null;
    return { id: String(a.id), platform, username };
  });
  return accounts;
}

export async function createPost(payload: CreatePostPayload, apiKeyOverride?: string): Promise<CreatedPost> {
  const url = `${getBaseUrl()}/v1/posts`;
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(apiKeyOverride),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create post: ${res.status} ${text}`);
  }
  const data = await res.json();
  return { id: String(data?.id) };
}


