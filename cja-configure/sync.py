#!/usr/bin/env python3
"""
CJA Configure — Sync Script
============================
Sync dimension and/or metric definitions to a CJA datagroup
(DEV or PROD environment).

Usage:
    python sync.py --env dev --type dimensions
    python sync.py --env dev --type metrics
    python sync.py --env dev --type all
    python sync.py --env dev --type all --dry-run
    python sync.py --env dev --status-only
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
    write_dimensions,
    write_metrics,
    update_sync_state,
    append_sync_log,
    DIM_COLUMNS,
    MET_COLUMNS,
    SHEET_DIMENSIONS,
    SHEET_METRICS,
    XLSX_PATH,
    init_workbook,
)


def _load_component_ids(sheet_name: str, env_name: str) -> dict:
    """
    Load existing component IDs from the XLSX for a given env.
    Returns {name: component_id} dict.
    """
    if sheet_name == SHEET_DIMENSIONS:
        rows = read_dimensions()
    else:
        rows = read_metrics()

    col = f"component_id_{env_name}"
    return {
        row["name"]: row.get(col)
        for row in rows
        if row.get(col)
    }


def _ensure_workbook_and_definitions():
    """
    Make sure the XLSX exists and has current definitions written.
    """
    if not XLSX_PATH.exists():
        print("📋 Initializing workbook...")
        init_workbook()

    # Write current definitions (preserving existing sync state)
    _merge_and_write(DIMENSIONS, SHEET_DIMENSIONS, DIM_COLUMNS)
    _merge_and_write(METRICS, SHEET_METRICS, MET_COLUMNS)


def _merge_and_write(definitions, sheet_name, columns):
    """
    Merge new definitions with existing sync state from XLSX.
    Preserves component_id_dev, component_id_prod, last_synced, status.
    """
    if sheet_name == SHEET_DIMENSIONS:
        existing = read_dimensions()
    else:
        existing = read_metrics()

    # Build lookup of existing state by name
    existing_by_name = {r["name"]: r for r in existing}

    merged = []
    for defn in definitions:
        row = dict(defn)  # copy
        name = defn["name"]
        if name in existing_by_name:
            old = existing_by_name[name]
            # Preserve sync state columns
            for col in ["status", "component_id_dev", "component_id_prod",
                        "last_synced_dev", "last_synced_prod"]:
                if old.get(col):
                    row[col] = old[col]
        merged.append(row)

    if sheet_name == SHEET_DIMENSIONS:
        write_dimensions(merged)
    else:
        write_metrics(merged)


def sync_dimensions(env_name: str, dry_run: bool = False):
    """Sync all dimension definitions to the specified environment."""
    print(f"\n{'─' * 60}")
    print(f"  📐 Syncing DIMENSIONS → {env_name.upper()}")
    print(f"{'─' * 60}")

    existing_ids = _load_component_ids(SHEET_DIMENSIONS, env_name)
    payloads = []

    for defn in DIMENSIONS:
        comp_id = existing_ids.get(defn["name"])
        payload = render_dimension(defn, comp_id)
        payloads.append(payload)

    print(f"  Definitions: {len(payloads)} ({sum(1 for d in DIMENSIONS if d['scope'] == 'product')} product-scoped)")

    if dry_run:
        print(f"\n  🔍 DRY RUN — payloads would be sent:\n")
        for p in payloads[:5]:
            print(f"    • {p['name']}")
            print(f"      id: {p['id']}")
            print(f"      source: {p['sourceFieldId']}")
            if p.get("sharedComponentId"):
                print(f"      update: {p['sharedComponentId']}")
        if len(payloads) > 5:
            print(f"    ... and {len(payloads) - 5} more")
        return

    result = bulk_upsert_dimensions(env_name, payloads)

    if result["success"]:
        matched = match_response_to_definitions(result["data"], DIMENSIONS)
        synced = [m for m in matched if m["matched"]]
        failed = [m for m in matched if not m["matched"]]

        print(f"  ✅ Synced: {len(synced)}, Failed to match: {len(failed)}")

        # Update storage
        updates = [
            {"name": m["definition"]["name"], "component_id": m["component_id"]}
            for m in synced
        ]
        update_sync_state(SHEET_DIMENSIONS, DIM_COLUMNS, updates, env_name)

        # Log
        append_sync_log(
            env=env_name,
            sync_type="dimensions",
            items_total=len(payloads),
            items_synced=len(synced),
            items_failed=len(failed),
        )
    else:
        print(f"  ❌ Sync failed: {result['error']}")
        append_sync_log(
            env=env_name,
            sync_type="dimensions",
            items_total=len(payloads),
            items_synced=0,
            items_failed=len(payloads),
            errors=result["error"][:500],
        )


def sync_metrics(env_name: str, dry_run: bool = False):
    """Sync all metric definitions to the specified environment."""
    print(f"\n{'─' * 60}")
    print(f"  📊 Syncing METRICS → {env_name.upper()}")
    print(f"{'─' * 60}")

    existing_ids = _load_component_ids(SHEET_METRICS, env_name)
    payloads = []

    for defn in METRICS:
        comp_id = existing_ids.get(defn["name"])
        payload = render_metric(defn, comp_id)
        payloads.append(payload)

    print(f"  Definitions: {len(payloads)} ({sum(1 for m in METRICS if m['scope'] == 'product')} product-scoped)")

    if dry_run:
        print(f"\n  🔍 DRY RUN — payloads would be sent:\n")
        for p in payloads[:5]:
            print(f"    • {p['name']}")
            print(f"      id: {p['id']}")
            print(f"      source: {p['sourceFieldId']}")
        if len(payloads) > 5:
            print(f"    ... and {len(payloads) - 5} more")
        return

    result = bulk_upsert_metrics(env_name, payloads)

    if result["success"]:
        matched = match_response_to_definitions(result["data"], METRICS)
        synced = [m for m in matched if m["matched"]]
        failed = [m for m in matched if not m["matched"]]

        print(f"  ✅ Synced: {len(synced)}, Failed to match: {len(failed)}")

        updates = [
            {"name": m["definition"]["name"], "component_id": m["component_id"]}
            for m in synced
        ]
        update_sync_state(SHEET_METRICS, MET_COLUMNS, updates, env_name)

        append_sync_log(
            env=env_name,
            sync_type="metrics",
            items_total=len(payloads),
            items_synced=len(synced),
            items_failed=len(failed),
        )
    else:
        print(f"  ❌ Sync failed: {result['error']}")
        append_sync_log(
            env=env_name,
            sync_type="metrics",
            items_total=len(payloads),
            items_synced=0,
            items_failed=len(payloads),
            errors=result["error"][:500],
        )


def show_status(env_name: str):
    """Show current sync status for all definitions."""
    print(f"\n{'─' * 60}")
    print(f"  📋 Sync Status — {env_name.upper()}")
    print(f"{'─' * 60}")

    comp_col = f"component_id_{env_name}"
    ts_col = f"last_synced_{env_name}"

    for label, rows in [("Dimensions", read_dimensions()), ("Metrics", read_metrics())]:
        total = len(rows)
        synced = sum(1 for r in rows if r.get(comp_col))
        pending = total - synced

        print(f"\n  {label}: {total} total, {synced} synced, {pending} pending")

        if pending > 0:
            print(f"  Pending items:")
            for r in rows:
                if not r.get(comp_col):
                    print(f"    • {r.get('name', '?')}")


def main():
    parser = argparse.ArgumentParser(description="Sync CJA dimensions and metrics")
    parser.add_argument("--env", required=True, choices=["dev", "prod"],
                        help="Target environment")
    parser.add_argument("--type", choices=["dimensions", "metrics", "all"],
                        default="all", help="What to sync (default: all)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show payloads without sending to API")
    parser.add_argument("--status-only", action="store_true",
                        help="Show sync status only, don't sync")

    args = parser.parse_args()

    print(f"\n🔧 CJA Configure — Sync")
    print(f"   Environment: {args.env.upper()}")

    # Ensure workbook is up to date with latest definitions
    _ensure_workbook_and_definitions()

    if args.status_only:
        show_status(args.env)
        return

    if args.type in ("dimensions", "all"):
        sync_dimensions(args.env, args.dry_run)

    if args.type in ("metrics", "all"):
        sync_metrics(args.env, args.dry_run)

    print(f"\n✅ Done.\n")


if __name__ == "__main__":
    main()
