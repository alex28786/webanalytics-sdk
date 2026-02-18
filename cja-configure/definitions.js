/**
 * Shared CJA component definitions used by sync scripts.
 *
 * Types:
 * - simple_evar, simple_prop, list_prop, hierarchy_variable, simple_event
 * - content_evar, content_prop, content_event (values sourced from content[]/products syntax)
 */

const dimensions = [
  {
    id: 'variables/_experience.analytics.customDimensions.eVars.eVar4',
    type: 'simple_evar',
    index: 4,
    name: 'Product Name [v4]',
    description: 'Product brand code (page-level).',
  },
  {
    id: 'variables/_experience.analytics.customDimensions.props.prop2',
    type: 'simple_prop',
    index: 2,
    name: 'Product Name [p2]',
    description: 'Product brand code (prop mirror).',
  },
  {
    id: 'variables/_experience.analytics.customDimensions.lists.list2',
    type: 'list_prop',
    index: 2,
    name: 'Widget Names [list2]',
    description: 'List prop for widget names on page.',
  },
  {
    id: 'variables/_experience.analytics.customDimensions.hierarchies.hier1',
    type: 'hierarchy_variable',
    index: 1,
    name: 'Site Hierarchy [hier1]',
    description: 'Section hierarchy.',
  },
  {
    id: 'variables/productListItems._experience.analytics.customDimensions.eVars.eVar100',
    type: 'content_evar',
    index: 100,
    name: 'Content Section [v100]',
    description: 'content[].section from products/content syntax.',
    merchandising: true,
    source: 'content[]',
  },
  {
    id: 'variables/productListItems._experience.analytics.customDimensions.eVars.eVar104',
    type: 'content_evar',
    index: 104,
    name: 'Content Detail [v104]',
    description: 'content[].detail from products/content syntax.',
    merchandising: true,
    source: 'content[]',
  },
  {
    id: 'variables/productListItems._experience.analytics.customDimensions.props.prop11',
    type: 'content_prop',
    index: 11,
    name: 'Content Pathing [p11]',
    description: 'content[].id pathing via products/content syntax.',
    merchandising: true,
    source: 'content[]',
  },
];

const metrics = [
  {
    id: 'metrics/_experience.analytics.customEvents.event20',
    type: 'simple_event',
    index: 20,
    name: 'Cart Adds [e20]',
    description: 'Cart add counter.',
  },
  {
    id: 'metrics/productListItems._experience.analytics.customEvents.event239',
    type: 'content_event',
    index: 239,
    name: 'Datapoints [e239]',
    description: 'content[].datapoints event in products/content syntax.',
    merchandising: true,
    source: 'content[]',
  },
  {
    id: 'metrics/productListItems._experience.analytics.customEvents.event240',
    type: 'content_event',
    index: 240,
    name: 'Documents [e240]',
    description: 'content[].documents event in products/content syntax.',
    merchandising: true,
    source: 'content[]',
  },
  {
    id: 'metrics/productListItems._experience.analytics.customEvents.event335',
    type: 'content_event',
    index: 335,
    name: 'Content Size Start [e335]',
    description: 'content[].size event (paired).',
    merchandising: true,
    source: 'content[]',
  },
  {
    id: 'metrics/productListItems._experience.analytics.customEvents.event336',
    type: 'content_event',
    index: 336,
    name: 'Content Size End [e336]',
    description: 'content[].size event (paired).',
    merchandising: true,
    source: 'content[]',
  },
];

module.exports = {
  dimensions,
  metrics,
};
