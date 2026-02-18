#!/usr/bin/env node
const { createClient } = require('./api-client');
const { dimensions, metrics } = require('./definitions');
const { syncDefinitions } = require('./sync-lib');

async function main() {
  const sharedId = process.env.CJA_SHARED_ID;
  if (!sharedId) throw new Error('Missing CJA_SHARED_ID environment variable.');

  const client = createClient({
    authToken: process.env.CJA_AUTH_TOKEN,
    imsOrgId: process.env.CJA_IMS_ORG_ID,
    imsUserId: process.env.CJA_IMS_USER_ID,
    baseUrl: process.env.CJA_BASE_URL,
  });

  const dryRun = process.argv.includes('--dry-run');
  const result = await syncDefinitions({ client, sharedId, dimensions, metrics, dryRun });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
