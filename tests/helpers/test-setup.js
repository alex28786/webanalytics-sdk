import { vi } from 'vitest';
import { createAlloyMock } from './alloy-mock.js';

let debugOutputEnabled = false;

/**
 * Enable or disable debug output for _satellite.logger mocks.
 * @param {boolean} enabled 
 */
export function setDebugOutput(enabled) {
    debugOutputEnabled = enabled;
}

function getCallerOrigin() {
    try {
        const err = new Error();
        const stack = err.stack.split('\n');
        for (let i = 2; i < stack.length; i++) {
            const line = stack[i];
            if (!line.includes('test-setup.js') && !line.includes('node_modules')) {
                const match = line.match(/[\/\\]([^\/\\]+\.js):(\d+):(\d+)/);
                if (match) {
                    return `${match[1]}:${match[2]}`;
                }
            }
        }
    } catch (e) {
        return 'unknown';
    }
    return 'unknown';
}

const createLoggerMock = (method) => {
    return vi.fn((...args) => {
        if (debugOutputEnabled) {
            const origin = getCallerOrigin();
            const prefix = `[${origin}]`;
            console[method](prefix, ...args);
        }
    });
};

/**
 * Properties that need to be cleaned up between tests.
 * These are set on the global `window` provided by happy-dom (vitest environment).
 */
const managedProps = [
    'pageData', 'eventData', 'appData', '_satellite',
    's', 'pageData_isLoaded', 'alloy',
    '__sShim', 's_onBeforeEventSendHook', 's_mapIntoXdm',
    'pageDataTracker', 's_doPlugins'
];

/**
 * Set up the test window environment.
 * 
 * Because vitest.config.js uses `environment: 'happy-dom'` and `globals: true`,
 * the global `window` object IS globalThis. Writing `window.pageData = {}` also
 * makes bare `pageData` work — exactly like a real browser.
 * 
 * This function simply initialises the properties the SDK expects on that
 * already-existing `window`.  No new Window() is created.
 */
export function setupTestWindow() {
    // Clean any leftover state from a previous test
    managedProps.forEach(prop => {
        try { delete window[prop]; } catch (_) { /* non-configurable */ }
    });

    // Mock _satellite
    window._satellite = {
        getVar: vi.fn((name) => ''),
        logger: {
            error: createLoggerMock('error'),
            log: createLoggerMock('log'),
            warn: createLoggerMock('warn'),
            info: createLoggerMock('info')
        },
        notify: vi.fn(),
        track: vi.fn()
    };

    // Alloy mock
    window.alloy = createAlloyMock();
}

/**
 * Tear down the test window environment.
 * Removes all managed properties and restores mocks.
 */
export function teardownTestWindow() {
    managedProps.forEach(prop => {
        try { delete window[prop]; } catch (_) { /* non-configurable */ }
    });

    debugOutputEnabled = false;
    vi.restoreAllMocks();
}

/**
 * Load (or reload) the tracking library.
 * Calls vi.resetModules() first so that the index.js IIFE runs fresh.
 */
export async function loadTrackingLibrary() {
    vi.resetModules();
    await import('../../src/index.js');
}
