
/**
 * s-code / AppMeasurement Wrapper
 * Defines createHitS used for per-hit tracking
 */

export function createHitS(ctx, eventName) {
    // Inherit all plugin methods from the global host (window.s)
    // We assume window.s is already initialized with plugins attached
    const s = Object.create(window.s || {});

    // 1) Define Page View events
    const PAGE_VIEW_EVENTS = ["newPage", "searchResultsUpdated"];
    const isPageView = PAGE_VIEW_EVENTS.indexOf(eventName) !== -1;

    // 2) Set link properties based on event type
    // If not a page view, it's a link hit ('o' = custom link)
    s.linkType = isPageView ? "" : (ctx?.linkType || "o");

    // Set linkName to eventName for link hits; empty for page views
    s.linkName = isPageView ? "" : (eventName || ctx?.linkName || "manual_link_hit");

    // Per-hit fields (data only; keeps methods on prototype)
    s.usePlugins = true;
    s.abort = false;

    s.linkTrackVars = "";
    s.linkTrackEvents = "";
    s.events = "";
    s.products = "";
    s.contextData = {};

    s.pageName = undefined;
    s.server = undefined;
    s.channel = undefined;
    s.campaign = undefined;
    s.state = undefined;
    s.zip = undefined;

    s.referrer = (typeof document !== 'undefined') ? (document.referrer || "") : "";
    s.pageURL = (typeof location !== 'undefined') ? location.href : "";

    //s.linkType = ctx && ctx.hitType === "link" ? (ctx.linkType || "o") : "";
    //s.linkName = (ctx && ctx.linkName) || "";
    s.linkURL = (ctx && ctx.linkURL) || "";

    if (window.__sShim) {
        s.version = "wsdk-" + window.__sShim.version;
    }

    return s;
}
