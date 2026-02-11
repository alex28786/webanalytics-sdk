import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Window } from 'happy-dom';
// We don't import pageDataTracker from the module yet because we want to setup the environment first
// import { pageDataTracker } from '../src/core/tracker.js'; 

describe('Async Support Fallback', () => {
    let win;

    beforeEach(async () => {
        // Create a fresh DOM environment
        win = new Window();
        global.window = win;
        global.document = win.document;
        global.localStorage = win.localStorage;

        // Fix for "ReferenceError: pageData is not defined"
        global.pageData = {};
        win.pageData = global.pageData;

        // Fix for "ReferenceError: _satellite is not defined"
        global._satellite = {
            getVar: vi.fn(),
            track: vi.fn(),
            logger: { log: vi.fn() }
        };
        win._satellite = global._satellite;

        // Mock console
        global.console = { ...console, error: vi.fn(), log: vi.fn(), warn: vi.fn() };

        // Mock window.alloy
        win.alloy = vi.fn(() => Promise.resolve({}));

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

        // We need to mock the tracker module to spy on it, 
        // BUT the IIFE in index.js uses the global pageDataTracker.
        // So we can just let index.js load, which will import tracker.js, 
        // which will assign window.pageDataTracker.
        // THEN we can spy on window.pageDataTracker methods.
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete global.window;
        delete global.document;
        delete global.localStorage;
        delete global.pageData;
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
