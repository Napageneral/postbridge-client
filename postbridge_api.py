import os
from typing import Any, Dict, List

import requests


POSTBRIDGE_BASE_URL = os.environ.get("POSTBRIDGE_BASE_URL", "https://api.post-bridge.com")


def _headers() -> Dict[str, str]:
    headers = {"Content-Type": "application/json"}
    api_key = os.environ.get("POSTBRIDGE_API_KEY")
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    return headers


def list_social_accounts() -> List[Dict[str, Any]]:
    url = f"{POSTBRIDGE_BASE_URL}/v1/social-accounts"
    r = requests.get(url, headers=_headers(), timeout=30)
    r.raise_for_status()
    data = r.json()
    # assume array response
    if isinstance(data, list):
        return data
    # or data has 'items'
    items = data.get("items") if isinstance(data, dict) else None
    return items or []


def create_scheduled_post(tweet_text: str, social_account_id: str, scheduled_at_iso: str) -> Dict[str, Any]:
    """
    Creates a scheduled post for X/Twitter. Payload follows a reasonable default structure based on docs hints.
    Adjust POSTBRIDGE_PAYLOAD_STYLE env var if your account expects a different shape.
    """
    style = os.environ.get("POSTBRIDGE_PAYLOAD_STYLE", "v1")

    if style == "v1":
        payload: Dict[str, Any] = {
            "socialAccountIds": [social_account_id],
            "scheduledAt": scheduled_at_iso,
            "platformConfigurations": {
                "twitter": {
                    "text": tweet_text,
                    "content": tweet_text,
                }
            },
            "content": tweet_text,
        }
    else:
        # Fallback minimal content
        payload = {
            "socialAccountIds": [social_account_id],
            "scheduledAt": scheduled_at_iso,
            "content": tweet_text,
        }

    url = f"{POSTBRIDGE_BASE_URL}/v1/posts"
    r = requests.post(url, headers=_headers(), json=payload, timeout=30)
    # If validation error, return the error body for visibility
    try:
        data = r.json()
    except Exception:
        data = {"text": r.text}
    if not r.ok:
        return {"status": r.status_code, "error": data}
    return {"status": r.status_code, "data": data}


