import { describe, it, beforeEach, afterEach } from 'vitest';
import { setupTestWindow, teardownTestWindow, loadTrackingLibrary } from './helpers/test-setup.js';
import { expectDataBeacon } from './helpers/beacon-validator.js';

describe.skip('Media Player Tracking', () => {

    beforeEach(() => {
        setupTestWindow();
    });

    afterEach(() => {
        teardownTestWindow();
    });

    it('should track videoStart and map variables', async () => {
        await loadTrackingLibrary();

        // Push pageLoad to initialize tracker
        window.appData.push({
            event: 'pageLoad',
            page: {
                name: 'test-video-page',
                productName: 'video-product'
            }
        });

        // Expect pageLoad beacon
        expectDataBeacon({
            v11: 'video-product:test-video-page'
        });

        // Push videoStart event
        window.appData.push({
            event: 'videoStart',
            video: {
                id: 'my-video-id',
                length: '100',
                position: '0'
            }
        });

        // Verify alloy call for videoStart
        // The mapping config says: 'a.media.name': 'eVar77,prop10' -> so we expect eVar77 and prop10 to be 'my-video-id'
        // 'a.media.view': 'event105' -> so we expect event105

        expectDataBeacon({
            v77: 'my-video-id',
            p10: 'my-video-id',
            events: ['event105']
        });
    });
});
