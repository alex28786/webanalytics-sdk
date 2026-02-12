
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Window } from 'happy-dom';
import { createAlloyMock } from './helpers/alloy-mock.js';
import { expectEVar, expectAnalyticsEvent } from './helpers/xdm-validators.js';
import { expectDataBeacon } from './helpers/beacon-validator.js';

describe('Alloy Integration Verification', () => {
    let win;

    beforeEach(async () => {
        // Setup happy-dom environment
        win = new Window();
        global.window = win;
        global.document = win.document;
        global.localStorage = win.localStorage;
        global.sessionStorage = win.sessionStorage;
        window.pageData = global.pageData = {};
        window.eventData = global.eventData = {};

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

        window.pageData = global.pageData = {
            page: {
                name: 'testsite',
                productName: 'sb',
                loadTimestamp: Date.now().toString() // needed to avoid warnings/errors in tracker
            }
        }

        window.appData = window.appData || [];
        window.appData.push({ event: 'pageLoad' });

        expectDataBeacon({
            v4: 'sb',
            v11: 'sb:testsite',
            events: ['event27']
        });
    });

    it('should handle complex event and product structures', async () => {
        // Load the main index entry point
        await import('../src/index.js');

        // Setup complex data
        window.pageData = global.pageData = {
            page: {
                name: 'product-page',
                productName: 'sb'
            },
            content: [{
                id: 'my-id',
                type: 'electronics',
                datapoints: '5'
            }]
        };

        window.appData = window.appData || [];
        window.appData.push({ event: 'pageLoad' });

        // Validate
        expectDataBeacon({
            v4: 'sb',
            v11: 'sb:product-page',
            events: ['event27'],
            productItems: [{
                sku: 'sb:my-id',
                v20: 'electronics',
                events: ['event239=5']
            }]
        });
    });

    it('should handle multiple events', async () => {
        // Load the main index entry point
        await import('../src/index.js');

        // Setup complex data
        window.pageData = global.pageData = {
            page: {
                name: 'product-page',
                productName: 'sb'
            }
        };

        window.appData = window.appData || [];
        window.appData.push({ event: 'pageLoad' });

        await new Promise(resolve => setTimeout(resolve, 10));

        window.appData.push({ event: 'newPage', page: { name: 'testsite' } });

        expectDataBeacon({
            v4: 'sb',
            v11: 'sb:product-page',
            events: ['event27']
        });
        expectDataBeacon({
            v4: 'sb',
            v11: 'sb:testsite',
            events: ['event27']
        });

    });
});
