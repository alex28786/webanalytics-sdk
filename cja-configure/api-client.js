const DEFAULT_BASE_URL = 'https://datagroups.acc.appsvc.an.adobe.com/datagroups/1.0/users';
const DEFAULT_EXPANSION = [
  'tags',
  'favorite',
  'approved',
  'sourceFieldId',
  'sourceFieldName',
  'sourceFieldType',
  'description',
  'persistenceSetting',
  'includeExcludeSetting',
].join(',');

function createClient({ authToken, imsOrgId, imsUserId, baseUrl = DEFAULT_BASE_URL, locale = 'en_US', fetchImpl = fetch }) {
  if (!authToken) throw new Error('Missing CJA auth token. Set CJA_AUTH_TOKEN env var.');
  if (!imsOrgId) throw new Error('Missing CJA org id. Set CJA_IMS_ORG_ID env var.');
  if (!imsUserId) throw new Error('Missing CJA user id. Set CJA_IMS_USER_ID env var.');

  const headers = {
    accept: 'application/json',
    authorization: authToken,
    'content-type': 'application/json; charset=UTF-8',
    'x-gw-ims-org-id': imsOrgId,
    'x-gw-ims-user-id': imsUserId,
    'x-request-client-type': 'API',
  };

  async function request(url, options = {}) {
    const response = await fetchImpl(url, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`CJA request failed (${response.status} ${response.statusText}): ${text}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  function getDimensionsUrl(sharedId) {
    return `${baseUrl}/sharedDimensions/${sharedId}`;
  }

  function getMetricsUrl(sharedId) {
    return `${baseUrl}/sharedMetrics/${sharedId}`;
  }

  return {
    async getDimensions(sharedId) {
      const url = `${getDimensionsUrl(sharedId)}?locale=${locale}&expansion=${encodeURIComponent(DEFAULT_EXPANSION)}`;
      return request(url, { method: 'GET' });
    },
    async getMetrics(sharedId) {
      const url = `${getMetricsUrl(sharedId)}?locale=${locale}&expansion=${encodeURIComponent(DEFAULT_EXPANSION)}`;
      return request(url, { method: 'GET' });
    },
    async upsertDimensions(sharedId, payload) {
      const url = `${getDimensionsUrl(sharedId)}/bulk?locale=${locale}&expansion=${encodeURIComponent(DEFAULT_EXPANSION)}`;
      return request(url, { method: 'PUT', body: JSON.stringify(payload) });
    },
    async upsertMetrics(sharedId, payload) {
      const url = `${getMetricsUrl(sharedId)}/bulk?locale=${locale}&expansion=${encodeURIComponent(DEFAULT_EXPANSION)}`;
      return request(url, { method: 'PUT', body: JSON.stringify(payload) });
    },
    async shareComponentsWithDataView({ dataViewId, dimensionIds = [], metricIds = [] }) {
      const url = `${baseUrl}/dataviews/${dataViewId}/sharedComponents`;
      return request(url, {
        method: 'POST',
        body: JSON.stringify({
          dimensionIds,
          metricIds,
        }),
      });
    },
  };
}

module.exports = {
  createClient,
  DEFAULT_BASE_URL,
};
