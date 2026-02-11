import { pageDataTracker } from '../core/tracker.js';

function path(str) {
    if (!str) return '';
    const parts = str.split('.');
    let obj = window;
    for (const part of parts) {
        if (obj === undefined || obj === null) return '';
        obj = obj[part];
    }
    return obj;
}

function getParam(name) {
    // Case insensitive matching by default as per legacy behavior seen
    const search = window.location.search.substring(1);
    const params = search.split('&');
    for (const param of params) {
        const [key, value] = param.split('=');
        if (key.toLowerCase() === name.toLowerCase()) {
            return decodeURIComponent(value || '');
        }
    }
    return '';
}

export const dataElements = {
    "Email - Broadlog ID": function () { return getParam("bid"); },
    "Visitor - Superaccount Name": function () { return path("pageData.visitor.superaccountName"); },
    "Visitor - Platform Name": function () { return path("pageData.visitor.platformName"); },
    "Education - Time Since Last Attempt": function () { return path("eventData.education.timeSinceLastAttempt"); },
    "Event - GenAI Input": function () { return path("eventData.genAI.input"); },
    "Email - Message ID": function () { return getParam("cid"); },
    "Education - Days Before / After Due Date": function () { return path("eventData.education.beforeAfterDueDate"); },
    "Education - Question Type": function () { return path("eventData.education.questionType"); },
    "Visitor - IP Address": function () { return path("pageData.visitor.ipAddress"); },
    "Education - Module ID and Name": function () {
        for (var e = ["moduleId", "moduleName"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Search - Sort Type": function () { return path("pageData.search.sortType"); },
    "Education - Assignment Numeric Grade": function () { return path("eventData.education.assignmentNumericGrade"); },
    "Education - Packet ID and Name": function () {
        for (var e = ["packetId", "packetName"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Event - GenAI ConversationId+PromptCounter": function () {
        for (var e = ["conversationId", "promptCounter"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.genAI && eventData.genAI[a] ? t.push(eventData.genAI[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Page - Context Domain": function () {
        for (var e = ["contextDomain", "host", "version", "platform"], t = [], n = !1, a = 0; a < e.length; a++) {
            var r = e[a];
            pageData && pageData.page && pageData.page[r] ? (t.push(pageData.page[r]),
                n = !0) : t.push("none")
        }
        return n ? t.join("^") : ""
    },
    "Event - Sync Duration": function () { return path("eventData.sync.duration"); },
    "Event - Navigation Link Name": function () { return path("eventData.navigationLink.name"); },
    "Education - Days Until Due": function () { return path("eventData.education.daysUntilDue"); },
    "Event - Action Name": function () { return path("eventData.action.name"); },
    "Visitor - Consortium ID": function () { return path("pageData.visitor.consortiumId"); },
    "Search - Within Content Criteria": function () { return path("pageData.search.withinContentCriteria"); },
    "Search - Type": function () { return path("pageData.search.type"); },
    "Search - Facet Operation": function () { return path("pageData.search.facetOperation"); },
    "Event - Sync Method": function () { return path("eventData.sync.method"); },
    "Page - UX Properties": function () { return path("pageData.page.isResponsive"); },
    "Event - LinkOut Referring Product": function () { return path("eventData.referringProduct"); },
    "Search - Data Form Criteria": function () { return path("pageData.search.dataFormCriteria"); },
    "Education - Program ID and Name": function () {
        for (var e = ["programId", "programName"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Page - Load Timestamp": function () { return path("pageData.page.loadTimestamp"); },
    "Education - Maximum Packets Issued": function () { return path("eventData.education.maxPackets"); },
    "Page - Section Name": function () { return path("pageData.page.sectionName"); },
    "Event - Survey Score": function () { return path("eventData.survey.score"); },
    "Education - Assignment Duration and Score": function () {
        for (var e = ["assignmentDuration", "assignmentScore"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Search - Criteria": function () {
        var e = "";
        return window.pageData && (pageData.search && (e = pageData.search.criteria || ""),
            !e && pageData.savedEvents && (e = pageData.savedEvents.autoSuggestSearchTerm || ""),
            !e && window.eventData && eventData.search && eventData.search.criteria && (e = eventData.search.criteria)),
            e
    },
    "Page - Product Application Version": function () {
        var e = [];
        return window.eventData && eventData.page && eventData.page.productAppVersion ? e.push(eventData.page.productAppVersion) : window.pageData && pageData.page && pageData.page.productAppVersion ? e.push(pageData.page.productAppVersion) : e.push("none"),
            window.eventData && eventData.page && eventData.page.recommenderVersion ? e.push(eventData.page.recommenderVersion) : window.pageData && pageData.page && pageData.page.recommenderVersion ? e.push(pageData.page.recommenderVersion) : e.push("none"),
            e.join("^")
    },
    "Visitor - Account ID": function () {
        return window.pageData && pageData.visitor && pageData.visitor.accountId ? pageData.visitor.accountId : window.eventData && eventData.visitor && eventData.visitor.accountId ? eventData.visitor.accountId : ""
    },
    "Event - Search Results Click Position": function () { return path("eventData.search.resultsPosition"); },
    "Event - AutoSuggest Search Typed Term": function () {
        return window.pageData ? pageData.savedEvents && pageData.savedEvents.autoSuggestTypedTerm ? pageData.savedEvents.autoSuggestTypedTerm : pageData.search && pageData.search.typedTerm ? pageData.search.typedTerm : "" : ""
    },
    "Event - AutoSuggest Search Data": function () {
        return window.pageData ? pageData.savedEvents && pageData.savedEvents.autoSuggestSearchData ? pageData.savedEvents.autoSuggestSearchData : pageData.search && (pageData.search.suggestedLetterCount || pageData.search.suggestedResultCount || pageData.search.suggestedClickPosition) ? ("letterct:" + (pageData.search.suggestedLetterCount || "none") + "|resultct:" + (pageData.search.suggestedResultCount || "none") + "|clickpos:" + (pageData.search.suggestedClickPosition || "none")).toLowerCase() : "" : ""
    },
    "Page - Environment": function () { return path("pageData.page.environment"); },
    "Visitor - App Session ID": function () { return path("pageData.visitor.appSessionId"); },
    "Education - Attempt": function () { return path("eventData.education.attempt"); },
    "Search - Current Page": function () { return path("pageData.search.currentPage"); },
    "Search - Total Results": function () { return path("pageData.search.totalResults"); },
    "Visitor - SIS ID": function () { return path("pageData.visitor.sisId"); },
    "Education - Question ID": function () { return path("eventData.education.questionId"); },
    "Education - Course Section ID and Name": function () {
        for (var e = ["courseSectionId", "courseSectionName"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Page - Type": function () {
        var e = window.pageData && pageData.page && pageData.page.type ? pageData.page.type : "";
        return "article" == e && (e = "CP-" + e),
            e
    },
    "Education - Semester": function () { return path("eventData.education.semester"); },
    "Education - Teaching Material ID and Name": function () {
        var e = "none",
            t = "none",
            n = "none";
        return eventData && eventData.education && (e = eventData.education.teachingMaterialId || "none",
            t = eventData.education.teachingMaterialName || "none",
            n = eventData.education.teachingMaterialType || "none"),
            [e, t, n].join("^")
    },
    "Page - Website Extensions": function () {
        return (window.pageData && pageData.savedEvents && pageData.savedEvents.wx ? pageData.savedEvents.wx.split("|") : []).join("|")
    },
    "Page - Widget Names": function () {
        if (window.eventData && eventData.link && eventData.link.widgetName)
            return eventData.link.widgetName;
        if (window.eventData && eventData.link && eventData.link.widgetNames)
            try {
                return eventData.link.widgetNames.join("|")
            } catch (e) {
                return eventData.link.widgetNames
            }
        else if (window.pageData && pageData.page && pageData.page.widgetNames)
            try {
                return pageData.page.widgetNames.join("|")
            } catch (e) {
                return pageData.page.widgetNames
            }
        return ""
    },
    "Page - Product Name": function () { return path("pageData.page.productName"); },
    "Visitor - Department ID": function () { return path("pageData.visitor.departmentId"); },
    "Education - Exam Group ID and Name": function () {
        for (var e = ["examGroupId", "examGroupName"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Education - Time to Complete": function () { return path("eventData.education.assignmentDuration"); },
    "Event - GenAI Details": function () {
        for (var e = ["inputSource", "inputOrigin", "component", "componentVersion"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.genAI && eventData.genAI[a] ? t.push(eventData.genAI[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Event - Button Type": function () { return path("eventData.buttonType"); },
    "Search - Facet List": function () {
        return pageDataTracker.getSearchFacets()
    },
    "Search - Channel": function () { return path("pageData.search.channel"); },
    "Event - NPS Comment": function () { return path("eventData.nps.comment"); },
    "Event - Survey Comment": function () { return path("eventData.survey.comment"); },
    "Research Networks": function () {
        return window.pageData && pageData.researchNetworks && pageData.researchNetworks.length > 0 ? pageData.researchNetworks.join("|") : ""
    },
    "Education - Self Reflection Score": function () { return path("eventData.education.selfReflectionScore"); },
    "Promo - Clicked ID": function () { return path("window.clickedPromoId"); },
    "Page - Secondary Product Name": function () { return path("pageData.page.secondaryProductName"); },
    "Visitor - Industry": function () { return path("pageData.visitor.industry"); },
    "Form - Type": function () {
        return window.eventData && eventData.form && eventData.form.type ? eventData.form.type : window.pageData && pageData.form && pageData.form.type ? pageData.form.type : ""
    },
    "Visitor - Account Name": function () {
        return window.pageData && pageData.visitor && pageData.visitor.accountName ? pageData.visitor.accountName : window.eventData && eventData.visitor && eventData.visitor.accountName ? eventData.visitor.accountName : ""
    },
    "Support - Topic Name": function () { return path("pageData.support.topicName"); },
    "Education - Category ID and Name": function () {
        for (var e = ["categoryId", "categoryName"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Visitor - Consortium + Account": function () {
        return pageDataTracker.getConsortiumAccountId()
    },
    "Campaign - ID": function () {
        var e = function (e, t = window.location.href) {
            e = e.replace(/[\[\]]/g, "\\$&");
            var n = new RegExp("[?&]" + e + "(=([^&#]*)|&|#|$)").exec(t);
            return n ? n[2] ? decodeURIComponent(n[2].replace(/\+/g, " ")) : "" : null
        },
            t = e("dgcid");
        if (!t)
            for (var n = window.parent, a = 0; a < 5 && n && !(t = e("dgcid", n.location.href)); a++)
                n = n.parent;
        if (!t) {
            var r = e("utm_campaign"),
                i = e("utm_medium"),
                s = e("utm_source"),
                o = e("utm_content");
            (r || i || s) && (t = (s = s || "none") + "_" + (i = i || "none") + "_" + (r = r || "none"),
                o && (t = t + "_" + o))
        }
        return t || (t = e("elsca1") || e("campid") || ""),
            !t && window.pageData && window.pageData.page && window.pageData.page.campaign && (t = window.pageData.page.campaign),
            t && window.sessionStorage && sessionStorage.setItem("dgcid", t),
            t
    },
    "Campaign - Spredfast ID": function () {
        var e = "";
        if (window.location && location.search) {
            var t = location.search.match(/(\?|&)sf([0-9]+)=1/);
            t && t[2] && (e = t[2])
        }
        return e
    },
    "Event - GenAI Answer Details": function () { return path("eventData.genAI.answerDetails"); },
    "Event - Rows Exported Failed": function () { return path("eventData.export.rowsFailed"); },
    "Education - Assignment ID Name and Type": function () {
        for (var e = ["assignmentId", "assignmentName", "assignmentType"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Search - Database": function () { return path("pageData.search.database"); },
    "Education - Score Origin": function () { return path("eventData.education.scoreOrigin"); },
    "Search - Results per Page": function () { return path("pageData.search.resultsPerPage"); },
    "Order - Promo Code": function () { return path("pageData.order.promoCode"); },
    "Page - Journal Info": function () {
        return pageDataTracker.getJournalInfo()
    },
    "Visitor - Superaccount ID": function () { return path("pageData.visitor.superaccountId"); },
    "Visitor - User ID": function () {
        val = '';
        if (pageData && pageData.visitor && pageData.visitor.userId) {
            val = pageData.visitor.userId;
            if (val && val.indexOf('@') !== -1) {
                if (window.pageDataTracker) {
                    val = pageDataTracker.md5(val).substring(0, 16);
                } else {
                    val = ''
                }
                val = 'GDPRFilter:' + val;
            }
        }
        return val;
    },
    "Search - Details": function () { return path("pageData.search.details"); },
    "dgcid-session": function () { return getParam("dgcid"); },
    "Event - Conversion Driver": function () {
        return window.eventData && eventData.conversionDriver && eventData.conversionDriver.name ? eventData.conversionDriver.name : window.pageData && pageData.conversionDriver && pageData.conversionDriver.name ? pageData.conversionDriver.name : window.pageData && pageData.savedEvents && pageData.savedEvents.conversionDriver ? pageData.savedEvents.conversionDriver.name : ""
    },
    "Education - Student and Instructor ID": function () {
        for (var e = ["studentId", "instructorId"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Visitor - Details": function () { return path("pageData.visitor.details"); },
    "Search - Criteria Original": function () { return path("pageData.search.criteria"); },
    "Form - Step + Name": function () {
        return window.eventData && eventData.form && eventData.form.type && eventData.form.step ? eventData.form.type + ":" + eventData.form.step : window.pageData && pageData.form && pageData.form.type && pageData.form.step ? pageData.form.type + ":" + pageData.form.step : ""
    },
    "Visitor - Platform ID": function () { return path("pageData.visitor.platformId"); },
    "Form - Name": function () {
        return window.eventData && eventData.form && eventData.form.name ? eventData.form.name : window.pageData && pageData.form && pageData.form.name ? pageData.form.name : ""
    },
    "nonce": function () { return path("window.nonce"); },
    "Page - Journal Publisher": function () {
        for (var e = ["businessPublisherName", "businessPublisherId", "productionPublisherName", "productionPublisherId"], t = [], n = !0, a = 0; a < e.length; a++) {
            var r = e[a];
            pageData && pageData.journal && pageData.journal[r] ? (t.push(pageData.journal[r]),
                n = !1) : t.push("none")
        }
        return n ? "" : t.join("^")
    },
    "Page - Error Type": function () {
        if (window.pageData && pageData.page) {
            if (pageData.page && pageData.page.errorType)
                return pageData.page.errorType;
            if (pageData.form && pageData.form.errorType)
                return pageData.form.errorType
        }
        if (window.eventData && eventData.page) {
            if (eventData.page && eventData.page.errorType)
                return eventData.page.errorType;
            if (eventData.form && eventData.form.errorType)
                return eventData.form.errorType
        }
        return ""
    },
    "Visitor - Login Status": function () { return path("pageData.visitor.loginStatus"); },
    "Page - Do Not Track": function () { return path("pageData.page.noTracking"); },
    "Event - Alert Type": function () {
        return window.eventData && eventData.alert && (eventData.alert.frequency || eventData.alert.type) ? (eventData.alert.frequency || "no frequency") + "|" + (eventData.alert.type || "no type") : ""
    },
    "Education - Exam ID Name and Type": function () {
        for (var e = ["examId", "examName", "examType"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "mcmid - pass params": function () {
        return console.log("\xa5\xa5\xa5\xa5\xa5\xa5\xa5\xa5\xa5\xa5\xa5 code executed data element ?????????????"),
            !0
    },
    "Visitor - Department Name": function () { return path("pageData.visitor.departmentName"); },
    "Search - Within Results Criteria": function () { return path("pageData.search.withinResultsCriteria"); },
    "Event - Link Name": function () { return path("eventData.link.name"); },
    "Page - Language": function () { return path("pageData.page.language"); },
    "Email - Recipient ID": function () { return getParam("eid"); },
    "Page - Extended Page Name": function () {
        if (window.pageData && pageData.page && pageData.page.productName && pageData.page.extendedName)
            return pageData.page.productName + ":" + pageData.page.extendedName
    },
    "Page - Load Time": function () { return path("pageData.page.loadTime"); },
    "Support - Search Criteria": function () { return path("pageData.support.searchCriteria"); },
    "Event - LinkOut Destination": function () { return path("eventData.linkOut"); },
    "Page - Name": function () { return path("pageData.page.name"); },
    "Event - AutoSuggest Search Selected Term": function () {
        return window.pageData ? pageData.savedEvents && pageData.savedEvents.autoSuggestSelectedTerm ? pageData.savedEvents.autoSuggestSelectedTerm : pageData.search && pageData.search.selectedTerm ? pageData.search.selectedTerm : "" : ""
    },
    "Page - Analytics Pagename": function () { return path("pageData.page.analyticsPagename"); },
    "Education - Benchmark Score": function () { return path("eventData.education.benchmarkScore"); },
    "Education - Generic Settings Name and Value": function () {
        for (var e = ["genericSettingsName", "genericSettingsValue"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Event - NPS Score": function () { return path("eventData.nps.score"); },
    "Source": function () { return "sb-wsdk"; },
    "Page - Test ID": function () {
        var e = [];
        window.pageData && pageData.page && pageData.page.testId && e.push(pageData.page.testId);
        try {
            if (pageData.page.productName.toLowerCase(),
                window.targetData) {
                var t = window.targetData;
                Object.keys(t).forEach((function (n) {
                    e.push(t[n]["activity.name"] + ">" + t[n]["experience.name"])
                }))
            }
        } catch (e) {
            _satellite.notify("Page - Test ID: " + e.message)
        }
        return e.join("|")
    },
    "Order - Payment Method": function () { return path("pageData.order.paymentMethod"); },
    "Visitor - Access Type": function () {
        return window.pageData && pageData.visitor && pageData.visitor.accessType ? pageData.visitor.accessType : window.eventData && eventData.visitor && eventData.visitor.accessType ? eventData.visitor.accessType : ""
    },
    "Promo - IDs": function () {
        for (var e = document.getElementsByTagName("a"), t = [], n = 0; n < e.length; n++) {
            var a = e[n].getAttribute("data-sc-promo-id");
            a && t.push(a)
        }
        if (window.pageData && pageData.cta && pageData.cta.ids)
            for (n = 0; n < pageData.cta.ids.length; n++)
                t.push(pageData.cta.ids[n]);
        if (window.eventData && eventData.cta && eventData.cta.ids)
            for (n = 0; n < eventData.cta.ids.length; n++)
                t.push(eventData.cta.ids[n]);
        return t.join("|")
    },
    "Visitor - TMX Request ID": function () { return path("pageData.visitor.tmxRequestId"); },
    "Visitor - Product ID": function () { return path("pageData.visitor.productId"); },
    "Page - Business Unit": function () { return path("pageData.page.businessUnit"); },
    "Event - Updated User Fields": function () { return path("eventData.user.fieldsUpdated"); },
    "Education - Course ID and Name": function () {
        for (var e = ["courseId", "courseName"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Page - Currency Code": function () { return path("pageData.page.currencyCode"); },
    "Form - Error Type": function () { return path("eventData.form.errorType"); },
    "Event - Step": function () { return path("eventData.step"); },
    "Search - Advanced Criteria": function () { return path("pageData.search.advancedCriteria"); },
    "Page - Online State": function () { return path("pageData.page.onlineState"); },
    "Event - Alert Details": function () { return path("eventData.alert.details"); },
    "Order - ID": function () { return path("pageData.order.id"); },
    "Visitor - Login Success": function () { return path("pageData.visitor.loginSuccess"); },
    "Education - Test Question": function () { return path("eventData.education.testQuestion"); },
    "Education - Content ID": function () {
        var e = "none^none^none^none^none^none^none^" + eventData.education.contentId;
        return pageDataTracker.stripProductDelimiters(e).toLowerCase()
    },
    "Event - Feature Name": function () { return path("eventData.feature.name"); },
    "Page - Tabs": function () {
        return window.eventData && eventData.page && (eventData.page.currentTab || eventData.page.openTabs) ? (eventData.page.currentTab ? eventData.page.currentTab : "none") + "|" + (eventData.page.openTabs ? eventData.page.openTabs : "none") : window.pageData && pageData.page && (pageData.page.currentTab || pageData.page.openTabs) ? (pageData.page.currentTab ? pageData.page.currentTab : "none") + "|" + (pageData.page.openTabs ? pageData.page.openTabs : "none") : ""
    },
    "Event - Survey Meta Data": function () {
        for (var e = ["type", "targeting", "question"], t = [], n = 0; n < e.length; n++) {
            var a = e[n];
            eventData && eventData.survey && eventData.survey[a] ? t.push(eventData.survey[a]) : t.push("none")
        }
        return t.join("^")
    },
    "Visitor - TMX Device ID": function () { return path("pageData.visitor.tmxDeviceId"); },
    "Event - Share Platform": function () { return path("eventData.sharePlatform"); },
    "Maturity Level": function () { return "1"; },
    "serverState": function () { return path("serverState"); },
    "Search - Result Types": function () {
        return pageDataTracker.getSearchResultsByType()
    },
    "Event - Rows Exported": function () { return path("eventData.export.rows"); },
    "Search - Feature Used": function () { return path("eventData.search.featureName"); },
    "Education - Assignment Origin": function () { return path("eventData.education.assignmentOrigin"); },
};

/**
 * Resolves a data element value.
 * Priority:
 * 1. Checks if window._satellite.getVar(name) returns a value (external override).
 * 2. Checks internal dataElements[name] (codified).
 * 3. Returns undefined if neither found.
 * 
 * @param {string} name - Name of the data element
 * @returns {*} - The resolved value
 */
export function resolveDataElement(name) {
    // 1. Check for external override
    try {
        if (window._satellite && typeof window._satellite.getVar === 'function') {
            const override = window._satellite.getVar(name);
            if (override !== undefined && override !== null && override !== '') {
                // Return override if it's a valid value.
                // Note: getVar might return null or empty string for valid but empty vars, 
                // but usually we want to fallback if it returns nothing useful.
                return override;
            }
        }
    } catch (e) {
        // Ignore errors from external satellite
    }

    // 2. Check internal codified data elements
    if (dataElements.hasOwnProperty(name)) {
        const item = dataElements[name];
        if (typeof item === 'function') {
            try {
                return item();
            } catch (e) {
                console.error(`Error executing internal data element "${name}":`, e);
                return '';
            }
        } else {
            return item;
        }
    }

    return undefined;
}
