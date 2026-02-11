import { describe, it, expect, vi } from 'vitest';
import { createHitS } from '../src/legacy/s-code.js';

describe('Media Module', () => {
    it('should attach Media object to s', () => {
        const s = createHitS({}, "videoStart");
        expect(s.Media).toBeDefined();
        expect(typeof s.Media.open).toBe('function');
    });

    it('Media.open should set contextData and event', () => {
        const s = createHitS({}, "videoStart");
        s.apl = vi.fn((list, v, d, u) => list + (list ? "," : "") + v);

        s.Media.open("My Video", 100, "HTML5");

        expect(s.contextData['a.media.name']).toBe("My Video");
        expect(s.contextData['a.media.length']).toBe(100);
        expect(s.contextData['a.media.playerName']).toBe("HTML5");
        expect(s.events).toContain("videoStart");
    });

    it('Media.close should set complete and event', () => {
        const s = createHitS({}, "videoComplete");
        s.apl = vi.fn((list, v, d, u) => list + (list ? "," : "") + v);

        s.Media.close("My Video");

        expect(s.contextData['a.media.complete']).toBe(true);
        expect(s.events).toContain("videoComplete");
    });
});
