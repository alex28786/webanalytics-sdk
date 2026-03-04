import { pageDataTracker } from '../core/tracker.js';
import { resolveDataElement } from './data-elements.js';

export function initDoPlugins(s) {
    if (!s) return;

    /**
     * ####### DO Plugins
     */
    s.doPlugins = function (s) {
        if (!window.pageData || pageData.page.noTracking == 'true' || !window.pageData_isLoaded) {
            s.abort = true;
            if (!window.pageData) {
                return;
            }
        }

        // synchronize data state
        try {
            if (window.ddqueue && window.ddqueue.length > 0) {
                var dd = JSON.parse(window.ddqueue.shift());
                window.eventData = dd.eventData;
                window.pageData = dd.pageData;
            }
        } catch (e) { }

        pageData.page.lastTrackedPage = pageData.page.analyticsPagename;

        if (typeof (window.eventData) == 'object' && (window.eventData.eventName == 'newPage' || window.eventData.eventName == 'searchResultsUpdated')) {
            //s.clearVars();
            s.pageLoaded = false;
            pageDataTracker.getEvents();
        }
        pageDataTracker.mapAdobeVars(s);

        // promo/cta processing
        var promos = [];
        try {
            if (s.getValue('eventData.cta.ids')) {
                promos.push.apply(promos, s.getValue('eventData.cta.ids'));
                s.linkTrackVars = s.apl(s.linkTrackVars, 'list3', ',', 2);
            } else {
                var links = document.getElementsByTagName('a');
                for (var i = 0; i < links.length; i++) {
                    var promo = links[i].getAttribute('data-sc-promo-id');
                    if (promo) {
                        promos.push(promo);
                    }
                }
                if (s.getValue('pageData.cta.ids')) {
                    promos.push.apply(promos, s.getValue('pageData.cta.ids'));
                }
            }
            s.list3 = promos.join('|');
        } catch (error) {
            _satellite.logger.error(error)
        }

        if (s.list3) {
            var splitted = s.list3.split('|');
            for (var i = 0; i < splitted.length; i++) {
                splitted[i] = s.productPrefix(splitted[i]);
            }
            s.list3 = splitted.join('|');
        }

        s.eVar21 = resolveDataElement('Promo - Clicked ID');
        if (s.eVar21) {
            s.list3 = s.eVar21 = s.productPrefix(s.eVar21);
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar21', ',', 2);
            if (window.clickedPromoId) {
                window.clickedPromoId = undefined;
            }
        }
        //s.account = s.getCustomReportSuites();
        s.getCustomReportSuites();

        s.tpEls = s.getTimeParting('n', '-5').split('|');
        s.prop5 = s.tpEls[0] + ' ' + s.tpEls[1];

        s.prop9 = s.version;

        s.server = document.location.hostname;
        s.prop18 = document.location.hostname + document.location.pathname;
        s.prop32 = document.location.protocol.replace(/\:/g, '');
        s.prop35 = s.getUrlWithHashbang();

        s.eVar8 = s.getDaysSinceLastVisit('v8');
        //alloy("getIdentity").then(({ identity }) => { window.__ecid = identity && identity.ECID; });
        //s.eVar50 = window.__ecid;
        s.eVar50 = localStorage.getItem("aa_ecid") || '';

        /*
        var visitorAPI = Visitor.getInstance('4D6368F454EC41940A4C98A6@AdobeOrg');
        s.eVar50 = visitorAPI.getMarketingCloudVisitorID();

        // sync customer ids
        if (s.prop12) {
            var authState = 0; // Visitor.AuthState.UNKNOWN;
            if (s.eVar33 && s.eVar33.match(/(reg(-|_|:))|registered/gi) !== null) {
                authState = 1; //Visitor.AuthState.AUTHENTICATED;
            }

            visitorAPI.setCustomerIDs({
                "userid": {
                    "id": s.prop12,
                    "authState": authState
                }
            });
        }
        */

        // redirect cert traffic
        // TODO remapping of accounts in websdk
        /*
        if (window.pageData && pageData.page && pageData.page.environment == 'cert') {
            s.account = s.account.replace(/\-(prod)/gi, '-dev');
        }
            */

        // account remap
        var accountRemap = resolveDataElement('Account');
        if (accountRemap) {
            s.account = accountRemap;
        }

        if (s.campaign && s.prop2) {
            if (s.campaign.indexOf(s.prop2 + ':') != 0) {
                s.campaign = s.prop2 + ':' + s.campaign;
            }
        }

        if (s.campaign) {
            s.eVar108 = s.campaign;
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar108', ',', 2);
        }

        s.events = s.events ? s.events : '';

        s.products = pageDataTracker.setProductsVariable();

        if (!s.pageLoaded && s.pageName) {
            s.prop19 = s.getPreviousValue(s.pageName, 'c19', '');
            if (s.prop19) {
                // TODO replace with websdk plugin
                /*
                var ppva = s.getPercentPageViewed(s.pageName);
                if (ppva && ppva.length > 2 && ppva[1] != 'undefined' && typeof (ppva[1]) != 'undefined' && ppva[2] != 'undefined' && typeof (ppva[2]) != 'undefined') {
                    s.prop17 = ppva[1] + '|' + ppva[2];
                } else {
                    s.prop17 = 'no data available';
                }
                */
            }

            s.eVar66 = s.eVar67 = '+1';
            s.events = s.apl(s.events, 'event27', ',', 2);

            // track events
            if (window.pageData && pageData.trackEvents && pageData.trackEvents instanceof Array) {
                var eventMap = {
                    'associationStart': 'event199',
                    'associated': 'event200',
                    'contentEdit': 'event190',
                    'contentAddition': 'event79',
                    'recommendationViews': 'event257,event264',
                    'accountAssociationStart': 'event333'
                };

                for (var j = 0; j < pageData.trackEvents.length; j++) {
                    var eventToAdd = eventMap[pageData.trackEvents[j]];
                    if (eventToAdd) {
                        s.events = s.apl(s.events, eventToAdd, ',', 2);
                    }
                }
                pageData.trackEvents = [];
            }

            // unique web user metrics
            var userId = resolveDataElement('Visitor - User ID');
            var d = new Date();
            if (userId) {
                userId = userId.toLowerCase();
                var onejan = new Date(d.getFullYear(), 0, 1);

                // unique web user id
                var e203val = userId + d.getFullYear() + d.getMonth();
                e203val = pageDataTracker.md5(e203val).substring(0, 20);
                s.events = s.apl(s.events, 'event203:' + e203val, ',', 2);

                // unique monthly product web user id
                var e320val = userId + d.getFullYear() + d.getMonth();
                e320val = s.productPrefix(e320val);
                e320val = pageDataTracker.md5(e320val).substring(0, 20);
                s.events = s.apl(s.events, 'event320:' + e320val, ',', 2);

                // unique weekly product web user id
                var e321val = userId + d.getFullYear() + Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
                e321val = s.productPrefix(e321val);
                e321val = pageDataTracker.md5(e321val).substring(0, 20);
                s.events = s.apl(s.events, 'event321:' + e321val, ',', 2);
            }

            // unique account id
            var uniqueAccountId = resolveDataElement('Visitor - Account ID');
            if (uniqueAccountId) {
                uniqueAccountId = uniqueAccountId.toLowerCase();
                uniqueAccountId += d.getFullYear();
                uniqueAccountId += d.getMonth();
                uniqueAccountId = pageDataTracker.md5(uniqueAccountId).substring(0, 20);
                s.events = s.apl(s.events, 'event205:' + uniqueAccountId, ',', 2);
            }

            // surveys
            if (s.eVar72) {
                s.events = s.apl(s.events, 'event9', ',', 2);
            }

            // logins
            if (window.pageData && pageData.visitor && pageData.visitor.loginSuccess && pageData.visitor.loginSuccess == 'true') {
                s.events = s.apl(s.events, 'event23', ',', 2);
                pageData.visitor.loginSuccess = 'false';
            }
            if (window.pageData && pageData.visitor && pageData.visitor.loginFailure && pageData.visitor.loginFailure == 'true') {
                s.events = s.apl(s.events, 'event134', ',', 2);
                pageData.visitor.loginFailure = 'false';
            }

            var searchDedupe = '';

            // internal search
            if (s.eVar19) {
                s.eVar19 = s.cleanUrlData(s.eVar19);
                if (!s.prop21) {
                    s.prop21 = s.eVar19;
                }
            }
            if (s.eVar3 == '0') {
                s.eVar3 = 'zero';
            }
            if (s.prop21) {
                s.prop21 = s.cleanUrlData(s.prop21);
                searchDedupe = s.getValOnce(s.prop21, 'c21', 0);

                if (searchDedupe) {
                    s.events = s.apl(s.events, 'event3', ',', 2);
                    s.eVar35 = s.eVar36 = '+1';

                    if (s.eVar3 == '0' || s.eVar3 == 'zero') {
                        s.eVar3 = 'zero';
                        s.events = s.apl(s.events, 'event4', ',', 2);
                    } else if (s.eVar3) {
                        s.events = s.apl(s.events, 'event14=' + s.eVar3, ',', 2);
                    }
                }

                var resultsOnPage = resolveDataElement('Search - Results per Page')
                    , currentPage = s.getValOnce(((!s.eVar19 || (s.eVar19 != s.prop21)) ? s.prop21 : '') + ':' + resolveDataElement('Search - Current Page'), 'e13', 0);
                if (currentPage && resultsOnPage) {
                    s.events = s.apl(s.events, 'event13=' + resultsOnPage, ',', 2);
                }
            }

            // search database
            if (s.eVar117) {
                searchDedupe = s.getValOnce(s.eVar117, 'v117', 0);
                if (searchDedupe) {
                    s.events = s.apl(s.events, 'event198', ',', 2);
                }
            }

            // search sort
            if (s.prop13) {
                searchDedupe = s.getValOnce(s.prop13, 'c13', 0);
                if (searchDedupe) {
                    s.events = s.apl(s.events, 'event24', ',', 2);
                }
            }

            // search facets
            if (s.prop7 || s.eVar46) {
                searchDedupe = s.getValOnce((s.prop7 || s.eVar46), 'c7', 0);
                if (searchDedupe) {
                    s.events = s.apl(s.events, 'event6', ',', 2);
                }
            }

            // data form searches
            if (s.prop60) {
                searchDedupe = s.getValOnce(s.prop60, 'c60', 0);
                if (searchDedupe) {
                    s.events = s.apl(s.events, 'event88', ',', 2);
                }
            }

            // entry clicks
            var visitStart = s.getValOnce('1', 'e41', 0);
            s.clickPast(visitStart, 'event41', 'event42');
            if (s.events.indexOf('event41') > -1 && ts) {
                s.c_w('v31', ts);
            }

            // promo impressions
            if (s.list3) {
                s.events = s.apl(s.events, 'event21', ',', 2);
            }

            // time between
            var ts = resolveDataElement('Page - Load Timestamp')
                , lts = s.getPreviousValue(ts, 'v68', '') || ts
                , vts = s.c_r('v31') || ts;

            if (ts) {
                try {
                    var dl = new Date(parseInt(ts));
                    var t = dl.getTime();
                    var isDST = s.isDST(dl);

                    s.eVar113 = (Math.floor(((t / 1000) - 18000 + 3600 * isDST) % 86400) + 1).toString();
                    s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar113', ',', 2);
                } catch (ex) {
                    _satellite.notify("Error setting s.eVar113: " + ex.message);
                }
            }

            if (ts && lts) {
                try {
                    var pageTimestamp = new Date(parseInt(ts))
                        , lastTimestamp = new Date(parseInt(lts))
                        , visitTimestamp = new Date(parseInt(vts));

                    var diff = pageTimestamp.getTime() - lastTimestamp.getTime();
                    if (diff > 0) {
                        s.eVar68 = '+' + (diff / 1000).toFixed(0);
                    }
                    s.currentVisitTime = ((pageTimestamp.getTime() - visitTimestamp.getTime()) / 1000).toFixed(0);
                } catch (ex) {
                    // invalid dates
                }
            }

            if (pageData.eventList) {
                for (var i = 0; i < pageData.eventList.length; i++) {
                    if (pageData.eventList[i] == 'product turnaway') {
                        s.events = s.apl(s.events, 'event43', ',', 2);
                    }
                }
            }

            // errors
            if (s.eVar43) {
                s.events = s.apl(s.events, 'event26', ',', 2);
            }

            // profile updates
            if (s.eVar44) {
                s.events = s.apl(s.events, 'event17', ',', 2);
            }

            // purchase steps
            if (pageData.page && pageData.page.purchaseStep) {
                var step = pageData.page.purchaseStep, evt = '';
                switch (step) {
                    case 'cart':
                        evt = 'scView';
                        break;
                    case 'login':
                    case 'checkout':
                    case 'shipping':
                    case 'payment':
                        evt = 'scCheckout';
                        break;
                    case 'purchase':
                        evt = 'purchase';
                        break;
                    default:
                        break;
                }
                if (evt) {
                    s.events = s.apl(s.events, evt, ',', 2);
                    if (evt == 'scView') {
                        s.events = s.apl(s.events, 'scOpen', ',', 2);
                    }
                }
            }

            // widgets
            if (s.list2) {
                s.events = s.apl(s.events, 'event178', ',', 2);
            }

            // dtm messages & performance
            try {
                var aamm = sessionStorage.getItem('aamm');
                if (aamm) {
                    pageDataTracker.addMessage('b' + aamm);
                    sessionStorage.removeItem('aamm');
                }
                var tpcfk = '_pageDataTracker_tpcf';
                var tpcf = sessionStorage.getItem(tpcfk);
                if (tpcf) {
                    pageDataTracker.addMessage(tpcf == 'true' ? '3p1' : '3p0');
                    sessionStorage.removeItem(tpcfk);
                }
                s.prop66 = pageDataTracker.getMessages();
                if (s.prop66) {
                    s.linkTrackVars = s.apl(s.linkTrackVars, 'prop66', ',', 2);
                }
                var measures = pageDataTracker.getPerformance();
                if (measures['du']) {
                    s.eVar114 = measures['du'];
                    s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar114', ',', 2);
                }
                if (measures['lt']) {
                    s.eVar115 = measures['lt'];
                    s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar115', ',', 2);
                }

            } catch (e) { }

            // campaign parameters
            var cParams = [
                'utm_campaign',
                'dgcid',
                'utm_dgroup',
                'utm_in',
                'utm_medium',
                'utm_acid',
                'cmx_id',
                'sis_id',
                'utm_source',
                'utm_term',
                'utm_content'];
            var cMerged = '', cFound = false;
            for (var ci = 0; ci < cParams.length; ci++) {
                var param = s.Util.getQueryParam(cParams[ci]) || '';
                if (param) {
                    cFound = true;
                }
                cMerged += param + "|";
            }
            if (cFound) {
                s.eVar125 = cMerged;
            }

            // load time
            if (s.prop14 && (!isNaN(parseFloat(s.prop14)) && isFinite(s.prop14))) {
                s.events = s.apl(s.events, 'event229=' + s.prop14, ',', 2);
                s.events = s.apl(s.events, 'event230', ',', 2);
            }

            // custom performance 1-5
            if (window.pageData && pageData.page) {
                for (var i_cp = 0; i_cp < 5; i_cp++) {
                    var cp = (i_cp * 2) + 306
                    var de = pageData.page['customPerformance' + (i_cp + 1)]
                    if (isFinite(parseFloat(de))) {
                        s.events = s.apl(s.events, 'event' + cp + '=' + parseFloat(de), ',', 2);
                        s.events = s.apl(s.events, 'event' + (cp + 1), ',', 2);
                    }
                }
            }

            // console messages
            if (window.pageDataTracker_ec && pageDataTracker_ec > 0) {
                s.events = s.apl(s.events, 'event227=' + pageDataTracker_ec, ',', 2);
                pageDataTracker_ec = 0;
            }
            if (window.pageDataTracker_wc && pageDataTracker_wc > 0) {
                s.events = s.apl(s.events, 'event228=' + pageDataTracker_wc, ',', 2);
                pageDataTracker_wc = 0;
            }

            s.pageLoaded = true;
        }

        if ((s.prop4 && s.prop4.match(/^CP\-/gi) !== null && !s.linkType) || (s.linkName && (s.linkName == 'content view' || s.linkName == 'contentView'))) {
            var contentItem = pageDataTracker.getContentItem();
            if (contentItem && contentItem.id && !contentItem.turnawayId) {
                s.events = s.apl(s.events, 'prodView', ',', 2);
                s.events = s.apl(s.events, 'event5', ',', 2);
                s.events = s.apl(s.events, 'event40', ',', 2);
                s.events = s.apl(s.events, 'event181', ',', 2);
                s.events = s.apl(s.events, 'event182', ',', 2);
                s.events = s.apl(s.events, 'event184', ',', 2);

                s.events = s.apl(s.events, 'event239', ',', 2);
                s.events = s.apl(s.events, 'event240', ',', 2);

                var sessionId = resolveDataElement('Visitor - App Session ID');

                // calculate id for unique content views
                var uniqueContentSessId = pageDataTracker.md5((sessionId ? sessionId : 'none') + contentItem.id).substring(0, 20);
                s.events = s.apl(s.events, 'event201:' + uniqueContentSessId, ',', 2);

                // calculate id for unique full content views
                if (contentItem.type && contentItem.type.toLowerCase().indexOf('scope-full') !== -1) {
                    s.events = s.apl(s.events, 'event202:' + uniqueContentSessId, ',', 2);
                }

                if (contentItem && contentItem.type) {
                    s.hier2 = contentItem.type;
                    s.linkTrackVars = s.apl(s.linkTrackVars, 'hier2', ',', 2);
                }

                s.eVar24 = '+1';
                s.eVar25 = '+1';

                s.prop11 = contentItem.id;
                s.prop31 = pageDataTracker.getBibliographicInfo(contentItem);

                if (contentItem.format) {
                    if (contentItem.format.match(/\-X?HTML/gi) !== null) {
                        var evt = '';
                        if (contentItem.format.match(/scope\-abstract/gi) !== null || contentItem.type.match(/scope\-abstract/gi) !== null) {
                            evt = 'event33';
                        } else {
                            evt = 'event29';
                        }
                        s.events = s.apl(s.events, evt, ',', 2);
                        s.linkTrackEvents = s.apl(s.linkTrackEvents, evt, ',', 2);
                    } else if (contentItem.format.match(/\-PDF/gi) !== null) {
                        s.events = s.apl(s.events, 'event30', ',', 2);
                        s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event30', ',', 2);
                    }
                }

                if (s.prop4.match(/^CP\-DL/gi) !== null) {
                    s.events = s.apl(s.events, 'event19', ',', 2);
                }

                if (contentItem.viewState) {
                    if (contentItem.viewState == 'login') {
                        s.events = s.apl(s.events, 'event103', ',', 2);
                        s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event103', ',', 2);
                    } else if (contentItem.viewState == 'upsell') {
                        s.events = s.apl(s.events, 'event104', ',', 2);
                        s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event104', ',', 2);
                    }
                }

                if (contentItem.indexTerms) {
                    s.prop56 = contentItem.indexTerms;
                }

                if (s.currentVisitTime) {
                    s.eVar31 = s.currentVisitTime;
                    if (!s.eVar31 || s.eVar31 == '0') {
                        s.eVar31 = 'zero';
                    }
                }

                s.linkTrackVars = s.apl(s.linkTrackVars, 'events', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar24', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar25', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar31', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'prop11', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'prop31', ',', 2);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'prodView', ',', 2);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event5', ',', 2);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event40', ',', 2);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event239', ',', 2);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event240', ',', 2);
            }
        } else {
            // remove all content view events
            s.events = s.removeFromList('prodView,event5,event40,event29,event33,event30,event239,event240', ',', s.events, ',');
        }

        // general track e239
        if (s.products && s.products.indexOf("event239=") >= 0) {
            s.events = s.apl(s.events, 'event239', ',', 2);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event239', ',', 2);
        }

        // general track e240
        if (s.products && s.products.indexOf("event240=") >= 0) {
            s.events = s.apl(s.events, 'event240', ',', 2);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event240', ',', 2);
        }

        // internal promos
        if (s.eVar21) {
            s.events = s.apl(s.events, 'event22', ',', 2);
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar21', ',', 2);
            s.linkTrackVars = s.apl(s.linkTrackVars, 'events', ',', 2);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event22', ',', 2);
        }

        if (s.prop23 && s.products) {
            var contentItem = pageDataTracker.getContentItem();
            if (contentItem && contentItem.id) {
                s.prop22 = contentItem.id + ':' + s.prop23;
                s.linkTrackVars = s.apl(s.linkTrackVars, 'prop22', ',', 2);
            }
        }

        // search within content
        if (s.eVar60) {
            searchDedupe = s.getValOnce(s.eVar60, 'v60', 0);
            if (searchDedupe) {
                s.events = s.apl(s.events, 'event75', ',', 2);
            }
        }

        // search within results
        if (s.eVar61) {
            searchDedupe = s.getValOnce(s.eVar61, 'v61', 0);
            if (searchDedupe) {
                s.events = s.apl(s.events, 'event76', ',', 2);
            }
        }

        // search result clicks
        if (s.eVar15) {
            if (s.getValOnce(resolveDataElement('Search - Criteria'), 'e78', 0)) {
                s.events = s.apl(s.events, 'event78', ',', 2);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event78', ',', 2);
                if (window.eventData && eventData.search) {
                    eventData.search.resultsPosition = '';
                }
            }
        }

        // link-out
        if (s.eVar37 && s.products && s.isTracked(s, 'eVar37')) {
            s.events = s.apl(s.events, 'event44', ',', 2);
            s.linkTrackVars = s.apl(s.linkTrackVars, 'events', ',', 2);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event44', ',', 2);
        }

        // forms
        var formName = resolveDataElement('Form - Step + Name');
        if (formName && formName === 'login:start') {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'events', ',', 2);
            s.events = s.apl(s.events, 'event141', ',', 2);
        } else if (formName && formName === 'loginregistration:start') {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'events', ',', 2);
            s.events = s.apl(s.events, 'event185', ',', 2);
        } else if (formName && formName === 'termsagreement:start') {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'events', ',', 2);
            s.events = s.apl(s.events, 'event186', ',', 2);
        } else if (formName && formName === 'termsagreement:complete') {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'events', ',', 2);
            s.events = s.apl(s.events, 'event187', ',', 2);
        } else if (formName) {
            var evt = '';
            if (formName.indexOf('complete') > -1) {
                evt = 'event' + (formName.indexOf('register') > -1 || formName.indexOf('registration') > -1 ? '2' : '47');
            } else {
                evt = 'event' + (formName.indexOf('register') > -1 || formName.indexOf('registration') > -1 ? '1' : '46');
            }
            s.linkTrackVars = s.apl(s.linkTrackVars, 'events', ',', 2);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, evt, ',', 2);
            s.events = s.apl(s.events, evt, ',', 2);
        } else {
            s.events = s.removeFromList('event1,event2,event46,event47', ',', s.events, ',');
        }

        // failed registrations
        if ((formName.indexOf('register') > -1 || formName.indexOf('registration') > -1) && s.isTracked(s, 'eVar43')) {
            s.events = s.apl(s.events, 'event216', ',', 2);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event216', ',', 2);
        }


        if (document.location.href.length > 255) {
            s.pageURL = document.location.href.substring(0, 255);
        } else {
            s.pageURL = document.location.href;
        }

        if (s.pageURL && (s.pageURL.indexOf("file:") === 0)) {
            s.pageURL = s.prop18 = s.prop35 = "file://[filepath sanitized for GDPR compliance]";
        }

        if (s.campaign && s.campaign.indexOf('raven') !== -1) {
            s.referrer = 'mail://raven';
        } else if (s.campaign && s.campaign.indexOf('email') !== -1) {
            s.referrer = 'mail://campaigns';
        } else if (document.referrer && document.referrer.length > 255 && !s.referrer) {
            s.referrer = document.referrer.substring(0, 255);
        } else if (!document.referrer) {
            s.referrer = s.Util.getQueryParam('aaref');
        }

        if (s.prop8) {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'prop8', ',', 2);
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar18', ',', 2);
        }

        // save external referrers with subdomains
        s.eVar109 = s.getFullReferringDomains();
        if (s.eVar109) {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar109', ',', 2);
        }

        // generally save link object information
        s.linkTrackVars = s.linkTrackVars || '';
        s.linkTrackVars = s.removeFromList('eVar118,eVar119,eVar120,eVar121,eVar144', ',', s.linkTrackVars, ',');
        if (window.eventData && eventData.link && eventData.link.location) {
            s.eVar118 = eventData.link.location;
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar118', ',', 2);
        }
        if (window.eventData && eventData.link && eventData.link.name) {
            s.eVar119 = eventData.link.name;
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar119', ',', 2);
        }
        if (window.eventData && eventData.link && eventData.link.type) {
            s.eVar120 = eventData.link.type;
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar120', ',', 2);
        }
        if (window.eventData && eventData.link && eventData.link.destination) {
            s.eVar121 = eventData.link.destination;
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar121', ',', 2);
        }
        if (window.eventData && eventData.link && eventData.link.userInputMethod) {
            s.eVar144 = eventData.link.userInputMethod;
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar144', ',', 2);
        }

        // save conversion driver page
        if (s.eVar103) {
            s.eVar110 = !s.eVar110 ? 'D=c19' : s.eVar110;
        }

        // generally save conversion driver
        if (!s.isTracked(s, 'eVar103') && window.eventData && eventData.conversionDriver && eventData.conversionDriver.name) {
            s.eVar103 = eventData.conversionDriver.name;
            s.eVar110 = 'D=pageName';
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar103,eVar110', ',', 2);
        }

        // copy conversion driver over with linear allocation
        if (s.eVar103 && s.isTracked(s, 'eVar103')) {
            s.eVar145 = 'D=v103';
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar145', ',', 2);
        }

        // trigger e2 without participation as well
        if (s.events && s.events.split(',').indexOf('event2') > -1) {
            s.events = s.apl(s.events, 'event7', ',', 2);
        }

        // custom exit link tracking
        if (s.linkObject && s.linkURL && s.linkType == 'e') {
            try {
                s.eVar158 = s.extractHostname(s.linkURL);
                if (s.eVar158) {
                    s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar158', ',', 2);
                }
            } catch (e) { }
        }

        // track user agent
        if (window.navigator && navigator.userAgent) {
            s.eVar186 = navigator.userAgent;
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar186', ',', 2);
        }

        // track all fired events in separate prop
        s.trackEventsList(s, 'prop69');

        // online state
        s.prop65 = resolveDataElement('Page - Online State');
        if (s.prop65) {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'prop65', ',', 2);
        }

        // copy user ids - a&e ids
        var userId = resolveDataElement('Visitor - User ID');
        var match = userId.match(/^ae:([0-9]+)$/i);
        if (match && match.length > 1) {
            s.prop72 = match[1];
            s.linkTrackVars = s.apl(s.linkTrackVars, 'prop72', ',', 2);
        }
        // whitelisted user id copy
        if (s.prop2 && ['pr', 'sv'].indexOf(s.prop2) !== -1) {
            s.prop41 = userId;
            s.linkTrackVars = s.apl(s.linkTrackVars, 'prop41', ',', 2);
        }

        // track detected mouseflow session
        var mf_session = sessionStorage.getItem('mf_session');
        if (mf_session) {
            s.prop44 = mf_session;
            s.linkTrackVars = s.apl(s.linkTrackVars, 'prop44', ',', 2);
        }

        // website extensions
        var wxv = [];
        window.ga && wxv.push('3');
        window.pendo && wxv.push('4');
        window.usabilla_live && wxv.push('5');
        window.optimizely && wxv.push('6');
        window.mendeleyWebImporter && wxv.push('7');
        window.OneTrust && wxv.push('8');
        window.mouseflow && wxv.push('9');
        if (wxv.length > 0) {
            s.prop34 = s.prop34 ? s.prop34 + "|" + wxv.join("|") : wxv.join("|");
        }

        // VARIABLE CONFIG
        s.prop29 = s.eVar7 ? 'D=v7' : '';
        //s.prop36 = s.list3 ? 'D=l3' : '';
        s.prop36 = s.list3 ? s.list3 : '';
        s.prop37 = s.eVar33 ? 'D=v33' : '';

        s.eVar1 = s.prop21 ? 'D=c21' : '';
        s.eVar2 = s.prop6 ? 'D=c6' : '';
        s.eVar4 = s.prop2 ? 'D=c2' : '';
        s.eVar5 = s.prop5 ? 'D=c5' : '';
        s.eVar9 = s.prop16 ? 'D=c16' : '';
        s.eVar10 = s.prop18 ? 'D=c18' : '';
        s.eVar11 = s.pageName ? 'D=pageName' : '';
        s.eVar13 = s.prop4 ? 'D=c4' : '';
        s.eVar14 = s.purchaseID ? s.purchaseID : '';
        s.eVar16 = s.prop1 ? 'D=c1' : '';
        s.eVar18 = s.prop8 ? 'D=c8' : '';
        s.eVar26 = s.prop13 ? 'D=c13' : '';
        s.eVar29 = s.prop12 ? 'D=c12' : '';
        s.eVar32 = s.prop19 ? 'D=c19' : '';
        s.eVar46 = s.prop7 ? 'D=c7' : '';
        s.eVar98 = s.prop63 ? 'D=c63' : '';
        s.eVar101 = 'D=g';
        s.eVar147 = s.prop33 ? 'D=c33' : '';

        s.hier1 = s.pageName ? s.pageName : '';
        s.hier3 = s.prop19 ? s.prop19 : '';
        s.list1 = s.prop7 ? s.prop7 : '';

        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop2', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop3', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop4', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop5', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop9', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop16', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop18', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop35', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop19', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop24', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop32', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop33', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar4', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar5', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar8', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar9', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar10', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar11', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar13', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar32', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar50', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar59', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar101', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar147', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'products', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'currencyCode', ',', 2);
        s.linkTrackVars = s.apl(s.linkTrackVars, 'channel', ',', 2);
        if (s.isTracked(s, 'list3')) {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'prop36', ',', 2);
        }
        if (s.isTracked(s, 'eVar33')) {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'prop37', ',', 2);
        }

        s.prop38 = resolveDataElement("Maturity Level");
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop38', ',', 2);

        s.prop39 = resolveDataElement("Source");
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop39', ',', 2);
        if (s.prop39 && s.prop39 == 'id') {
            s.prop42 = s.eVar33 ? 'D=v33' : '';
            if (s.isTracked(s, 'eVar33')) {
                s.linkTrackVars = s.apl(s.linkTrackVars, 'prop42', ',', 2);
            }
        }

        // get KPI name
        s.prop3 = s.getKPIName(s.events);

        // blacklisted
        s.abort = resolveDataElement('s_blacklist');
    };
}
