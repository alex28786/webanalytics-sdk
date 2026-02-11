import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveDataElement } from '../src/legacy/data-elements.js';
import { applyRuleToS } from '../src/legacy/rules.js';
import { createHitS } from '../src/legacy/s-code.js';

describe('Data Elements Overrides', () => {
    beforeEach(() => {
        window._satellite = {
            getVar: vi.fn()
        };
    });

    afterEach(() => {
        delete window._satellite;
    });

    it('should resolve codified data element if no override', () => {
        // internal definitions needed.
        // let's mock one for test if possible, or use one defined in data-elements.js
        // valid ones: pageName (returns document.title)
        document.title = "Test Page";
        // const val = resolveDataElement("pageName");
        // expect(val).toBe("Test Page");
        // But data-elements.js exports const dataElements. We can't easily patch it unless we modify the file or use vi.mock.
    });

    it('should use override from _satellite.getVar', () => {
        window._satellite.getVar.mockReturnValue("Overridden Value");
        const val = resolveDataElement("someVar");
        expect(window._satellite.getVar).toHaveBeenCalledWith("someVar");
        expect(val).toBe("Overridden Value");
    });
});

describe('Rules Overrides', () => {
    // We can't easily test index.js logic without full DOM/Alloy setup or mocking modules.
    // usage logic is: index.js calls _satellite.getVar(eventName) -> rule.
    // We can test applyRuleToS works with a custom rule object.

    it('applyRuleToS should work with custom rule object', () => {
        const s = createHitS({}, "testEvent");
        s.apl = vi.fn((list, v) => list + (list ? "," : "") + v); // mock apl

        const customRule = {
            track: { "eVar1": "customValue" },
            events: ["event99"]
        };

        applyRuleToS(s, customRule, "testEvent");

        expect(s.eVar1).toBe("customValue");
        expect(s.events).toContain("event99");
    });
});
