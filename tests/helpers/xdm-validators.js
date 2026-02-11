import { expect } from 'vitest';

/**
 * Verifies that a deep path exists in the XDM object and matches the expected value.
 * @param {Object} xdm The XDM object
 * @param {String} path Dot-notation path (e.g. "_experience.analytics.customDimensions.eVars.eVar1")
 * @param {Any} expectedValue The expected value
 */
export function expectXdmPath(xdm, path, expectedValue) {
    const parts = path.split('.');
    let current = xdm;

    for (const part of parts) {
        if (current === undefined || current === null) {
            console.error(`Path ${path} not found in XDM object. Stopped at ${part}. Full object:`, JSON.stringify(xdm, null, 2));
            throw new Error(`Path ${path} not found in XDM object. Stopped at ${part}.`);
        }
        current = current[part];
    }

    if (current !== expectedValue) {
        console.error(`Mismatch at ${path}: Expected '${expectedValue}', got '${current}'`);
        console.error(`Full XDM object:`, JSON.stringify(xdm, null, 2));
    }
    expect(current).toBe(expectedValue);
}

/**
 * Accessor for eVars.
 */
export function expectEVar(xdm, index, expectedValue) {
    const path = `_experience.analytics.customDimensions.eVars.eVar${index}`;
    expectXdmPath(xdm, path, expectedValue);
}

/**
 * Accessor for Props.
 */
export function expectProp(xdm, index, expectedValue) {
    const path = `_experience.analytics.customDimensions.props.prop${index}`;
    expectXdmPath(xdm, path, expectedValue);
}

/**
 * Verifies that a specific event is present in the XDM object.
 * Checks _experience.analytics.event1to100.eventN.value
 */
export function expectAnalyticsEvent(xdm, eventIndex, expectedValue = 1) {
    // Determine bucket
    const n = Number(eventIndex);
    const start = Math.floor((n - 1) / 100) * 100 + 1;
    const end = start + 99;
    const bucket = `event${start}to${end}`;

    const path = `_experience.analytics.${bucket}.event${eventIndex}.value`;
    // We expect the value to be there. Usually 1.
    // Sometimes it might be a string "1" or number 1.

    // We'll use a custom check to allow string/number mismatch if needed, or strict.
    // The mapper sets it as number or string depending on logic.
    // For now, strict check based on caller
    expectXdmPath(xdm, path, expectedValue);
}
