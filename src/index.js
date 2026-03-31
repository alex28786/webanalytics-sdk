// Import everything needed to assemble the final shim
import { createHitS } from './legacy/s-code.js';
import { pageDataTracker } from './core/tracker.js';
import { mapIntoXdm } from './xdm/mapper.js';
import { applyRuleToS, rules } from './legacy/rules.js';
import { attachPlugins } from './legacy/plugins.js';
import { initDoPlugins } from './legacy/doPlugins.js';
import { ORG_ID } from './core/utils.js';

// Create Satellite Shim Namespace
if (!window.__sShim) {
    window.__sShim = { version: "2.6" };
}

// Initialization IIFE (ECID)
(function ensureEcidStored() {
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem("aa_ecid")) {
        return;
    }
    if (window.alloy) {
        window.alloy("getIdentity", { namespaces: ["ECID"] })
            .then(result => {
                if (result.identity?.ECID) {
                    localStorage.setItem("aa_ecid", result.identity.ECID);
                }
            })
    }
})();

// Ensure global s exists and attach plugins
window.s = window.s || {};

// --- START: Visitor API Backfill ---
window.s.visitor = window.s.visitor || {};

/**
 * Backfill for s.visitor.appendVisitorIDsTo
 * Returns a URL compatible with legacy VisitorAPI.js parsers.
 */
window.s.visitor.appendVisitorIDsTo = function (url) {
    // 1. CONFIGURATION
    // Enter the plain ID. The code handles the necessary double-encoding.

    // Safety checks
    if (!url) return "";
    if (typeof localStorage === 'undefined') return url;

    // 2. Get ECID from storage (synchronous)
    var ecid = localStorage.getItem("aa_ecid");

    // Fail-safe: Return original URL if ID is not yet cached (first view race condition)
    if (!ecid) return url;

    try {
        // 3. Prepare Values
        // Legacy format puts timestamp at the end
        var ts = Math.floor(new Date().getTime() / 1000);

        // CRITICAL: The Org ID is URL-encoded INSIDE the pipe-delimited string.
        // (e.g., "@" becomes "%40")
        var encodedOrgId = encodeURIComponent(ORG_ID);

        // 4. Construct the Internal String
        // Order: MCMID -> MCORGID -> TS
        var rawValue = "MCMID=" + ecid +
            "|MCORGID=" + encodedOrgId +
            "|TS=" + ts;

        // 5. Final Encode
        // The entire pipe-delimited string is encoded again for the URL parameter.
        // This turns the pipe "|" into "%7C" and the "%40" into "%2540".
        var adobeMcParam = encodeURIComponent(rawValue);

        // 6. Append to URL
        var separator = url.indexOf("?") > -1 ? "&" : "?";
        return url + separator + "adobe_mc=" + adobeMcParam;

    } catch (e) {
        return url;
    }
};
// --- END: Visitor API Backfill ---

attachPlugins(window.s);
initDoPlugins(window.s);

// Expose pageDataTracker globally
window.pageDataTracker = pageDataTracker;
// Initialize it (warnings check etc.)
if (pageDataTracker.init) {
    pageDataTracker.init();
}

// Define the Hook
window.s_onBeforeEventSendHook = function (content, ctx) {
    // 1) derive eventName
    const eventName =
        content?.xdm?._experience?.analytics?.eventName ||
        content?.eventName ||
        "";

    // 2) create s object for this hit
    // This replicates the `createHitS` logic
    const s = createHitS(ctx, eventName);

    // Extract link tracking properties from XDM if they exist (for auto-tracked events)
    // NOTE: createHitS defaults linkType to "o" and linkName to eventName/"manual_link_hit"
    // for ALL non-page events.  We MUST override these defaults when the Web SDK has
    // auto-tracked the real link type (exit/download) so that doPlugins can act on the
    // correct values (e.g. eVar158 exit hostname extraction requires linkType === 'e').
    if (content && content.xdm && content.xdm.web && content.xdm.web.webInteraction) {
        const wi = content.xdm.web.webInteraction;
        if (wi.type === 'exit')    { s.linkType = 'e'; }
        else if (wi.type === 'download') { s.linkType = 'd'; }
        if (wi.URL)  s.linkURL  = wi.URL;
        if (wi.name) s.linkName = wi.name;
        // Set linkObject so doPlugins exit‑link guard (s.linkObject && …) passes
        s.linkObject = content.clickedElement || true;
    }

    // 3) apply rules
    // (a) generic rule for ALL hits?
    // (b) specific rule for eventName
    let ruleToApply = rules[eventName];

    // Check for override
    try {
        if (window._satellite && typeof window._satellite.getVar === 'function') {
            const overrideRule = window._satellite.getVar(eventName);
            if (overrideRule && (typeof overrideRule === 'object' || typeof overrideRule === 'function')) {
                // It's an override rule (object with track/events/run or a function?)
                // Our applyRuleToS expects an object. If it's just functionality, we might need to adapt.
                // Assuming it matches the structure of internal rules.
                ruleToApply = overrideRule;
            }
        }
    } catch (e) { }

    if (ruleToApply) {
        applyRuleToS(s, ruleToApply, eventName);
    } else {
        // Log lack of rule?
        // console.log("No rule for event: " + eventName);
    }

    // 4) Map global AA vars (like s.pageName from DTM rules)
    // Legacy code: s.mapAdobeVars(s) called on global s? Or per hit?
    // Logic was `pageDataTracker.mapAdobeVars(s)`.
    if (pageDataTracker.mapAdobeVars) {
        pageDataTracker.mapAdobeVars(s);
    }

    // 5) doPlugins (legacy support)
    if (typeof s.doPlugins === "function") {
        s.doPlugins(s);
    } else if (typeof window.s_doPlugins === "function") {
        window.s_doPlugins(s);
    }

    // 6) Integrated Merge
    // Call mapper and capture both XDM and Data branches
    var mapped = mapIntoXdm(s, content.xdm, {
        eventName: eventName,
        hitType: s.linkType ? "link" : "page",
        originalData: content.data // Pass original data including activitymap
    });
    // Re-assign the enriched XDM (which now includes your identityMap + mapper output)
    content.xdm = mapped.xdm;

    // Assign the Data object for direct AA mapping (preserves contextData)
    content.data = mapped.data;
};

// Expose s_mapIntoXdm for debugging or legacy calls
window.s_mapIntoXdm = mapIntoXdm;

// Define Filter Click Hook (Activity Map implementation)
window.s_filterClickDetailsHook = function (content) {
    if (!content || !content.clickedElement) return;

    var el = content.clickedElement;

    // Region logic (no stopout)
    var regionId = null;
    var regionEl = el;
    while (regionEl) {
        if (regionEl.getAttribute) {
            regionId = regionEl.getAttribute('data-aa-region');
            if (regionId) {
                content.linkRegion = regionId.toLowerCase();
                break;
            }
        }
        regionEl = regionEl.parentNode;
    }

    // Default region logic - apply MD5 hashing if it contains '@'
    if (!regionId && content.linkRegion && content.linkRegion.indexOf('@') !== -1) {
        if (window.pageDataTracker && window.pageDataTracker.md5) {
            content.linkRegion = 'DTM filtered (@):' + window.pageDataTracker.md5(content.linkRegion).substring(0, 16);
        }
    }

    // Link logic (stopout on A or BUTTON)
    var linkId = null;
    var linkEl = el;
    while (linkEl) {
        if (linkEl.getAttribute) {
            linkId = linkEl.getAttribute('data-aa-name');
            if (linkId) {
                content.linkName = linkId.toLowerCase();
                break;
            }
        }
        if (linkEl.tagName === 'A' || linkEl.tagName === 'BUTTON') {
            break;
        }
        linkEl = linkEl.parentNode;
    }

    // Default link logic - apply MD5 hashing if it contains '@'
    if (!linkId && content.linkName && content.linkName.indexOf('@') !== -1) {
        if (window.pageDataTracker && window.pageDataTracker.md5) {
            content.linkName = 'DTM filtered (@):' + window.pageDataTracker.md5(content.linkName).substring(0, 16);
        }
    }

    return true;
};

_satellite.logger.info("[Adobe Analytics Shim] Initialized.");

// async support fallback
(function (w) {
    var eventBuffer = [];
    if (w.appData) {
        if (Array.isArray(w.appData)) {
            eventBuffer = w.appData;
        } else {
            _satellite.logger.error('Elsevier DataLayer "window.appData" must be specified as array');
            return;
        }
    }

    w.appData = [];

    var oldPush = w.appData.push;

    var appDataPush = function () {
        oldPush.apply(w.appData, arguments);
        for (var i = 0; i < arguments.length; i++) {
            var data = arguments[i];
            if (data.event) {
                if (data.event == 'pageLoad') {
                    if (w.pageDataTracker && typeof w.pageDataTracker.trackPageLoad === 'function') {
                        w.pageDataTracker.trackPageLoad(data);
                    }
                } else {
                    if (w.pageDataTracker && typeof w.pageDataTracker.trackEvent === 'function') {
                        w.pageDataTracker.trackEvent(data.event, data);
                    }
                }
            }
        }
    };

    w.appData.push = appDataPush;
    for (var i = 0; i < eventBuffer.length; i++) {
        var data = eventBuffer[i];
        w.appData.push(data);
    }
})(window);
