#!/usr/bin/env python3
"""
CJA Configure — Sync DEV → PROD
=================================
Promote synced definitions from the DEV environment to PROD.
Uses the same definitions but targets the PROD datagroup IDs.

Usage:
    python sync_dev_to_prod.py --type dimensions
    python sync_dev_to_prod.py --type metrics
    python sync_dev_to_prod.py --type all
    python sync_dev_to_prod.py --type all --dry-run
"""

import argparse
import sys

from definitions.dimensions import DIMENSIONS
from definitions.metrics import METRICS
from api import (
    render_dimension,
    render_metric,
    bulk_upsert_dimensions,
    bulk_upsert_metrics,
    match_response_to_definitions,
)
from storage import (
    read_dimensions,
    read_metrics,
    update_sync_state,
    append_sync_log,
    DIM_COLUMNS,
    MET_COLUMNS,
    SHEET_DIMENSIONS,
    SHEET_METRICS,
    XLSX_PATH,
)


def _load_prod_component_ids(sheet_name: str) -> dict:
    """Load existing PROD component IDs from the XLSX."""
    if sheet_name == SHEET_DIMENSIONS:
        rows = read_dimensions()
    else:
        rows = read_metrics()

    return {
        row["name"]: row.get("component_id_prod")
        for row in rows
        if row.get("component_id_prod")
    }


def _check_dev_synced(sheet_name: str) -> tuple[list[dict], list[dict]]:
    """
    Check which definitions have been synced to DEV.
    Returns (synced_to_dev, not_synced_to_dev).
    """
    if sheet_name == SHEET_DIMENSIONS:
        rows = read_dimensions()
    else:
        rows = read_metrics()

    synced = [r for r in rows if r.get("component_id_dev")]
    not_synced = [r for r in rows if not r.get("component_id_dev")]
    return synced, not_synced


def promote_dimensions(dry_run: bool = False):
    """Promote dimension definitions from DEV to PROD."""
    print(f"\n{'─' * 60}")
    print(f"  📐 Promoting DIMENSIONS: DEV → PROD")
    print(f"{'─' * 60}")

    synced_dev, not_synced = _check_dev_synced(SHEET_DIMENSIONS)

    if not_synced:
        print(f"  ⚠ {len(not_synced)} dimensions not yet synced to DEV:")
        for r in not_synced[:10]:
            print(f"    • {r.get('name', '?')}")
        if len(not_synced) > 10:
            print(f"    ... and {len(not_synced) - 10} more")
        print(f"  → These will be skipped. Sync to DEV first.")
        print()

    if not synced_dev:
        print("  ❌ No dimensions synced to DEV. Run sync.py --env dev first.")
        return

    # Build payloads using PROD component IDs for updates
    prod_ids = _load_prod_component_ids(SHEET_DIMENSIONS)
    payloads = []

    for defn in DIMENSIONS:
        # Only promote items that were synced to DEV
        if not any(r["name"] == defn["name"] for r in synced_dev):
            continue
        comp_id = prod_ids.get(defn["name"])
        payload = render_dimension(defn, comp_id)
        payloads.append(payload)

    print(f"  Promoting: {len(payloads)} dimensions")

    if dry_run:
        print(f"\n  🔍 DRY RUN — would promote {len(payloads)} dimensions to PROD")
        for p in payloads[:5]:
            print(f"    • {p['name']}")
        if len(payloads) > 5:
            print(f"    ... and {len(payloads) - 5} more")
        return

    result = bulk_upsert_dimensions("prod", payloads)

    if result["success"]:
        matched = match_response_to_definitions(result["data"], DIMENSIONS)
        synced = [m for m in matched if m["matched"]]
        print(f"  ✅ Promoted: {len(synced)} dimensions to PROD")

        updates = [
            {"name": m["definition"]["name"], "component_id": m["component_id"]}
            for m in synced
        ]
        update_sync_state(SHEET_DIMENSIONS, DIM_COLUMNS, updates, "prod")

        append_sync_log(
            env="prod",
            sync_type="dimensions (promoted from DEV)",
            items_total=len(payloads),
            items_synced=len(synced),
            items_failed=len(payloads) - len(synced),
        )
    else:
        print(f"  ❌ Promotion failed: {result['error']}")
        append_sync_log(
            env="prod",
            sync_type="dimensions (promotion failed)",
            items_total=len(payloads),
            items_synced=0,
            items_failed=len(payloads),
            errors=result["error"][:500],
        )


def promote_metrics(dry_run: bool = False):
    """Promote metric definitions from DEV to PROD."""
    print(f"\n{'─' * 60}")
    print(f"  📊 Promoting METRICS: DEV → PROD")
    print(f"{'─' * 60}")

    synced_dev, not_synced = _check_dev_synced(SHEET_METRICS)

    if not_synced:
        print(f"  ⚠ {len(not_synced)} metrics not yet synced to DEV:")
        for r in not_synced[:10]:
            print(f"    • {r.get('name', '?')}")
        if len(not_synced) > 10:
            print(f"    ... and {len(not_synced) - 10} more")
        print(f"  → These will be skipped. Sync to DEV first.")
        print()

    if not synced_dev:
        print("  ❌ No metrics synced to DEV. Run sync.py --env dev first.")
        return

    prod_ids = _load_prod_component_ids(SHEET_METRICS)
    payloads = []

    for defn in METRICS:
        if not any(r["name"] == defn["name"] for r in synced_dev):
            continue
        comp_id = prod_ids.get(defn["name"])
        payload = render_metric(defn, comp_id)
        payloads.append(payload)

    print(f"  Promoting: {len(payloads)} metrics")

    if dry_run:
        print(f"\n  🔍 DRY RUN — would promote {len(payloads)} metrics to PROD")
        for p in payloads[:5]:
            print(f"    • {p['name']}")
        if len(payloads) > 5:
            print(f"    ... and {len(payloads) - 5} more")
        return

    result = bulk_upsert_metrics("prod", payloads)

    if result["success"]:
        matched = match_response_to_definitions(result["data"], METRICS)
        synced = [m for m in matched if m["matched"]]
        print(f"  ✅ Promoted: {len(synced)} metrics to PROD")

        updates = [
            {"name": m["definition"]["name"], "component_id": m["component_id"]}
            for m in synced
        ]
        update_sync_state(SHEET_METRICS, MET_COLUMNS, updates, "prod")

        append_sync_log(
            env="prod",
            sync_type="metrics (promoted from DEV)",
            items_total=len(payloads),
            items_synced=len(synced),
            items_failed=len(payloads) - len(synced),
        )
    else:
        print(f"  ❌ Promotion failed: {result['error']}")
        append_sync_log(
            env="prod",
            sync_type="metrics (promotion failed)",
            items_total=len(payloads),
            items_synced=0,
            items_failed=len(payloads),
            errors=result["error"][:500],
        )


def main():
    parser = argparse.ArgumentParser(
        description="Promote CJA definitions from DEV to PROD"
    )
    parser.add_argument("--type", required=True,
                        choices=["dimensions", "metrics", "all"],
                        help="What to promote")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show what would be promoted without calling API")

    args = parser.parse_args()

    print(f"\n🔧 CJA Configure — DEV → PROD Promotion")

    if not XLSX_PATH.exists():
        print("  ❌ No workbook found. Run sync.py --env dev first.")
        sys.exit(1)

    if args.type in ("dimensions", "all"):
        promote_dimensions(args.dry_run)

    if args.type in ("metrics", "all"):
        promote_metrics(args.dry_run)

    print(f"\n✅ Done.\n")


if __name__ == "__main__":
    main()
