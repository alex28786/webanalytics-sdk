/**
 * Data Elements Shim
 * 
 * Codified data elements similar to rules.
 * Supports overrides via window._satellite.getVar()
 */

export const dataElements = {
    // Example data element
    "pageName": function () {
        return document.title;
    },
    // Add more codified data elements here
};

/**
 * Resolves a data element value.
 * Priority:
 * 1. Checks if window._satellite.getVar(name) returns a value (external override).
 * 2. Checks internal dataElements[name] (codified).
 * 3. Returns undefined if neither found.
 * 
 * @param {string} name - Name of the data element
 * @returns {*} - The resolved value
 */
export function resolveDataElement(name) {
    // 1. Check for external override
    try {
        if (window._satellite && typeof window._satellite.getVar === 'function') {
            const override = window._satellite.getVar(name);
            if (override !== undefined && override !== null && override !== '') {
                // Return override if it's a valid value.
                // Note: getVar might return null or empty string for valid but empty vars, 
                // but usually we want to fallback if it returns nothing useful.
                // However, if the user explicitly set it to empty string, we should probably respect it?
                // For now, let's assume if it returns a non-nullish value, we use it.
                return override;
            }
        }
    } catch (e) {
        // Ignore errors from external satellite
    }

    // 2. Check internal codified data elements
    if (dataElements.hasOwnProperty(name)) {
        const item = dataElements[name];
        if (typeof item === 'function') {
            try {
                return item();
            } catch (e) {
                console.error(`Error executing internal data element "${name}":`, e);
                return undefined;
            }
        } else {
            return item;
        }
    }

    return undefined;
}
