#!/usr/bin/env node
const { createClient } = require('./api-client');
const { dimensions, metrics } = require('./definitions');
const { shareWithDataViews } = require('./sync-lib');

async function main() {
  const raw = process.env.CJA_DATA_VIEW_IDS || '';
  const dataViewIds = raw.split(',').map((id) => id.trim()).filter(Boolean);

  if (!dataViewIds.length) {
    throw new Error('Missing CJA_DATA_VIEW_IDS environment variable (comma-separated list).');
  }

  const client = createClient({
    authToken: process.env.CJA_AUTH_TOKEN,
    imsOrgId: process.env.CJA_IMS_ORG_ID,
    imsUserId: process.env.CJA_IMS_USER_ID,
    baseUrl: process.env.CJA_BASE_URL,
  });

  const result = await shareWithDataViews({ client, dataViewIds, dimensions, metrics });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
