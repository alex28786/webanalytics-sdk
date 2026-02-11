var dataElements = {
    "Email - Broadlog ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/queryStringParameter.js",
        settings: {
            name: "bid",
            caseInsensitive: !0
        }
    },
    "Visitor - Superaccount Name": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.superaccountName"
        }
    },
    "Visitor - Platform Name": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.platformName"
        }
    },
    "Education - Time Since Last Attempt": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.timeSinceLastAttempt"
        }
    },
    "Event - GenAI Input": {
        forceLowerCase: !0,
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.genAI.input"
        }
    },
    "Email - Message ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/queryStringParameter.js",
        settings: {
            name: "cid",
            caseInsensitive: !0
        }
    },
    "Education - Days Before / After Due Date": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.beforeAfterDueDate"
        }
    },
    "Education - Question Type": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.questionType"
        }
    },
    "Visitor - IP Address": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.ipAddress"
        }
    },
    "Education - Module ID and Name": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["moduleId", "moduleName"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Search - Sort Type": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.sortType"
        }
    },
    "Education - Assignment Numeric Grade": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.assignmentNumericGrade"
        }
    },
    "Education - Packet ID and Name": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["packetId", "packetName"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Event - GenAI ConversationId+PromptCounter": {
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["conversationId", "promptCounter"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.genAI && eventData.genAI[a] ? t.push(eventData.genAI[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Page - Context Domain": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["contextDomain", "host", "version", "platform"], t = [], n = !1, a = 0; a < e.length; a++) {
                    var r = e[a];
                    pageData && pageData.page && pageData.page[r] ? (t.push(pageData.page[r]),
                        n = !0) : t.push("none")
                }
                return n ? t.join("^") : ""
            }
        }
    },
    "Event - Sync Duration": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.sync.duration"
        }
    },
    "Event - Navigation Link Name": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.navigationLink.name"
        }
    },
    "Education - Days Until Due": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.daysUntilDue"
        }
    },
    "Event - Action Name": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.action.name"
        }
    },
    "Visitor - Consortium ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.consortiumId"
        }
    },
    "Search - Within Content Criteria": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.withinContentCriteria"
        }
    },
    "Search - Type": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.type"
        }
    },
    "Search - Facet Operation": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.facetOperation"
        }
    },
    "Event - Sync Method": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.sync.method"
        }
    },
    "Page - UX Properties": {
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.isResponsive"
        }
    },
    "Event - LinkOut Referring Product": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.referringProduct"
        }
    },
    "Search - Data Form Criteria": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.dataFormCriteria"
        }
    },
    "Education - Program ID and Name": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["programId", "programName"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Page - Load Timestamp": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.loadTimestamp"
        }
    },
    "Education - Maximum Packets Issued": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.maxPackets"
        }
    },
    "Page - Section Name": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.sectionName"
        }
    },
    "Event - Survey Score": {
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.survey.score"
        }
    },
    "Education - Assignment Duration and Score": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["assignmentDuration", "assignmentScore"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Search - Criteria": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                var e = "";
                return window.pageData && (pageData.search && (e = pageData.search.criteria || ""),
                    !e && pageData.savedEvents && (e = pageData.savedEvents.autoSuggestSearchTerm || ""),
                    !e && window.eventData && eventData.search && eventData.search.criteria && (e = eventData.search.criteria)),
                    e
            }
        }
    },
    "Page - Product Application Version": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                var e = [];
                return window.eventData && eventData.page && eventData.page.productAppVersion ? e.push(eventData.page.productAppVersion) : window.pageData && pageData.page && pageData.page.productAppVersion ? e.push(pageData.page.productAppVersion) : e.push("none"),
                    window.eventData && eventData.page && eventData.page.recommenderVersion ? e.push(eventData.page.recommenderVersion) : window.pageData && pageData.page && pageData.page.recommenderVersion ? e.push(pageData.page.recommenderVersion) : e.push("none"),
                    e.join("^")
            }
        }
    },
    "Visitor - Account ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.pageData && pageData.visitor && pageData.visitor.accountId ? pageData.visitor.accountId : window.eventData && eventData.visitor && eventData.visitor.accountId ? eventData.visitor.accountId : ""
            }
        }
    },
    "Event - Search Results Click Position": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.search.resultsPosition"
        }
    },
    "Event - AutoSuggest Search Typed Term": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.pageData ? pageData.savedEvents && pageData.savedEvents.autoSuggestTypedTerm ? pageData.savedEvents.autoSuggestTypedTerm : pageData.search && pageData.search.typedTerm ? pageData.search.typedTerm : "" : ""
            }
        }
    },
    "Event - AutoSuggest Search Data": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.pageData ? pageData.savedEvents && pageData.savedEvents.autoSuggestSearchData ? pageData.savedEvents.autoSuggestSearchData : pageData.search && (pageData.search.suggestedLetterCount || pageData.search.suggestedResultCount || pageData.search.suggestedClickPosition) ? ("letterct:" + (pageData.search.suggestedLetterCount || "none") + "|resultct:" + (pageData.search.suggestedResultCount || "none") + "|clickpos:" + (pageData.search.suggestedClickPosition || "none")).toLowerCase() : "" : ""
            }
        }
    },
    "Page - Environment": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.environment"
        }
    },
    "Visitor - App Session ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.appSessionId"
        }
    },
    "Education - Attempt": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.attempt"
        }
    },
    "Search - Current Page": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.currentPage"
        }
    },
    "Search - Total Results": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.totalResults"
        }
    },
    "Visitor - SIS ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.sisId"
        }
    },
    "Education - Question ID": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.questionId"
        }
    },
    "Education - Course Section ID and Name": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["courseSectionId", "courseSectionName"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Page - Type": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                var e = window.pageData && pageData.page && pageData.page.type ? pageData.page.type : "";
                return "article" == e && (e = "CP-" + e),
                    e
            }
        }
    },
    "Education - Semester": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.semester"
        }
    },
    "Education - Teaching Material ID and Name": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                var e = "none",
                    t = "none",
                    n = "none";
                return eventData && eventData.education && (e = eventData.education.teachingMaterialId || "none",
                    t = eventData.education.teachingMaterialName || "none",
                    n = eventData.education.teachingMaterialType || "none"),
                    [e, t, n].join("^")
            }
        }
    },
    "Page - Website Extensions": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return (window.pageData && pageData.savedEvents && pageData.savedEvents.wx ? pageData.savedEvents.wx.split("|") : []).join("|")
            }
        }
    },
    "Page - Widget Names": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
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
            }
        }
    },
    "Page - Product Name": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.productName"
        }
    },
    "Visitor - Department ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.departmentId"
        }
    },
    "Education - Exam Group ID and Name": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["examGroupId", "examGroupName"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Education - Time to Complete": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.assignmentDuration"
        }
    },
    "Event - GenAI Details": {
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["inputSource", "inputOrigin", "component", "componentVersion"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.genAI && eventData.genAI[a] ? t.push(eventData.genAI[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Event - Button Type": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.buttonType"
        }
    },
    "Search - Facet List": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return pageDataTracker.getSearchFacets()
            }
        }
    },
    "Search - Channel": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.channel"
        }
    },
    "Event - NPS Comment": {
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.nps.comment"
        }
    },
    "Event - Survey Comment": {
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.survey.comment"
        }
    },
    "Research Networks": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.pageData && pageData.researchNetworks && pageData.researchNetworks.length > 0 ? pageData.researchNetworks.join("|") : ""
            }
        }
    },
    "Education - Self Reflection Score": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.selfReflectionScore"
        }
    },
    "Promo - Clicked ID": {
        defaultValue: "",
        forceLowerCase: !0,
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "window.clickedPromoId"
        }
    },
    "Page - Secondary Product Name": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.secondaryProductName"
        }
    },
    "Visitor - Industry": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.industry"
        }
    },
    "Form - Type": {
        defaultValue: "",
        forceLowerCase: !0,
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.eventData && eventData.form && eventData.form.type ? eventData.form.type : window.pageData && pageData.form && pageData.form.type ? pageData.form.type : ""
            }
        }
    },
    "Visitor - Account Name": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.pageData && pageData.visitor && pageData.visitor.accountName ? pageData.visitor.accountName : window.eventData && eventData.visitor && eventData.visitor.accountName ? eventData.visitor.accountName : ""
            }
        }
    },
    "Support - Topic Name": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.support.topicName"
        }
    },
    "Education - Category ID and Name": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["categoryId", "categoryName"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Visitor - Consortium + Account": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return pageDataTracker.getConsortiumAccountId()
            }
        }
    },
    "Campaign - ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
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
            }
        }
    },
    "Campaign - Spredfast ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                var e = "";
                if (window.location && location.search) {
                    var t = location.search.match(/(\?|&)sf([0-9]+)=1/);
                    t && t[2] && (e = t[2])
                }
                return e
            }
        }
    },
    "Event - GenAI Answer Details": {
        forceLowerCase: !0,
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.genAI.answerDetails"
        }
    },
    "Event - Rows Exported Failed": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.export.rowsFailed"
        }
    },
    "Education - Assignment ID Name and Type": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["assignmentId", "assignmentName", "assignmentType"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Search - Database": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.database"
        }
    },
    "Education - Score Origin": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.scoreOrigin"
        }
    },
    "Search - Results per Page": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.resultsPerPage"
        }
    },
    "Order - Promo Code": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.order.promoCode"
        }
    },
    "Page - Journal Info": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return pageDataTracker.getJournalInfo()
            }
        }
    },
    "Visitor - Superaccount ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.superaccountId"
        }
    },
    "Visitor - User ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return val = "",
                    pageData && pageData.visitor && pageData.visitor.userId && (val = pageData.visitor.userId,
                        val && -1 !== val.indexOf("@") && (window.pageDataTracker ? val = pageDataTracker.md5(val).substring(0, 16) : val = "",
                            val = "GDPRFilter:" + val)),
                    val
            }
        }
    },
    "Search - Details": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.details"
        }
    },
    "dgcid-session": {
        defaultValue: "",
        storageDuration: "session",
        modulePath: "core/src/lib/dataElements/queryStringParameter.js",
        settings: {
            name: "dgcid",
            caseInsensitive: !0
        }
    },
    "Event - Conversion Driver": {
        defaultValue: "",
        forceLowerCase: !0,
        cleanText: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.eventData && eventData.conversionDriver && eventData.conversionDriver.name ? eventData.conversionDriver.name : window.pageData && pageData.conversionDriver && pageData.conversionDriver.name ? pageData.conversionDriver.name : window.pageData && pageData.savedEvents && pageData.savedEvents.conversionDriver ? pageData.savedEvents.conversionDriver.name : ""
            }
        }
    },
    "Education - Student and Instructor ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["studentId", "instructorId"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Visitor - Details": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.details"
        }
    },
    "Search - Criteria Original": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.criteria"
        }
    },
    "Form - Step + Name": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.eventData && eventData.form && eventData.form.type && eventData.form.step ? eventData.form.type + ":" + eventData.form.step : window.pageData && pageData.form && pageData.form.type && pageData.form.step ? pageData.form.type + ":" + pageData.form.step : ""
            }
        }
    },
    "Visitor - Platform ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.platformId"
        }
    },
    "Form - Name": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.eventData && eventData.form && eventData.form.name ? eventData.form.name : window.pageData && pageData.form && pageData.form.name ? pageData.form.name : ""
            }
        }
    },
    nonce: {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "window.nonce"
        }
    },
    "Page - Journal Publisher": {
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["businessPublisherName", "businessPublisherId", "productionPublisherName", "productionPublisherId"], t = [], n = !0, a = 0; a < e.length; a++) {
                    var r = e[a];
                    pageData && pageData.journal && pageData.journal[r] ? (t.push(pageData.journal[r]),
                        n = !1) : t.push("none")
                }
                return n ? "" : t.join("^")
            }
        }
    },
    "Page - Error Type": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
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
            }
        }
    },
    "Visitor - Login Status": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.loginStatus"
        }
    },
    "Page - Do Not Track": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.noTracking"
        }
    },
    "Event - Alert Type": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.eventData && eventData.alert && (eventData.alert.frequency || eventData.alert.type) ? (eventData.alert.frequency || "no frequency") + "|" + (eventData.alert.type || "no type") : ""
            }
        }
    },
    "Education - Exam ID Name and Type": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["examId", "examName", "examType"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "mcmid - pass params": {
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return console.log("\xa5\xa5\xa5\xa5\xa5\xa5\xa5\xa5\xa5\xa5\xa5 code executed data element ?????????????"),
                    !0
            }
        }
    },
    "Visitor - Department Name": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.departmentName"
        }
    },
    "Search - Within Results Criteria": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.withinResultsCriteria"
        }
    },
    "Event - Link Name": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.link.name"
        }
    },
    "Page - Language": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.language"
        }
    },
    "Email - Recipient ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/queryStringParameter.js",
        settings: {
            name: "eid",
            caseInsensitive: !0
        }
    },
    "Page - Extended Page Name": {
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                if (window.pageData && pageData.page && pageData.page.productName && pageData.page.extendedName)
                    return pageData.page.productName + ":" + pageData.page.extendedName
            }
        }
    },
    "Page - Load Time": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.loadTime"
        }
    },
    "Support - Search Criteria": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.support.searchCriteria"
        }
    },
    "Event - LinkOut Destination": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.linkOut"
        }
    },
    "Page - Name": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.name"
        }
    },
    "Event - AutoSuggest Search Selected Term": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.pageData ? pageData.savedEvents && pageData.savedEvents.autoSuggestSelectedTerm ? pageData.savedEvents.autoSuggestSelectedTerm : pageData.search && pageData.search.selectedTerm ? pageData.search.selectedTerm : "" : ""
            }
        }
    },
    "Page - Analytics Pagename": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.analyticsPagename"
        }
    },
    "Education - Benchmark Score": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.benchmarkScore"
        }
    },
    "Education - Generic Settings Name and Value": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["genericSettingsName", "genericSettingsValue"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Event - NPS Score": {
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.nps.score"
        }
    },
    Source: {
        modulePath: "core/src/lib/dataElements/constant.js",
        settings: {
            value: "sb-wsdk"
        }
    },
    "Page - Test ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
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
            }
        }
    },
    "Order - Payment Method": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.order.paymentMethod"
        }
    },
    "Visitor - Access Type": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.pageData && pageData.visitor && pageData.visitor.accessType ? pageData.visitor.accessType : window.eventData && eventData.visitor && eventData.visitor.accessType ? eventData.visitor.accessType : ""
            }
        }
    },
    "Promo - IDs": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
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
            }
        }
    },
    "Visitor - TMX Request ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.tmxRequestId"
        }
    },
    "Visitor - Product ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.productId"
        }
    },
    "Page - Business Unit": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.businessUnit"
        }
    },
    "Event - Updated User Fields": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.user.fieldsUpdated"
        }
    },
    "Education - Course ID and Name": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["courseId", "courseName"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.education && eventData.education[a] ? t.push(eventData.education[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Page - Currency Code": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.currencyCode"
        }
    },
    "Form - Error Type": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.form.errorType"
        }
    },
    "Event - Step": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.step"
        }
    },
    "Search - Advanced Criteria": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.search.advancedCriteria"
        }
    },
    "Page - Online State": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.page.onlineState"
        }
    },
    "Event - Alert Details": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.alert.details"
        }
    },
    "Order - ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.order.id"
        }
    },
    "Visitor - Login Success": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.loginSuccess"
        }
    },
    "Education - Test Question": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.testQuestion"
        }
    },
    "Education - Content ID": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                var e = "none^none^none^none^none^none^none^" + eventData.education.contentId;
                return pageDataTracker.stripProductDelimiters(e).toLowerCase()
            }
        }
    },
    "Event - Feature Name": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.feature.name"
        }
    },
    "Page - Tabs": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return window.eventData && eventData.page && (eventData.page.currentTab || eventData.page.openTabs) ? (eventData.page.currentTab ? eventData.page.currentTab : "none") + "|" + (eventData.page.openTabs ? eventData.page.openTabs : "none") : window.pageData && pageData.page && (pageData.page.currentTab || pageData.page.openTabs) ? (pageData.page.currentTab ? pageData.page.currentTab : "none") + "|" + (pageData.page.openTabs ? pageData.page.openTabs : "none") : ""
            }
        }
    },
    "Event - Survey Meta Data": {
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                for (var e = ["type", "targeting", "question"], t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    eventData && eventData.survey && eventData.survey[a] ? t.push(eventData.survey[a]) : t.push("none")
                }
                return t.join("^")
            }
        }
    },
    "Visitor - TMX Device ID": {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "pageData.visitor.tmxDeviceId"
        }
    },
    "Event - Share Platform": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.sharePlatform"
        }
    },
    "Maturity Level": {
        modulePath: "core/src/lib/dataElements/constant.js",
        settings: {
            value: "1"
        }
    },
    serverState: {
        defaultValue: "",
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "serverState"
        }
    },
    "Search - Result Types": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/customCode.js",
        settings: {
            source: function () {
                return pageDataTracker.getSearchResultsByType()
            }
        }
    },
    "Event - Rows Exported": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.export.rows"
        }
    },
    "Search - Feature Used": {
        defaultValue: "",
        forceLowerCase: !0,
        storageDuration: "pageview",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.search.featureName"
        }
    },
    "Education - Assignment Origin": {
        defaultValue: "",
        modulePath: "core/src/lib/dataElements/javascriptVariable.js",
        settings: {
            path: "eventData.education.assignmentOrigin"
        }
    }
};