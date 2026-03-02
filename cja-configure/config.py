"""
CJA Configure — Configuration & Constants
==========================================
Loads API credentials from environment variables or .env file,
defines datagroup IDs and API endpoints for DEV and PROD.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# ── Load .env from project root ────────────────────────────────────────────
_project_root = Path(__file__).resolve().parent.parent
_env_path = _project_root / ".env"
if _env_path.exists():
    load_dotenv(_env_path)

# ── API Credentials ────────────────────────────────────────────────────────
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN", "")
ORG_ID = os.getenv("CJA_ORG_ID", "4D6368F454EC41940A4C98A6@AdobeOrg")

# ── API Base ───────────────────────────────────────────────────────────────
API_BASE = "https://datagroups.acc.appsvc.an.adobe.com/datagroups/1.0/users"

# ── Expansion parameters (used in all bulk requests) ──────────────────────
EXPANSION_PARAMS = ",".join([
    "tags", "favorite", "approved", "storagePrecision", "segmentable",
    "dataSetIds", "sourceFieldId", "sourceFieldName", "sourceFieldType",
    "description", "hideFromReporting", "includeExcludeSetting",
    "dataSetType", "schemaPath", "schemaType", "type", "required",
    "tableName", "baseTableName", "allocation", "duleLabels", "deprecated",
    "inheritedDataSetTypes", "isArrayType", "bucketingSetting",
    "noValueOptionsSetting", "booleanFormatSetting", "defaultDimensionSort",
    "persistenceSetting", "multiValued", "behaviorSetting",
    "dateTimeFormatSetting", "substringSetting", "precisionSetting",
    "summaryDataGroupingSetting",
])

# ── Environment Configs ───────────────────────────────────────────────────
# Replace placeholder IDs with your actual datagroup IDs.
ENVS = {
    "dev": {
        "dimensions_dg": os.getenv(
            "CJA_DEV_DIMENSIONS_DG",
            "dg_a64d1f7a-4d42-4638-9815-8188ecaadfd1",  # from legacy template
        ),
        "metrics_dg": os.getenv(
            "CJA_DEV_METRICS_DG",
            "dg_PLACEHOLDER_DEV_METRICS",
        ),
    },
    "prod": {
        "dimensions_dg": os.getenv(
            "CJA_PROD_DIMENSIONS_DG",
            "dg_PLACEHOLDER_PROD_DIMENSIONS",
        ),
        "metrics_dg": os.getenv(
            "CJA_PROD_METRICS_DG",
            "dg_PLACEHOLDER_PROD_METRICS",
        ),
    },
}

# ── Data file path ────────────────────────────────────────────────────────
DATA_DIR = Path(__file__).resolve().parent / "data"
XLSX_PATH = DATA_DIR / "cja-metrics-dimensions.xlsx"

# ── Request defaults ──────────────────────────────────────────────────────
DEFAULT_HEADERS = {
    "accept": "application/json",
    "content-type": "application/json; charset=UTF-8",
    "cache-control": "no-cache",
    "x-request-client-type": "Script",
}


def get_headers():
    """Build request headers with current ACCESS_TOKEN."""
    if not ACCESS_TOKEN:
        raise ValueError(
            "ACCESS_TOKEN is not set. "
            "Set it in .env or as an environment variable."
        )
    return {
        **DEFAULT_HEADERS,
        "authorization": f"Bearer {ACCESS_TOKEN}",
        "x-gw-ims-org-id": ORG_ID,
    }


def get_env(env_name: str) -> dict:
    """Return the environment config dict, raising on invalid env."""
    env_name = env_name.lower()
    if env_name not in ENVS:
        raise ValueError(f"Unknown environment '{env_name}'. Use: {list(ENVS.keys())}")
    return ENVS[env_name]
