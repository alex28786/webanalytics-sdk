# CJA Configure Scripts

Node-based replacement for the legacy notebook workflow in `legacy/cja-configure/sync.ipynb`.

## Files

- `definitions.js`: source-of-truth for all dimensions and metrics.
- `component-types.js`: type registry and source field path resolution.
- `sync.js`: sync local definitions to one shared dimensions/metrics group.
- `sync-dev-to-prod.js`: copy current DEV shared group definitions into PROD shared group.
- `share-with-dataviews.js`: share the configured components with a list of data views.

## Component type coverage

- `simple_evar`
- `simple_prop`
- `list_prop`
- `hierarchy_variable`
- `simple_event`
- `content_evar` (merchandising in `content[]`/products)
- `content_prop` (merchandising in `content[]`/products)
- `content_event` (merchandising in `content[]`/products)

## Usage

```bash
# Sync local definitions to one shared group
CJA_SHARED_ID=dg_xxx CJA_AUTH_TOKEN='Bearer ...' CJA_IMS_ORG_ID='...' CJA_IMS_USER_ID='...' node cja-configure/sync.js

# Dry run payload
CJA_SHARED_ID=dg_xxx CJA_AUTH_TOKEN='Bearer ...' CJA_IMS_ORG_ID='...' CJA_IMS_USER_ID='...' node cja-configure/sync.js --dry-run

# DEV -> PROD copy
CJA_DEV_SHARED_ID=dg_dev CJA_PROD_SHARED_ID=dg_prod CJA_AUTH_TOKEN='Bearer ...' CJA_IMS_ORG_ID='...' CJA_IMS_USER_ID='...' node cja-configure/sync-dev-to-prod.js

# Share all local components with data views
CJA_DATA_VIEW_IDS='dv_1,dv_2' CJA_AUTH_TOKEN='Bearer ...' CJA_IMS_ORG_ID='...' CJA_IMS_USER_ID='...' node cja-configure/share-with-dataviews.js
```
