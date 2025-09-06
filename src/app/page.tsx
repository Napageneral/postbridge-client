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
        body: JSON.stringify({
          tweets,
          socialAccountIds: selectedIds,
          startDate: startDate || undefined,
          timezone: timezone || undefined,
          postTimeLocal: postTime || undefined,
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

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Schedule options</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm">Start date</label>
            <input
              type="date"
              className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-transparent"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">Post time (HH:mm)</label>
            <input
              type="time"
              className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-transparent"
              value={postTime}
              onChange={(e) => setPostTime(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">Timezone</label>
            <input
              type="text"
              className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-transparent"
              placeholder="e.g. America/Los_Angeles"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>
        </div>
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
