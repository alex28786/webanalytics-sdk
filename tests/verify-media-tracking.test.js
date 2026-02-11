import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Window } from 'happy-dom';

describe.skip('Media Player Tracking', () => {
    let win;

    beforeEach(async () => {
        win = new Window();
        global.window = win;
        global.document = win.document;
        global.localStorage = win.localStorage;

        global.console = { ...console, error: vi.fn(), warn: vi.fn() };

        win.alloy = vi.fn(() => Promise.resolve({}));

        // Mock Satellite
        win._satellite = {
            getVar: vi.fn((name) => ''),
            logger: { error: vi.fn(), log: vi.fn() },
            notify: vi.fn()
        };
        global._satellite = win._satellite;

        // Reset modules
        vi.resetModules();

        // Load index to initialize s and plugins
        await import('../src/index.js');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete global.window;
        delete global.document;
        delete global.localStorage;
        delete global._satellite;
    });

    it('should track videoStart and map variables', async () => {
        // Mock alloy response
        win.alloy.mockResolvedValue({});

        // Push pageLoad to initialize tracker
        window.appData.push({
            event: 'pageLoad',
            page: {
                name: 'test-video-page',
                productName: 'video-product'
            }
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

        // Wait for potential async processing (though shim is synchronous usually)
        await new Promise(resolve => setTimeout(resolve, 10));

        // Verify alloy call
        // We expect alloy("sendEvent", { xdm: ... })
        // The mapping config says: 'a.media.name': 'eVar77,prop10'
        // So we expect eVar77 and prop10 to be 'my-video-id'

        const sendEventCalls = win.alloy.mock.calls.filter(call => call[0] === 'sendEvent');
        // Filter for videoStart event (which might be mapped to an analytics event too?)
        // The tracking call should definitely happen.

        console.log('Alloy Calls:', JSON.stringify(win.alloy.mock.calls, null, 2));

        const videoStartCall = sendEventCalls.find(call => {
            const xdm = call[1].xdm;
            // Check if it's the right event. 
            // In tracker.js, videoStart sets s.Media.open/play.
            // s.Media.open sets contextData.
            // s.Media.play sets contextData['a.media.view'] = true which maps to event105.
            // So we look for a hit that has these.
            return true; // For now just take the last one or investigate all
        });

        expect(videoStartCall).toBeDefined();
        const xdm = videoStartCall[1].xdm;
        const analytics = xdm._experience.analytics;

        // Assert Mappings
        // 'a.media.name': 'eVar77,prop10'
        expect(analytics.customDimensions.eVars.eVar77).toBe('my-video-id');
        expect(analytics.customDimensions.props.prop10).toBe('my-video-id');

        // 'a.media.view': 'event105'
        // 'videoStart' usually implies a view start.
        // check events
        // keys in analytics.event1to100.event105 should be present
        // OR legacy events string in data object?
        // mapper.js maps events to xdm._experience.analytics.event1to100...

        // mapper.js helper: eventBucketName(105) -> event101to200
        // checks boolean value or id

        const event105 = analytics.event101to200 && analytics.event101to200.event105;
        expect(event105).toBeDefined();
    });
});
