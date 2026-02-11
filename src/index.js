// Import everything needed to assemble the final shim
import { createHitS } from './legacy/s-code.js';
import { pageDataTracker } from './core/tracker.js';
import { mapIntoXdm } from './xdm/mapper.js';
import { applyRuleToS, rules } from './legacy/rules.js';
import { attachPlugins } from './legacy/plugins.js';
import { initDoPlugins } from './legacy/doPlugins.js';

// Create Satellite Shim Namespace
if (!window.__sShim) {
    window.__sShim = { version: "2.1" };
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
            .catch(console.error);
    }
})();

// Ensure global s exists and attach plugins
window.s = window.s || {};
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
    var mapped = mapIntoXdm(s, content.xdm, { eventName: eventName, hitType: s.linkType ? "link" : "page" });
    // Re-assign the enriched XDM (which now includes your identityMap + mapper output)
    content.xdm = mapped.xdm;

    // Assign the Data object for direct AA mapping
    content.data = mapped.data;
};

// Expose s_mapIntoXdm for debugging or legacy calls
window.s_mapIntoXdm = mapIntoXdm;

console.log("[Adobe Analytics Shim] Initialized.");

// async support fallback
(function (w) {
    var eventBuffer = [];
    if (w.appData) {
        if (Array.isArray(w.appData)) {
            eventBuffer = w.appData;
        } else {
            console.error('Elsevier DataLayer "window.appData" must be specified as array');
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
