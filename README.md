## PostBridge Daily Tweet Scheduler

A tiny CLI that:

- Parses a block of text with an LLM into discrete tweet-sized posts
- Schedules one tweet per day at 9:00 PM for N consecutive days via PostBridge
- Provides a dry-run mode and utilities to list your connected social accounts

References: see the PostBridge API docs at [Post Results](https://api.post-bridge.com/reference#tag/post-results).

### Features

- LLM-based parsing (OpenAI by default) with a safe heuristic fallback
- Timezone-aware scheduling (defaults to your local TZ) at 21:00 daily
- Chooses specific social account(s) to schedule to (e.g., X/Twitter)
- Dry-run prints the planned schedule without calling the API

### Quickstart

1) Create and activate a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2) Install dependencies

```bash
pip install -r requirements.txt
```

3) Configure environment

Copy the example file and fill in your keys. Never commit real keys.

```bash
cp .env.example .env
```

Edit `.env` and set:

- `POSTBRIDGE_API_KEY` = your PostBridge API key
- `OPENAI_API_KEY` = your OpenAI API key (if using the LLM parser)
- Optional `POSTBRIDGE_BASE_URL` (defaults to `https://api.post-bridge.com`)
- Optional `DEFAULT_TZ` (IANA name like `America/Los_Angeles`)

4) List your social accounts (to grab the ID for X/Twitter)

```bash
python cli.py list-accounts
```

5) Parse and schedule from a text file (dry-run first)

```bash
python cli.py schedule \
  --social-account-id YOUR_TWITTER_ACCOUNT_ID \
  --tz America/Los_Angeles \
  --time 21:00 \
  --start-date 2025-01-02 \
  --max 30 \
  --dry-run \
  --file path/to/your_input.txt
```

Pipe input works too:

```bash
cat notes.txt | python cli.py schedule --social-account-id YOUR_TWITTER_ACCOUNT_ID --dry-run
```

Remove `--dry-run` to actually create scheduled posts via PostBridge.

### Notes

- The tool defaults to 9:00 PM local time daily; use `--tz` and `--time` to override
- If the LLM is not available or errors, a heuristic splitter will be used
- Tweets are capped at 280 chars by default (soft limit) before scheduling

### Environment

All secrets are read from `.env` via `python-dotenv`. `.env` is included in `.gitignore`.

### Development

- Python 3.10+ recommended
- No package `__init__.py` files are used
- No ORMs are used; no database required

### License

MIT. See `LICENSE` (optional to add).


