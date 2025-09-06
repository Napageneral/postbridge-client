import argparse
import json
import os
import sys
from datetime import date

from dotenv import load_dotenv

from llm_parser import prepare_tweets_list
from postbridge_api import list_social_accounts, create_scheduled_post
from scheduler import generate_schedule_datetimes


def read_input_text(file_path: str | None) -> str:
    if file_path:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    return sys.stdin.read()


def cmd_list_accounts(_args: argparse.Namespace) -> int:
    accounts = list_social_accounts()
    print(json.dumps(accounts, indent=2))
    return 0


def cmd_schedule(args: argparse.Namespace) -> int:
    raw_text = read_input_text(args.file)
    if not raw_text.strip():
        print("No input text provided. Use --file or pipe text via stdin.", file=sys.stderr)
        return 2

    tweets = prepare_tweets_list(
        raw_text,
        use_llm=not args.no_llm,
        max_items=args.max,
        max_len=args.max_len,
    )

    if len(tweets) == 0:
        print("No tweets extracted from input.", file=sys.stderr)
        return 3

    # Determine schedule start date
    start_date = args.start_date or date.today().isoformat()
    schedule_times = generate_schedule_datetimes(
        count=len(tweets),
        start_date_iso=start_date,
        time_str=args.time,
        tz_name=args.tz,
    )

    plan = []
    for i, (tweet, when_iso) in enumerate(zip(tweets, schedule_times), start=1):
        plan.append({
            "index": i,
            "socialAccountId": args.social_account_id,
            "scheduledAt": when_iso,
            "text": tweet,
        })

    if args.dry_run:
        print(json.dumps({"planned": plan}, indent=2))
        return 0

    # Execute scheduling
    results = []
    for item in plan:
        resp = create_scheduled_post(
            tweet_text=item["text"],
            social_account_id=item["socialAccountId"],
            scheduled_at_iso=item["scheduledAt"],
        )
        results.append(resp)

    print(json.dumps({"created": results}, indent=2))
    return 0


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="PostBridge daily tweet scheduler")
    sub = parser.add_subparsers(dest="command", required=True)

    # list-accounts
    p_list = sub.add_parser("list-accounts", help="List your social accounts")
    p_list.set_defaults(func=cmd_list_accounts)

    # schedule
    p_sched = sub.add_parser("schedule", help="Parse text and schedule daily tweets")
    p_sched.add_argument("--social-account-id", required=True, help="Target social account id (X/Twitter)")
    p_sched.add_argument("--file", help="Path to input text file; if omitted, reads stdin")
    p_sched.add_argument("--tz", default=os.environ.get("DEFAULT_TZ") or "local", help="IANA timezone, e.g. America/Los_Angeles; 'local' uses system")
    p_sched.add_argument("--time", default=os.environ.get("DEFAULT_POST_TIME") or "21:00", help="Daily post time HH:MM (24h)")
    p_sched.add_argument("--start-date", help="ISO date YYYY-MM-DD to start scheduling; defaults to today")
    p_sched.add_argument("--max", type=int, help="Max number of tweets to schedule")
    p_sched.add_argument("--max-len", type=int, default=280, help="Max length per tweet")
    p_sched.add_argument("--dry-run", action="store_true", help="Print plan without creating posts")
    p_sched.add_argument("--no-llm", action="store_true", help="Disable LLM and use heuristic splitter only")
    p_sched.set_defaults(func=cmd_schedule)

    return parser


def main() -> int:
    load_dotenv()
    parser = build_arg_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())


