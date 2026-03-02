"""
CJA Configure — Dimension Definitions
======================================
Every custom dimension (eVar, prop, list var, list prop, hierarchy)
that should be synced to CJA as a shared dimension.

Each entry has:
  - name        : display name in CJA  (e.g. "Account ID [v1]")
  - description : human-readable description
  - id          : CJA variable path
  - source      : XDM source field
  - scope       : "hit" (standard) or "product" (merchandising)
  - expiration  : optional persistence setting
"""

# ── Helpers ────────────────────────────────────────────────────────────────

def _evar(num, name, desc, scope="hit", expiration=None):
    """Generate an eVar dimension definition."""
    prefix = "productListItems." if scope == "product" else ""
    return {
        "name": f"{name} [v{num}]",
        "description": desc,
        "id": f"variables/{prefix}_experience.analytics.customDimensions.eVars.eVar{num}",
        "source": f"{prefix}_experience.analytics.customDimensions.eVars.eVar{num}",
        "scope": scope,
        "expiration": expiration,
    }

def _prop(num, name, desc):
    """Generate a prop dimension definition."""
    return {
        "name": f"{name} [c{num}]",
        "description": desc,
        "id": f"variables/_experience.analytics.customDimensions.props.prop{num}",
        "source": f"_experience.analytics.customDimensions.props.prop{num}",
        "scope": "hit",
        "expiration": None,
    }

def _list_var(num, name, desc):
    """Generate a list variable dimension definition."""
    return {
        "name": f"{name} [list{num}]",
        "description": desc,
        "id": f"variables/_experience.analytics.customDimensions.lists.list{num}",
        "source": f"_experience.analytics.customDimensions.lists.list{num}",
        "scope": "hit",
        "expiration": None,
    }

def _list_prop(num, name, desc, delimiter):
    """Generate a list prop dimension definition."""
    return {
        "name": f"{name} [listprop{num}]",
        "description": f"{desc} (delimiter: '{delimiter}')",
        "id": f"variables/_experience.analytics.customDimensions.listProps.prop{num}",
        "source": f"_experience.analytics.customDimensions.listProps.prop{num}",
        "scope": "hit",
        "expiration": None,
    }

def _hier(num, name, desc):
    """Generate a hierarchy dimension definition."""
    return {
        "name": f"{name} [hier{num}]",
        "description": desc,
        "id": f"variables/_experience.analytics.customDimensions.hierarchies.hier{num}",
        "source": f"_experience.analytics.customDimensions.hierarchies.hier{num}",
        "scope": "hit",
        "expiration": None,
    }


# ══════════════════════════════════════════════════════════════════════════
#  STANDARD (HIT-SCOPED) eVars  — from mapAdobeVars + rules.js
# ══════════════════════════════════════════════════════════════════════════

EVARS_HIT = [
    _evar(1, "Search Criteria", "Search query string"),
    _evar(2, "Search Type", "Type of search performed"),
    _evar(3, "Search Total Results", "Total search results count"),
    _evar(4, "Product Name (Form)", "Product name from form views"),
    _evar(7, "Account Name", "Institutional account name"),
    _evar(15, "Search Click Position", "Position of clicked search result"),
    _evar(16, "Account ID (Event)", "Account ID passed via events"),
    _evar(19, "Search Advanced Criteria", "Advanced search criteria"),
    _evar(21, "Promo Clicked ID", "Clicked promotion ID"),
    _evar(22, "Test ID", "A/B test identifier"),
    _evar(27, "AutoSuggest Search Data", "Auto-suggest search metadata"),
    _evar(30, "Share Platform", "Social share platform name"),
    _evar(33, "Access Type", "Visitor access type"),
    _evar(34, "Order Promo Code", "Promotional code used in order"),
    _evar(39, "Order Payment Method", "Payment method for orders"),
    _evar(41, "Visitor Industry", "Visitor's industry"),
    _evar(42, "Visitor SIS ID", "Student Information System ID"),
    _evar(43, "Error Type", "Page or form error type"),
    _evar(44, "Updated User Fields", "Fields updated in user profile"),
    _evar(48, "Email Recipient ID", "Email campaign recipient ID"),
    _evar(51, "Email Message ID", "Email campaign message ID"),
    _evar(52, "Department ID", "Visitor department ID"),
    _evar(53, "Department Name", "Visitor department name"),
    _evar(57, "GenAI Input", "Generative AI prompt input"),
    _evar(58, "GenAI Details", "Generative AI response details"),
    _evar(59, "Journal Publisher", "Journal publisher name"),
    _evar(60, "Search Within Content Criteria", "Search within content query"),
    _evar(61, "Search Within Results Criteria", "Search within results query"),
    _evar(62, "Search Result Types", "Types of search results returned"),
    _evar(69, "Rows Exported", "Number of rows exported"),
    _evar(74, "Journal Info", "Journal metadata composite"),
    _evar(76, "Email Broadlog ID", "Adobe Campaign broadlog ID"),
    _evar(78, "Visitor Details", "Visitor detail string"),
    _evar(97, "Alert Type", "Alert notification type"),
    _evar(102, "Form Type", "Form type identifier"),
    _evar(103, "Conversion Driver", "Conversion driver element"),
    _evar(105, "Search Current Page", "Current page in search results"),
    _evar(106, "App Session ID", "Application session identifier"),
    _evar(107, "Secondary Product Name", "Secondary product name"),
    _evar(110, "Conversion Page", "Page where conversion occurred"),
    _evar(112, "Step", "Interaction step number"),
    _evar(117, "Search Database", "Database searched"),
    _evar(124, "Button Type", "Button type for click/hover events"),
    _evar(126, "Environment", "Page environment (dev/staging/prod)"),
    _evar(141, "Search Criteria Original", "Original unmodified search query"),
    _evar(143, "Tabs", "Active tab name"),
    _evar(148, "Platform Name", "Visitor platform name"),
    _evar(149, "Platform ID", "Visitor platform ID"),
    _evar(152, "Product ID", "Visitor product ID"),
    _evar(153, "Superaccount ID", "Superaccount identifier"),
    _evar(154, "Superaccount Name", "Superaccount name"),
    _evar(156, "AutoSuggest Selected Term", "Selected auto-suggest term"),
    _evar(157, "AutoSuggest Typed Term", "Typed auto-suggest term"),
    _evar(161, "Search Channel", "Search channel"),
    _evar(162, "AutoSuggest Category", "Auto-suggest category"),
    _evar(163, "AutoSuggest Details", "Auto-suggest details"),
    _evar(165, "Education Program ID and Name", "Education program composite"),
    _evar(166, "Education Student and Instructor ID", "Student/instructor IDs"),
    _evar(167, "Education Days Before/After Due Date", "Days relative to due date"),
    _evar(168, "Education Semester", "Academic semester"),
    _evar(169, "Search Facet Operation", "Facet add/remove operation"),
    _evar(171, "Education Duration and Score", "Assignment duration and score"),
    _evar(172, "Education Test Question", "Test question identifier"),
    _evar(173, "Search Details", "Extended search details"),
    _evar(174, "Campaign Spredfast ID", "Spredfast campaign ID"),
    _evar(175, "TMX Device ID", "ThreatMetrix device ID"),
    _evar(176, "TMX Request ID", "ThreatMetrix request ID"),
    _evar(177, "Context Domain", "Context domain"),
    _evar(178, "Education Course ID and Name", "Course composite"),
    _evar(179, "Education Assignment ID Name and Type", "Assignment composite"),
    _evar(180, "Education Module ID and Name", "Module composite"),
    _evar(182, "Education Attempt", "Attempt number"),
    _evar(183, "Education Course Section ID and Name", "Course section composite"),
    _evar(184, "Education Question Type", "Question type"),
    _evar(188, "Education Time Since Last Attempt", "Time since previous attempt"),
    _evar(189, "Experimentation User ID", "Experimentation user identifier"),
    _evar(190, "Identity User", "Identity user"),
    _evar(191, "Alert Details", "Alert detail string"),
    _evar(192, "Education Category ID and Name", "Category composite"),
    _evar(193, "Education Exam ID Name and Type", "Exam composite"),
    _evar(195, "Education Exam Group ID and Name", "Exam group composite"),
    _evar(196, "Education Score Origin", "Score origin type"),
    _evar(199, "ID+ Parameters", "Identity Plus parameters"),
]


# ══════════════════════════════════════════════════════════════════════════
#  MERCHANDISING (PRODUCT-SCOPED) eVars  — from setProductsVariable
# ══════════════════════════════════════════════════════════════════════════

EVARS_PRODUCT = [
    _evar(17, "Content Format", "Content format (e.g. PDF, HTML)", scope="product"),
    _evar(20, "Content Type", "Content type with access type", scope="product"),
    _evar(28, "Bibliographic Info", "Bibliographic metadata composite", scope="product"),
    _evar(38, "Online/Publish Date", "Online date ^ publish date composite", scope="product"),
    _evar(63, "Content Breadcrumb", "Content navigation breadcrumb", scope="product"),
    _evar(70, "Content MAP ID", "MAP identifier", scope="product"),
    _evar(71, "Content Relevancy Score", "Search relevancy score", scope="product"),
    _evar(73, "Content Status", "Content status", scope="product"),
    _evar(75, "Content Title", "Content title", scope="product"),
    _evar(80, "Content Entitlement Type", "Entitlement type", scope="product"),
    _evar(93, "Content Record Type", "Record type classification", scope="product"),
    _evar(99, "Content Export Type", "Export format type", scope="product"),
    _evar(100, "Content Section", "Content section", scope="product"),
    _evar(104, "Content Detail", "Content detail string", scope="product"),
    _evar(111, "Content Previous Status", "Previous content status", scope="product"),
    _evar(116, "Content Position", "Position in results/list", scope="product"),
    _evar(122, "Content Online Date", "Online publication date", scope="product"),
    _evar(123, "Content Publish Date", "Print publication date", scope="product"),
    _evar(127, "Content Publish Age", "Days since publish date", scope="product"),
    _evar(128, "Content Online Age", "Days since online date", scope="product"),
    _evar(129, "Content Publication Title", "Publication title", scope="product"),
    _evar(130, "Content Special Issue Title", "Special issue title", scope="product"),
    _evar(131, "Content Special Issue Number", "Special issue number", scope="product"),
    _evar(132, "Content Volume Title", "Volume title", scope="product"),
    _evar(133, "Content Publication Section", "Publication section", scope="product"),
    _evar(134, "Content Publication Specialty", "Publication specialty", scope="product"),
    _evar(135, "Content ISSN", "ISSN identifier", scope="product"),
    _evar(139, "Content Reference Module Title", "Reference module title", scope="product"),
    _evar(140, "Content Reference Module ISBN", "Reference module ISBN", scope="product"),
    _evar(142, "Content Import Type", "Import type", scope="product"),
    _evar(159, "Content ID2", "Secondary content ID", scope="product"),
    _evar(160, "Content ID3", "Tertiary content ID", scope="product"),
    _evar(164, "Content Provider", "Content provider name", scope="product"),
    _evar(170, "Content Citation Style", "Citation style name", scope="product"),
    _evar(200, "Content Manuscript ID", "Manuscript identifier", scope="product"),
]


# ══════════════════════════════════════════════════════════════════════════
#  PROPS  — from mapAdobeVars + rules.js
# ══════════════════════════════════════════════════════════════════════════

PROPS = [
    _prop(1, "Account ID", "Institutional account ID"),
    _prop(2, "Product Name", "Page-level product name"),
    _prop(4, "Page Type", "Page type classification"),
    _prop(6, "Search Type", "Type of search performed"),
    _prop(7, "Search Facet List", "Active search facets"),
    _prop(8, "Search Feature Used", "Search feature name"),
    _prop(12, "User ID", "Visitor user ID"),
    _prop(13, "Search Sort Type", "Search results sort order"),
    _prop(14, "Page Load Time", "Page load time in ms"),
    _prop(15, "Support Topic Name", "Support topic"),
    _prop(16, "Business Unit", "Business unit"),
    _prop(20, "Tab Name", "Content tab or window name"),
    _prop(21, "Search Criteria", "Search query (prop)"),
    _prop(23, "Content Link Click", "Content link click action"),
    _prop(24, "Page Language", "Page language code"),
    _prop(25, "Product Feature", "Product feature name"),
    _prop(28, "Support Search Criteria", "Support search query"),
    _prop(29, "Account Name", "Institutional account name"),
    _prop(30, "IP Address", "Visitor IP address"),
    _prop(33, "Application Version", "Product application version"),
    _prop(40, "UX Properties", "UX properties"),
    _prop(45, "GenAI Answer Details", "Generative AI answer detail"),
    _prop(46, "GenAI ConversationId+PromptCounter", "GenAI conversation tracking"),
    _prop(47, "Form Error ID", "Form error identifier"),
    _prop(53, "Action Name", "Interaction action name"),
    _prop(60, "Search Data Form Criteria", "Data form search criteria"),
    _prop(63, "Extended Page Name", "Extended page name"),
    _prop(65, "Online State", "Online/offline state"),
]


# ══════════════════════════════════════════════════════════════════════════
#  LIST PROPS — from mapper.js LIST_PROPS_CONFIG
# ══════════════════════════════════════════════════════════════════════════

LIST_PROPS = [
    _list_prop(34, "Website Extensions", "Website extension list", "|"),
    _list_prop(36, "Content IDs", "Content ID list", ","),
    _list_prop(66, "Research Network IDs", "Research network IDs", "|"),
    _list_prop(67, "Research Networks", "Research network names", "|"),
    _list_prop(69, "Content Details List", "Content details", ","),
]


# ══════════════════════════════════════════════════════════════════════════
#  LIST VARIABLES — from mapAdobeVars
# ══════════════════════════════════════════════════════════════════════════

LIST_VARS = [
    _list_var(2, "Widget Names", "Active widget names on the page"),
    _list_var(3, "Promo IDs", "Promotion IDs present on page"),
]


# ══════════════════════════════════════════════════════════════════════════
#  HIERARCHY VARIABLES
# ══════════════════════════════════════════════════════════════════════════

HIER_VARS = [
    _hier(1, "Site Hierarchy", "Site section hierarchy (colon-delimited)"),
]


# ══════════════════════════════════════════════════════════════════════════
#  COMBINED — all dimensions in one list
# ══════════════════════════════════════════════════════════════════════════

DIMENSIONS = EVARS_HIT + EVARS_PRODUCT + PROPS + LIST_PROPS + LIST_VARS + HIER_VARS
