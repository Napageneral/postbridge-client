import json
import os
import re
from typing import List

from openai import OpenAI


def _json_array_from_text(text: str) -> List[str]:
    try:
        data = json.loads(text)
        if isinstance(data, list):
            return [str(x) for x in data]
    except Exception:
        pass
    # try to extract the first [...] block
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(0))
            if isinstance(data, list):
                return [str(x) for x in data]
        except Exception:
            pass
    return []


def _split_heuristic(text: str, max_len: int = 280) -> List[str]:
    # Prioritize double-newline separated chunks, then lines
    blocks = [b.strip() for b in re.split(r"\n\n+", text) if b.strip()] or [l.strip() for l in text.splitlines() if l.strip()]
    tweets: List[str] = []
    for block in blocks:
        if len(block) <= max_len:
            tweets.append(block)
            continue
        # Try sentence-aware splitting
        sentences = re.split(r"(?<=[.!?])\s+", block)
        cur = ""
        for s in sentences:
            if not s:
                continue
            if len(cur) + (1 if cur else 0) + len(s) <= max_len:
                cur = f"{cur} {s}".strip()
            else:
                if cur:
                    tweets.append(cur)
                # If a single sentence is longer than max_len, hard-wrap
                if len(s) > max_len:
                    while len(s) > max_len:
                        tweets.append(s[:max_len])
                        s = s[max_len:]
                    if s:
                        cur = s
                    else:
                        cur = ""
                else:
                    cur = s
        if cur:
            tweets.append(cur)
    return tweets


def _call_llm(text: str, max_items: int | None, max_len: int) -> List[str]:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return []
    client = OpenAI(api_key=api_key)
    system = (
        "You split input into a JSON array of tweet strings. "
        "Each tweet <= " + str(max_len) + " characters, no numbering, no quotes inside."
    )
    user = (
        "Extract discrete, self-contained tweets (<= "
        + str(max_len)
        + ") from the following text. Return ONLY a JSON array of strings, nothing else.\n\n" + text
    )

    try:
        resp = client.chat.completions.create(
            model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=0.2,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
        content = resp.choices[0].message.content or ""
        items = _json_array_from_text(content)
        if max_items is not None:
            items = items[: max_items]
        # enforce max_len softly
        cleaned = [t.strip()[:max_len] for t in items if t and t.strip()]
        return cleaned
    except Exception:
        return []


def prepare_tweets_list(text: str, use_llm: bool = True, max_items: int | None = None, max_len: int = 280) -> List[str]:
    tweets: List[str] = []
    if use_llm:
        tweets = _call_llm(text, max_items=max_items, max_len=max_len)
    if not tweets:
        tweets = _split_heuristic(text, max_len=max_len)
        if max_items is not None:
            tweets = tweets[: max_items]
    # final clean
    tweets = [t.replace("\u201c", '"').replace("\u201d", '"').strip()[:max_len] for t in tweets if t and t.strip()]
    return tweets


