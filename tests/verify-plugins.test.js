import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Window } from 'happy-dom';

describe('Plugins Attachment', () => {
    let win;

    beforeEach(async () => {
        // Create a fresh DOM environment
        win = new Window();
        global.window = win;
        global.document = win.document;
        global.localStorage = win.localStorage;

        // Mock console
        global.console = { ...console, error: vi.fn(), log: vi.fn(), warn: vi.fn() };

        // Mock window.alloy
        win.alloy = vi.fn(() => Promise.resolve({}));

        // We need to reset modules to run index.js again
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete global.window;
        delete global.document;
        delete global.localStorage;
    });

    it('should attach legacy plugins to window.s', async () => {
        // Import index.js to runs the IIFE and initialization logic
        await import('../src/index.js');

        // Verify window.s exists
        expect(window.s).toBeDefined();

        // Verify plugins are attached
        expect(window.s.apl).toBeDefined();
        expect(typeof window.s.apl).toBe('function');

        expect(window.s.split).toBeDefined();
        expect(typeof window.s.split).toBe('function');

        expect(window.s.getValOnce).toBeDefined();
        expect(typeof window.s.getValOnce).toBe('function');

        expect(window.s.Util).toBeDefined();
        expect(window.s.Util.getQueryParam).toBeDefined();
    });

    it('should allow createHitS to inherit plugins', async () => {
        // Import index.js to initialize window.s
        await import('../src/index.js');

        // Import createHitS to test inheritance
        const { createHitS } = await import('../src/legacy/s-code.js');

        const s = createHitS({}, 'testEvent');

        // s instance should inherit plugins from window.s (via prototype or copy)
        // logic in s-code.js is: const s = Object.create(window.s || {});
        // so it should have them in prototype chain

        expect(s.apl).toBeDefined();
        expect(s.split).toBeDefined();

        // Test basic plugin execution
        const list = "a,b";
        const result = s.apl(list, "c", ",", 1);
        expect(result).toBe("a,b,c");
    });
});
