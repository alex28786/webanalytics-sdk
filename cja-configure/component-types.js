const PATH_BUILDERS = {
  simple_evar: (index) => `_experience.analytics.customDimensions.eVars.eVar${index}`,
  simple_prop: (index) => `_experience.analytics.customDimensions.props.prop${index}`,
  list_prop: (index) => `_experience.analytics.customDimensions.lists.list${index}`,
  hierarchy_variable: (index) => `_experience.analytics.customDimensions.hierarchies.hier${index}`,
  simple_event: (index) => `_experience.analytics.customEvents.event${index}.value`,
  content_event: (index) => `productListItems._experience.analytics.customEvents.event${index}.value`,
  content_evar: (index) => `productListItems._experience.analytics.customDimensions.eVars.eVar${index}`,
  content_prop: (index) => `productListItems._experience.analytics.customDimensions.props.prop${index}`,
};

function resolveSourceFieldId(definition) {
  if (definition.sourceFieldId) return definition.sourceFieldId;
  const builder = PATH_BUILDERS[definition.type];
  if (!builder) {
    throw new Error(`Unsupported component type: ${definition.type}`);
  }
  if (typeof definition.index !== 'number') {
    throw new Error(`Missing numeric index for type ${definition.type} (${definition.id || definition.name})`);
  }
  return builder(definition.index);
}

function basePayload(definition) {
  const payload = {
    id: definition.id,
    name: definition.name,
    description: definition.description || '',
    sourceFieldId: resolveSourceFieldId(definition),
  };

  if (definition.sharedComponentId) {
    payload.sharedComponentId = definition.sharedComponentId;
  }

  if (definition.tags?.length) {
    payload.tags = definition.tags;
  }

  if (definition.settings) {
    Object.assign(payload, definition.settings);
  }

  return payload;
}

function renderDimension(definition) {
  const payload = basePayload(definition);
  payload.includeExcludeSetting = payload.includeExcludeSetting || { enabled: false };
  payload.noValueOptionsSetting = payload.noValueOptionsSetting || {
    includeNoneByDefault: true,
    noneChangeable: true,
    noneSettingType: 'show-no-value',
    customNoneValue: 'No value',
  };

  return payload;
}

function renderMetric(definition) {
  return basePayload(definition);
}

module.exports = {
  PATH_BUILDERS,
  resolveSourceFieldId,
  renderDimension,
  renderMetric,
};
