import { pageDataTracker } from '../core/tracker.js';
import { resolveDataElement } from './data-elements.js';

function resolveTrackValue(val) {
    if (typeof val !== "string") return val;
    const m = val.match(/^\^(.+)\^$/);
    if (m && m[1]) {
        return resolveDataElement(m[1]) || '';
    }
    return val; // includes literals like "D=c29" or plain strings
}

export function applyRuleToS(s, rule, eventName) {
    if (!rule || !s) return;

    // 1) track variables
    if (rule.track && typeof rule.track === "object") {
        try {
            Object.keys(rule.track).forEach((varName) => {
                const resolved = resolveTrackValue(rule.track[varName]);
                s[varName] = resolved;
                // ensure tracked
                if (s.apl) {
                    s.linkTrackVars = s.apl(s.linkTrackVars, varName, ",", 1);
                }
            });
        } catch (e) {
            try { window._satellite && _satellite.logger && _satellite.logger.log(`applyRuleToS(track) error for "${eventName}": ${e && e.message}`); } catch (_) { }
        }
    }

    // 2) events
    if (Array.isArray(rule.events)) {
        try {
            rule.events.forEach((evt) => {
                const str = String(evt);
                const eventId = str.split("=")[0];
                if (s.apl) {
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, eventId, ",", 1);
                    s.events = s.apl(s.events, str, ",", 1);
                }
            });
        } catch (e) {
            try { window._satellite && _satellite.logger && _satellite.logger.log(`applyRuleToS(events) error for "${eventName}": ${e && e.message}`); } catch (_) { }
        }
    }

    // 3) optional custom code
    if (typeof rule.run === "function") {
        try {
            rule.run(s);
        } catch (e) {
            try { window._satellite && _satellite.logger && _satellite.logger.log(`applyRuleToS(run) error for "${eventName}": ${e && e.message}`); } catch (_) { }
        }
    }
}

export const rules = {
    accessCodeGeneration: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event286"],
        run: function (s) {
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event290', ',', 1);
            s.events = s.apl(s.events, 'event290=' + resolveDataElement("Education - Time to Complete"), ',', 1);
        }
    },
    accountAssociationStart: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "D=c1",
            "eVar33": "^Visitor - Access Type^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "D=v7"
        },
        events: ["event333"]
    },
    assessmentCompleted: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar183": "^Education - Course Section ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event263"]
    },
    assessmentStarted: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar183": "^Education - Course Section ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event262"]
    },
    assignmentAssigned: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar168": "^Education - Semester^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar183": "^Education - Course Section ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event256"]
    },
    assignmentAttempted: {
        track: {
            "eVar165": "^Education - Program ID and Name^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^",
            "prop1": "^Visitor - Account ID^"
        },
        events: ["event256"]
    },
    assignmentCompleted: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar167": "^Education - Days Before / After Due Date^",
            "eVar168": "^Education - Semester^",
            "eVar171": "^Education - Assignment Duration and Score^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event252"],
        run: function (s) {
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event277', ',', 1);
            s.events = s.apl(s.events, 'event277=' + resolveDataElement("Education - Time Since Last Attempt"), ',', 1);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event290', ',', 1);
            s.events = s.apl(s.events, 'event290=' + resolveDataElement("Education - Time to Complete"), ',', 1);
        }
    },
    assignmentCreated: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar183": "^Education - Course Section ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event270"]
    },
    assignmentGraded: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar183": "^Education - Course Section ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event259"],
        run: function (s) {
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event260', ',', 1);
            s.events = s.apl(s.events, 'event260=' + resolveDataElement("Education - Assignment Numeric Grade"), ',', 1);
        }
    },
    assignmentNumericGrade: {
        track: {
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^",
            "prop1": "^Visitor - Account ID^"
        },
        run: function (s) {
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event260', ',', 1);
            s.events = s.apl(s.events, 'event260=' + resolveDataElement("Education - Assignment Numeric Grade"), ',', 1);
        }
    },
    assignmentReassigned: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar183": "^Education - Course Section ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event261"]
    },
    assignmentReceived: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar167": "^Education - Days Before / After Due Date^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar183": "^Education - Course Section ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event251"]
    },
    assignmentStarted: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar183": "^Education - Course Section ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event258"]
    },
    associated: {
        events: ["event200"]
    },
    associationStart: {
        events: ["event199"]
    },
    autoSuggestTermClicked: {
        events: ["event233"],
        run: function (s) {
            if (window.eventData && eventData.search) {
                s.eVar27 = 'letterct:' + (eventData.search.suggestedLetterCount || 'none') +
                    '|resultct:' + (eventData.search.suggestedResultCount || 'none') +
                    '|clickpos:' + (eventData.search.suggestedClickPosition || 'none');

                s.eVar157 = (eventData.search.typedTerm || '');
                s.eVar156 = (eventData.search.selectedTerm || '');
                s.eVar162 = (eventData.search.autoSuggestCategory || '');
                s.eVar163 = (eventData.search.autoSuggestDetails || '');

                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar27', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar157', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar156', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar162', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar163', ',', 2);
            }
        }
    },
    buttonClick: {
        events: ["event204"],
        run: function (s) {
            s.eVar124 = resolveDataElement('Event - Button Type');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar124', ',', 2);
        }
    },
    buttonHover: {
        events: ["event269"],
        run: function (s) {
            s.eVar124 = resolveDataElement('Event - Button Type');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar124', ',', 2);
        }
    },
    cartAdd: {
        events: ["scAdd", "scOpen", "event20"]
    },
    cartRemove: {
        events: ["scRemove"]
    },
    categoryCompleted: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar167": "^Education - Days Before / After Due Date^",
            "eVar168": "^Education - Semester^",
            "eVar171": "^Education - Assignment Duration and Score^",
            "eVar182": "^Education - Attempt^",
            "eVar192": "^Education - Category ID and Name^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event271"],
        run: function (s) {
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event260', ',', 1);
            s.events = s.apl(s.events, 'event260=' + resolveDataElement("Education - Assignment Numeric Grade"), ',', 1);
        }
    },
    claimProfile: {
        events: ["event172"]
    },
    claimStart: {
        events: ["event213"]
    },
    closeTab: {
        events: ["event215"],
        run: function (s) {
            s.eVar143 = resolveDataElement('Page - Tabs');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar143', ',', 2);
        }
    },
    cohortReport: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar171": "^Education - Assignment Duration and Score^",
            "eVar183": "^Education - Course Section ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event289"],
        run: function (s) {
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event290', ',', 1);
            s.events = s.apl(s.events, 'event290=' + resolveDataElement("Education - Time to Complete"), ',', 1);
        }
    },
    compLogin: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar78": "^Visitor - Details^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar178": "^Education - Course ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event298"]
    },
    contentAddition: {
        events: ["event79"]
    },
    contentAdditionStart: {
        events: ["event188"]
    },
    contentAdditionStep: {
        events: ["event189"],
        run: function (s) {
            s.eVar112 = resolveDataElement('Event - Step');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar112', ',', 2);
        }
    },
    contentCitationChange: {
        events: ["event253"]
    },
    contentDeletion: {
        events: ["event231"]
    },
    contentDismissal: {
        events: ["event241"]
    },
    contentDownload: {
        events: ["event19", "event182"]
    },
    contentDownloadRequest: {
        events: ["event318", "event319"]
    },
    contentDownloadStart: {
        events: ["event123"]
    },
    contentEdited: {
        events: ["event190"]
    },
    contentEditStart: {
        events: ["event191"]
    },
    contentExport: {
        track: {
            "eVar69": "^Event - Rows Exported^"
        },
        events: ["event39"],
        run: function (s) {
            var rows = resolveDataElement('Event - Rows Exported');
            if (rows) {
                s.events = s.apl(s.events, 'event246=' + rows, ',', 2);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event246', ',', 2);
            }

            var rowsFailed = resolveDataElement('Event - Rows Exported Failed');
            if (rowsFailed) {
                s.events = s.apl(s.events, 'event334=' + rowsFailed, ',', 2);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event334', ',', 2);
            }
        }
    },
    contentExportStart: {
        track: {
            "eVar69": "^Event - Rows Exported^"
        },
        events: ["event125"]
    },
    contentImport: {
        events: ["event79"]
    },
    contentInteraction: {
        track: {
            "prop53": "^Event - Action Name^"
        }
    },
    contentInteractionStep: {
        events: ["event189"],
        run: function (s) {
            s.eVar112 = resolveDataElement('Event - Step');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar112', ',', 2);
        }
    },
    contentLinkClick: {
        track: {
            "prop23": "^Event - Action Name^"
        },
        events: ["event87"]
    },
    contentPrint: {
        events: ["event80"]
    },
    contentSelection: {
        events: ["event232"]
    },
    contentShare: {
        track: {
            "eVar30": "^Event - Share Platform^"
        },
        events: ["event11"]
    },
    contentShareStart: {
        events: ["event206"]
    },
    contentTabClick: {
        track: {
            "prop20": "^Event - Tab Name^"
        }
    },
    contentView: {
        events: ["event5"]
    },
    contentWindowLoad: {
        track: {
            "prop20": "^Event - Tab Name^"
        },
        events: ["event5", "event84"]
    },
    conversionDriverClick: {
        run: function (s) {
            s.eVar103 = resolveDataElement('Event - Conversion Driver');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar103', ',', 2);

            s.eVar110 = 'D=pageName';
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar110', ',', 2);
        }
    },
    copyToClipboard: {
        events: ["event210"]
    },
    ctaClick: {
        events: ["event22"],
        run: function (s) {
            if (window.eventData && eventData.cta && eventData.cta.ids) {
                if (eventData.cta.ids.length > 0) {
                    window.clickedPromoId = eventData.cta.ids[0];
                }
            }
        }
    },
    ctaImpression: {
        events: ["event21"]
    },
    deleteAlert: {
        track: {
            "eVar1": "^Search - Criteria^",
            "eVar97": "^Event - Alert Type^",
            "eVar191": "^Event - Alert Details^",
            "prop21": "^Search - Criteria^"
        },
        events: ["event237"]
    },
    deleteAlertStart: {
        track: {
            "eVar1": "^Search - Criteria^",
            "eVar97": "^Event - Alert Type^",
            "eVar191": "^Event - Alert Details^",
            "prop21": "^Search - Criteria^"
        },
        events: ["event238"]
    },
    editAlert: {
        track: {
            "eVar1": "^Search - Criteria^",
            "eVar97": "^Event - Alert Type^",
            "eVar191": "^Event - Alert Details^",
            "prop21": "^Search - Criteria^"
        },
        events: ["event235"]
    },
    editAlertStart: {
        track: {
            "eVar1": "^Search - Criteria^",
            "eVar97": "^Event - Alert Type^",
            "eVar191": "^Event - Alert Details^",
            "prop21": "^Search - Criteria^"
        },
        events: ["event236"]
    },
    educationLogin: {
        track: {
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar168": "^Education - Semester^"
        },
        events: ["event23"]
    },
    examCompleted: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar167": "^Education - Days Before / After Due Date^",
            "eVar171": "^Education - Assignment Duration and Score^",
            "eVar182": "^Education - Attempt^",
            "eVar188": "^Education - Time Since Last Attempt^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event272"],
        run: function (s) {
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event260', ',', 1);
            s.events = s.apl(s.events, 'event260=' + resolveDataElement("Education - Assignment Numeric Grade"), ',', 1);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event290', ',', 1);
            s.events = s.apl(s.events, 'event290=' + resolveDataElement("Education - Time to Complete"), ',', 1);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event277', ',', 1);
            s.events = s.apl(s.events, 'event277=' + resolveDataElement("Education - Time Since Last Attempt"), ',', 1);
        }
    },
    examCreated: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar167": "^Education - Days Before / After Due Date^",
            "eVar171": "^Education - Assignment Duration and Score^",
            "eVar182": "^Education - Attempt^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event297"]
    },
    examStarted: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar167": "^Education - Days Before / After Due Date^",
            "eVar171": "^Education - Assignment Duration and Score^",
            "eVar182": "^Education - Attempt^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event296"]
    },
    rowsExported: {
        track: {
            "eVar69": "^Event - Rows Exported^"
        },
        events: ["event39"]
    },
    followProfile: {
        events: ["event247"]
    },
    formError: {
        track: {
            "eVar43": "^Form - Error Type^"
        },
        events: ["event26"]
    },
    formStart: {
        track: {
            "eVar102": "^Form - Type^"
        },
        events: ["event50"]
    },
    formSubmit: {
        track: {
            "eVar102": "^Form - Type^"
        },
        events: ["event47"]
    },
    formView: {
        track: {
            "eVar4": "^Page - Product Name^",
            "eVar102": "^Form - Type^",
            "prop2": "^Page - Product Name^"
        }
    },
    genAIClosed: {
        events: ["event347"]
    },
    genAIContentRequested: {
        track: {
            "eVar57": "^Event - GenAI Input^",
            "eVar58": "^Event - GenAI Details^",
            "prop45": "^Event - GenAI Answer Details^",
            "prop46": "^Event - GenAI ConversationId+PromptCounter^"
        },
        events: ["event366"],
        run: function (s) {
            if (eventData && eventData.genAI) {
                var genAI = eventData.genAI;
                if (genAI.resultWordCount) {
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event340', ',', 1);
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event341', ',', 1);
                    s.events = s.apl(s.events, 'event340=' + genAI.resultWordCount, ',', 1);
                    s.events = s.apl(s.events, 'event341', ',', 1);
                }
                if (genAI.citationsCount) {
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event342', ',', 1);
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event343', ',', 1);
                    s.events = s.apl(s.events, 'event342=' + genAI.citationsCount, ',', 1);
                    s.events = s.apl(s.events, 'event343', ',', 1);
                }
                if (genAI.refinementsOfferedCount) {
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event344', ',', 1);
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event345', ',', 1);
                    s.events = s.apl(s.events, 'event344=' + genAI.refinementsOfferedCount, ',', 1);
                    s.events = s.apl(s.events, 'event345', ',', 1);
                }

                if (genAI.processingTime) {
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event362', ',', 1);
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event363', ',', 1);
                    s.events = s.apl(s.events, 'event362=' + genAI.processingTime, ',', 1);
                    s.events = s.apl(s.events, 'event363', ',', 1);
                }

                try {
                    if (genAI.conversationId) {
                        var convId = pageDataTracker.md5(genAI.conversationId).substring(0, 20);
                        s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event364', ',', 1);
                        s.events = s.apl(s.events, 'event364:' + convId, ',', 1);
                    }
                } catch (e) { }

                try {
                    if (genAI.conversationId && genAI.promptCounter) {
                        var promptId = pageDataTracker.md5(genAI.conversationId + genAI.promptCounter).substring(0, 20);
                        s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event365', ',', 1);
                        s.events = s.apl(s.events, 'event365:' + promptId, ',', 1);
                    }
                } catch (e) { }
            }
        }
    },
    genAIContentUpdated: {
        track: {
            "eVar57": "^Event - GenAI Input^",
            "eVar58": "^Event - GenAI Details^",
            "prop45": "^Event - GenAI Answer Details^",
            "prop46": "^Event - GenAI ConversationId+PromptCounter^"
        },
        events: ["event346", "event51"],
        run: function (s) {
            if (eventData && eventData.genAI) {
                var genAI = eventData.genAI;
                if (genAI.resultWordCount) {
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event340', ',', 1);
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event341', ',', 1);
                    s.events = s.apl(s.events, 'event340=' + genAI.resultWordCount, ',', 1);
                    s.events = s.apl(s.events, 'event341', ',', 1);
                }
                if (genAI.citationsCount) {
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event342', ',', 1);
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event343', ',', 1);
                    s.events = s.apl(s.events, 'event342=' + genAI.citationsCount, ',', 1);
                    s.events = s.apl(s.events, 'event343', ',', 1);
                }
                if (genAI.refinementsOfferedCount) {
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event344', ',', 1);
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event345', ',', 1);
                    s.events = s.apl(s.events, 'event344=' + genAI.refinementsOfferedCount, ',', 1);
                    s.events = s.apl(s.events, 'event345', ',', 1);
                }

                if (genAI.processingTime) {
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event362', ',', 1);
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event363', ',', 1);
                    s.events = s.apl(s.events, 'event362=' + genAI.processingTime, ',', 1);
                    s.events = s.apl(s.events, 'event363', ',', 1);
                }

                try {
                    if (genAI.conversationId) {
                        var convId = pageDataTracker.md5(genAI.conversationId).substring(0, 20);
                        s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event364', ',', 1);
                        s.events = s.apl(s.events, 'event364:' + convId, ',', 1);
                    }
                } catch (e) { }

                try {
                    if (genAI.conversationId && genAI.promptCounter) {
                        var promptId = pageDataTracker.md5(genAI.conversationId + genAI.promptCounter).substring(0, 20);
                        s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event365', ',', 1);
                        s.events = s.apl(s.events, 'event365:' + promptId, ',', 1);
                    }
                } catch (e) { }
            }
        }
    },
    h2Login: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar78": "^Visitor - Details^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        }
    },
    hesiCategoryScores: {
        track: {
            "eVar171": "^Education - Assignment Duration and Score^",
            "eVar192": "^Education - Category ID and Name^",
            "eVar196": "^Education - Score Origin^"
        }
    },
    instructorActivity: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event305"]
    },
    instructorEnrollment: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar168": "^Education - Semester^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar183": "^Education - Course Section ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event255"]
    },
    itemCategory: {
        track: {
            "eVar172": "^Education - Test Question^",
            "eVar184": "^Education - Question Type^",
            "eVar192": "^Education - Category ID and Name^^Education - Category ID and Name^"
        },
        events: ["event285"]
    },
    linkOut: {
        track: {
            "eVar37": "^Event - LinkOut Destination^",
            "eVar23": "^Event - LinkOut Referring Product^",
            "eVar49": "^Event - LinkOut Referring Product^"
        },
        events: ["event25"]
    },
    liveChatAccepted: {
        events: ["event83"]
    },
    liveChatClosed: {
        events: ["event250"]
    },
    liveChatOffered: {
        events: ["event249"]
    },
    loginFailure: {
        events: ["event134"]
    },
    loginRegistrationStart: {
        events: ["event185"]
    },
    loginStart: {
        events: ["event141"]
    },
    logoutClick: {
        events: ["event180"]
    },
    mockExamFailed: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event279"]
    },
    mockExamPassed: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event279"]
    },
    navigationClick: {
        track: {
            "eVar12": "^Event - Navigation Link Name^",
            "prop26": "^Event - Navigation Link Name^"
        },
        events: ["event45"]
    },
    newPage: {},
    NPSSubmission: {
        track: {
            "eVar55": "^Event - NPS Comment^"
        },
        events: ["event323", "event322"]
    },
    packetAccess: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar192": "^Education - Category ID and Name^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar194": "^Education - Packet ID and Name^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event287"]
    },
    packetCompleted: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar171": "^Education - Assignment Duration and Score^",
            "eVar192": "^Education - Category ID and Name^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar194": "^Education - Packet ID and Name^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event281"],
        run: function (s) {
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event260', ',', 1);
            s.events = s.apl(s.events, 'event260=' + resolveDataElement("Education - Assignment Numeric Grade"), ',', 1);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event290', ',', 1);
            s.events = s.apl(s.events, 'event290=' + resolveDataElement("Education - Time to Complete"), ',', 1);
        }
    },
    packetReceived: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar192": "^Education - Category ID and Name^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar194": "^Education - Packet ID and Name^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event280"]
    },
    reSubmissionRemove: {
        events: ["event329"],
        run: function (s) {
            try {
                productId = pageDataTracker.getContentItem().id;
                productId = pageDataTracker.md5(productId);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event349', ',', 1);
                s.events = s.apl(s.events, 'event349:' + productId, ',', 1);
            } catch (e) { }
        }
    },
    reSubmissionComplete: {
        events: ["event328"],
        run: function (s) {
            try {
                productId = pageDataTracker.getContentItem().id;
                productId = pageDataTracker.md5(productId);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event348', ',', 1);
                s.events = s.apl(s.events, 'event348:' + productId, ',', 1);
            } catch (e) { }
        }
    },
    reSubmissionStart: {
        events: ["event327"],
        run: function (s) {
            try {
                productId = pageDataTracker.getContentItem().id;
                productId = pageDataTracker.md5(productId);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event337', ',', 1);
                s.events = s.apl(s.events, 'event337:' + productId, ',', 1);
            } catch (e) { }
        }
    },
    paperSentBack: {
        events: ["event338"],
        run: function (s) {
            try {
                productId = pageDataTracker.getContentItem().id;
                productId = pageDataTracker.md5(productId);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event339', ',', 1);
                s.events = s.apl(s.events, 'event339:' + productId, ',', 1);
            } catch (e) { }
        }
    },
    paperSubmissionComplete: {
        events: ["event173"],
        run: function (s) {
            try {
                productId = pageDataTracker.getContentItem().id;
                productId = pageDataTracker.md5(productId);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event326', ',', 1);
                s.events = s.apl(s.events, 'event326:' + productId, ',', 1);
            } catch (e) { }
        }
    },
    paperSubmissionStart: {
        events: ["event174"],
        run: function (s) {
            try {
                productId = pageDataTracker.getContentItem().id;
                productId = pageDataTracker.md5(productId);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event325', ',', 1);
                s.events = s.apl(s.events, 'event325:' + productId, ',', 1);
            } catch (e) { }
        }
    },
    productFeatureUsed: {
        track: {
            "prop25": "^Event - Feature Name^"
        }
    },
    purchaseComplete: {
        events: ["purchase"],
        run: function (s) {
            if (window.eventData && window.eventData.order) {
                var order = window.eventData.order;
                s.purchaseID = order['id'];
                s.eVar34 = order['promoCode'];
                s.eVar39 = order['paymentMethod'];
                s.linkTrackVars = s.apl(s.linkTrackVars, 'purchaseID', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar14', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar34', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar39', ',', 2);
                if (window.eventData.page && window.eventData.page.currencyCode) {
                    s.currencyCode = window.eventData.page.currencyCode;
                    s.linkTrackVars = s.apl(s.linkTrackVars, 'currencyCode', ',', 2);
                }
            }
        }
    },
    testQuestionAnswered: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar28": "^Education - Content ID^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar172": "^Education - Test Question^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar184": "^Education - Question Type^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event266"]
    },
    questionCorrect: {
        track: {
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar168": "^Education - Semester^",
            "eVar172": "^Education - Test Question^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event263", "event267", "event266"]
    },
    questionIncorrect: {
        track: {
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar168": "^Education - Semester^",
            "eVar172": "^Education - Test Question^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar179": "^Education - Assignment ID Name and Type^",
            "eVar180": "^Education - Module ID and Name^",
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event263", "event268", "event266"]
    },
    recommendationClick: {
        track: {
            "prop33": "^Page - Product Application Version^"
        },
        events: ["event265"]
    },
    recommendationDeletion: {
        track: {
            "prop33": "^Page - Product Application Version^"
        },
        events: ["event324"]
    },
    recommendationViews: {
        track: {
            "prop33": "^Page - Product Application Version^"
        },
        events: ["event257", "event264"]
    },
    registerExam: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar171": "^Education - Assignment Duration and Score^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event283"],
        run: function (s) {
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event290', ',', 1);
            s.events = s.apl(s.events, 'event290=' + resolveDataElement("Education - Time to Complete"), ',', 1);
        }
    },
    packetAssigned: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^^Education - Program ID and Name^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event282"]
    },
    remediationCustomization: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar187": "^Education - Generic Settings Name and Value^",
            "eVar193": "^Education - Exam ID Name and Type^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event284", "event292"],
        run: function (s) {
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event291', ',', 1);
            s.events = s.apl(s.events, 'event291=' + resolveDataElement("Education - Maximum Packets Issued"), ',', 1);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event293', ',', 1);
            s.events = s.apl(s.events, 'event293=' + resolveDataElement("Education - Benchmark Score"), ',', 1);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event293', ',', 1);
            s.events = s.apl(s.events, 'event294=' + resolveDataElement("Education - Days Until Due"), ',', 1);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event294', ',', 1);
        }
    },
    remoteAccessActivation: {
        events: ["event139"]
    },
    removeFromMyList: {
        events: ["event192"]
    },
    rightsAndAccessComplete: {
        events: ["event352"],
        run: function (s) {
            try {
                productId = pageDataTracker.getContentItem().id;
                productId = pageDataTracker.md5(productId);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event353', ',', 1);
                s.events = s.apl(s.events, 'event353:' + productId, ',', 1);
            } catch (e) { }
        }
    },
    rightsAndAccessStart: {
        events: ["event350"],
        run: function (s) {
            try {
                productId = pageDataTracker.getContentItem().id;
                productId = pageDataTracker.md5(productId);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event351', ',', 1);
                s.events = s.apl(s.events, 'event351:' + productId, ',', 1);
            } catch (e) { }
        }
    },
    saveAlertStart: {
        track: {
            "eVar1": "^Search - Criteria^",
            "eVar97": "^Event - Alert Type^",
            "eVar191": "^Event - Alert Details^",
            "prop21": "^Search - Criteria^"
        },
        events: ["event234"]
    },
    saveAlert: {
        track: {
            "eVar1": "^Search - Criteria^",
            "eVar97": "^Event - Alert Type^",
            "eVar191": "^Event - Alert Details^",
            "prop21": "^Search - Criteria^"
        },
        events: ["event9"]
    },
    saveSearch: {
        track: {
            "eVar19": "^Search - Advanced Criteria^",
            "prop21": "^Search - Criteria^",
            "prop13": "^Search - Sort Type^",
            "prop6": "^Search - Type^",
            "prop7": "^Search - Facet List^"
        },
        events: ["event12"],
        run: function (s) {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar2,eVar46,eVar26,eVar1', ',', 2);
        }
    },
    saveToList: {
        events: ["event48"]
    },
    saveToListStart: {
        events: ["event273"]
    },
    searchFeatureClick: {
        track: {
            "eVar18": "^Search - Feature Used^",
            "prop8": "^Search - Feature Used^"
        },
        events: ["event10"]
    },
    searchResultsClick: {
        track: {
            "eVar15": "^Event - Search Results Click Position^"
        },
        events: ["event37"]
    },
    searchResultsUpdated: {},
    searchStart: {
        events: ["event211"],
        run: function (s) {
            if (window.eventData && eventData.search && eventData.search.type) {
                s.prop6 = window.eventData.search.type;
                s.linkTrackVars = s.apl(s.linkTrackVars, 'prop6', ',', 2);
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar2', ',', 2);
            }
        }
    },
    searchWithinContent: {
        track: {
            "eVar60": "^Search - Within Content Criteria^"
        },
        events: ["event75"]
    },
    selfReflectionResult: {
        track: {
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "eVar165": "^Education - Program ID and Name^",
            "eVar172": "^Education - Test Question^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar184": "^Education - Question Type^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event266", "event300"]
    },
    settingsUpdate: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar187": "^Education - Generic Settings Name and Value^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event274"]
    },
    socialShare: {
        track: {
            "eVar30": "^Event - Share Platform^"
        },
        events: ["event11"]
    },
    studentEnrollment: {
        track: {
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar178": "^Education - Course ID and Name^",
            "eVar7": "^Visitor - Account Name^",
            "eVar16": "^Visitor - Account ID^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event254"]
    },
    studentRemediationReport: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar171": "^Education - Assignment Duration and Score^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event288"],
        run: function (s) {
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event290', ',', 1);
            s.events = s.apl(s.events, 'event290=' + resolveDataElement("Education - Time to Complete"), ',', 1);
        }
    },
    SurveySubmission: {
        track: {
            "eVar55": "^Event - Survey Comment^",
            "eVar56": "D=c43",
            "prop43": "^Event - Survey Meta Data^"
        },
        events: ["event323", "event322"]
    },
    sync: {
        events: ["event208"],
        run: function (s) {
            s.eVar137 = resolveDataElement('Event - Sync Method');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar137', ',', 2);

            s.eVar138 = resolveDataElement('Event - Sync Duration');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar138', ',', 2);
        }
    },
    syncFailure: {
        events: ["event209"],
        run: function (s) {
            s.eVar137 = resolveDataElement('Event - Sync Method');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar137', ',', 2);

            s.eVar138 = resolveDataElement('Event - Sync Duration');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar138', ',', 2);
        }
    },
    syncStart: {
        events: ["event207"],
        run: function (s) {
            s.eVar137 = resolveDataElement('Event - Sync Method');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar137', ',', 2);

            s.eVar138 = resolveDataElement('Event - Sync Duration');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar138', ',', 2);
        }
    },
    accessTeachingMaterial: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar168": "^Education - Semester^",
            "eVar181": "^Education - Teaching Material ID and Name^",
            "eVar192": "^Education - Category ID and Name^",
            "eVar194": "^Education - Packet ID and Name^",
            "eVar195": "^Education -Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event275"]
    },
    timeout: {
        track: {
            "eVar7": "D=c29",
            "eVar16": "D=c1",
            "eVar165": "^Education - Program ID and Name^",
            "eVar166": "^Education - Student and Instructor ID^",
            "eVar195": "^Education - Exam Group ID and Name^",
            "prop1": "^Visitor - Account ID^",
            "prop29": "^Visitor - Account Name^"
        },
        events: ["event276"]
    },
    transferOfferAccepted: {
        events: ["event330"]
    },
    transferOfferRejected: {
        events: ["event331"]
    },
    transferpaperSubmissions: {
        events: ["event356"],
        run: function (s) {
            try {
                productId = pageDataTracker.getContentItem().id;
                productId = pageDataTracker.md5(productId);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event357', ',', 1);
                s.events = s.apl(s.events, 'event357:' + productId, ',', 1);
            } catch (e) { }
        }
    },
    transferpaperSubmissionStarts: {
        events: ["event354"],
        run: function (s) {
            try {
                productId = pageDataTracker.getContentItem().id;
                productId = pageDataTracker.md5(productId);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event355', ',', 1);
                s.events = s.apl(s.events, 'event355:' + productId, ',', 1);
            } catch (e) { }
        }
    },
    unfollowProfile: {
        events: ["event248"]
    },
    userProfileUpdate: {
        track: {
            "eVar44": "^Event - Updated User Fields^"
        },
        events: ["event17"]
    },
    websiteError: {
        track: {
            "eVar43": "^Page - Error Type^"
        },
        events: ["event26"]
    },
    widgetClick: {
        events: ["event179"],
        run: function (s) {
            s.list2 = resolveDataElement('Page - Widget Names');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'list2', ',', 2);
        }
    },
    widgetImpression: {
        events: ["event178"],
        run: function (s) {
            s.list2 = resolveDataElement('Page - Widget Names');
            s.linkTrackVars = s.apl(s.linkTrackVars, 'list2', ',', 2);
        }
    }

};
