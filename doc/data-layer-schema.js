/**
 * Web Analytics SDK — Data Layer Schema
 * Auto-generated from source: rules.js, data-elements.js, tracker.js, doPlugins.js
 *
 * This file defines the complete data layer specification:
 *   1. pageData          — static page-level information set before tracking
 *   2. contentItem       — product / content item schema (inside pageData or eventData)
 *   3. eventDataSchemas  — reusable data shapes passed alongside events
 *   4. events            — all trackable events, linked to their schema(s)
 */

// ──────────────────────────────────────────────────────────────────────────────
// USAGE PATTERN
// ──────────────────────────────────────────────────────────────────────────────
//
//   // 1. Set page-level data (once, before any event)
//   window.pageData = { page: { ... }, visitor: { ... }, content: [ ... ] };
//
//   // 2. Fire events via the push API
//   window.appData.push({ event: 'pageLoad' });
//   window.appData.push({ event: 'cartAdd', content: [{ id: 'X', price: '10', quantity: '1' }] });
//
//   // 3. Fire events with schema data
//   window.appData.push({ event: 'formSubmit', form: { type: 'contact' } });
//
// ──────────────────────────────────────────────────────────────────────────────

const SDK_SCHEMA = {

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE DATA  — window.pageData
    // ══════════════════════════════════════════════════════════════════════════
    pageData: {
        page: {
            name: { type: 'string', aa: 'pageName (via analyticsPagename)', desc: 'Logical page name' },
            analyticsPagename: { type: 'string', aa: 'pageName', desc: 'Override for AA pageName' },
            productName: { type: 'string', aa: 'eVar4, prop2', desc: 'Product brand code (e.g. "sb")' },
            businessUnit: { type: 'string', aa: 'prop16', desc: 'Business unit hierarchy (e.g. "els:rp:bau")' },
            sectionName: { type: 'string', aa: 'channel', desc: 'Site section / channel' },
            type: { type: 'string', aa: 'prop4', desc: 'Page type (e.g. "checkout", "CP-article")' },
            language: { type: 'string', aa: 'prop24', desc: 'Page language code' },
            environment: { type: 'string', aa: 'eVar126', desc: 'Environment (dev, cert, prod)' },
            currencyCode: { type: 'string', aa: 'currencyCode', desc: 'ISO currency code (e.g. "USD")' },
            purchaseStep: { type: 'string', aa: 'scView/scCheckout/purchase', desc: 'Funnel step: cart|login|checkout|shipping|payment|purchase', enum: ['cart', 'login', 'checkout', 'shipping', 'payment', 'purchase'] },
            loadTimestamp: { type: 'string', aa: 'prop14 (load time)', desc: 'Unix timestamp in ms for time-between calculations' },
            loadTime: { type: 'string', aa: 'prop14', desc: 'Page load time in seconds' },
            errorType: { type: 'string', aa: 'eVar43', desc: 'Error type identifier' },
            testId: { type: 'string', aa: 'eVar22', desc: 'A/B test identifier' },
            campaign: { type: 'string', aa: 'campaign', desc: 'Campaign tracking code (fallback if no URL param)' },
            extendedName: { type: 'string', aa: 'prop63', desc: 'Extended page name (combined with productName)' },
            onlineState: { type: 'string', aa: 'prop65', desc: 'Online/offline state' },
            secondaryProductName: { type: 'string', aa: 'eVar107', desc: 'Secondary product name' },
            noTracking: { type: 'string', desc: 'Set to "true" to abort tracking' },
            isResponsive: { type: 'string', aa: 'prop40', desc: 'UX properties flag' },
            widgetNames: { type: 'string[]', aa: 'list2', desc: 'Widget names on page' },
            currentTab: { type: 'string', aa: 'eVar143 (partial)', desc: 'Current active tab' },
            openTabs: { type: 'string', aa: 'eVar143 (partial)', desc: 'Open tabs count/list' },
            contextDomain: { type: 'string', aa: 'eVar177 (partial)', desc: 'Context domain' },
            host: { type: 'string', aa: 'eVar177 (partial)', desc: 'Host name' },
            version: { type: 'string', aa: 'eVar177 (partial)', desc: 'App version' },
            platform: { type: 'string', aa: 'eVar177 (partial)', desc: 'Platform identifier' },
            productAppVersion: { type: 'string', aa: 'prop33', desc: 'Product application version' },
            recommenderVersion: { type: 'string', aa: 'prop33 (partial)', desc: 'Recommender engine version' },
            customPerformance1: { type: 'number', aa: 'event306', desc: 'Custom perf metric 1' },
            customPerformance2: { type: 'number', aa: 'event308', desc: 'Custom perf metric 2' },
            customPerformance3: { type: 'number', aa: 'event310', desc: 'Custom perf metric 3' },
            customPerformance4: { type: 'number', aa: 'event312', desc: 'Custom perf metric 4' },
            customPerformance5: { type: 'number', aa: 'event314', desc: 'Custom perf metric 5' },
            journalInfo: { type: 'string', aa: 'eVar74', desc: 'Journal info (resolved via tracker)' },
            experimentationUserId: { type: 'string', aa: 'eVar189', desc: 'Experimentation user ID' },
            identityUser: { type: 'string', aa: 'eVar190', desc: 'Identity user' },
            idPlusParameters: { type: 'string', aa: 'eVar199', desc: 'ID+ parameters' },
        },

        visitor: {
            accountId: { type: 'string', aa: 'prop1', desc: 'Institutional account ID' },
            accountName: { type: 'string', aa: 'eVar7', desc: 'Account name' },
            userId: { type: 'string', aa: 'prop12', desc: 'User ID (hashed if email)' },
            accessType: { type: 'string', aa: 'eVar33', desc: 'Access type (e.g. "registered", "institutional")' },
            loginStatus: { type: 'string', desc: 'Login status flag' },
            loginSuccess: { type: 'string', desc: 'Set "true" to fire login success event (event23)' },
            loginFailure: { type: 'string', desc: 'Set "true" to fire login failure event (event134)' },
            industry: { type: 'string', aa: 'eVar41', desc: 'Visitor industry' },
            sisId: { type: 'string', aa: 'eVar42', desc: 'SIS ID' },
            departmentId: { type: 'string', aa: 'eVar52', desc: 'Department ID' },
            departmentName: { type: 'string', aa: 'eVar53', desc: 'Department name' },
            details: { type: 'string', aa: 'eVar78', desc: 'Visitor details' },
            ipAddress: { type: 'string', aa: 'prop30', desc: 'Visitor IP address' },
            appSessionId: { type: 'string', aa: 'eVar106', desc: 'App session ID' },
            consortiumId: { type: 'string', desc: 'Consortium ID' },
            superaccountId: { type: 'string', aa: 'eVar153', desc: 'Superaccount ID' },
            superaccountName: { type: 'string', aa: 'eVar154', desc: 'Superaccount name' },
            platformName: { type: 'string', aa: 'eVar148', desc: 'Platform name' },
            platformId: { type: 'string', aa: 'eVar149', desc: 'Platform ID' },
            productId: { type: 'string', aa: 'eVar152', desc: 'Visitor product ID' },
            tmxDeviceId: { type: 'string', aa: 'eVar175', desc: 'TMX device ID' },
            tmxRequestId: { type: 'string', aa: 'eVar176', desc: 'TMX request ID' },
        },

        search: {
            criteria: { type: 'string', aa: 'prop21, eVar141', desc: 'Search query' },
            type: { type: 'string', aa: 'prop6', desc: 'Search type' },
            totalResults: { type: 'string', aa: 'eVar3', desc: 'Total search results count' },
            sortType: { type: 'string', aa: 'prop13', desc: 'Sort type applied' },
            facetList: { type: 'string', aa: 'prop7', desc: 'Applied facets' },
            facetOperation: { type: 'string', aa: 'eVar169', desc: 'Facet operation (add/remove)' },
            advancedCriteria: { type: 'string', aa: 'eVar19', desc: 'Advanced search criteria' },
            currentPage: { type: 'string', aa: 'eVar105', desc: 'Current results page' },
            resultsPerPage: { type: 'string', desc: 'Results shown per page' },
            database: { type: 'string', aa: 'eVar117', desc: 'Search database' },
            channel: { type: 'string', aa: 'eVar161', desc: 'Search channel' },
            details: { type: 'string', aa: 'eVar173', desc: 'Search details' },
            withinContentCriteria: { type: 'string', aa: 'eVar60', desc: 'Within-content search' },
            withinResultsCriteria: { type: 'string', aa: 'eVar61', desc: 'Within-results search' },
            dataFormCriteria: { type: 'string', aa: 'prop60', desc: 'Data form search criteria' },
        },

        order: {
            id: { type: 'string', aa: 'purchaseID', desc: 'Order/purchase ID' },
            promoCode: { type: 'string', aa: 'eVar34', desc: 'Promotional code(s)' },
            paymentMethod: { type: 'string', aa: 'eVar39', desc: 'Payment method(s)' },
        },

        support: {
            topicName: { type: 'string', aa: 'prop15', desc: 'Support topic name' },
            searchCriteria: { type: 'string', aa: 'prop28', desc: 'Support search criteria' },
        },

        form: {
            type: { type: 'string', aa: 'eVar102', desc: 'Form type' },
            name: { type: 'string', aa: 'eVar102', desc: 'Form name' },
            step: { type: 'string', desc: 'Form step identifier' },
            errorType: { type: 'string', aa: 'eVar43', desc: 'Form error type' },
        },

        cta: {
            ids: { type: 'string[]', aa: 'list3', desc: 'CTA / promo IDs on page' },
        },

        journal: {
            businessPublisherName: { type: 'string', aa: 'eVar59 (partial)', desc: 'Business publisher name' },
            businessPublisherId: { type: 'string', aa: 'eVar59 (partial)', desc: 'Business publisher ID' },
            productionPublisherName: { type: 'string', aa: 'eVar59 (partial)', desc: 'Production publisher name' },
            productionPublisherId: { type: 'string', aa: 'eVar59 (partial)', desc: 'Production publisher ID' },
        },

        trackEvents: { type: 'string[]', desc: 'Page-load events: associationStart, associated, contentEdit, contentAddition, recommendationViews, accountAssociationStart' },
        researchNetworks: { type: 'string[]', aa: 'prop67', desc: 'Research network identifiers' },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // CONTENT ITEMS  — pageData.content[] or eventData.content[]
    // ══════════════════════════════════════════════════════════════════════════
    contentItem: {
        id: { type: 'string', aa: 'products (SKU)', desc: 'Content/product ID — prefixed with productName automatically' },
        id2: { type: 'string', aa: 'eVar159', desc: 'Secondary ID' },
        id3: { type: 'string', aa: 'eVar160', desc: 'Tertiary ID' },
        type: { type: 'string', aa: 'eVar20', desc: 'Content type (e.g. "journal-article")' },
        accessType: { type: 'string', aa: 'eVar20 (suffix)', desc: 'Access type appended to type' },
        title: { type: 'string', aa: 'eVar75', desc: 'Content title' },
        name: { type: 'string', aa: 'eVar75 (fallback)', desc: 'Content name (fallback for title)' },
        format: { type: 'string', aa: 'eVar17', desc: 'Content format' },
        price: { type: 'string', aa: 'products (price)', desc: 'Unit price' },
        quantity: { type: 'string', aa: 'products (quantity)', desc: 'Quantity' },
        breadcrumb: { type: 'string', aa: 'eVar63', desc: 'Content breadcrumb path' },
        onlineDate: { type: 'number', aa: 'eVar122, eVar128', desc: 'Online date (unix timestamp)' },
        publishDate: { type: 'number', aa: 'eVar123, eVar127', desc: 'Publish date (unix timestamp)' },
        mapId: { type: 'string', aa: 'eVar70', desc: 'MAP ID' },
        relevancyScore: { type: 'string', aa: 'eVar71', desc: 'Relevancy score' },
        status: { type: 'string', aa: 'eVar73', desc: 'Content status' },
        previousStatus: { type: 'string', aa: 'eVar111', desc: 'Previous status' },
        entitlementType: { type: 'string', aa: 'eVar80', desc: 'Entitlement type' },
        recordType: { type: 'string', aa: 'eVar93', desc: 'Record type' },
        exportType: { type: 'string', aa: 'eVar99', desc: 'Export type' },
        importType: { type: 'string', aa: 'eVar142', desc: 'Import type' },
        section: { type: 'string', aa: 'eVar100', desc: 'Content section' },
        detail: { type: 'string', aa: 'eVar104', desc: 'Content detail' },
        details: { type: 'string', aa: 'eVar104 (alias)', desc: 'Content details (alias for detail)' },
        position: { type: 'string', aa: 'eVar116', desc: 'Content position in list' },
        publicationTitle: { type: 'string', aa: 'eVar129', desc: 'Publication title' },
        specialIssueTitle: { type: 'string', aa: 'eVar130', desc: 'Special issue title' },
        specialIssueNumber: { type: 'string', aa: 'eVar131', desc: 'Special issue number' },
        volumeTitle: { type: 'string', aa: 'eVar132', desc: 'Volume title' },
        publicationSection: { type: 'string', aa: 'eVar133', desc: 'Publication section' },
        publicationSpecialty: { type: 'string', aa: 'eVar134', desc: 'Publication specialty' },
        issn: { type: 'string', aa: 'eVar135', desc: 'ISSN' },
        referenceModuleTitle: { type: 'string', aa: 'eVar139', desc: 'Reference module title' },
        referenceModuleISBN: { type: 'string', aa: 'eVar140', desc: 'Reference module ISBN' },
        provider: { type: 'string', aa: 'eVar164', desc: 'Content provider' },
        citationStyle: { type: 'string', aa: 'eVar170', desc: 'Citation style' },
        datapoints: { type: 'string', aa: 'event239', desc: 'Number of datapoints (product event)' },
        documents: { type: 'string', aa: 'event240', desc: 'Number of documents (product event)' },
        size: { type: 'string', aa: 'event335+event336', desc: 'Content size (product event)' },
        turnawayId: { type: 'string', aa: 'event43', desc: 'Turnaway identifier (triggers turnaway event)' },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // EVENT DATA SCHEMAS — reusable data shapes passed alongside events
    //
    // Each schema defines a top-level key in the appData.push() payload.
    // Events reference these by name via `schema: '<name>'`.
    //
    // Example: schema 'form' → appData.push({ event: 'formSubmit', form: { type: 'contact' } })
    // ══════════════════════════════════════════════════════════════════════════
    eventDataSchemas: {

        // ── Search ────────────────────────────────────────────────────────────
        search: {
            desc: 'Search event data — passed under the "search" key',
            fields: {
                type: { type: 'string', desc: 'Search type' },
                criteria: { type: 'string', desc: 'Search query' },
                featureName: { type: 'string', desc: 'Search feature name' },
                resultsPosition: { type: 'string', desc: 'Clicked result position' },
                typedTerm: { type: 'string', desc: 'Term as typed by user' },
                selectedTerm: { type: 'string', desc: 'Term selected from suggestions' },
                suggestedLetterCount: { type: 'string', desc: 'Letters typed before suggestion' },
                suggestedResultCount: { type: 'string', desc: 'Number of suggestions shown' },
                suggestedClickPosition: { type: 'string', desc: 'Position of clicked suggestion' },
                autoSuggestCategory: { type: 'string', desc: 'AutoSuggest category' },
                autoSuggestDetails: { type: 'string', desc: 'AutoSuggest details' },
            }
        },

        // ── Form ──────────────────────────────────────────────────────────────
        form: {
            desc: 'Form event data — passed under the "form" key',
            fields: {
                type: { type: 'string', desc: 'Form type' },
                name: { type: 'string', desc: 'Form name' },
                step: { type: 'string', desc: 'Form step identifier' },
                errorType: { type: 'string', desc: 'Form error type' },
                errorId: { type: 'string', desc: 'Form error identifier' },
            }
        },

        // ── Video ─────────────────────────────────────────────────────────────
        video: {
            desc: 'Video tracking data — passed under the "video" key',
            fields: {
                id: { type: 'string', desc: 'Video identifier' },
                duration: { type: 'number', desc: 'Video duration in seconds' },
            }
        },

        // ── Media (internal) ──────────────────────────────────────────────────
        _media: {
            desc: 'Internal media state — passed under the "_media" key',
            fields: {
                timePlayed: { type: 'number', desc: 'Seconds of video played' },
                milestoneEvent: { type: 'string', desc: 'Milestone event identifier (e.g. "25", "50")' },
            }
        },

        // ── Order ─────────────────────────────────────────────────────────────
        order: {
            desc: 'Order/purchase data — passed under the "order" key',
            fields: {
                id: { type: 'string', desc: 'Order/purchase ID' },
                promoCode: { type: 'string', desc: 'Promotional code(s)' },
                paymentMethod: { type: 'string', desc: 'Payment method(s)' },
            }
        },

        // ── Education ─────────────────────────────────────────────────────────
        education: {
            desc: 'Education-related event data — passed under the "education" key',
            fields: {
                programId: { type: 'string', desc: 'Program ID' },
                programName: { type: 'string', desc: 'Program name' },
                courseId: { type: 'string', desc: 'Course ID' },
                courseName: { type: 'string', desc: 'Course name' },
                courseSectionId: { type: 'string', desc: 'Course section ID' },
                courseSectionName: { type: 'string', desc: 'Course section name' },
                assignmentId: { type: 'string', desc: 'Assignment ID' },
                assignmentName: { type: 'string', desc: 'Assignment name' },
                assignmentType: { type: 'string', desc: 'Assignment type' },
                moduleId: { type: 'string', desc: 'Module ID' },
                moduleName: { type: 'string', desc: 'Module name' },
                studentId: { type: 'string', desc: 'Student ID' },
                instructorId: { type: 'string', desc: 'Instructor ID' },
                semester: { type: 'string', desc: 'Semester' },
                attempt: { type: 'string', desc: 'Attempt number' },
                assignmentDuration: { type: 'number', desc: 'Assignment duration in seconds' },
                assignmentScore: { type: 'string', desc: 'Assignment score' },
                assignmentNumericGrade: { type: 'number', desc: 'Numeric grade' },
                beforeAfterDueDate: { type: 'string', desc: 'Before/after due date indicator' },
                timeSinceLastAttempt: { type: 'number', desc: 'Seconds since last attempt' },
                selfReflectionScore: { type: 'number', desc: 'Self-reflection score' },
                benchmarkScore: { type: 'number', desc: 'Benchmark score' },
                daysUntilDue: { type: 'number', desc: 'Days until due date' },
                maxPackets: { type: 'number', desc: 'Maximum packets' },
                examId: { type: 'string', desc: 'Exam ID' },
                examName: { type: 'string', desc: 'Exam name' },
                examType: { type: 'string', desc: 'Exam type' },
                examGroupId: { type: 'string', desc: 'Exam group ID' },
                examGroupName: { type: 'string', desc: 'Exam group name' },
                categoryId: { type: 'string', desc: 'Category ID' },
                categoryName: { type: 'string', desc: 'Category name' },
                packetId: { type: 'string', desc: 'Packet ID' },
                packetName: { type: 'string', desc: 'Packet name' },
                questionId: { type: 'string', desc: 'Question ID' },
                questionType: { type: 'string', desc: 'Question type' },
                testQuestion: { type: 'string', desc: 'Test question' },
                teachingMaterialId: { type: 'string', desc: 'Teaching material ID' },
                teachingMaterialName: { type: 'string', desc: 'Teaching material name' },
                teachingMaterialType: { type: 'string', desc: 'Teaching material type' },
                genericSettingsName: { type: 'string', desc: 'Settings name' },
                genericSettingsValue: { type: 'string', desc: 'Settings value' },
                scoreOrigin: { type: 'string', desc: 'Score origin' },
                contentId: { type: 'string', desc: 'Content ID' },
                assignmentOrigin: { type: 'string', desc: 'Assignment origin' },
            }
        },

        // ── GenAI ─────────────────────────────────────────────────────────────
        genAI: {
            desc: 'GenAI event data — passed under the "genAI" key',
            fields: {
                input: { type: 'string', desc: 'User input / prompt' },
                inputSource: { type: 'string', desc: 'Source of the input' },
                inputOrigin: { type: 'string', desc: 'Origin of the input' },
                component: { type: 'string', desc: 'GenAI component name' },
                componentVersion: { type: 'string', desc: 'Component version' },
                conversationId: { type: 'string', desc: 'Conversation ID' },
                promptCounter: { type: 'string', desc: 'Prompt counter' },
                resultWordCount: { type: 'number', desc: 'Result word count' },
                citationsCount: { type: 'number', desc: 'Number of citations' },
                refinementsOfferedCount: { type: 'number', desc: 'Refinements offered' },
                processingTime: { type: 'number', desc: 'Processing time in ms' },
                answerDetails: { type: 'string', desc: 'Answer details' },
            }
        },

        // ── Alert ─────────────────────────────────────────────────────────────
        alert: {
            desc: 'Alert event data — passed under the "alert" key',
            fields: {
                type: { type: 'string', desc: 'Alert type' },
                frequency: { type: 'string', desc: 'Alert frequency' },
                details: { type: 'string', desc: 'Alert details' },
            }
        },

        // ── Survey ────────────────────────────────────────────────────────────
        survey: {
            desc: 'Survey event data — passed under the "survey" key',
            fields: {
                comment: { type: 'string', desc: 'Survey comment' },
                score: { type: 'number', desc: 'Survey score' },
                type: { type: 'string', desc: 'Survey type' },
                targeting: { type: 'string', desc: 'Survey targeting' },
                question: { type: 'string', desc: 'Survey question' },
            }
        },

        // ── NPS ───────────────────────────────────────────────────────────────
        nps: {
            desc: 'NPS event data — passed under the "nps" key',
            fields: {
                comment: { type: 'string', desc: 'NPS comment' },
                score: { type: 'number', desc: 'NPS score' },
            }
        },

        // ── Sync ──────────────────────────────────────────────────────────────
        sync: {
            desc: 'Sync event data — passed under the "sync" key',
            fields: {
                method: { type: 'string', desc: 'Sync method' },
                duration: { type: 'number', desc: 'Sync duration in ms' },
            }
        },

        // ── Action ────────────────────────────────────────────────────────────
        action: {
            desc: 'Generic action data — passed under the "action" key',
            fields: {
                name: { type: 'string', desc: 'Action name / identifier' },
            }
        },

        // ── Export ────────────────────────────────────────────────────────────
        export: {
            desc: 'Export event data — passed under the "export" key',
            fields: {
                rows: { type: 'number', desc: 'Number of rows exported' },
                rowsFailed: { type: 'number', desc: 'Number of rows failed' },
            }
        },

        // ── Navigation Link ──────────────────────────────────────────────────
        navigationLink: {
            desc: 'Navigation link data — passed under the "navigationLink" key',
            fields: {
                name: { type: 'string', desc: 'Navigation link name' },
            }
        },

        // ── Link ──────────────────────────────────────────────────────────────
        link: {
            desc: 'Link data — passed under the "link" key',
            fields: {
                widgetName: { type: 'string', desc: 'Widget name for link' },
            }
        },

        // ── Conversion Driver ─────────────────────────────────────────────────
        conversionDriver: {
            desc: 'Conversion driver data — passed under the "conversionDriver" key',
            fields: {
                name: { type: 'string', desc: 'Conversion driver name' },
            }
        },

        // ── User ──────────────────────────────────────────────────────────────
        user: {
            desc: 'User event data — passed under the "user" key',
            fields: {
                fieldsUpdated: { type: 'string', desc: 'Pipe-separated list of updated fields' },
            }
        },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // EVENTS  — fired via appData.push({ event: '<name>', ... })
    //
    // Each event may reference:
    //   schema  — name(s) of eventDataSchema to include in the push payload
    //   fields  — subset of schema fields this event actually uses (omit = all)
    //   content — true if this event accepts a content[] array
    //   data    — one-off inline fields (only for truly unique, non-reusable data)
    // ══════════════════════════════════════════════════════════════════════════
    events: {

        // ── Core Page Events ─────────────────────────────────────────────────
        pageLoad: { category: 'Page', aa: 'event27', desc: 'Initial page load — fires all page-level mappings' },
        newPage: { category: 'Page', aa: 'event27', desc: 'SPA navigation / virtual page view' },

        // ── Commerce Events ──────────────────────────────────────────────────
        cartAdd: { category: 'Commerce', aa: 'scAdd, scOpen, event20', desc: 'Add item to cart', content: true },
        cartRemove: { category: 'Commerce', aa: 'scRemove', desc: 'Remove item from cart', content: true },
        purchaseComplete: { category: 'Commerce', aa: 'purchase', desc: 'Purchase complete', content: true, schema: 'order' },

        // ── Content Events ───────────────────────────────────────────────────
        contentView: { category: 'Content', aa: 'event5', desc: 'Content viewed' },
        contentDownload: { category: 'Content', aa: 'event19, event182', desc: 'Content downloaded' },
        contentDownloadRequest: { category: 'Content', aa: 'event318, event319', desc: 'Content download requested' },
        contentDownloadStart: { category: 'Content', aa: 'event123', desc: 'Content download started' },
        contentExport: { category: 'Content', aa: 'event39', desc: 'Content exported', schema: 'export', fields: ['rows', 'rowsFailed'] },
        contentExportStart: { category: 'Content', aa: 'event125', desc: 'Content export started', schema: 'export', fields: ['rows'] },
        contentImport: { category: 'Content', aa: 'event79', desc: 'Content imported' },
        contentAddition: { category: 'Content', aa: 'event79', desc: 'Content added' },
        contentAdditionStart: { category: 'Content', aa: 'event188', desc: 'Content addition started' },
        contentAdditionStep: { category: 'Content', aa: 'event189', desc: 'Content addition step', data: { step: 'string' } },
        contentEdited: { category: 'Content', aa: 'event190', desc: 'Content edited' },
        contentEditStart: { category: 'Content', aa: 'event191', desc: 'Content edit started' },
        contentDeletion: { category: 'Content', aa: 'event231', desc: 'Content deleted' },
        contentDismissal: { category: 'Content', aa: 'event241', desc: 'Content dismissed' },
        contentSelection: { category: 'Content', aa: 'event232', desc: 'Content selected' },
        contentPrint: { category: 'Content', aa: 'event80', desc: 'Content printed' },
        contentCitationChange: { category: 'Content', aa: 'event253', desc: 'Citation style changed' },
        contentInteraction: { category: 'Content', aa: '-', desc: 'Content interaction', schema: 'action' },
        contentInteractionStep: { category: 'Content', aa: 'event189', desc: 'Content interaction step', data: { step: 'string' } },
        contentLinkClick: { category: 'Content', aa: 'event87', desc: 'Content link click', schema: 'action' },
        contentShare: { category: 'Content', aa: 'event11', desc: 'Content shared', data: { sharePlatform: 'string' } },
        contentShareStart: { category: 'Content', aa: 'event206', desc: 'Content share started' },
        contentTabClick: { category: 'Content', aa: '-', desc: 'Content tab click', data: { 'page.currentTab': 'string' } },
        contentWindowLoad: { category: 'Content', aa: 'event5, event84', desc: 'Content window loaded', data: { 'page.currentTab': 'string' } },
        copyToClipboard: { category: 'Content', aa: 'event210', desc: 'Content copied to clipboard' },
        genAIContentRequested: { category: 'Content', aa: 'event366', desc: 'GenAI content requested', schema: 'genAI' },
        genAIContentUpdated: { category: 'Content', aa: 'event346, event51', desc: 'GenAI content updated', schema: 'genAI' },
        genAIClosed: { category: 'Content', aa: 'event347', desc: 'GenAI interface closed' },

        // ── Search Events ────────────────────────────────────────────────────
        searchStart: { category: 'Search', aa: 'event211', desc: 'Search initiated', schema: 'search', fields: ['type'] },
        searchResultsClick: { category: 'Search', aa: 'event37', desc: 'Search result clicked', schema: 'search', fields: ['resultsPosition'] },
        searchResultsUpdated: { category: 'Search', aa: '-', desc: 'Search results updated (SPA)' },
        searchFeatureClick: { category: 'Search', aa: 'event10', desc: 'Search feature used', schema: 'search', fields: ['featureName'] },
        searchWithinContent: { category: 'Search', aa: 'event75', desc: 'Search within content' },
        saveSearch: { category: 'Search', aa: 'event12', desc: 'Search saved' },
        autoSuggestTermClicked: { category: 'Search', aa: 'event233', desc: 'AutoSuggest term clicked', schema: 'search', fields: ['typedTerm', 'selectedTerm', 'suggestedLetterCount', 'suggestedResultCount', 'suggestedClickPosition', 'autoSuggestCategory', 'autoSuggestDetails'] },

        // ── User Events ──────────────────────────────────────────────────────
        loginStart: { category: 'User', aa: 'event141', desc: 'Login started' },
        loginFailure: { category: 'User', aa: 'event134', desc: 'Login failed' },
        loginRegistrationStart: { category: 'User', aa: 'event185', desc: 'Login/registration started' },
        logoutClick: { category: 'User', aa: 'event180', desc: 'Logout clicked' },
        userProfileUpdate: { category: 'User', aa: 'event17', desc: 'User profile updated', schema: 'user' },
        claimProfile: { category: 'User', aa: 'event172', desc: 'Profile claimed' },
        claimStart: { category: 'User', aa: 'event213', desc: 'Claim started' },
        associated: { category: 'User', aa: 'event200', desc: 'Account associated' },
        associationStart: { category: 'User', aa: 'event199', desc: 'Association started' },
        accountAssociationStart: { category: 'User', aa: 'event333', desc: 'Account association started' },
        followProfile: { category: 'User', aa: 'event247', desc: 'Profile followed' },
        unfollowProfile: { category: 'User', aa: 'event248', desc: 'Profile unfollowed' },
        remoteAccessActivation: { category: 'User', aa: 'event139', desc: 'Remote access activated' },

        // ── Navigation & UI Events ───────────────────────────────────────────
        navigationClick: { category: 'Navigation', aa: 'event45', desc: 'Navigation link clicked', schema: 'navigationLink' },
        buttonClick: { category: 'Navigation', aa: 'event204', desc: 'Button clicked', data: { buttonType: 'string' } },
        buttonHover: { category: 'Navigation', aa: 'event269', desc: 'Button hovered', data: { buttonType: 'string' } },
        ctaClick: { category: 'Navigation', aa: 'event22', desc: 'CTA clicked', data: { 'cta.ids': 'string[]' } },
        ctaImpression: { category: 'Navigation', aa: 'event21', desc: 'CTA impression' },
        linkOut: { category: 'Navigation', aa: 'event25', desc: 'External link clicked', data: { linkOut: 'string', referringProduct: 'string' } },
        closeTab: { category: 'Navigation', aa: 'event215', desc: 'Tab closed' },
        widgetClick: { category: 'Navigation', aa: 'event179', desc: 'Widget clicked', schema: 'link', fields: ['widgetName'] },
        widgetImpression: { category: 'Navigation', aa: 'event178', desc: 'Widget impression' },
        conversionDriverClick: { category: 'Navigation', aa: '-', desc: 'Conversion driver clicked', schema: 'conversionDriver' },

        // ── Form Events ──────────────────────────────────────────────────────
        formView: { category: 'Form', aa: '-', desc: 'Form viewed', schema: 'form', fields: ['type'] },
        formStart: { category: 'Form', aa: 'event50', desc: 'Form started', schema: 'form', fields: ['type'] },
        formSubmit: { category: 'Form', aa: 'event47', desc: 'Form submitted', schema: 'form', fields: ['type'] },
        formError: { category: 'Form', aa: 'event26', desc: 'Form error', schema: 'form', fields: ['errorType', 'errorId'] },
        websiteError: { category: 'Form', aa: 'event26', desc: 'Website error', data: { 'page.errorType': 'string' } },

        // ── Alerts ───────────────────────────────────────────────────────────
        saveAlert: { category: 'Alert', aa: 'event9', desc: 'Alert saved', schema: 'alert' },
        saveAlertStart: { category: 'Alert', aa: 'event234', desc: 'Alert save started' },
        editAlert: { category: 'Alert', aa: 'event235', desc: 'Alert edited' },
        editAlertStart: { category: 'Alert', aa: 'event236', desc: 'Alert edit started' },
        deleteAlert: { category: 'Alert', aa: 'event237', desc: 'Alert deleted' },
        deleteAlertStart: { category: 'Alert', aa: 'event238', desc: 'Alert delete started' },

        // ── List Events ──────────────────────────────────────────────────────
        saveToList: { category: 'List', aa: 'event48', desc: 'Saved to list' },
        saveToListStart: { category: 'List', aa: 'event273', desc: 'Save to list started' },
        removeFromMyList: { category: 'List', aa: 'event192', desc: 'Removed from list' },

        // ── Recommendation Events ────────────────────────────────────────────
        recommendationClick: { category: 'Recommendation', aa: 'event265', desc: 'Recommendation clicked' },
        recommendationDeletion: { category: 'Recommendation', aa: 'event324', desc: 'Recommendation deleted' },
        recommendationViews: { category: 'Recommendation', aa: 'event257, event264', desc: 'Recommendations viewed' },

        // ── Survey / NPS Events ──────────────────────────────────────────────
        SurveySubmission: { category: 'Survey', aa: 'event323', desc: 'Survey submitted', schema: 'survey' },
        NPSSubmission: { category: 'Survey', aa: 'event323, event322', desc: 'NPS submitted', schema: 'nps' },

        // ── Sync Events ──────────────────────────────────────────────────────
        syncStart: { category: 'Sync', aa: 'event207', desc: 'Sync started', schema: 'sync' },
        sync: { category: 'Sync', aa: 'event208', desc: 'Sync completed', schema: 'sync' },
        syncFailure: { category: 'Sync', aa: 'event209', desc: 'Sync failed', schema: 'sync' },

        // ── Live Chat Events ─────────────────────────────────────────────────
        liveChatOffered: { category: 'Chat', aa: 'event249', desc: 'Live chat offered' },
        liveChatAccepted: { category: 'Chat', aa: 'event83', desc: 'Live chat accepted' },
        liveChatClosed: { category: 'Chat', aa: 'event250', desc: 'Live chat closed' },

        // ── Product Feature Events ───────────────────────────────────────────
        productFeatureUsed: { category: 'Feature', aa: '-', desc: 'Product feature used', data: { 'feature.name': 'string' } },
        rowsExported: { category: 'Feature', aa: 'event39', desc: 'Rows exported', schema: 'export', fields: ['rows'] },

        // ── Paper Submission Events ──────────────────────────────────────────
        paperSubmissionStart: { category: 'Submission', aa: 'event174', desc: 'Paper submission started' },
        paperSubmissionComplete: { category: 'Submission', aa: 'event173', desc: 'Paper submission completed' },
        paperSentBack: { category: 'Submission', aa: 'event338', desc: 'Paper sent back' },
        reSubmissionStart: { category: 'Submission', aa: 'event327', desc: 'Re-submission started' },
        reSubmissionComplete: { category: 'Submission', aa: 'event328', desc: 'Re-submission completed' },
        reSubmissionRemove: { category: 'Submission', aa: 'event329', desc: 'Re-submission removed' },
        transferpaperSubmissionStarts: { category: 'Submission', aa: 'event354', desc: 'Transfer paper submission started' },
        transferpaperSubmissions: { category: 'Submission', aa: 'event356', desc: 'Transfer paper submitted' },
        transferOfferAccepted: { category: 'Submission', aa: 'event330', desc: 'Transfer offer accepted' },
        transferOfferRejected: { category: 'Submission', aa: 'event331', desc: 'Transfer offer rejected' },
        rightsAndAccessStart: { category: 'Submission', aa: 'event350', desc: 'Rights & access started' },
        rightsAndAccessComplete: { category: 'Submission', aa: 'event352', desc: 'Rights & access completed' },

        // ── Video Events ─────────────────────────────────────────────────────
        videoStart: { category: 'Video', aa: 'event105', desc: 'Video started', schema: 'video', fields: ['id'] },
        videoPlay: { category: 'Video', aa: '-', desc: 'Video playing', schema: 'video', fields: ['id'] },
        videoStop: { category: 'Video', aa: '-', desc: 'Video stopped', schema: ['video', '_media'], fields: { video: ['id'], _media: ['timePlayed'] } },
        videoComplete: { category: 'Video', aa: 'event107', desc: 'Video completed', schema: ['video', '_media'], fields: { video: ['id'], _media: ['timePlayed'] } },
        videoMilestone: { category: 'Video', aa: 'event106 (25%), event109 (50%)', desc: 'Video milestone reached', schema: ['video', '_media'], fields: { video: ['id'], _media: ['milestoneEvent'] } },

        // ── Education Events ─────────────────────────────────────────────────
        educationLogin: { category: 'Education', aa: 'event23', desc: 'Education login', schema: 'education' },
        compLogin: { category: 'Education', aa: 'event298', desc: 'Comp login', schema: 'education' },
        h2Login: { category: 'Education', aa: '-', desc: 'H2 login', schema: 'education' },
        studentEnrollment: { category: 'Education', aa: 'event254', desc: 'Student enrolled', schema: 'education' },
        instructorEnrollment: { category: 'Education', aa: 'event255', desc: 'Instructor enrolled', schema: 'education' },
        instructorActivity: { category: 'Education', aa: 'event305', desc: 'Instructor activity', schema: 'education' },
        assignmentAssigned: { category: 'Education', aa: 'event256', desc: 'Assignment assigned', schema: 'education' },
        assignmentAttempted: { category: 'Education', aa: 'event256', desc: 'Assignment attempted', schema: 'education' },
        assignmentStarted: { category: 'Education', aa: 'event258', desc: 'Assignment started', schema: 'education' },
        assignmentCompleted: { category: 'Education', aa: 'event252', desc: 'Assignment completed', schema: 'education' },
        assignmentCreated: { category: 'Education', aa: 'event270', desc: 'Assignment created', schema: 'education' },
        assignmentGraded: { category: 'Education', aa: 'event259', desc: 'Assignment graded', schema: 'education' },
        assignmentNumericGrade: { category: 'Education', aa: '-', desc: 'Assignment numeric grade', schema: 'education' },
        assignmentReassigned: { category: 'Education', aa: 'event261', desc: 'Assignment reassigned', schema: 'education' },
        assignmentReceived: { category: 'Education', aa: 'event251', desc: 'Assignment received', schema: 'education' },
        assessmentStarted: { category: 'Education', aa: 'event262', desc: 'Assessment started', schema: 'education' },
        assessmentCompleted: { category: 'Education', aa: 'event263', desc: 'Assessment completed', schema: 'education' },
        testQuestionAnswered: { category: 'Education', aa: 'event266', desc: 'Test question answered', schema: 'education' },
        questionCorrect: { category: 'Education', aa: 'event263, event267, event266', desc: 'Question answered correctly', schema: 'education' },
        questionIncorrect: { category: 'Education', aa: 'event263, event268, event266', desc: 'Question answered incorrectly', schema: 'education' },
        selfReflectionResult: { category: 'Education', aa: 'event266', desc: 'Self-reflection result', schema: 'education' },
        examStarted: { category: 'Education', aa: 'event296', desc: 'Exam started', schema: 'education' },
        examCreated: { category: 'Education', aa: 'event297', desc: 'Exam created', schema: 'education' },
        examCompleted: { category: 'Education', aa: 'event272', desc: 'Exam completed', schema: 'education' },
        categoryCompleted: { category: 'Education', aa: 'event271', desc: 'Category completed', schema: 'education' },
        itemCategory: { category: 'Education', aa: 'event285', desc: 'Item category', schema: 'education' },
        hesiCategoryScores: { category: 'Education', aa: '-', desc: 'HESI category scores', schema: 'education' },
        packetAssigned: { category: 'Education', aa: 'event282', desc: 'Packet assigned', schema: 'education' },
        packetReceived: { category: 'Education', aa: 'event280', desc: 'Packet received', schema: 'education' },
        packetAccess: { category: 'Education', aa: 'event287', desc: 'Packet accessed', schema: 'education' },
        packetCompleted: { category: 'Education', aa: 'event281', desc: 'Packet completed', schema: 'education' },
        registerExam: { category: 'Education', aa: 'event283', desc: 'Exam registered', schema: 'education' },
        mockExamPassed: { category: 'Education', aa: 'event279', desc: 'Mock exam passed', schema: 'education' },
        mockExamFailed: { category: 'Education', aa: 'event279', desc: 'Mock exam failed', schema: 'education' },
        cohortReport: { category: 'Education', aa: 'event289', desc: 'Cohort report', schema: 'education' },
        studentRemediationReport: { category: 'Education', aa: 'event288', desc: 'Student remediation report', schema: 'education' },
        settingsUpdate: { category: 'Education', aa: 'event274', desc: 'Settings updated', schema: 'education' },
        remediationCustomization: { category: 'Education', aa: 'event284, event292', desc: 'Remediation customization', schema: 'education' },
        accessTeachingMaterial: { category: 'Education', aa: 'event275', desc: 'Teaching material accessed', schema: 'education' },
        accessCodeGeneration: { category: 'Education', aa: 'event286', desc: 'Access code generated', schema: 'education' },
        timeout: { category: 'Education', aa: 'event276', desc: 'Session timeout', schema: 'education' },

        // ── Social ───────────────────────────────────────────────────────────
        socialShare: { category: 'Social', aa: 'event11', desc: 'Social share', data: { sharePlatform: 'string' } },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // CATEGORIES — for grouping in the explorer
    // ══════════════════════════════════════════════════════════════════════════
    categories: [
        'Page', 'Commerce', 'Content', 'Search', 'User', 'Navigation',
        'Form', 'Alert', 'List', 'Recommendation', 'Survey', 'Sync',
        'Chat', 'Feature', 'Submission', 'Video', 'Education', 'Social'
    ]
};
