"""
Tests — API Payload Rendering & Response Matching
===================================================
Tests the API payload generation and response matching
without making actual API calls.
"""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from api import render_dimension, render_metric, match_response_to_definitions


class TestRenderDimension:
    def test_basic_hit_dimension(self):
        defn = {
            "name": "Account ID [v1]",
            "description": "Institutional account ID",
            "id": "variables/_experience.analytics.customDimensions.eVars.eVar1",
            "source": "_experience.analytics.customDimensions.eVars.eVar1",
            "scope": "hit",
        }
        payload = render_dimension(defn)

        assert payload["name"] == "Account ID [v1]"
        assert payload["id"] == defn["id"]
        assert payload["sourceFieldId"] == defn["source"]
        assert "sharedComponentId" not in payload
        assert payload["persistenceSetting"]["enabled"] is False

    def test_with_component_id(self):
        defn = {
            "name": "Test [v2]",
            "description": "Test",
            "id": "test_id",
            "source": "test_source",
            "scope": "hit",
        }
        payload = render_dimension(defn, component_id="comp_123")
        assert payload["sharedComponentId"] == "comp_123"

    def test_with_expiration(self):
        defn = {
            "name": "Test [v3]",
            "description": "Test",
            "id": "test_id",
            "source": "test_source",
            "scope": "hit",
            "expiration": "visit",
        }
        payload = render_dimension(defn)
        assert payload["persistenceSetting"]["enabled"] is True
        assert payload["persistenceSetting"]["expiration"] == "visit"

    def test_product_scoped_source(self):
        defn = {
            "name": "Content Format [v17]",
            "description": "Content format",
            "id": "variables/productListItems._experience.analytics.customDimensions.eVars.eVar17",
            "source": "productListItems._experience.analytics.customDimensions.eVars.eVar17",
            "scope": "product",
        }
        payload = render_dimension(defn)
        assert "productListItems." in payload["sourceFieldId"]

    def test_strips_xdm_prefix(self):
        defn = {
            "name": "Test [v99]",
            "description": "Test",
            "id": "test_id",
            "source": "xdm._experience.analytics.customDimensions.eVars.eVar99",
            "scope": "hit",
        }
        payload = render_dimension(defn)
        assert payload["sourceFieldId"].startswith("_experience")


class TestRenderMetric:
    def test_basic_hit_metric(self):
        defn = {
            "name": "Page Load [e27]",
            "description": "Initial page load",
            "id": "metrics/_experience.analytics.event1to100.event27.value",
            "source": "_experience.analytics.event1to100.event27.value",
            "scope": "hit",
        }
        payload = render_metric(defn)

        assert payload["name"] == "Page Load [e27]"
        assert payload["sourceFieldId"] == defn["source"]
        assert "sharedComponentId" not in payload

    def test_product_scoped_metric(self):
        defn = {
            "name": "Cart Revenue [e20]",
            "description": "Revenue",
            "id": "metrics/productListItems._experience.analytics.event1to100.event20.value",
            "source": "productListItems._experience.analytics.event1to100.event20.value",
            "scope": "product",
        }
        payload = render_metric(defn)
        assert "productListItems." in payload["sourceFieldId"]

    def test_with_deduplication(self):
        defn = {
            "name": "Test [e100]",
            "description": "Test",
            "id": "test_id",
            "source": "test_source",
            "scope": "hit",
            "deduplication": {"enabled": True, "type": "always"},
        }
        payload = render_metric(defn)
        assert payload["deduplication"]["enabled"] is True


class TestMatchResponse:
    def test_exact_match(self):
        results = [
            {"name": "Dim A", "sharedComponentId": "comp_a"},
            {"name": "Dim B", "sharedComponentId": "comp_b"},
        ]
        definitions = [
            {"name": "Dim A"},
            {"name": "Dim B"},
        ]
        matched = match_response_to_definitions(results, definitions)

        assert len(matched) == 2
        assert all(m["matched"] for m in matched)
        assert matched[0]["component_id"] == "comp_a"

    def test_partial_match(self):
        results = [
            {"name": "Dim A", "sharedComponentId": "comp_a"},
        ]
        definitions = [
            {"name": "Dim A"},
            {"name": "Dim C"},  # not in results
        ]
        matched = match_response_to_definitions(results, definitions)

        assert matched[0]["matched"] is True
        assert matched[1]["matched"] is False

    def test_empty_results(self):
        matched = match_response_to_definitions([], [{"name": "X"}])
        assert len(matched) == 1
        assert matched[0]["matched"] is False
