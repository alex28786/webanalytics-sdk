
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Window } from 'happy-dom';
import { createAlloyMock } from './helpers/alloy-mock.js';
import { expectEVar, expectAnalyticsEvent } from './helpers/xdm-validators.js';

describe('Alloy Integration Verification', () => {
    let win;

    beforeEach(async () => {
        // Setup happy-dom environment
        win = new Window();
        global.window = win;
        global.document = win.document;
        global.localStorage = win.localStorage;
        global.sessionStorage = win.sessionStorage;

        // Shim global pageData to window.pageData because tracker.js uses 'pageData' without window prefix
        // We define it on global so that when tracker.js (as an ES module) runs, it finds pageData on the global object
        Object.defineProperty(global, 'pageData', {
            get() { return win.pageData; },
            set(v) { win.pageData = v; },
            configurable: true
        });

        // Mock console to reduce noise
        // global.console = { ...console, error: vi.fn(), warn: vi.fn(), log: vi.fn() };

        // establish global appData array
        win.appData = [];

        // Mock Alloy
        win.alloy = createAlloyMock();

        // Reset modules so we get fresh state for each test
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete global.pageData;
        delete global.window;
        delete global.document;
        delete global.localStorage;
        delete global.sessionStorage;
        delete global._satellite;
    });

    it('should map pageLoad data to correct XDM values via the hook', async () => {
        // Load the main index entry point to initialize the shim
        await import('../src/index.js');

        // Wait for any async initialization
        await new Promise(resolve => setTimeout(resolve, 10));

        // Scenario 1: Page Load
        // User requirement: set pageData global first
        window.pageData = {
            page: {
                name: 'testsite',
                productName: 'sb',
                loadTimestamp: Date.now().toString() // needed to avoid warnings/errors in tracker
            }
        };

        // Push to appData
        window.appData.push({ event: 'pageLoad' });

        // Wait for async processing if any
        await new Promise(resolve => setTimeout(resolve, 50));

        // Get the alloy mock
        const alloyMock = win.alloy;

        // Expect alloy("sendEvent", { xdm: ... }) to be called
        // We check processedEvents to see the state AFTER the hook
        expect(alloyMock.processedEvents.length).toBeGreaterThan(0);
        const lastContent = alloyMock.processedEvents[alloyMock.processedEvents.length - 1];
        const xdm = lastContent.xdm;

        // Assertions requested by user:
        expectEVar(xdm, 4, 'sb');
        expectEVar(xdm, 11, 'sb:testsite');

        // check that event27 is being fired and set, should be path
        expectAnalyticsEvent(xdm, 27, 1);
    });
});
