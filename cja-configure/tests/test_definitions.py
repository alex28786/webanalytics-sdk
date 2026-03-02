"""
Tests — Dimension & Metric Definition Validation
=================================================
Ensures all definitions have required keys, no duplicates,
and merchandising variables are correctly flagged.
"""

import pytest
import sys
import os

# Add parent dir to path so we can import definitions
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from definitions.dimensions import DIMENSIONS, EVARS_PRODUCT, PROPS, LIST_PROPS, LIST_VARS, HIER_VARS
from definitions.metrics import METRICS, METRICS_PRODUCT


# ── Required keys ──────────────────────────────────────────────────────────

REQUIRED_DIM_KEYS = {"name", "description", "id", "source", "scope"}
REQUIRED_MET_KEYS = {"name", "description", "id", "source", "scope"}


class TestDimensionDefinitions:
    """Validate dimension definitions."""

    def test_all_have_required_keys(self):
        for i, defn in enumerate(DIMENSIONS):
            missing = REQUIRED_DIM_KEYS - set(defn.keys())
            assert not missing, f"Dimension #{i} '{defn.get('name', '?')}' missing keys: {missing}"

    def test_no_duplicate_ids(self):
        ids = [d["id"] for d in DIMENSIONS]
        dupes = [x for x in ids if ids.count(x) > 1]
        assert not dupes, f"Duplicate dimension IDs: {set(dupes)}"

    def test_no_duplicate_names(self):
        names = [d["name"] for d in DIMENSIONS]
        dupes = [x for x in names if names.count(x) > 1]
        assert not dupes, f"Duplicate dimension names: {set(dupes)}"

    def test_scope_values(self):
        for defn in DIMENSIONS:
            assert defn["scope"] in ("hit", "product"), (
                f"'{defn['name']}' has invalid scope: {defn['scope']}"
            )

    def test_product_scoped_have_prefix(self):
        """Merchandising eVars should have productListItems prefix."""
        for defn in EVARS_PRODUCT:
            assert defn["scope"] == "product"
            assert "productListItems." in defn["id"], (
                f"'{defn['name']}' is product-scoped but missing productListItems prefix in id"
            )
            assert "productListItems." in defn["source"], (
                f"'{defn['name']}' is product-scoped but missing productListItems prefix in source"
            )

    def test_hit_scoped_no_prefix(self):
        """Standard eVars should NOT have productListItems prefix."""
        from definitions.dimensions import EVARS_HIT
        for defn in EVARS_HIT:
            assert defn["scope"] == "hit"
            assert "productListItems." not in defn["id"], (
                f"'{defn['name']}' is hit-scoped but has productListItems prefix"
            )

    def test_props_are_hit_scoped(self):
        for defn in PROPS:
            assert defn["scope"] == "hit"

    def test_total_count(self):
        """Sanity check: we have a reasonable number of dimensions."""
        assert len(DIMENSIONS) > 100, f"Expected 100+ dimensions, got {len(DIMENSIONS)}"

    def test_known_merchandising_evars(self):
        """Verify known merchandising eVar numbers are product-scoped."""
        merch_nums = {17, 20, 28, 38, 63, 70, 71, 73, 75, 80, 93, 99, 100,
                      104, 111, 116, 122, 123, 127, 128, 129, 130, 131, 132,
                      133, 134, 135, 139, 140, 142, 159, 160, 164, 170, 200}

        product_nums = set()
        for defn in EVARS_PRODUCT:
            # Extract eVar number from name like "Content Format [v17]"
            num = int(defn["name"].split("[v")[1].rstrip("]"))
            product_nums.add(num)

        missing = merch_nums - product_nums
        assert not missing, f"Missing merchandising eVars: {missing}"


class TestMetricDefinitions:
    """Validate metric definitions."""

    def test_all_have_required_keys(self):
        for i, defn in enumerate(METRICS):
            missing = REQUIRED_MET_KEYS - set(defn.keys())
            assert not missing, f"Metric #{i} '{defn.get('name', '?')}' missing keys: {missing}"

    def test_no_duplicate_ids(self):
        ids = [m["id"] for m in METRICS]
        dupes = [x for x in ids if ids.count(x) > 1]
        assert not dupes, f"Duplicate metric IDs: {set(dupes)}"

    def test_no_duplicate_names(self):
        names = [m["name"] for m in METRICS]
        dupes = [x for x in names if names.count(x) > 1]
        assert not dupes, f"Duplicate metric names: {set(dupes)}"

    def test_scope_values(self):
        for defn in METRICS:
            assert defn["scope"] in ("hit", "product"), (
                f"'{defn['name']}' has invalid scope: {defn['scope']}"
            )

    def test_product_scoped_have_prefix(self):
        for defn in METRICS_PRODUCT:
            assert defn["scope"] == "product"
            assert "productListItems." in defn["id"], (
                f"'{defn['name']}' missing productListItems prefix in id"
            )

    def test_event_bucket_naming(self):
        """Verify event bucket naming is correct."""
        from definitions.metrics import _event_bucket
        assert _event_bucket(1) == "event1to100"
        assert _event_bucket(100) == "event1to100"
        assert _event_bucket(101) == "event101to200"
        assert _event_bucket(200) == "event101to200"
        assert _event_bucket(364) == "event301to400"

    def test_known_merchandising_events(self):
        """Verify known merchandising event numbers are product-scoped."""
        merch_events = {20, 51, 181, 182, 184, 239, 240, 264, 319, 335, 336}

        product_nums = set()
        for defn in METRICS_PRODUCT:
            num = int(defn["name"].split("[e")[1].rstrip("]"))
            product_nums.add(num)

        missing = merch_events - product_nums
        assert not missing, f"Missing merchandising events: {missing}"

    def test_total_count(self):
        assert len(METRICS) > 50, f"Expected 50+ metrics, got {len(METRICS)}"
