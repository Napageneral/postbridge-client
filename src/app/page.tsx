"use client";
import { useEffect, useMemo, useState } from "react";

type Account = { id: string; platform: string; username?: string | null };

export default function Home() {
  const [input, setInput] = useState("");
  const [tweets, setTweets] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loadingParse, setLoadingParse] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts || []))
      .catch(() => setAccounts([]));
  }, []);

  async function handleParse() {
    setError(null);
    setLoadingParse(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
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
        body: JSON.stringify({ tweets, socialAccountIds: selectedIds }),
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

  return (
    <div className="font-sans max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Postbridge Tweet Scheduler</h1>

      <div className="space-y-2">
        <label className="text-sm">Paste your text</label>
        <textarea
          className="w-full h-48 p-3 rounded-md border border-black/10 dark:border-white/10 bg-transparent"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste long text here..."
        />
        <button
          className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
          disabled={!input.trim() || loadingParse}
          onClick={handleParse}
        >
          {loadingParse ? "Parsing..." : "Parse into tweets"}
        </button>
      </div>

      {tweets.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Preview ({tweets.length})</h2>
          <ul className="space-y-2">
            {tweets.map((t, i) => (
              <li key={i} className="p-3 rounded-md border border-black/10 dark:border-white/10">
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Select accounts</h2>
        {accounts.length === 0 ? (
          <p className="text-sm opacity-70">No accounts found.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {accounts.map((a) => (
              <label key={a.id} className="flex items-center gap-2 border px-3 py-2 rounded-md">
                <input
                  type="checkbox"
                  checked={!!selected[a.id]}
                  onChange={(e) =>
                    setSelected((s) => ({ ...s, [a.id]: e.target.checked }))
                  }
                />
                <span className="text-sm">{a.platform}{a.username ? ` • @${a.username}` : ""}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      <div>
        <button
          className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
          disabled={tweets.length === 0 || selectedIds.length === 0 || loadingSchedule}
          onClick={handleSchedule}
        >
          {loadingSchedule ? "Scheduling..." : "Schedule daily at 9pm"}
        </button>
      </div>
    </div>
  );
}
