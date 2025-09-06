from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import List

from zoneinfo import ZoneInfo


def _parse_time_str(hhmm: str) -> time:
    hh, mm = hhmm.split(":")
    return time(hour=int(hh), minute=int(mm))


def generate_schedule_datetimes(
    count: int,
    start_date_iso: str,
    time_str: str,
    tz_name: str | None,
) -> List[str]:
    tzinfo = None
    if tz_name and tz_name != "local":
        tzinfo = ZoneInfo(tz_name)
    else:
        tzinfo = datetime.now().astimezone().tzinfo

    start_date_obj = date.fromisoformat(start_date_iso)
    post_time = _parse_time_str(time_str)

    out: List[str] = []
    for i in range(count):
        d = start_date_obj + timedelta(days=i)
        dt = datetime.combine(d, post_time)
        if tzinfo is not None:
            dt = dt.replace(tzinfo=tzinfo)
        # ISO string with timezone offset
        out.append(dt.isoformat())
    return out


