import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupTestWindow, teardownTestWindow } from './helpers/test-setup.js';

describe('Async Support Fallback', () => {
    let win;

    beforeEach(async () => {
        setupTestWindow();
        win = window;

        // Setup initial appData state (async simulation)
        win.pageData = {
            page: {
                name: 'test-page'
            }
        }
        win.appData = [];
        win.appData.push({ event: 'pageLoad', page: { name: 'test-page' } });
        win.appData.push({ event: 'contentView', data: { foo: 'bar' } });

        // We need to reset the module cache to ensure the IIFE runs again
        vi.resetModules();
    });

    afterEach(() => {
        teardownTestWindow();
    });

    it('should process events pushed to appData before load', async () => {
        // Import index.js to run the IIFE
        await import('../src/index.js');

        // Now pageDataTracker should be on window
        const tracker = window.pageDataTracker;
        const spyLoad = vi.spyOn(tracker, 'trackPageLoad');
        const spyEvent = vi.spyOn(tracker, 'trackEvent');

        expect(window.alloy).toHaveBeenCalledWith("sendEvent", expect.objectContaining({
            xdm: expect.objectContaining({
                _experience: expect.objectContaining({
                    analytics: expect.objectContaining({
                        eventName: "newPage"
                    })
                })
            })
        }));
        expect(window.alloy).toHaveBeenCalledWith("sendEvent", expect.objectContaining({
            xdm: expect.objectContaining({
                _experience: expect.objectContaining({
                    analytics: expect.objectContaining({
                        eventName: "contentView"
                    })
                })
            })
        }));
    });

    it('should process events pushed to appData AFTER load', async () => {
        await import('../src/index.js');

        // Clear previous calls
        window.alloy.mockClear();

        // Push a new event
        window.appData.push({ event: 'postLoadEvent', id: 123 });

        // Should be tracked immediately
        expect(window.alloy).toHaveBeenCalledWith("sendEvent", expect.objectContaining({
            xdm: expect.objectContaining({
                _experience: expect.objectContaining({
                    analytics: expect.objectContaining({
                        eventName: "postLoadEvent"
                    })
                })
            })
        }));
    });
});
