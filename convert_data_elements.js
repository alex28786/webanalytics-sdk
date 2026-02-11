const fs = require('fs');
const path = require('path');

// Read the legacy file content
const legacyContent = fs.readFileSync('legacy/data-elements.js', 'utf8');

// Modifying content to be essentially a module export so we can require it
const fileContent = legacyContent + "\nmodule.exports = dataElements;";
const tempFile = 'legacy/data-elements-temp.js';
fs.writeFileSync(tempFile, fileContent);

let definitions;
try {
    definitions = require('./' + tempFile);
} catch (e) {
    console.error("Error requiring temp file:", e);
    // fallback or exit?
    process.exit(1);
}

// Now generate the output
let output = `import { pageDataTracker } from '../core/tracker.js';

function path(str) {
    if (!str) return '';
    const parts = str.split('.');
    let obj = window;
    for (const part of parts) {
        if (obj === undefined || obj === null) return '';
        obj = obj[part];
    }
    return obj;
}

function getParam(name) {
    // Case insensitive matching by default as per legacy behavior seen
    const search = window.location.search.substring(1);
    const params = search.split('&');
    for (const param of params) {
        const [key, value] = param.split('=');
        if (key.toLowerCase() === name.toLowerCase()) {
            return decodeURIComponent(value || '');
        }
    }
    return '';
}

export const dataElements = {
`;

for (const [name, config] of Object.entries(definitions)) {
    let fnBody = '';

    // Check modulePath to determine type
    if (config.modulePath && config.modulePath.includes('customCode.js')) {
        // Source is a function
        if (config.settings && config.settings.source) {
            fnBody = config.settings.source.toString();
        }
    } else if (config.modulePath && config.modulePath.includes('javascriptVariable.js')) {
        // path mapping
        if (config.settings && config.settings.path) {
            const p = config.settings.path;
            fnBody = `function() { return path("${p}"); }`;
        }
    } else if (config.modulePath && config.modulePath.includes('queryStringParameter.js')) {
        // query param
        if (config.settings && config.settings.name) {
            const p = config.settings.name;
            fnBody = `function() { return getParam("${p}"); }`;
        }
    } else if (config.modulePath && config.modulePath.includes('constant.js')) {
        if (config.settings && config.settings.value) {
            const val = config.settings.value;
            fnBody = `function() { return "${val}"; }`;
        }
    }

    if (fnBody) {
        output += `    "${name}": ${fnBody},\n`;
    } else {
        // console.warn('Skipping data element with unknown type or missing settings:', name);
    }
}

output += `};

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
                console.error(\`Error executing internal data element "\${name}":\`, e);
                return undefined;
            }
        } else {
            return item;
        }
    }

    return undefined;
}
`;

fs.writeFileSync('src/legacy/data-elements.js', output);
fs.unlinkSync(tempFile);
console.log('Done');
