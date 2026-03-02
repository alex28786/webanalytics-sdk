#!/usr/bin/env python3
"""
CJA Configure — Share with Data Views
=======================================
Share synced dimensions and/or metrics with one or more
CJA data view IDs.

Usage:
    python share.py --data-views dv_xxx,dv_yyy --type dimensions --env dev
    python share.py --data-views dv_xxx --type all --env prod
    python share.py --data-views dv_xxx --type all --env dev --dry-run
"""

import argparse
import sys

import requests
from config import API_BASE, EXPANSION_PARAMS, get_headers, get_env
from storage import (
    read_dimensions,
    read_metrics,
    XLSX_PATH,
)


def _get_synced_component_ids(item_type: str, env_name: str) -> list[dict]:
    """
    Get all synced items with their component IDs for a given env.
    Returns list of {name, component_id}.
    """
    comp_col = f"component_id_{env_name}"

    if item_type == "dimensions":
        rows = read_dimensions()
    else:
        rows = read_metrics()

    return [
        {"name": row["name"], "component_id": row[comp_col]}
        for row in rows
        if row.get(comp_col)
    ]


def share_items(
    data_view_ids: list[str],
    item_type: str,
    env_name: str,
    dry_run: bool = False,
):
    """
    Share dimensions or metrics with specified data view IDs.

    Parameters
    ----------
    data_view_ids : list[str]  — Data view IDs to share with
    item_type     : str        — "dimensions" or "metrics"
    env_name      : str        — "dev" or "prod"
    dry_run       : bool       — if True, don't call API
    """
    env = get_env(env_name)
    items = _get_synced_component_ids(item_type, env_name)

    if not items:
        print(f"  ❌ No {item_type} synced to {env_name.upper()} yet.")
        return

    print(f"\n{'─' * 60}")
    print(f"  🔗 Sharing {len(items)} {item_type} with {len(data_view_ids)} data view(s)")
    print(f"{'─' * 60}")
    print(f"  Data views: {', '.join(data_view_ids)}")

    if dry_run:
        print(f"\n  🔍 DRY RUN — would share:")
        for it in items[:10]:
            print(f"    • {it['name']} ({it['component_id']})")
        if len(items) > 10:
            print(f"    ... and {len(items) - 10} more")
        return

    headers = get_headers()

    # The CJA sharing API typically works per data view
    # Each data view gets the shared component assignments
    for dv_id in data_view_ids:
        print(f"\n  📤 Sharing with data view: {dv_id}")

        # NOTE: The exact sharing API endpoint may differ.
        # This is based on the observed pattern from the CJA UI.
        # The endpoint associates shared components with a data view.
        endpoint_type = "sharedDimensions" if item_type == "dimensions" else "sharedMetrics"
        dg_id = env[f"{item_type}_dg"]

        # Build the sharing payload
        component_ids = [it["component_id"] for it in items]

        try:
            url = f"{API_BASE}/{endpoint_type}/{dg_id}/share"
            payload = {
                "dataViewId": dv_id,
                "componentIds": component_ids,
            }

            resp = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=60,
            )
            resp.raise_for_status()
            print(f"    ✅ Shared {len(component_ids)} {item_type}")

        except requests.exceptions.HTTPError as exc:
            error_body = ""
            try:
                error_body = exc.response.text[:200]
            except Exception:
                pass
            print(f"    ❌ Failed: {exc}")
            if error_body:
                print(f"       {error_body}")

        except Exception as exc:
            print(f"    ❌ Error: {exc}")


def main():
    parser = argparse.ArgumentParser(
        description="Share CJA dimensions/metrics with data views"
    )
    parser.add_argument("--data-views", required=True,
                        help="Comma-separated list of data view IDs")
    parser.add_argument("--type", required=True,
                        choices=["dimensions", "metrics", "all"],
                        help="What to share")
    parser.add_argument("--env", required=True, choices=["dev", "prod"],
                        help="Environment to share from")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show what would be shared without calling API")

    args = parser.parse_args()
    dv_ids = [v.strip() for v in args.data_views.split(",") if v.strip()]

    if not dv_ids:
        print("  ❌ No data view IDs provided.")
        sys.exit(1)

    if not XLSX_PATH.exists():
        print("  ❌ No workbook found. Run sync.py first.")
        sys.exit(1)

    print(f"\n🔧 CJA Configure — Share with Data Views")
    print(f"   Environment: {args.env.upper()}")

    if args.type in ("dimensions", "all"):
        share_items(dv_ids, "dimensions", args.env, args.dry_run)

    if args.type in ("metrics", "all"):
        share_items(dv_ids, "metrics", args.env, args.dry_run)

    print(f"\n✅ Done.\n")


if __name__ == "__main__":
    main()
