import { describe, it, beforeEach, afterEach } from 'vitest';
import { expectDataBeacon } from './helpers/beacon-validator.js';
import { setupTestWindow, teardownTestWindow, loadTrackingLibrary } from './helpers/test-setup.js';

describe('Alloy Integration Verification', () => {

    beforeEach(() => {
        setupTestWindow();
    });

    afterEach(() => {
        teardownTestWindow();
    });

    it('should map pageLoad data to correct XDM values via the hook', async () => {
        await loadTrackingLibrary();

        // Scenario 1: Page Load
        window.pageData = {
            page: {
                name: 'testsite',
                productName: 'sb',
                businessUnit: 'els:rp:bau'
            }
        };

        window.appData.push({ event: 'pageLoad' });

        expectDataBeacon({
            v4: 'sb',
            v11: 'sb:testsite',
            events: ['event27']
        });
    });

    it('should handle complex event and product structures', async () => {
        await loadTrackingLibrary();

        // Setup complex data
        window.pageData = {
            page: {
                name: 'product-page',
                productName: 'sb',
                businessUnit: 'els:rp:bau'
            },
            content: [{
                id: 'my-id',
                type: 'electronics',
                datapoints: '5'
            }]
        };

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
        await loadTrackingLibrary();

        // Setup complex data
        window.pageData = {
            page: {
                name: 'product-page',
                productName: 'sb'
            }
        };

        window.appData.push({ event: 'pageLoad' });

        // First beacon validation
        expectDataBeacon({
            v4: 'sb',
            v11: 'sb:product-page',
            events: ['event27']
        });

        // Second event
        window.appData.push({ event: 'newPage', page: { name: 'testsite' } });

        // Second beacon validation
        expectDataBeacon({
            v4: 'sb',
            v11: 'sb:testsite',
            events: ['event27']
        });

    });
});
