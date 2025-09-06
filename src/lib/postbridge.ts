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

function getHeaders() {
  const env = getEnv();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.POSTBRIDGE_API_KEY}`,
  } as const;
}

function getBaseUrl() {
  return getEnv().POSTBRIDGE_BASE_URL.replace(/\/$/, "");
}

export async function fetchSocialAccounts(): Promise<SocialAccount[]> {
  const url = `${getBaseUrl()}/v1/social-accounts`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch accounts: ${res.status} ${text}`);
  }
  const data = await res.json();
  // Shape to minimal type
  const accounts: SocialAccount[] = (Array.isArray(data) ? data : data?.items || []).map((a: any) => {
    const rawPlatform = String(a.platform || a.provider || a.type || "");
    const platform = rawPlatform.toLowerCase();
    const username = a.username ?? a.handle ?? a.screenName ?? null;
    return { id: String(a.id), platform, username };
  });
  return accounts;
}

export async function createPost(payload: CreatePostPayload): Promise<CreatedPost> {
  const url = `${getBaseUrl()}/v1/posts`;
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create post: ${res.status} ${text}`);
  }
  const data = await res.json();
  return { id: String(data?.id) };
}


