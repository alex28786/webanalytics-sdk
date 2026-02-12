import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupTestWindow, teardownTestWindow, loadTrackingLibrary, setDebugOutput } from './helpers/test-setup.js';

describe('Debug Logging Verification', () => {

    beforeEach(() => {
        setupTestWindow();
    });

    afterEach(() => {
        teardownTestWindow();
        setDebugOutput(false);
        vi.restoreAllMocks();
    });

    it('should not log to console by default', async () => {
        const consoleSpy = vi.spyOn(console, 'log');

        window._satellite.logger.log('test message');

        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should log to console when debug output is enabled', async () => {
        setDebugOutput(true);
        const consoleSpy = vi.spyOn(console, 'log');

        window._satellite.logger.log('test message');

        expect(consoleSpy).toHaveBeenCalled();
        // Check for origin trace (this file)
        expect(consoleSpy.mock.calls[0][0]).toMatch(/\[verify-debug-logging\.test\.js:\d+\]/);
        expect(consoleSpy.mock.calls[0][1]).toBe('test message');
    });

    it('should log errors with origin', async () => {
        setDebugOutput(true);
        const consoleSpy = vi.spyOn(console, 'error');

        window._satellite.logger.error('error message');

        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy.mock.calls[0][0]).toMatch(/\[verify-debug-logging\.test\.js:\d+\]/);
        expect(consoleSpy.mock.calls[0][1]).toBe('error message');
    });
});
