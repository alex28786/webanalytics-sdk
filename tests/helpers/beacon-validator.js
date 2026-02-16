import { expect } from 'vitest';
import { expectEVar, expectProp, expectXdmPath } from './xdm-validators.js';

/**
 * Validates the next event sent to Alloy against expected data.
 * @param {Object} expected The expected data configuration
 * @param {Object} expected.vN eVars (e.g. v4: 'val')
 * @param {Object} expected.pN props (e.g. p2: 'val')
 * @param {Array<String>} expected.events Array of event strings (e.g. 'event1', 'event2=10', 'event3:id')
 * @param {Array<Object>} expected.productItems Array of product item expectation objects. 
 *                                            Each object can have 'sku', 'vN', and 'events' array.
 * @param {Array<String>} expected.commerceEvents Array of AA commerce event tokens 
 *                                                (e.g. 'scAdd', 'scRemove', 'scCheckout', 'purchase', 'scView', 'scOpen')
 * @param {String} expected.purchaseID Expected purchaseID in xdm.commerce.order.purchaseID
 * @param {String} expected.currencyCode Expected currencyCode in xdm.commerce.order.currencyCode
 */
export function expectDataBeacon(expected) {
    const mock = window.alloy;

    if (!mock) {
        throw new Error("Alloy mock not found on window.alloy");
    }

    if (mock.nextEventIndex === undefined) {
        mock.nextEventIndex = 0;
    }

    if (mock.nextEventIndex >= mock.processedEvents.length) {
        throw new Error(`Expected beacon #${mock.nextEventIndex + 1} but only ${mock.processedEvents.length} events were sent.`);
    }

    const content = mock.processedEvents[mock.nextEventIndex];
    mock.nextEventIndex++;

    const xdm = content.xdm;
    if (!xdm) {
        throw new Error("No XDM object found in event content");
    }

    // 1. Check eVars (vN) and Props (pN)
    Object.keys(expected).forEach(key => {
        // vN -> eVarN
        if (/^v\d+$/.test(key)) {
            const index = key.substring(1);
            expectEVar(xdm, index, expected[key]);
        }
        // pN -> propN
        else if (/^p\d+$/.test(key)) {
            const index = key.substring(1);
            expectProp(xdm, index, expected[key]);
        }
    });

    // 2. Check Events
    if (expected.events && Array.isArray(expected.events)) {
        expected.events.forEach(evtStr => {
            // Robust parsing logic matching mapper.js mostly
            // eventN (value=1)
            // eventN=10 (value=10)
            // eventN:ID (value=1, id="ID")
            // eventN=10:ID (value=10, id="ID") - less common but supported logic

            let num, val = 1, id;

            // Split by : first to separate ID if present
            // But wait, standard AA syntax for serialization is event1:12345
            // And value assignment is event1=10.
            // Complex case: event1=10:12345 ?? AA documentation says serialization ID is for event deduplication.
            // Usually it's one or the other or combined.
            // Let's parse with regex.

            // Regex to capture: event(\d+) then optional =(\d+) then optional :(.+)
            // But order of = and : can vary in loose strings? Standard is eventN=val or eventN:id.
            // Let's assume standard format provided by user in tests.

            const match = /^event(\d+)(?:=(.+?))?(?::(.+))?$/i.exec(evtStr);
            // This regex expects =val before :id. 
            // If string is "event1:id", group 2 is undefined, match[0] is input.
            // Wait, regex execution:
            // "event1:id" -> match[1]="1", match[2]=undefined, match[3]=undefined ?? No.
            // because (?:=(.+?))? is optional. It matches empty string.
            // Then (?::(.+))? matches :id.
            // So for "event1:id":
            // "event1" matches "event(\d+)"
            // (?:=(.+?))? fails to match "=...", so it's skipped/empty.
            // THEN it sees ":id". 
            // The regex expects the string to be consumed in order.

            if (evtStr.includes(':') && !evtStr.includes('=')) {
                // "event1:id"
                const p = evtStr.split(':');
                const p0 = p[0]; // event1
                num = p0.replace('event', '');
                id = p[1];
            } else if (evtStr.includes('=') && !evtStr.includes(':')) {
                // "event1=10"
                const p = evtStr.split('=');
                num = p[0].replace('event', '');
                val = p[1];
            } else if (!evtStr.includes('=') && !evtStr.includes(':')) {
                // "event1"
                num = evtStr.replace('event', '');
            } else {
                // Both? "event1=10:id"
                // Let's rely on splitting
                const p1 = evtStr.split(':');
                id = p1[1];
                const p2 = p1[0].split('=');
                num = p2[0].replace('event', '');
                val = p2[1];
            }

            // Construct bucketing path
            const n = parseInt(num, 10);
            const start = Math.floor((n - 1) / 100) * 100 + 1;
            const end = start + 99;
            const bucket = `event${start}to${end}`;

            const eventPath = `_experience.analytics.${bucket}.event${n}`;

            // Check value
            try {
                expectXdmPath(xdm, `${eventPath}.value`, Number(val));
            } catch (e) {
                // rethrow with context
                throw new Error(`Failed expecting ${evtStr}: ${e.message}`);
            }

            // Check ID
            if (id) {
                expectXdmPath(xdm, `${eventPath}.id`, String(id));
            }
        });
    }

    // 3. Check Product Items
    if (expected.productItems && Array.isArray(expected.productItems)) {
        const productListItems = xdm.productListItems;
        // Should be at root per mapper fix
        // If not, try legacy path just in case? No, we fixed it.

        if (!productListItems) {
            throw new Error("xdm.productListItems is undefined");
        }

        expected.productItems.forEach((expectItem, index) => {
            let actualItem;
            if (expectItem.sku) {
                actualItem = productListItems.find(p => p.SKU === expectItem.sku);
            } else {
                actualItem = productListItems[index];
            }

            if (!actualItem) {
                throw new Error(`Product item not found. Config: ${JSON.stringify(expectItem)}`);
            }

            // Check SKU
            if (expectItem.sku) {
                expect(actualItem.SKU).toBe(expectItem.sku);
            }

            // Check eVars (vN)
            Object.keys(expectItem).forEach(key => {
                if (/^v\d+$/.test(key)) {
                    const idx = key.substring(1);
                    const val = expectItem[key];

                    // Custom dims in product are under _experience.analytics.customDimensions.eVars.eVarN
                    // Let's verify structure existence first
                    const evars = actualItem._experience?.analytics?.customDimensions?.eVars || {};
                    const actualVal = evars[`eVar${idx}`];

                    if (actualVal !== val) {
                        throw new Error(`Product [${expectItem.sku || index}] eVar${idx} mismatch. Expected '${val}', got '${actualVal}'`);
                    }
                }
            });

            // Check Events in product?
            // "events" key in productItems config?
            // "event5=100", "event6:XXX" ?
            // Implementing basic check if 'events' array present in product item config
            if (expectItem.events && Array.isArray(expectItem.events)) {
                expectItem.events.forEach(evtStr => {
                    // same parsing logic as main events?
                    // Reuse logic?
                    // Simplify for now: Just check existence of eventN in product
                    // Product events are: _experience.analytics.event1to100.eventN = { value: ..., id: ... }
                    // Note: PRODUCT events are different structure?
                    // mapper.js: addStructuredEventIntoProduct(item, ...)
                    // structure: item._experience.analytics.event1to100.eventN...

                    let num, val = 1, id;
                    if (evtStr.includes(':')) {
                        const p = evtStr.split(':');
                        const p0 = p[0].split('='); // handle event1=10:ID
                        num = p0[0].replace('event', '');
                        if (p0[1]) val = p0[1];
                        id = p[1];
                    } else if (evtStr.includes('=')) {
                        const p = evtStr.split('=');
                        num = p[0].replace('event', '');
                        val = p[1];
                    } else {
                        num = evtStr.replace('event', '');
                    }

                    const n = parseInt(num, 10);
                    const start = Math.floor((n - 1) / 100) * 100 + 1;
                    const end = start + 99;
                    const bucket = `event${start}to${end}`;

                    const node = actualItem._experience?.analytics?.[bucket]?.[`event${n}`];

                    if (!node) {
                        throw new Error(`Product [${expectItem.sku || index}] missing event${n}`);
                    }

                    if (node.value !== Number(val)) {
                        throw new Error(`Product [${expectItem.sku || index}] event${n} value mismatch. Expected ${val}, got ${node.value}`);
                    }
                    if (id && node.id !== id) {
                        throw new Error(`Product [${expectItem.sku || index}] event${n} ID mismatch. Expected ${id}, got ${node.id}`);
                    }
                });
            }
        });
    }

    // 4. Check Commerce Events (AA commerce event tokens like scAdd, scRemove, scCheckout, purchase, scView, scOpen)
    //    These are validated against the data.__adobe.analytics.events string, not the XDM structured events,
    //    because commerce events flow through the AA backwards-compatibility path.
    if (expected.commerceEvents && Array.isArray(expected.commerceEvents)) {
        const aaEvents = content.data?.__adobe?.analytics?.events || '';
        expected.commerceEvents.forEach(evt => {
            if (!aaEvents.split(',').some(token => token.trim() === evt)) {
                throw new Error(`Commerce event '${evt}' not found in data.__adobe.analytics.events. Got: '${aaEvents}'`);
            }
        });
    }

    // 5. Check purchaseID (xdm.commerce.order.purchaseID)
    if (expected.purchaseID !== undefined) {
        const actual = xdm.commerce?.order?.purchaseID;
        if (actual !== expected.purchaseID) {
            throw new Error(`purchaseID mismatch. Expected '${expected.purchaseID}', got '${actual}'`);
        }
    }

    // 6. Check currencyCode (xdm.commerce.order.currencyCode)
    if (expected.currencyCode !== undefined) {
        const actual = xdm.commerce?.order?.currencyCode;
        if (actual !== expected.currencyCode) {
            throw new Error(`currencyCode mismatch. Expected '${expected.currencyCode}', got '${actual}'`);
        }
    }
}
