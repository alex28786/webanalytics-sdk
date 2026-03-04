import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { expectDataBeacon } from './helpers/beacon-validator.js';
import { setupTestWindow, teardownTestWindow, loadTrackingLibrary } from './helpers/test-setup.js';

describe('LinkOut Event - event44 tracking', () => {

    beforeEach(() => {
        setupTestWindow();
    });

    afterEach(() => {
        teardownTestWindow();
    });

    it.only('should trigger event44 and map eVar37 when linkOut event occurs', async () => {
        await loadTrackingLibrary();

        // Scenario: Initial Page Load is required to set up context (like product)
        window.pageData = {
            page: {
                name: 'testsite',
                productName: 'sb',
            }
        };
        window.appData.push({ event: 'pageLoad' });
        expectDataBeacon({});

        // Scenario: LinkOut Event
        window.appData.push({
            event: 'linkOut',
            content: [{ id: "test-id", linkOut: "destination-url.com" }]
        });

        expectDataBeacon({
            //debug: true,
            v37: 'destination-url.com',
            events: ['event25', 'event44'],
            productItems: [{
                sku: 'sb:test-id'
            }]
        });
    });
});
