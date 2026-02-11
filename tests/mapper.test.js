import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapIntoXdm } from '../src/xdm/mapper';

describe('mapIntoXdm', () => {
    let s;
    let xdm;

    beforeEach(() => {
        s = {
            linkTrackVars: 'products,events,eVar1',
            linkTrackEvents: 'event1',
            pageName: 'Test Page',
            events: 'event1',
            products: 'Category;Product;1;10.00;event1=10|eVar1=value',
            campaign: 'tracking-code',
            linkType: 'o',
            linkName: 'Test Link'
        };
        xdm = {};
    });

    it('should map products to xdm.productListItems (CJA Compliance Fix)', () => {
        const result = mapIntoXdm(s, xdm, { eventName: 'testEvent', hitType: 'link' });

        expect(result.xdm).toBeDefined();
        // Check core fix: items should be in productListItems, not commerce.productListItems
        expect(result.xdm.productListItems).toBeDefined();
        expect(result.xdm.productListItems.length).toBe(1);
        expect(result.xdm.productListItems[0].SKU).toBe('Product');
        expect(result.xdm.commerce).toBeUndefined(); // Should not define commerce unless explicitly needed
    });

    it('should map events correctly', () => {
        const result = mapIntoXdm(s, xdm, { eventName: 'testEvent', hitType: 'link' });
        // event1 bucket 1-100
        expect(result.xdm._experience.analytics.event1to100.event1.value).toBe(1);
    });
});
