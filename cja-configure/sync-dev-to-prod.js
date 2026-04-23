#!/usr/bin/env node
const { createClient } = require('./api-client');
const { syncDevToProd } = require('./sync-lib');

async function main() {
  const devSharedId = process.env.CJA_DEV_SHARED_ID;
  const prodSharedId = process.env.CJA_PROD_SHARED_ID;

  if (!devSharedId || !prodSharedId) {
    throw new Error('Missing CJA_DEV_SHARED_ID or CJA_PROD_SHARED_ID environment variable.');
  }

  const client = createClient({
    authToken: process.env.CJA_AUTH_TOKEN,
    imsOrgId: process.env.CJA_IMS_ORG_ID,
    imsUserId: process.env.CJA_IMS_USER_ID,
    baseUrl: process.env.CJA_BASE_URL,
  });

  const result = await syncDevToProd({ client, devSharedId, prodSharedId });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
