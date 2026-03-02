"""
CJA Configure — API Client
===========================
Thin wrapper around the Adobe CJA Datagroups API for bulk
upserting shared dimensions and shared metrics.
"""

import requests
from config import API_BASE, EXPANSION_PARAMS, get_headers, get_env


# ── Payload rendering ─────────────────────────────────────────────────────

def render_dimension(defn: dict, component_id: str | None = None) -> dict:
    """
    Build a single dimension payload for the CJA bulk API.

    Parameters
    ----------
    defn : dict
        A dimension definition from definitions/dimensions.py.
        Must have: name, description, id, source, scope.
    component_id : str or None
        If the dimension was previously synced, pass the sharedComponentId
        to update instead of create.

    Returns
    -------
    dict  — API-ready payload.
    """
    # For merchandising (product-scoped) dimensions, the source is under
    # productListItems.  The `id` and `source` in the definition should
    # already reflect this, but we'll double-check the prefix.
    source = defn["source"]
    if source.startswith("xdm."):
        source = source[4:]  # strip leading xdm.

    payload = {
        "name": defn["name"],
        "description": defn.get("description", ""),
        "id": defn["id"],
        "sourceFieldId": source,
        "labels": [],
        "isDeleted": False,
        "hideFromReporting": False,
        "includeExcludeSetting": {"enabled": False},
        "noValueOptionsSetting": {
            "includeNoneByDefault": True,
            "noneChangeable": True,
            "noneSettingType": "show-no-value",
            "customNoneValue": "No value",
        },
        "behaviorSetting": {"lowercase": False},
        "substringSetting": {"enabled": False},
    }

    # Persistence / expiration
    if defn.get("expiration"):
        payload["persistenceSetting"] = {
            "enabled": True,
            "expiration": defn["expiration"],
        }
    else:
        payload["persistenceSetting"] = {"enabled": False}

    # Existing component → update
    if component_id:
        payload["sharedComponentId"] = component_id

    return payload


def render_metric(defn: dict, component_id: str | None = None) -> dict:
    """
    Build a single metric payload for the CJA bulk API.

    Parameters
    ----------
    defn : dict
        A metric definition from definitions/metrics.py.
    component_id : str or None
        Existing sharedComponentId for updates.

    Returns
    -------
    dict  — API-ready payload.
    """
    source = defn["source"]
    if source.startswith("xdm."):
        source = source[4:]

    payload = {
        "name": defn["name"],
        "description": defn.get("description", ""),
        "id": defn["id"],
        "sourceFieldId": source,
        "labels": [],
        "isDeleted": False,
        "hideFromReporting": False,
        "includeExcludeSetting": {"enabled": False},
    }

    # Deduplication
    if defn.get("deduplication"):
        payload["deduplication"] = defn["deduplication"]

    # Existing component → update
    if component_id:
        payload["sharedComponentId"] = component_id

    return payload


# ── API calls ──────────────────────────────────────────────────────────────

def bulk_upsert_dimensions(env_name: str, payloads: list[dict], dry_run: bool = False) -> dict:
    """
    PUT bulk dimensions to the CJA datagroups API.

    Parameters
    ----------
    env_name : str   — "dev" or "prod"
    payloads : list  — list of rendered dimension payloads
    dry_run : bool   — if True, skip the actual API call

    Returns
    -------
    dict with keys: success (bool), data (list), error (str|None)
    """
    env = get_env(env_name)
    dg_id = env["dimensions_dg"]
    url = f"{API_BASE}/sharedDimensions/{dg_id}/bulk"

    return _do_bulk_put(url, payloads, dry_run)


def bulk_upsert_metrics(env_name: str, payloads: list[dict], dry_run: bool = False) -> dict:
    """
    PUT bulk metrics to the CJA datagroups API.

    Parameters
    ----------
    env_name : str   — "dev" or "prod"
    payloads : list  — list of rendered metric payloads
    dry_run : bool   — if True, skip the actual API call

    Returns
    -------
    dict with keys: success (bool), data (list), error (str|None)
    """
    env = get_env(env_name)
    dg_id = env["metrics_dg"]
    url = f"{API_BASE}/sharedMetrics/{dg_id}/bulk"

    return _do_bulk_put(url, payloads, dry_run)


def _do_bulk_put(url: str, payloads: list[dict], dry_run: bool = False) -> dict:
    """Execute the bulk PUT and return normalized result."""
    params = {"locale": "en_US", "expansion": EXPANSION_PARAMS}
    headers = get_headers()

    if dry_run:
        return {
            "success": True,
            "dry_run": True,
            "url": url,
            "payload_count": len(payloads),
            "payloads": payloads,
            "data": [],
            "error": None,
        }

    try:
        resp = requests.put(url, params=params, headers=headers, json=payloads, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        # Normalise: the API may return a list or an object with results
        if isinstance(data, list):
            results = data
        elif isinstance(data, dict) and "results" in data:
            results = data["results"]
        else:
            results = [data]

        return {"success": True, "data": results, "error": None}

    except requests.exceptions.HTTPError as exc:
        error_body = ""
        try:
            error_body = exc.response.text
        except Exception:
            pass
        return {
            "success": False,
            "data": [],
            "error": f"{exc} — {error_body}",
        }
    except Exception as exc:
        return {
            "success": False,
            "data": [],
            "error": str(exc),
        }


# ── Response matching ──────────────────────────────────────────────────────

def match_response_to_definitions(results: list[dict], definitions: list[dict]) -> list[dict]:
    """
    Match API response items back to local definitions by name.

    Returns a list of dicts:
      { "definition": <defn>, "component_id": <str>, "matched": True/False }
    """
    # Build lookup by name
    result_by_name = {}
    for item in results:
        name = item.get("name", "")
        comp_id = item.get("sharedComponentId") or item.get("id", "")
        result_by_name[name] = comp_id

    matched = []
    for defn in definitions:
        name = defn["name"]
        comp_id = result_by_name.get(name)
        matched.append({
            "definition": defn,
            "component_id": comp_id,
            "matched": comp_id is not None,
        })

    return matched
