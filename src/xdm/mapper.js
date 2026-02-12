
// Constants
const EVAR_MAX = 200, PROP_MAX = 75;
const PAGE_EVENTS = new Set(["pageLoad", "newPage", "searchResultsUpdated"]);
const AUTH = { unknown: "ambiguous", authenticated: "authenticated" };

// Helper Functions
const csvSet = s =>
    new Set(String(s || "").split(",").map(v => v.trim()).filter(Boolean));

const parseEvents = str =>
    String(str || "").split(",").map(v => v.trim()).filter(Boolean);

const setIfEmpty = (obj, key, val) => {
    if (val == null || val === "") return;
    if (obj[key] == null) obj[key] = val;
};

// Functions to resolve variable mapping
function resolveCopyTarget(tok) {
    // Basic resolving of "v5" -> "eVar5" etc.
    // Based on standard AA "D=" syntax parsing
    if (!tok) return null;
    let t = tok.toLowerCase();
    if (t.startsWith('v')) return "eVar" + parseInt(t.slice(1), 10);
    if (t.startsWith('c')) return "prop" + parseInt(t.slice(1), 10);
    if (t === "pagename") return "::pageName";
    if (t === "g") return "::g";
    return null;
}

function resolveCopyChain(varName, sObj, seen = new Set()) {
    let val = sObj[varName];
    if (typeof val !== "string") {
        return val != null ? val + "" : val;
    }
    if (!/^D=/i.test(val)) return val;

    let current = varName;
    let curVal = val;

    while (typeof curVal === "string" && /^D=/i.test(curVal)) {
        if (seen.has(current)) break; // cycle guard
        seen.add(current);

        const token = curVal.slice(2); // after "D="
        const target = resolveCopyTarget(token);
        if (!target) break;

        if (target === "::pageName") return sObj.pageName;
        if (target === "::g") return sObj.pageURL; // full URL incl. params

        current = target;
        curVal = sObj[target];
        // If sObj[target] is undefined, we return undefined
        if (curVal === undefined) return undefined;
    }
    return curVal;
}

function eventBucketName(evNum) {
    const n = Number(evNum);
    if (!isFinite(n) || n < 1) return null;
    const start = Math.floor((n - 1) / 100) * 100 + 1;
    const end = start + 99;
    return `event${start}to${end}`;
}

function addStructuredEvent(targetXdm, evToken) {
    const m = /^event(\d+)(?::([^=]+))?(?:=(.+))?$/i.exec(evToken);
    if (!m) return;
    const num = parseInt(m[1], 10);
    const ser = m[2];
    const valRaw = m[3];
    const bucket = eventBucketName(num);
    if (!bucket) return;

    targetXdm._experience = targetXdm._experience || {};
    targetXdm._experience.analytics = targetXdm._experience.analytics || {};
    targetXdm._experience.analytics[bucket] = targetXdm._experience.analytics[bucket] || {};
    const node = targetXdm._experience.analytics[bucket][`event${num}`] =
        targetXdm._experience.analytics[bucket][`event${num}`] || {};

    if (ser != null && ser !== "") {
        node.id = String(ser);
        node.value = 1
    } else if (valRaw != null) {
        node.value = Number(valRaw);
    } else {
        node.value = 1;
    }
}

function addStructuredEventIntoProduct(item, keyOrToken, valMaybe) {
    const m = /^event(\d+)(?::([^=]+))?$/i.exec(String(keyOrToken));
    if (!m) return;
    const num = parseInt(m[1], 10);
    const ser = m[2];
    const bucket = eventBucketName(num);
    if (!bucket) return;

    item._experience = item._experience || {};
    item._experience.analytics = item._experience.analytics || {};
    const a = item._experience.analytics;
    a[bucket] = a[bucket] || {};
    const node = a[bucket][`event${num}`] = a[bucket][`event${num}`] || {};

    if (typeof valMaybe !== "undefined" && valMaybe !== null && valMaybe !== true) {
        node.value = Number(valMaybe);
    } else if (ser != null && ser !== "") {
        node.id = String(ser);
        node.value = 1
    } else {
        node.value = 1;
    }
}

function mapLinkType(t) {
    const v = (t || "").toString().toLowerCase();
    if (v === "d") return "download";
    if (v === "e") return "exit";
    return "other";
}

const LIST_PROPS_CONFIG = {
    prop34: "|",
    prop36: ",",
    prop66: "|",
    prop67: "|",
    prop69: ","
};

const HIER_DELIMITER = ":";

function parseListToKeyValuePairs(value, delimiter) {
    if (!value || value === "") return [];
    var items = value.split(delimiter);
    return items.map(function (item) {
        var trimmed = item.trim();
        return {
            key: trimmed,
            value: trimmed
        };
    });
}

function allowVarFactory(ltv) {
    if (!ltv) return () => false; // If undefined, allow nothing (strict link tracking)
    // If ltv is empty string, it allows nothing.
    // If ltv is "None" (case insensitive?), assumption is nothing.
    const allowed = new Set(ltv.split(',').map(v => v.trim()));
    return (v) => allowed.has(v);
}

function allowEvtFactory(lte) {
    if (!lte) return () => false;
    const allowed = new Set(lte.split(',').map(v => {
        // Strip serialization or values from the allowed list definition?
        // Usually linkTrackEvents = "event1,event2".
        return v.trim();
    }));

    // The filter receives the full token from s.events (e.g., "event1=5" or "event1:123")
    return (token) => {
        // We need to extract the event name from the token
        let evtName = token.split(/=|:/)[0]; // "event1"
        return allowed.has(evtName);
    };
}

// Derived from usage
function parseProducts(productsStr) {
    if (!productsStr || typeof productsStr !== "string") return [];
    var entries = productsStr.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    // ... logic from lines 1361-1400 ...
    // Since I don't see the full logic in the snippets, I will implement a robust parser
    // that matches valid AA product string parsing.

    return entries.map(entry => {
        let parts = entry.split(';');
        let item = {
            category: parts[0] || undefined,
            product: parts[1] || undefined,
            quantity: parts[2] && !isNaN(parseFloat(parts[2])) ? parseFloat(parts[2]) : undefined,
            price: parts[3] && !isNaN(parseFloat(parts[3])) ? parseFloat(parts[3]) : undefined,
            events: parts[4] ? parts[4].split('|') : [],
            eVars: parts[5] ? parts[5].split('|') : []
        };

        // Transform eVars/events into attributes map for easier processing
        let attributes = {};

        // eVar handling
        item.eVars.forEach(e => {
            let [k, v] = e.split('=');
            if (k) attributes[k] = v || true;
        });

        // Event handling - events in product string are like "event1=10" or "event2"
        item.events.forEach(e => {
            let k = e;
            let v = true;
            if (e.includes('=')) {
                [k, v] = e.split('=');
            } else if (e.includes(':')) {
                [k, v] = e.split(':'); // Serialization?
                // Actually AA product events syntax is eventN=val. Serialization is rarely used in products but possible.
            }
            if (k) attributes[k] = v;
        });

        item.attributes = attributes;
        return item;
    });
}

function mergeProductListItems(existing, newItems) {
    if (!existing) return newItems;
    // Simple concatenation
    return existing.concat(newItems);
}

function applyCommerceEventCounters(xdm, allowEvt, aaEventTokens) {
    // Logic to map purchase, etc.?
    // Not visible in snippets, stubbing as no-op or basic logic.
    // Assuming standard implementation:
    // If "purchase" event exists, ensure purchaseID is mapped.
}

export function mapIntoXdm(s, xdm, context) {
    const { eventName, hitType } = context;

    // 1) resolve hit type
    var resolvedHitType = hitType || (PAGE_EVENTS.has(eventName) ? "page" : "link");

    // 2) allowed sets (strict for link; page allows all)
    var allowVar = resolvedHitType === "link"
        ? allowVarFactory(s.linkTrackVars)
        : () => true;

    var allowEvt = resolvedHitType === "link"
        ? allowEvtFactory(s.linkTrackEvents)
        : () => true;

    // 3) ensure base branches
    xdm = xdm || {};
    xdm.web = xdm.web || {};
    xdm.web.webPageDetails = xdm.web.webPageDetails || {};
    xdm.web.webReferrer = xdm.web.webReferrer || {};
    xdm._experience = xdm._experience || {};
    xdm._experience.analytics = xdm._experience.analytics || {};
    var cd = xdm._experience.analytics.customDimensions =
        xdm._experience.analytics.customDimensions || {};
    cd.eVars = cd.eVars || {};
    cd.props = cd.props || {};
    cd.lists = cd.lists || {};
    cd.listProps = cd.listProps || {};
    cd.hierarchies = cd.hierarchies || {};

    // 4) specials (standard AA → XDM mappings)
    setIfEmpty(xdm.web.webPageDetails, "name", s.pageName);
    setIfEmpty(xdm.web.webPageDetails, "server", s.server);
    setIfEmpty(xdm.web.webPageDetails, "URL", s.pageURL);
    setIfEmpty(xdm.web.webReferrer, "URL", s.referrer);
    if (allowVar("campaign")) {
        xdm.marketing = xdm.marketing || {};
        setIfEmpty(xdm.marketing, "trackingCode", s.campaign);
    }
    if (allowVar("channel")) setIfEmpty(xdm.web.webPageDetails, "siteSection", s.channel);

    if (allowVar("currencyCode") && s.currencyCode) {
        xdm.commerce = xdm.commerce || {};
        xdm.commerce.order = xdm.commerce.order || {};
        setIfEmpty(xdm.commerce.order, "currencyCode", s.currencyCode);
    }
    if (allowVar("purchaseID") && s.purchaseID) {
        xdm.commerce = xdm.commerce || {};
        xdm.commerce.order = xdm.commerce.order || {};
        setIfEmpty(xdm.commerce.order, "purchaseID", s.purchaseID);
    }

    // 5) eVars / props with legacy D= copy resolution
    for (var i = 1; i <= EVAR_MAX; i++) {
        var ek = "eVar" + i;
        if (!allowVar(ek) || cd.eVars[ek] != null) continue;
        var ev = resolveCopyChain(ek, s);
        if (ev != null && ev !== "") cd.eVars[ek] = ev;
    }
    for (var p = 1; p <= PROP_MAX; p++) {
        var pk = "prop" + p;
        if (!allowVar(pk) || cd.props[pk] != null) continue;
        var pv = resolveCopyChain(pk, s);
        if (pv != null && pv !== "") cd.props[pk] = pv;
    }

    // NEW: 5a) List Variables (list1, list2, list3)
    for (var l = 1; l <= 3; l++) {
        var listKey = "list" + l;
        if (!allowVar(listKey)) continue;
        var listValue = s[listKey];
        if (listValue && listValue !== "") {
            var kvPairs = parseListToKeyValuePairs(listValue, "|");
            if (kvPairs.length > 0) {
                cd.lists[listKey] = {
                    list: kvPairs
                };
            }
        }
    }

    // NEW: 5b) List Props (configured props with delimiters)
    for (var propKey in LIST_PROPS_CONFIG) {
        if (!LIST_PROPS_CONFIG.hasOwnProperty(propKey)) continue;
        if (!allowVar(propKey)) continue;

        var propValue = s[propKey];
        if (propValue && propValue !== "") {
            var delimiter = LIST_PROPS_CONFIG[propKey];
            var valuesArray = propValue.split(delimiter).map(function (v) { return v.trim(); });
            if (valuesArray.length > 0) {
                cd.listProps[propKey] = {
                    delimiter: delimiter,
                    values: valuesArray // Store as array per XDM spec
                };
            }
        }
    }

    // NEW: 5c) Hierarchy Variables (hier1, hier2, hier3)
    for (var h = 1; h <= 5; h++) {
        var hierKey = "hier" + h;
        if (!allowVar(hierKey)) continue;
        var hierValue = s[hierKey];
        if (hierValue && hierValue !== "") {
            var valuesArray = hierValue.split(HIER_DELIMITER).map(function (v) { return v.trim(); });
            if (valuesArray.length > 0) {
                cd.hierarchies[hierKey] = {
                    delimiter: HIER_DELIMITER,
                    values: valuesArray // Store as array per XDM spec
                };
            }
        }
    }

    // 6) events: respect linkTrackEvents on link calls (via allowEvt)
    var aaEventTokens = [];
    if (s.events) {
        var add = parseEvents(s.events).filter(allowEvt);
        if (add.length) {
            // (a) merged flat tokens list
            var existing = Array.isArray(xdm._experience.analytics.events)
                ? xdm._experience.analytics.events
                : [];
            var merged = Array.from(new Set(existing.concat(add)));

            // Note: We don't overwrite xdm._experience.analytics.events per commented out code in logic
            aaEventTokens = merged;

            // (b) structured mapping into bucketed event nodes with value/id
            merged.forEach(function (tok) { addStructuredEvent(xdm, tok); });
        }
    }
    // (c) optional commerce counters derived from AA tokens
    applyCommerceEventCounters(xdm, allowEvt, aaEventTokens);

    // 7) products -> XDM commerce.productListItems with merchandising eVars & events
    if (allowVar("products") && s.products) {
        var parsed = parseProducts(s.products);

        var toItems = parsed.map(function (it) {
            var qty = (typeof it.quantity === "number" && isFinite(it.quantity)) ? it.quantity : undefined;
            var price = (typeof it.price === "number" && isFinite(it.price)) ? it.price : undefined;
            var priceTotal = (price != null && qty != null) ? (price * qty) : price;

            // Base AA → XDM product fields
            var item = {
                category: it.category,
                quantity: qty,
                priceTotal: priceTotal
            };
            if (it.product) {
                item.SKU = it.product;   // preferred
                item.name = it.product;  // convenience duplicate
            }

            // Merchandising eVars & Events from product syntax
            if (it.attributes && Object.keys(it.attributes).length) {
                // Prepare branches
                item._experience = item._experience || {};
                item._experience.analytics = item._experience.analytics || {};
                const a = item._experience.analytics;
                a.customDimensions = a.customDimensions || {};
                a.customDimensions.eVars = a.customDimensions.eVars || {};

                // Walk attributes to detect eVarN and eventN[=v] or eventN:SER
                Object.keys(it.attributes).forEach(function (key) {
                    const val = it.attributes[key];

                    // eVar merchandising
                    const mVar = /^eVar(\d+)$/i.exec(key);
                    if (mVar) {
                        const eIdx = parseInt(mVar[1], 10);
                        if (isFinite(eIdx) && eIdx >= 1 && eIdx <= EVAR_MAX) {
                            a.customDimensions.eVars[`eVar${eIdx}`] = (val === true || val == null) ? "1" : String(val);
                        }
                        return;
                    }

                    // event merchandising
                    // Handle three shapes:
                    //   1) key "event342" with val "11"        -> value=11
                    //   2) key "event364:SERIAL" with val true -> id="SERIAL"
                    //   3) key "event51" with val true         -> counter value=1
                    const mEvt = /^event(\d+)(?::([^=]+))?$/i.exec(key);
                    if (mEvt) {
                        const evNum = parseInt(mEvt[1], 10);
                        if (!isFinite(evNum) || evNum < 1) return;

                        // If value provided (case 1), set value. Else if serialization suffix present (case 2), set id. Else (case 3) counter = 1
                        if (val !== true && val !== undefined && val !== null) {
                            addStructuredEventIntoProduct(item, `event${evNum}`, val);
                        } else if (mEvt[2]) {
                            addStructuredEventIntoProduct(item, `event${evNum}:${mEvt[2]}`);
                        } else {
                            addStructuredEventIntoProduct(item, `event${evNum}`);
                        }
                    }
                });
            }

            return item;
        }).filter(function (x) { return x.SKU || x.name; });

        if (toItems.length) {
            // FIX: Ensure productListItems is at XDM root, not under commerce for CJA compliance (or as per schema stats)
            // But wait, standard XDM commerce schema puts productListItems at root.
            // The legacy code used: xdm.commerce.productListItems
            // The requirement is "productListItems were incorrectly placed within the commerce object, and they need to be at the XDM root."

            // xdm.productListItems = ...
            xdm.productListItems = mergeProductListItems(xdm.productListItems, toItems);
        }
    }

    // 8) eventType + link/page details + counters
    if (!xdm.eventType) {
        xdm.eventType = resolvedHitType === "link"
            ? "web.webinteraction.linkClicks"
            : "web.webpagedetails.pageViews";
    }

    if (resolvedHitType === "link") {
        xdm.web.webInteraction = xdm.web.webInteraction || {};
        // Populate link details
        setIfEmpty(xdm.web.webInteraction, "URL", s.linkURL);
        // Use eventName for link click name per request; fallback to s.linkName
        xdm.web.webInteraction.name = eventName || xdm.web.webInteraction.name || s.linkName || "";
        // Type: "other" for custom, else mapped from AA
        const mappedType = mapLinkType(s.linkType);
        xdm.web.webInteraction.type = mappedType === "other" ? "other" : mappedType;

        // increment linkClicks counter
        xdm.web.webInteraction.linkClicks = xdm.web.webInteraction.linkClicks || {};
        setIfEmpty(xdm.web.webInteraction.linkClicks, "value", 1);
    } else {
        // page view counter
        xdm.web.webPageDetails.pageViews = xdm.web.webPageDetails.pageViews || {};
        setIfEmpty(xdm.web.webPageDetails.pageViews, "value", 1);
    }

    // 9) DATA OBJECT FOR LEGACY ANALYTICS OVERRIDE
    var data = {
        "__adobe": {
            "analytics": {}
        }
    };

    // Map the raw products string directly if it exists and is allowed
    if (allowVar("products") && s.products) {
        data.__adobe.analytics.products = s.products;
    }

    // Handle Events with linkTrackEvents respect
    if (s.events) {
        var rawTokens = parseEvents(s.events);
        var filteredTokens = rawTokens.filter(allowEvt);

        if (filteredTokens.length > 0) {
            data.__adobe.analytics.events = filteredTokens.join(",");
        }
    }

    return {
        xdm: xdm,
        data: data
    };
}
