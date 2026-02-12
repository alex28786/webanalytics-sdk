import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { setupTestWindow, teardownTestWindow, loadTrackingLibrary } from './helpers/test-setup.js';
import { expectDataBeacon } from './helpers/beacon-validator.js';

describe('Media Player Tracking', () => {

    beforeEach(() => {
        setupTestWindow();
    });

    afterEach(() => {
        teardownTestWindow();
    });

    it('should track videoStart and map eVar77, prop10, event105', async () => {
        await loadTrackingLibrary();

        // Initialize page tracking
        window.appData.push({
            event: 'pageLoad',
            page: { name: 'test-video-page', productName: 'sb' }
        });

        expectDataBeacon({
            v4: 'sb',
            v11: 'sb:test-video-page'
        });

        // Push videoStart
        window.appData.push({
            event: 'videoStart',
            video: { id: 'my-video', length: '100', position: '0' }
        });

        expectDataBeacon({
            v77: 'my-video',
            p10: 'my-video',
            events: ['event105']
        });
    });

    it('should track videoStop with timePlayed in event108', async () => {
        await loadTrackingLibrary();

        window.appData.push({
            event: 'pageLoad',
            page: { name: 'test-video-page', productName: 'sb' }
        });
        expectDataBeacon({}); // consume pageLoad beacon

        // Start video at position 0
        window.appData.push({
            event: 'videoStart',
            video: { id: 'my-video', length: '100', position: '0' }
        });
        expectDataBeacon({}); // consume videoStart beacon

        // Stop video at position 15 (timePlayed = 15)
        window.appData.push({
            event: 'videoStop',
            video: { id: 'my-video', length: '100', position: '15' }
        });

        expectDataBeacon({
            v77: 'my-video',
            p10: 'my-video',
            events: ['event108=15']
        });
    });

    it('should track videoComplete with event107 and total timePlayed', async () => {
        await loadTrackingLibrary();

        window.appData.push({
            event: 'pageLoad',
            page: { name: 'test-video-page', productName: 'sb' }
        });
        expectDataBeacon({}); // consume pageLoad

        // Start video
        window.appData.push({
            event: 'videoStart',
            video: { id: 'my-video', length: '60', position: '0' }
        });
        expectDataBeacon({}); // consume videoStart

        // Complete video (watched all 60s)
        window.appData.push({
            event: 'videoComplete',
            video: { id: 'my-video', length: '60', position: '60' }
        });

        expectDataBeacon({
            v77: 'my-video',
            p10: 'my-video',
            events: ['event107', 'event108=60']
        });
    });

    it('should fire 25% milestone (event358) when position crosses 25%', async () => {
        await loadTrackingLibrary();

        window.appData.push({
            event: 'pageLoad',
            page: { name: 'test-video-page', productName: 'sb' }
        });
        expectDataBeacon({}); // consume pageLoad

        // Start video (length=100)
        window.appData.push({
            event: 'videoStart',
            video: { id: 'milestone-test', length: '100', position: '0' }
        });
        expectDataBeacon({}); // consume videoStart

        // Stop at position 30 (30% — crosses 25% milestone)
        window.appData.push({
            event: 'videoStop',
            video: { id: 'milestone-test', length: '100', position: '30' }
        });

        // First beacon: the videoStop event itself
        expectDataBeacon({
            v77: 'milestone-test',
            events: ['event108=30']
        });

        // Second beacon: the 25% milestone
        expectDataBeacon({
            v77: 'milestone-test',
            p10: 'milestone-test',
            events: ['event358']
        });
    });

    it('should fire both 25% and 50% milestones when position crosses 50%', async () => {
        await loadTrackingLibrary();

        window.appData.push({
            event: 'pageLoad',
            page: { name: 'test-video-page', productName: 'sb' }
        });
        expectDataBeacon({}); // consume pageLoad

        // Start video (length=100, position=0)
        window.appData.push({
            event: 'videoStart',
            video: { id: 'milestone-test', length: '100', position: '0' }
        });
        expectDataBeacon({}); // consume videoStart

        // Stop at position 55 (55% — crosses both 25% and 50%)
        window.appData.push({
            event: 'videoStop',
            video: { id: 'milestone-test', length: '100', position: '55' }
        });

        // videoStop beacon
        expectDataBeacon({
            v77: 'milestone-test',
            events: ['event108=55']
        });

        // 25% milestone beacon
        expectDataBeacon({
            events: ['event358']
        });

        // 50% milestone beacon
        expectDataBeacon({
            events: ['event106']
        });
    });

    it('should not re-fire milestones already reached', async () => {
        await loadTrackingLibrary();

        window.appData.push({
            event: 'pageLoad',
            page: { name: 'test-video-page', productName: 'sb' }
        });
        expectDataBeacon({}); // consume pageLoad

        // Start video
        window.appData.push({
            event: 'videoStart',
            video: { id: 'no-refire', length: '100', position: '0' }
        });
        expectDataBeacon({}); // consume videoStart

        // Stop at 30% (fires 25% milestone)
        window.appData.push({
            event: 'videoStop',
            video: { id: 'no-refire', length: '100', position: '30' }
        });
        expectDataBeacon({}); // consume videoStop
        expectDataBeacon({}); // consume 25% milestone

        // Play again from position 30
        window.appData.push({
            event: 'videoPlay',
            video: { id: 'no-refire', length: '100', position: '30' }
        });
        // videoPlay beacon — no milestone should fire (25% already reached, 50% not yet)
        expectDataBeacon({
            v77: 'no-refire',
            p10: 'no-refire'
        });

        // Verify no extra milestone beacons were generated
        // (alloy.processedEvents should have exactly 5 events:
        //  pageLoad, videoStart, videoStop, milestone25, videoPlay)
        const totalEvents = window.alloy.processedEvents.length;
        if (totalEvents !== 5) {
            throw new Error(`Expected 5 total beacons, got ${totalEvents}`);
        }
    });

    it('should fire milestones via heartbeat without explicit stop/play events', async () => {
        vi.useFakeTimers();
        try {
            await loadTrackingLibrary();

            window.appData.push({
                event: 'pageLoad',
                page: { name: 'test-video-page', productName: 'sb' }
            });
            expectDataBeacon({}); // consume pageLoad

            // Start a 100-second video at position 0
            window.appData.push({
                event: 'videoStart',
                video: { id: 'heartbeat-test', length: '100', position: '0' }
            });
            expectDataBeacon({}); // consume videoStart

            // Advance time by 26 seconds — heartbeat should detect 25% milestone
            vi.advanceTimersByTime(26000);

            // The heartbeat should have auto-pushed a videoMilestone via appData
            expectDataBeacon({
                v77: 'heartbeat-test',
                p10: 'heartbeat-test',
                events: ['event358']
            });
        } finally {
            vi.useRealTimers();
        }
    });
});
