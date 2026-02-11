import { md5, stripProductDelimiters, setCookie, getCookie, deleteCookie, getFormattedDate, parseListToKeyValuePairs } from './utils.js';
import { validateData, initWarnings, dtmCodeDesc } from './validation.js';

export const pageDataTracker = {
    eventCookieName: 'eventTrack',
    debugCookie: 'els-aa-debugmode',
    debugCounter: 1,
    warnings: [],
    measures: {},
    timeoffset: 0,
    // Expose helpers for internal usage via this provided legacy code calls them directly
    md5: md5,
    stripProductDelimiters: stripProductDelimiters,
    setCookie: setCookie,
    getCookie: getCookie,
    deleteCookie: deleteCookie,
    getFormattedDate: getFormattedDate,
    parseListToKeyValuePairs: parseListToKeyValuePairs,
    dtmCodeDesc: dtmCodeDesc,

    trackPageLoad: function (data) {
        if (window.pageData && ((pageData.page && pageData.page.noTracking == 'true') || window.pageData_isLoaded)) {
            return false;
        }

        this.updatePageData(data);

        this.initWarnings();
        if (!(window.pageData && pageData.page && pageData.page.name)) {
            console.error('pageDataTracker.trackPageLoad() called without pageData.page.name being defined!');
            return;
        }

        this.processIdPlusData(window.pageData);

        if (window.pageData && pageData.page && !pageData.page.loadTime) {
            pageData.page.loadTime = performance ? Math.round((performance.now())).toString() : '';
        }

        if (window.pageData && pageData.page) {
            var localTime = new Date().getTime();
            if (pageData.page.loadTimestamp) {
                // calculate timeoffset
                var serverTime = parseInt(pageData.page.loadTimestamp);
                if (!isNaN(serverTime)) {
                    this.timeoffset = pageData.page.loadTimestamp - localTime;
                }
            } else {
                pageData.page.loadTimestamp = localTime;
            }
        }

        this.validateData(window.pageData);

        try {
            var cookieTest = 'aa-cookie-test';
            this.setCookie(cookieTest, cookieTest);
            if (this.getCookie(cookieTest) != cookieTest) {
                this.warnings.push('dtm5');
            }
            this.deleteCookie(cookieTest);
        } catch (e) {
            this.warnings.push('dtm5');
        }

        this.registerCallbacks();
        this.setAnalyticsData();

        // handle any cookied event data
        this.getEvents();

        window.pageData_isLoaded = true;

        this.debugMessage('Init - trackPageLoad()', window.pageData);

        if (window._satellite && _satellite.logger) {
            _satellite.logger.log("[pageDataTracker] trackPageLoad - calling alloy");
        }
        this.triggerAlloy("newPage");
    },

    // Extracted methods
    validateData: function (data) {
        validateData(data, this.warnings);
    },
    initWarnings: function () {
        initWarnings(this.warnings);
    },

    trackEvent: function (event, data, callback) {
        if (window.pageData && pageData.page && pageData.page.noTracking == 'true') {
            return false;
        }

        if (!window.pageData_isLoaded) {
            if (this.isDebugEnabled()) {
                console.log('[AA] pageDataTracker.trackEvent() called without calling trackPageLoad() first.');
            }
            return false;
        }

        if (event) {
            this.initWarnings();
            if (event === 'newPage') {
                // auto fillings
                if (data && data.page && !data.page.loadTimestamp) {
                    data.page.loadTimestamp = '' + (new Date().getTime() + this.timeoffset);
                }
                this.processIdPlusData(data);
            }

            window.eventData = data ? data : {};
            window.eventData.eventName = event;
            if (!(_satellite && _satellite.getVar && _satellite.getVar('blacklisted'))) {
                this.handleEventData(event, data);

                if (event === 'newPage') {
                    this.validateData(window.pageData);
                }
                this.debugMessage('Event: ' + event, data);
                if (window._satellite && _satellite.logger) {
                    _satellite.logger.log("[pageDataTracker] trackEvent - calling alloy");
                }
                this.triggerAlloy(event);
            } else {
                this.debugMessage('!! Blocked Event: ' + event, data);
            }
        }

        if (typeof (callback) == 'function') {
            callback.call();
        }
    },

    triggerAlloy: function (eventName) {
        const xdm = {};

        // carry eventName so the hook can decide page vs link
        xdm._experience = xdm._experience || {};
        xdm._experience.analytics = xdm._experience.analytics || {};
        xdm._experience.analytics.eventName = eventName;

        // let the Web SDK callback run doPlugins + s->XDM merge
        // We use window.alloy directly
        window.alloy && window.alloy("sendEvent", { xdm });

        if (eventName == "newPage" && window._satellite && _satellite.track) {
            _satellite.track("newPage"); // support triggers like pendo
        }
    },

    processIdPlusData: function (data) {
        if (data && data.visitor && data.visitor.idPlusData) {
            var idPlusFields = ['userId', 'accessType', 'accountId', 'accountName'];
            for (var i = 0; i < idPlusFields.length; i++) {
                if (typeof data.visitor.idPlusData[idPlusFields[i]] !== 'undefined') {
                    data.visitor[idPlusFields[i]] = data.visitor.idPlusData[idPlusFields[i]];
                }
            }
            data.visitor.idPlusData = undefined;
        }
    },

    getMessages: function () {
        return ['v1'].concat(this.warnings).join('|');
    },
    addMessage: function (message) {
        this.warnings.push(message);
    },

    getPerformance: function () {
        var copy = {};
        for (var attr in this.measures) {
            if (this.measures.hasOwnProperty(attr)) {
                copy[attr] = this.measures[attr];
            }
        }

        this.measures = {};
        return copy;
    },

    debugMessage: function (event, data) {
        if (this.isDebugEnabled()) {
            console.log('[AA] --------- [' + (this.debugCounter++) + '] Web Analytics Data ---------');
            console.log('[AA] ' + event);
            console.groupCollapsed("[AA] AA Data: ");
            if (window.eventData) {
                console.log("[AA] eventData:\n" + JSON.stringify(window.eventData, null, 2));
            }
            if (window.pageData) {
                console.log("[AA] pageData:\n" + JSON.stringify(window.pageData, null, 2));
            }
            console.groupEnd();
            if (this.warnings.length > 0) {
                console.groupCollapsed("[AA] Warnings (" + this.warnings.length + "): ");
                for (var i = 0; i < this.warnings.length; i++) {
                    var error = this.dtmCodeDesc[this.warnings[i]] ? this.dtmCodeDesc[this.warnings[i]] : 'Error Code: ' + this.warnings[i];
                    console.log('[AA] ' + error);
                }
                console.log('[AA] More can be found here: https://confluence.cbsels.com/display/AA/AA+Error+Catalog');
                console.groupEnd();
            }
            console.log("This mode can be disabled by calling 'pageDataTracker.disableDebug()'");
        }
    },

    getTrackingCode: function () {
        var campaign;
        if (window._satellite && _satellite.getVar) {
            campaign = _satellite.getVar('Campaign - ID');
        }
        if (!campaign) {
            campaign = window.sessionStorage ? sessionStorage.getItem('dgcid') : '';
        }
        return campaign;
    },

    isDebugEnabled: function () {
        if (typeof this.debug === 'undefined') {
            this.debug = (document.cookie.indexOf(this.debugCookie) !== -1) || (window.pageData && pageData.page && pageData.page.environment && pageData.page.environment.toLowerCase() === 'dev');
        }
        return this.debug;
    },

    enableDebug: function (expire) {
        if (typeof expire === 'undefined') {
            expire = 86400;
        }
        console.log('You just enabled debug mode for Adobe Analytics tracking. This mode will persist for 24h.');
        console.log("This mode can be disabled by calling 'pageDataTracker.disableDebug()'");
        this.setCookie(this.debugCookie, 'true', expire, document.location.hostname);
        this.debug = true;
    },

    disableDebug: function () {
        console.log('Debug mode is now disabled.');
        this.deleteCookie(this.debugCookie);
        this.debug = false;
    },

    setAnalyticsData: function () {
        if (!(window.pageData && pageData.page && pageData.page.productName && pageData.page.name)) {
            return;
        }
        pageData.page.analyticsPagename = pageData.page.productName + ':' + pageData.page.name;

        var pageEls = pageData.page.name.indexOf(':') > -1 ? pageData.page.name.split(':') : [pageData.page.name];
        pageData.page.sectionName = pageData.page.productName + ':' + pageEls[0];
    },

    getEvents: function () {
        window.pageData = window.pageData || {};
        pageData.savedEvents = {};
        pageData.eventList = [];

        var val = this.getCookie(this.eventCookieName);
        if (val) {
            pageData.savedEvents = val;
        }

        this.deleteCookie(this.eventCookieName);
    },

    updatePageData: function (data) {
        window.pageData = window.pageData || {};
        if (data && typeof (data) === 'object') {
            for (var x in data) {
                if (data.hasOwnProperty(x) && data[x] instanceof Array) {
                    pageData[x] = data[x];
                } else if (data.hasOwnProperty(x) && typeof (data[x]) === 'object') {
                    if (!pageData[x]) {
                        pageData[x] = {};
                    }
                    for (var y in data[x]) {
                        if (data[x].hasOwnProperty(y)) {
                            pageData[x][y] = data[x][y];
                        }
                    }
                }
            }
        }
    },

    handleEventData: function (event, data) {
        var val;
        var s = window.s || {}; // Safe reference
        switch (event) {
            case 'newPage':
                this.updatePageData(data);
                this.setAnalyticsData();
                break;
            case 'saveSearch':
            case 'searchResultsUpdated':
                if (data) {
                    // overwrite page-load object
                    if (data.search && typeof (data.search) == 'object') {
                        window.eventData.search.resultsPosition = '';
                        pageData.search = pageData.search || {};
                        var fields = ['advancedCriteria', 'criteria', 'currentPage', 'dataFormCriteria', 'facets', 'resultsByType', 'resultsPerPage', 'sortType', 'totalResults', 'type', 'database',
                            'suggestedClickPosition', 'suggestedLetterCount', 'suggestedResultCount', 'autoSuggestCategory', 'autoSuggestDetails', 'typedTerm', 'selectedTerm', 'channel',
                            'facetOperation', 'details'];
                        for (var i = 0; i < fields.length; i++) {
                            if (data.search[fields[i]]) {
                                pageData.search[fields[i]] = data.search[fields[i]];
                            }
                        }
                    }
                }
                this.setAnalyticsData();
                break;
            case 'navigationClick':
                if (data && data.link) {
                    window.eventData.navigationLink = {
                        name: ((data.link.location || 'no location') + ':' + (data.link.name || 'no name'))
                    };
                }
                break;
            case 'autoSuggestClick':
                if (data && data.search) {
                    val = {
                        autoSuggestSearchData: (
                            'letterct:' + (data.search.suggestedLetterCount || 'none') +
                            '|resultct:' + (data.search.suggestedResultCount || 'none') +
                            '|clickpos:' + (data.search.suggestedClickPosition || 'none')
                        ).toLowerCase(),
                        autoSuggestSearchTerm: (data.search.typedTerm || ''),
                        autoSuggestTypedTerm: (data.search.typedTerm || ''),
                        autoSuggestSelectedTerm: (data.search.selectedTerm || ''),
                        autoSuggestCategory: (data.search.autoSuggestCategory || ''),
                        autoSuggestDetails: (data.search.autoSuggestDetails || '')
                    };
                }
                break;
            case 'linkOut':
                if (data && data.content && data.content.length > 0) {
                    window.eventData.linkOut = data.content[0].linkOut;
                    window.eventData.referringProduct = (window._satellite ? _satellite.getVar('Page - Product Name') : '') + ':' + data.content[0].id;
                }
                break;
            case 'socialShare':
                if (data && data.social) {
                    window.eventData.sharePlatform = data.social.sharePlatform || '';
                }
                break;
            case 'contentInteraction':
                if (data && data.action) {
                    window.eventData.action.name = pageData.page.productName + ':' + data.action.name;
                }
                break;
            case 'searchWithinContent':
                if (data && data.search) {
                    window.pageData.search = window.pageData.search || {};
                    pageData.search.withinContentCriteria = data.search.withinContentCriteria;
                }
                break;
            case 'contentShare':
                if (data && data.content) {
                    window.eventData.sharePlatform = data.content[0].sharePlatform;
                }
                break;
            case 'contentLinkClick':
                if (data && data.link) {
                    window.eventData.action = { name: pageData.page.productName + ':' + (data.link.type || 'no link type') + ':' + (data.link.name || 'no link name') };
                }
                break;
            case 'contentWindowLoad':
            case 'contentTabClick':
                if (data && data.content) {
                    window.eventData.tabName = data.content[0].tabName || '';
                    window.eventData.windowName = data.content[0].windowName || '';
                }
                break;
            case 'userProfileUpdate':
                if (data && data.user) {
                    if (Object.prototype.toString.call(data.user) === "[object Array]") {
                        window.eventData.user = data.user[0];
                    }
                }
                break;
            case 'videoStart':
                if (data.video && s.Media) {
                    data.video.length = parseFloat(data.video.length || '0');
                    data.video.position = parseFloat(data.video.position || '0');
                    s.Media.open(data.video.id, data.video.length, s.Media.playerName);
                    s.Media.play(data.video.id, data.video.position);
                }
                break;
            case 'videoPlay':
                if (data.video && s.Media) {
                    data.video.position = parseFloat(data.video.position || '0');
                    s.Media.play(data.video.id, data.video.position);
                }
                break;
            case 'videoStop':
                if (data.video && s.Media) {
                    data.video.position = parseFloat(data.video.position || '0');
                    s.Media.stop(data.video.id, data.video.position);
                }
                break;
            case 'videoComplete':
                if (data.video && s.Media) {
                    data.video.position = parseFloat(data.video.position || '0');
                    s.Media.stop(data.video.id, data.video.position);
                    s.Media.close(data.video.id);
                }
                break;
            case 'addWebsiteExtension':
                if (data && data.page) {
                    val = {
                        wx: data.page.websiteExtension
                    }
                }
                break;
        }

        if (val) {
            this.setCookie(this.eventCookieName, val);
        }
    },

    registerCallbacks: function () {
        var self = this;
        if (window.usabilla_live) {
            window.usabilla_live('setEventCallback', function (category, action, label, value) {
                if (action == 'Campaign:Open') {
                    self.trackEvent('ctaImpression', {
                        cta: {
                            ids: ['usabillaid:' + label]
                        }
                    });
                } else if (action == 'Campaign:Success') {
                    self.trackEvent('ctaClick', {
                        cta: {
                            ids: ['usabillaid:' + label]
                        }
                    });
                }
            });
        }
    },

    getConsortiumAccountId: function () {
        var id = '';
        if (window.pageData && pageData.visitor && (pageData.visitor.consortiumId || pageData.visitor.accountId)) {
            id = (pageData.visitor.consortiumId || 'no consortium ID') + '|' + (pageData.visitor.accountId || 'no account ID');
        }

        return id;
    },

    getSearchClickPosition: function () {
        if (window.eventData && eventData.search && eventData.search.resultsPosition) {
            var pos = parseInt(eventData.search.resultsPosition), clickPos;
            if (!isNaN(pos)) {
                var page = pageData.search.currentPage ? parseInt(pageData.search.currentPage) : '', perPage = pageData.search.resultsPerPage ? parseInt(pageData.search.resultsPerPage) : '';
                if (!isNaN(page) && !isNaN(perPage)) {
                    clickPos = pos + ((page - 1) * perPage);
                }
            }
            return clickPos ? clickPos.toString() : eventData.search.resultsPosition;
        }
        return '';
    },

    getSearchFacets: function () {
        var facetList = '';
        if (window.pageData && pageData.search && pageData.search.facets) {
            if (typeof (pageData.search.facets) == 'object') {
                for (var i = 0; i < pageData.search.facets.length; i++) {
                    var f = pageData.search.facets[i];
                    facetList += (facetList ? '|' : '') + f.name + '=' + f.values.join('^');
                }
            }
        }
        return facetList;
    },

    getSearchResultsByType: function () {
        var resultTypes = '';
        if (window.pageData && pageData.search && pageData.search.resultsByType) {
            for (var i = 0; i < pageData.search.resultsByType.length; i++) {
                var r = pageData.search.resultsByType[i];
                resultTypes += (resultTypes ? '|' : '') + r.name + (r.results || r.values ? '=' + (r.results || r.values) : '');
            }
        }
        return resultTypes;
    },

    getJournalInfo: function () {
        var info = '';
        if (window.pageData && pageData.journal && (pageData.journal.name || pageData.journal.specialty || pageData.journal.section || pageData.journal.issn || pageData.journal.issueNumber || pageData.journal.volumeNumber || pageData.journal.family || pageData.journal.publisher)) {
            var journal = pageData.journal;
            info = (journal.name || 'no name')
                + '|' + (journal.specialty || 'no specialty')
                + '|' + (journal.section || 'no section')
                + '|' + (journal.issn || 'no issn')
                + '|' + (journal.issueNumber || 'no issue #')
                + '|' + (journal.volumeNumber || 'no volume #')
                + '|' + (journal.family || 'no family')
                + '|' + (journal.publisher || 'no publisher');

        }
        return info;
    },

    getBibliographicInfo: function (doc) {
        if (!doc || !(doc.publisher || doc.indexTerms || doc.publicationType || doc.publicationRights || doc.volumeNumber || doc.issueNumber || doc.subjectAreas || doc.isbn)) {
            return '';
        }

        var terms = doc.indexTerms ? doc.indexTerms.split('+') : '';
        if (terms) {
            terms = terms.slice(0, 5).join('+');
            terms = terms.length > 100 ? terms.substring(0, 100) : terms;
        }

        var areas = doc.subjectAreas ? doc.subjectAreas.split('>') : '';
        if (areas) {
            areas = areas.slice(0, 5).join('>');
            areas = areas.length > 100 ? areas.substring(0, 100) : areas;
        }

        var biblio = (doc.publisher || 'none')
            + '^' + (doc.publicationType || 'none')
            + '^' + (doc.publicationRights || 'none')
            + '^' + (terms || 'none')
            + '^' + (doc.volumeNumber || 'none')
            + '^' + (doc.issueNumber || 'none')
            + '^' + (areas || 'none')
            + '^' + (doc.isbn || 'none');

        return this.stripProductDelimiters(biblio).toLowerCase();
    },

    getContentItem: function () {
        var docs = window.eventData && eventData.content ? eventData.content : pageData.content;
        if (docs && docs.length > 0) {
            return docs[0];
        }
    },

    getVisitorId: function () {
        return localStorage.getItem("aa_ecid") || '';
    },

    setProductsVariable: function () {
        var prodList = window.eventData && eventData.content ? eventData.content : pageData.content
            , prods = [];
        if (prodList) {
            for (var i = 0; i < prodList.length; i++) {
                if (prodList[i].id || prodList[i].type || prodList[i].publishDate || prodList[i].onlineDate) {
                    if (!prodList[i].id) {
                        prodList[i].id = 'no id';
                    }
                    var prodName = (pageData.page.productName || 'xx').toLowerCase();
                    if (prodList[i].id.indexOf(prodName + ':') != 0) {
                        prodList[i].id = prodName + ':' + prodList[i].id;
                    }
                    prodList[i].id = this.stripProductDelimiters(prodList[i].id);
                    var merch = [];
                    var a;
                    if (prodList[i].format) {
                        merch.push('evar17=' + this.stripProductDelimiters(prodList[i].format.toLowerCase()));
                    }
                    if (prodList[i].type) {
                        var type = prodList[i].type;
                        if (prodList[i].accessType) {
                            type += ':' + prodList[i].accessType;
                        }
                        merch.push('evar20=' + this.stripProductDelimiters(type.toLowerCase()));

                        if (type.indexOf(':manuscript') > 0) {
                            a = prodList[i].id.lastIndexOf(':');
                            if (a > 0) {
                                merch.push('evar200=' + prodList[i].id.substring(a + 1).toUpperCase());
                            }
                        } else if (type.indexOf(':submission') > 0) {
                            merch.push('evar200=' + prodList[i].id);
                        }
                    }
                    if (!prodList[i].title) {
                        prodList[i].title = prodList[i].name;
                    }
                    if (prodList[i].title) {
                        merch.push('evar75=' + this.stripProductDelimiters(prodList[i].title.toLowerCase()));
                    }
                    if (prodList[i].breadcrumb) {
                        merch.push('evar63=' + this.stripProductDelimiters(prodList[i].breadcrumb).toLowerCase());
                    }
                    var nowTs = new Date().getTime() / 1000;
                    if (prodList[i].onlineDate && !isNaN(prodList[i].onlineDate)) {
                        if (prodList[i].onlineDate > 32503680000) {
                            prodList[i].onlineDate = prodList[i].onlineDate / 1000;
                        }
                        merch.push('evar122=' + this.stripProductDelimiters(this.getFormattedDate(prodList[i].onlineDate)));
                        var onlineAge = Math.floor((nowTs - prodList[i].onlineDate) / 86400);
                        onlineAge = (onlineAge === 0) ? 'zero' : onlineAge;
                        merch.push('evar128=' + onlineAge);
                    }
                    if (prodList[i].publishDate && !isNaN(prodList[i].publishDate)) {
                        if (prodList[i].publishDate > 32503680000) {
                            prodList[i].publishDate = prodList[i].publishDate / 1000;
                        }
                        merch.push('evar123=' + this.stripProductDelimiters(this.getFormattedDate(prodList[i].publishDate)));
                        var publishAge = Math.floor((nowTs - prodList[i].publishDate) / 86400);
                        publishAge = (publishAge === 0) ? 'zero' : publishAge;
                        merch.push('evar127=' + publishAge);
                    }
                    if (prodList[i].onlineDate && prodList[i].publishDate) {
                        merch.push('evar38=' + this.stripProductDelimiters(this.getFormattedDate(prodList[i].onlineDate) + '^' + this.getFormattedDate(prodList[i].publishDate)));
                    }
                    if (prodList[i].mapId) {
                        merch.push('evar70=' + this.stripProductDelimiters(prodList[i].mapId));
                    }
                    if (prodList[i].relevancyScore) {
                        merch.push('evar71=' + this.stripProductDelimiters(prodList[i].relevancyScore));
                    }
                    if (prodList[i].status) {
                        merch.push('evar73=' + this.stripProductDelimiters(prodList[i].status));
                    }
                    if (prodList[i].previousStatus) {
                        merch.push('evar111=' + this.stripProductDelimiters(prodList[i].previousStatus));
                    }
                    if (prodList[i].entitlementType) {
                        merch.push('evar80=' + this.stripProductDelimiters(prodList[i].entitlementType));
                    }
                    if (prodList[i].recordType) {
                        merch.push('evar93=' + this.stripProductDelimiters(prodList[i].recordType));
                    }
                    if (prodList[i].exportType) {
                        merch.push('evar99=' + this.stripProductDelimiters(prodList[i].exportType));
                    }
                    if (prodList[i].importType) {
                        merch.push('evar142=' + this.stripProductDelimiters(prodList[i].importType));
                    }
                    if (prodList[i].section) {
                        merch.push('evar100=' + this.stripProductDelimiters(prodList[i].section));
                    }
                    if (prodList[i].detail) {
                        merch.push('evar104=' + this.stripProductDelimiters(prodList[i].detail.toLowerCase()));
                    } else if (prodList[i].details) {
                        merch.push('evar104=' + this.stripProductDelimiters(prodList[i].details.toLowerCase()));
                    }
                    if (prodList[i].position) {
                        merch.push('evar116=' + this.stripProductDelimiters(prodList[i].position));
                    }
                    if (prodList[i].publicationTitle) {
                        merch.push('evar129=' + this.stripProductDelimiters(prodList[i].publicationTitle));
                    }
                    if (prodList[i].specialIssueTitle) {
                        merch.push('evar130=' + this.stripProductDelimiters(prodList[i].specialIssueTitle));
                    }
                    if (prodList[i].specialIssueNumber) {
                        merch.push('evar131=' + this.stripProductDelimiters(prodList[i].specialIssueNumber));
                    }
                    if (prodList[i].referenceModuleTitle) {
                        merch.push('evar139=' + this.stripProductDelimiters(prodList[i].referenceModuleTitle));
                    }
                    if (prodList[i].referenceModuleISBN) {
                        merch.push('evar140=' + this.stripProductDelimiters(prodList[i].referenceModuleISBN));
                    }
                    if (prodList[i].volumeTitle) {
                        merch.push('evar132=' + this.stripProductDelimiters(prodList[i].volumeTitle));
                    }
                    if (prodList[i].publicationSection) {
                        merch.push('evar133=' + this.stripProductDelimiters(prodList[i].publicationSection));
                    }
                    if (prodList[i].publicationSpecialty) {
                        merch.push('evar134=' + this.stripProductDelimiters(prodList[i].publicationSpecialty));
                    }
                    if (prodList[i].issn) {
                        merch.push('evar135=' + this.stripProductDelimiters(prodList[i].issn));
                    }
                    if (prodList[i].id2) {
                        merch.push('evar159=' + this.stripProductDelimiters(prodList[i].id2));
                    }
                    if (prodList[i].id3) {
                        merch.push('evar160=' + this.stripProductDelimiters(prodList[i].id3));
                    }
                    if (prodList[i].provider) {
                        merch.push('evar164=' + this.stripProductDelimiters(prodList[i].provider));
                    }
                    if (prodList[i].citationStyle) {
                        merch.push('evar170=' + this.stripProductDelimiters(prodList[i].citationStyle));
                    }

                    var biblio = this.getBibliographicInfo(prodList[i]);
                    if (biblio) {
                        merch.push('evar28=' + biblio);
                    }

                    if (prodList[i].turnawayId) {
                        pageData.eventList.push('product turnaway');
                    }

                    var price = prodList[i].price || '', qty = prodList[i].quantity || '', evts = [];
                    if (price && qty) {
                        qty = parseInt(qty || '1');
                        price = parseFloat(price || '0');
                        price = (price * qty).toFixed(2);

                        if (window.eventData && eventData.eventName && eventData.eventName == 'cartAdd') {
                            evts.push('event20=' + price);
                        }
                    }

                    var type = window.pageData && pageData.page && pageData.page.type ? pageData.page.type : '', evt = window.eventData && eventData.eventName ? eventData.eventName : '';
                    if (type.match(/^CP\-/gi) !== null && (!evt || evt == 'newPage' || evt == 'contentView')) {
                        evts.push('event181=1');
                    }
                    if (evt == 'contentDownload' || type.match(/^CP\-DL/gi) !== null) {
                        evts.push('event182=1');
                    }
                    if (evt == 'contentDownloadRequest') {
                        evts.push('event319=1');
                    }
                    if (evt == 'contentExport') {
                        evts.push('event184=1');
                    }
                    if (this.eventFires('recommendationViews')) {
                        evts.push('event264=1');
                    }

                    if (prodList[i].datapoints) {
                        evts.push('event239=' + prodList[i].datapoints);
                    }
                    if (prodList[i].documents) {
                        evts.push('event240=' + prodList[i].documents);
                    }
                    if (prodList[i].size) {
                        evts.push('event335=' + prodList[i].size);
                        evts.push('event336=1')
                    }

                    if (evt == 'genAIContentUpdated') {
                        evts.push('event51=1');
                    }

                    prods.push([
                        ''					// empty category
                        , prodList[i].id		// id
                        , qty				// qty
                        , price				// price
                        , evts.join('|')		// events
                        , merch.join('|')	// merchandising eVars
                    ].join(';'));
                }
            }
        }

        return prods.join(',');
    },

    eventFires: function (eventName) {
        var evt = window.eventData && eventData.eventName ? eventData.eventName : '';
        if (evt == eventName) {
            return true;
        }
        // initial pageload and new pages
        if ((!window.eventData || evt == 'newPage') && window.pageData && window.pageData.trackEvents) {
            var tEvents = window.pageData.trackEvents;
            for (var i = 0; i < tEvents.length; i++) {
                if (tEvents[i] == eventName) {
                    return true;
                }
            }
        }
        return false;
    },

    mapAdobeVars: function (s) {
        if (!s) return;
        var vars = {
            pageName: 'Page - Analytics Pagename'
            , channel: 'Page - Section Name'
            , campaign: 'Campaign - ID'
            , currencyCode: 'Page - Currency Code'
            , purchaseID: 'Order - ID'
            , prop1: 'Visitor - Account ID'
            , prop2: 'Page - Product Name'
            , prop4: 'Page - Type'
            , prop6: 'Search - Type'
            , prop7: 'Search - Facet List'
            , prop8: 'Search - Feature Used'
            , prop12: 'Visitor - User ID'
            , prop13: 'Search - Sort Type'
            , prop14: 'Page - Load Time'
            , prop15: 'Support - Topic Name'
            , prop16: 'Page - Business Unit'
            , prop21: 'Search - Criteria'
            , prop24: 'Page - Language'
            , prop25: 'Page - Product Feature'
            , prop28: 'Support - Search Criteria'
            , prop30: 'Visitor - IP Address'
            , prop33: 'Page - Product Application Version'
            , prop34: 'Page - Website Extensions'
            , prop60: 'Search - Data Form Criteria'
            , prop63: 'Page - Extended Page Name'
            , prop65: 'Page - Online State'
            , prop67: 'Research Networks'
            , prop40: 'Page - UX Properties'

            , eVar3: 'Search - Total Results'
            , eVar7: 'Visitor - Account Name'
            , eVar15: 'Event - Search Results Click Position'
            , eVar19: 'Search - Advanced Criteria'
            , eVar21: 'Promo - Clicked ID'
            , eVar22: 'Page - Test ID'
            , eVar27: 'Event - AutoSuggest Search Data'
            , eVar157: 'Event - AutoSuggest Search Typed Term'
            , eVar156: 'Event - AutoSuggest Search Selected Term'
            , eVar162: 'Event - AutoSuggest Search Category'
            , eVar163: 'Event - AutoSuggest Search Details'
            , eVar33: 'Visitor - Access Type'
            , eVar34: 'Order - Promo Code'
            , eVar39: 'Order - Payment Method'
            , eVar41: 'Visitor - Industry'
            , eVar42: 'Visitor - SIS ID'
            , eVar43: 'Page - Error Type'
            , eVar44: 'Event - Updated User Fields'
            , eVar48: 'Email - Recipient ID'
            , eVar51: 'Email - Message ID'
            , eVar52: 'Visitor - Department ID'
            , eVar53: 'Visitor - Department Name'
            , eVar60: 'Search - Within Content Criteria'
            , eVar61: 'Search - Within Results Criteria'
            , eVar62: 'Search - Result Types'
            , eVar74: 'Page - Journal Info'
            , eVar59: 'Page - Journal Publisher'
            , eVar76: 'Email - Broadlog ID'
            , eVar78: 'Visitor - Details'
            , eVar80: 'Visitor - Usage Path Info'
            , eVar102: 'Form - Name'
            , eVar103: 'Event - Conversion Driver'
            , eVar105: 'Search - Current Page'
            , eVar106: 'Visitor - App Session ID'
            , eVar107: 'Page - Secondary Product Name'
            , eVar117: 'Search - Database'
            , eVar126: 'Page - Environment'
            , eVar141: 'Search - Criteria Original'
            , eVar143: 'Page - Tabs'
            , eVar161: 'Search - Channel'
            , eVar169: 'Search - Facet Operation'
            , eVar173: 'Search - Details'
            , eVar174: 'Campaign - Spredfast ID'
            , eVar175: 'Visitor - TMX Device ID'
            , eVar176: 'Visitor - TMX Request ID'
            , eVar148: 'Visitor - Platform Name'
            , eVar149: 'Visitor - Platform ID'
            , eVar152: 'Visitor - Product ID'
            , eVar153: 'Visitor - Superaccount ID'
            , eVar154: 'Visitor - Superaccount Name'
            , eVar177: 'Page - Context Domain'
            , eVar189: 'Page - Experimentation User Id'
            , eVar190: 'Page - Identity User'
            , eVar199: 'Page - ID+ Parameters'

            , list2: 'Page - Widget Names'
            , list3: 'Promo - IDs'
        };

        for (var i in vars) {
            // Access _satellite globally. It should be available via legacy ecosystem.
            s[i] = s[i] ? s[i] : (window._satellite && _satellite.getVar ? _satellite.getVar(vars[i]) : '');
        }
    }
};
