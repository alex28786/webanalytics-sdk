import { describe, it, expect, vi } from 'vitest';

const { resolveSourceFieldId, renderDimension, renderMetric } = require('../cja-configure/component-types');
const { buildPayload, syncDefinitions, syncDevToProd, shareWithDataViews } = require('../cja-configure/sync-lib');

describe('CJA component type mapping', () => {
  const cases = [
    ['simple_evar', 12, '_experience.analytics.customDimensions.eVars.eVar12'],
    ['simple_prop', 31, '_experience.analytics.customDimensions.props.prop31'],
    ['list_prop', 2, '_experience.analytics.customDimensions.lists.list2'],
    ['hierarchy_variable', 1, '_experience.analytics.customDimensions.hierarchies.hier1'],
    ['simple_event', 190, '_experience.analytics.customEvents.event190.value'],
    ['content_event', 191, 'productListItems._experience.analytics.customEvents.event191.value'],
    ['content_evar', 127, 'productListItems._experience.analytics.customDimensions.eVars.eVar127'],
    ['content_prop', 11, 'productListItems._experience.analytics.customDimensions.props.prop11'],
  ];

  it.each(cases)('maps %s', (type, index, expectedPath) => {
    const sourceFieldId = resolveSourceFieldId({ type, index, id: `${type}-${index}` });
    expect(sourceFieldId).toBe(expectedPath);
  });

  it('builds dimension payload defaults', () => {
    const payload = renderDimension({
      id: 'variables/_experience.analytics.customDimensions.eVars.eVar2',
      type: 'simple_evar',
      index: 2,
      name: 'Search Type [v2]',
    });

    expect(payload.includeExcludeSetting).toEqual({ enabled: false });
    expect(payload.noValueOptionsSetting.noneSettingType).toBe('show-no-value');
  });

  it('builds metric payload', () => {
    const payload = renderMetric({
      id: 'metrics/_experience.analytics.customEvents.event20',
      type: 'simple_event',
      index: 20,
      name: 'Cart Adds [e20]',
    });

    expect(payload.sourceFieldId).toBe('_experience.analytics.customEvents.event20.value');
  });
});

describe('CJA sync orchestration', () => {
  it('buildPayload renders mixed dimensions and metrics', () => {
    const result = buildPayload([
      { id: 'variables/_experience.analytics.customDimensions.eVars.eVar4', type: 'simple_evar', index: 4, name: 'v4' },
      { id: 'metrics/_experience.analytics.customEvents.event20', type: 'simple_event', index: 20, name: 'e20' },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].sourceFieldId).toContain('eVar4');
    expect(result[1].sourceFieldId).toContain('event20');
  });

  it('syncDefinitions calls dimension + metric upsert', async () => {
    const client = {
      upsertDimensions: vi.fn().mockResolvedValue({ ok: true }),
      upsertMetrics: vi.fn().mockResolvedValue({ ok: true }),
    };

    const result = await syncDefinitions({
      client,
      sharedId: 'dg_1',
      dimensions: [{ id: 'variables/_experience.analytics.customDimensions.eVars.eVar4', type: 'simple_evar', index: 4, name: 'v4' }],
      metrics: [{ id: 'metrics/_experience.analytics.customEvents.event20', type: 'simple_event', index: 20, name: 'e20' }],
    });

    expect(client.upsertDimensions).toHaveBeenCalledWith('dg_1', expect.any(Array));
    expect(client.upsertMetrics).toHaveBeenCalledWith('dg_1', expect.any(Array));
    expect(result.dimensionCount).toBe(1);
    expect(result.metricCount).toBe(1);
  });

  it('syncDevToProd copies dev payload to prod payload', async () => {
    const client = {
      getDimensions: vi.fn().mockResolvedValue({ content: [{ id: 'variables/a', sharedComponentId: 'x' }] }),
      getMetrics: vi.fn().mockResolvedValue({ content: [{ id: 'metrics/a', sharedComponentId: 'y' }] }),
      upsertDimensions: vi.fn().mockResolvedValue({}),
      upsertMetrics: vi.fn().mockResolvedValue({}),
    };

    await syncDevToProd({ client, devSharedId: 'dg_dev', prodSharedId: 'dg_prod' });

    expect(client.getDimensions).toHaveBeenCalledWith('dg_dev');
    expect(client.upsertDimensions).toHaveBeenCalledWith('dg_prod', [{ id: 'variables/a' }]);
    expect(client.upsertMetrics).toHaveBeenCalledWith('dg_prod', [{ id: 'metrics/a' }]);
  });

  it('shareWithDataViews shares all component ids with each dataview', async () => {
    const client = {
      shareComponentsWithDataView: vi.fn().mockResolvedValue({}),
    };

    const dataViewIds = ['dv_1', 'dv_2'];
    const dimensions = [{ id: 'variables/a' }];
    const metrics = [{ id: 'metrics/a' }];

    const result = await shareWithDataViews({ client, dataViewIds, dimensions, metrics });

    expect(client.shareComponentsWithDataView).toHaveBeenCalledTimes(2);
    expect(client.shareComponentsWithDataView).toHaveBeenCalledWith({
      dataViewId: 'dv_1',
      dimensionIds: ['variables/a'],
      metricIds: ['metrics/a'],
    });
    expect(result.dataViewCount).toBe(2);
  });
});
