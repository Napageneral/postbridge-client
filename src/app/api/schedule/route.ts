import { NextRequest } from "next/server";
import { z } from "zod";
import { DateTime } from "luxon";
import { createPost } from "@/lib/postbridge";
import { getEnv } from "@/lib/env";

const Body = z.object({
  tweets: z.array(z.string().min(1)).min(1),
  socialAccountIds: z.array(z.string().min(1)).min(1),
  startDate: z.string().optional(), // ISO date-only in tz, e.g. 2025-09-07
  timezone: z.string().optional(), // IANA tz
  postTimeLocal: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:mm
});

export async function POST(req: NextRequest) {
  try {
    const { tweets, socialAccountIds, startDate, timezone, postTimeLocal } = Body.parse(
      await req.json()
    );

    const env = getEnv();
    const tz = timezone || env.DEFAULT_TIMEZONE;
    const defaultHour = parseInt(env.DEFAULT_POST_HOUR_LOCAL, 10) || 21;
    const [h, m] = (postTimeLocal || `${defaultHour}:00`).split(":").map((s) => parseInt(s, 10));

    const start = startDate
      ? DateTime.fromISO(startDate, { zone: tz })
      : DateTime.now().setZone(tz);

    // Today at configured hour (or tomorrow if time already passed)
    let first = start.set({ hour: h, minute: m || 0, second: 0, millisecond: 0 });
    if (first < DateTime.now().setZone(tz)) {
      first = first.plus({ days: 1 });
    }

    const results: { index: number; text: string; scheduledAt: string; id: string }[] = [];

    for (let i = 0; i < tweets.length; i++) {
      const text = tweets[i];
      const scheduledAt = first.plus({ days: i }).toUTC().toISO();
      if (!scheduledAt) throw new Error("Failed to compute schedule time");

      const created = await createPost({
        scheduledAt,
        socialAccountIds,
        content: { default: { text } },
      });
      results.push({ index: i, text, scheduledAt, id: created.id });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed" }), {
      status: 400,
    });
  }
}


