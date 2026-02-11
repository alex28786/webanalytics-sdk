import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Window } from 'happy-dom';

describe('doPlugins Integration', () => {
    let win;

    beforeEach(async () => {
        // Create a fresh DOM environment
        win = new Window();
        global.window = win;
        global.document = win.document;
        global.localStorage = win.localStorage;

        // Mock console
        global.console = { ...console, error: vi.fn(), log: vi.fn(), warn: vi.fn() };

        // Mock Alloy
        win.alloy = vi.fn(() => Promise.resolve({}));

        // Mock Satellite
        win._satellite = {
            getVar: vi.fn((name) => {
                if (name === 'Visitor - User ID') return 'test-user-id';
                if (name === 'Page - Load Timestamp') return Date.now().toString();
                return '';
            }),
            logger: { error: vi.fn() },
            notify: vi.fn()
        };
        global._satellite = win._satellite;

        // Mock pageData
        win.pageData = {
            page: {
                name: 'test-page',
                noTracking: 'false'
            },
            visitor: {}
        };
        global.pageData = win.pageData;

        win.pageData_isLoaded = true;

        // Reset modules
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete global.window;
        delete global.document;
        delete global.localStorage;
        delete global._satellite;
        delete global.pageData;
    });

    it('should attach doPlugins to window.s', async () => {
        await import('../src/index.js');

        expect(window.s).toBeDefined();
        expect(window.s.doPlugins).toBeDefined();
        expect(typeof window.s.doPlugins).toBe('function');
    });

    it('should execute doPlugins without error', async () => {
        await import('../src/index.js');

        // Setup minimal s object state for doPlugins
        window.s.events = "";
        window.s.linkTrackVars = "";
        window.s.pageName = "test-page";

        // Execute doPlugins
        expect(() => window.s.doPlugins(window.s)).not.toThrow();

        // Verify side effects
        // e.g. s.prop9 should be s.version (which is usually locally defined in older AppMeasurement, but generic s-code might not have it.
        // Let's check something we know the code does:
        // s.prop3 = s.getKPIName(s.events);
        // We know plugins are attached, so getKPIName should exist.

        // Verify interaction with satellite
        expect(window._satellite.getVar).toHaveBeenCalled();
    });
});
