const { renderDimension, renderMetric } = require('./component-types');

function buildPayload(definitions) {
  return definitions.map((item) => {
    if (!item.id || !item.name) {
      throw new Error(`Definition must have id and name: ${JSON.stringify(item)}`);
    }

    if (item.id.startsWith('variables/')) {
      return renderDimension(item);
    }

    if (item.id.startsWith('metrics/')) {
      return renderMetric(item);
    }

    throw new Error(`Cannot infer component kind from id: ${item.id}`);
  });
}

async function syncDefinitions({ client, sharedId, dimensions, metrics, dryRun = false }) {
  const dimensionPayload = buildPayload(dimensions);
  const metricPayload = buildPayload(metrics);

  if (dryRun) {
    return {
      dryRun: true,
      dimensionPayload,
      metricPayload,
    };
  }

  const [dimensionResult, metricResult] = await Promise.all([
    client.upsertDimensions(sharedId, dimensionPayload),
    client.upsertMetrics(sharedId, metricPayload),
  ]);

  return {
    dryRun: false,
    dimensionCount: dimensionPayload.length,
    metricCount: metricPayload.length,
    dimensionResult,
    metricResult,
  };
}

async function syncDevToProd({ client, devSharedId, prodSharedId }) {
  const [devDimensions, devMetrics] = await Promise.all([
    client.getDimensions(devSharedId),
    client.getMetrics(devSharedId),
  ]);

  const cleanForTarget = (items = []) => items.map((item) => {
    const cloned = { ...item };
    delete cloned.sharedComponentId;
    delete cloned.approved;
    delete cloned.favorite;
    return cloned;
  });

  const dimensionPayload = cleanForTarget(devDimensions?.content || devDimensions || []);
  const metricPayload = cleanForTarget(devMetrics?.content || devMetrics || []);

  await client.upsertDimensions(prodSharedId, dimensionPayload);
  await client.upsertMetrics(prodSharedId, metricPayload);

  return {
    dimensionCount: dimensionPayload.length,
    metricCount: metricPayload.length,
  };
}

async function shareWithDataViews({ client, dataViewIds, dimensions, metrics }) {
  const dimensionIds = dimensions.map((d) => d.id);
  const metricIds = metrics.map((m) => m.id);

  for (const dataViewId of dataViewIds) {
    // sequential to make failure context easier to read
    await client.shareComponentsWithDataView({ dataViewId, dimensionIds, metricIds });
  }

  return {
    dataViewCount: dataViewIds.length,
    dimensionCount: dimensionIds.length,
    metricCount: metricIds.length,
  };
}

module.exports = {
  buildPayload,
  syncDefinitions,
  syncDevToProd,
  shareWithDataViews,
};
