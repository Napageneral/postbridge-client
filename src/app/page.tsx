"use client";
import { useEffect, useMemo, useState } from "react";

type Account = { id: string; platform: string; username?: string | null };

export default function Home() {
  const [input, setInput] = useState("");
  const [tweets, setTweets] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [startDate, setStartDate] = useState<string>(""); // YYYY-MM-DD
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles");
  const [postTime, setPostTime] = useState<string>("21:00"); // HH:mm
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [clientOpenAIKey, setClientOpenAIKey] = useState<string>("");
  const [clientPostbridgeKey, setClientPostbridgeKey] = useState<string>("");
  const [loadingParse, setLoadingParse] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  useEffect(() => {
    const qs = clientPostbridgeKey ? `?key=${encodeURIComponent(clientPostbridgeKey)}` : "";
    fetch(`/api/accounts${qs}`)
      .then(async (r) => {
        const d = await r.json();
        if (r.ok) {
          setAccounts(d.accounts || []);
        } else {
          setAccounts([]);
          setError(d?.error || "Failed to fetch accounts. Check your API key and restart dev server after changing env.");
        }
      })
      .catch((e) => {
        setAccounts([]);
        setError(e?.message || "Failed to fetch accounts");
      });
  }, [clientPostbridgeKey]);

  async function handleParse() {
    setError(null);
    setLoadingParse(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, openaiApiKey: clientOpenAIKey || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTweets(data.tweets || []);
    } catch (e: any) {
      setError(e?.message || "Parse failed");
    } finally {
      setLoadingParse(false);
    }
  }

  async function handleSchedule() {
    setError(null);
    setLoadingSchedule(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweets,
          socialAccountIds: selectedIds,
          startDate: startDate || undefined,
          timezone: timezone || undefined,
          postTimeLocal: postTime || undefined,
          postbridgeApiKey: clientPostbridgeKey || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      alert(`Scheduled ${data.results?.length || 0} posts.`);
    } catch (e: any) {
      setError(e?.message || "Schedule failed");
    } finally {
      setLoadingSchedule(false);
    }
  }

  function removeTweet(index: number) {
    setTweets((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  }

  function updateTweet(index: number, text: string) {
    setTweets((prev) => prev.map((t, i) => (i === index ? text : t)));
  }

  const prompt = "Based on your memory of our chat logs, and the following guidance: If you want to get rich on X, it isn't going to be through creator revenue or meme coins. Instead, think about one subject matter that you know more about than anyone else in the world. It can be anything: plumbing, menswear, Indian food, furniture, social apps, whatever. Post one unexpected insight you picked from your experience in that area. Keep it under 5 sentences. Do this every day for 6 months. If you stick to it, we will promote your account to others. By the end, you will be recognized as the world's leading expert in that subject area and you can charge whatever you want for endorsements, your time, or whatever. And no one will be able to take that way from you. What is my subject matter that I know more about than anyone else and what are some examples of unexpected insights I could offer under 5 sentences?";

  return (
    <div className="font-sans mx-auto p-6 space-y-8 max-w-7xl">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">Tweet Like Nikita</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="md:col-span-3 flex justify-center md:justify-start">
            <img
              src="/nikita-tweet.png"
              alt="Nikita's tweet"
              className="w-full max-w-3xl rounded-xl border border-black/10 dark:border-white/10 shadow-sm"
            />
          </div>
          <div className="md:col-span-1 card">
            <div className="card-content space-y-3">
              <p className="text-sm opacity-80">
                Copy the starter prompt, paste into ChatGPT or Claude, then paste the
                results here to automatically parse and schedule them out.
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(prompt)}
                className="btn w-full"
              >
                Copy prompt
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-content space-y-2">
          <label className="text-sm">Paste your text</label>
          <textarea
            className="input w-full h-48"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste long text here..."
          />
          <button
            className="btn-primary px-4 py-2 rounded-md disabled:opacity-50"
            disabled={!input.trim() || loadingParse}
            onClick={handleParse}
          >
            {loadingParse ? "Parsing..." : "Parse into tweets"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card">
          <div className="card-content flex flex-col gap-1">
            <label className="text-sm">OpenAI API key (optional, client-only)</label>
            <input
              type="password"
              className="input"
              placeholder="sk-..."
              value={clientOpenAIKey}
              onChange={(e) => setClientOpenAIKey(e.target.value)}
            />
            <p className="text-xs opacity-80">
              Used only to parse your long text into tweet-sized posts. You can
              create/manage keys in your provider dashboard.
              <a
                href="https://platform.openai.com/settings/organization/api-keys"
                target="_blank"
                rel="noreferrer"
                className="ml-1 underline"
              >
                Get an OpenAI API key
              </a>
              .
            </p>
            <p className="text-xs opacity-70">Trust at your own peril. Prefer deploying your own and setting env vars. Use throwaway keys if entering here.</p>
          </div>
        </div>
        <div className="card">
          <div className="card-content flex flex-col gap-1">
            <label className="text-sm">Post-Bridge API key (optional, client-only)</label>
            <input
              type="password"
              className="input"
              placeholder="pb_live_..."
              value={clientPostbridgeKey}
              onChange={(e) => setClientPostbridgeKey(e.target.value)}
            />
            <p className="text-xs opacity-80">
              Required to schedule posts. Post-Bridge lets you publish across
              social platforms via one API. You’ll need an account and API key.
              <a
                href="https://www.post-bridge.com/dashboard/api-keys"
                target="_blank"
                rel="noreferrer"
                className="ml-1 underline"
              >
                Get a Post-Bridge API key
              </a>
              .
            </p>
            <p className="text-xs opacity-70">Trust at your own peril. Prefer deploying your own and setting env vars. Use throwaway keys if entering here.</p>
          </div>
        </div>
      </div>

      {tweets.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Preview ({tweets.length})</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tweets.map((t, i) => {
              const over = (t || "").length > 280;
              const isEditing = editingIndex === i;
              return (
                <li key={i} className="relative card max-w-sm">
                  <div className="card-content p-4">
                    <button
                      type="button"
                      onClick={() => removeTweet(i)}
                      className="absolute top-2 right-2 btn text-xs"
                      aria-label="Remove tweet"
                    >
                      Remove
                    </button>
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-black/10 dark:bg-white/10 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">Preview</span>
                          <span className="opacity-60">@you</span>
                          <span className={`ml-auto text-xs ${over ? "text-red-600 dark:text-red-400" : "opacity-60"}`}>{(t || "").length}/280</span>
                        </div>
                        <div className="mt-2">
                          {isEditing ? (
                            <textarea
                              value={t}
                              onChange={(e) => updateTweet(i, e.target.value)}
                              onBlur={() => setEditingIndex(null)}
                              autoFocus
                              rows={3}
                              className="input w-full"
                            />
                          ) : (
                            <p
                              className="whitespace-pre-wrap break-words cursor-text"
                              onClick={() => setEditingIndex(i)}
                              title="Click to edit"
                            >
                              {t}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Select accounts (Twitter/X)</h2>
        {accounts.length === 0 ? (
          <p className="text-sm opacity-70">No Twitter/X accounts found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accounts.map((a) => {
              const active = !!selected[a.id];
              return (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => setSelected((s) => ({ ...s, [a.id]: !active }))}
                  className={`text-left p-4 rounded-md border transition-colors ${
                    active
                      ? "border-black dark:border-white bg-black/5 dark:bg-white/10"
                      : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="text-sm font-medium">{a.username ? `@${a.username}` : a.id}</div>
                  <div className="text-xs opacity-70">{a.platform}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-content">
          <h2 className="text-lg font-medium mb-3">Schedule options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm">Start date</label>
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Post time (HH:mm)</label>
              <input
                type="time"
                className="input"
                value={postTime}
                onChange={(e) => setPostTime(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Timezone</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. America/Los_Angeles"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <button
          className="btn-primary px-4 py-2 rounded-md disabled:opacity-50"
          disabled={tweets.length === 0 || selectedIds.length === 0 || loadingSchedule}
          onClick={handleSchedule}
        >
          {loadingSchedule ? "Scheduling..." : `Schedule daily at ${(() => {
            const [hh, mm] = (postTime || "21:00").split(":").map((s) => parseInt(s, 10));
            const h = isNaN(hh) ? 21 : hh;
            const m = isNaN(mm) ? 0 : mm;
            const suffix = h >= 12 ? "PM" : "AM";
            const hour12 = ((h % 12) || 12).toString().padStart(1, "");
            const min = m.toString().padStart(2, "0");
            return `${hour12}:${min} ${suffix}`;
          })()}`}
        </button>
      </div>
    </div>
  );
}
