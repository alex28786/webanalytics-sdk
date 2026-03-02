"""
CJA Configure — Metric Definitions
====================================
Every custom metric (event) that should be synced to CJA as
a shared metric.

Each entry has:
  - name          : display name in CJA  (e.g. "Page Load [e27]")
  - description   : human-readable description
  - id            : CJA variable path
  - source        : XDM source field
  - scope         : "hit" (standard) or "product" (merchandising/content)
  - deduplication : optional dedup config
"""

# ── Helper ─────────────────────────────────────────────────────────────────

def _event_bucket(num):
    """Return the XDM event bucket name for a given event number."""
    n = int(num)
    start = ((n - 1) // 100) * 100 + 1
    end = start + 99
    return f"event{start}to{end}"


def _metric(num, name, desc, scope="hit", deduplication=None):
    """Generate a metric definition."""
    bucket = _event_bucket(num)
    prefix = "productListItems." if scope == "product" else ""
    return {
        "name": f"{name} [e{num}]",
        "description": desc,
        "id": f"metrics/{prefix}_experience.analytics.{bucket}.event{num}.value",
        "source": f"{prefix}_experience.analytics.{bucket}.event{num}.value",
        "scope": scope,
        "deduplication": deduplication,
    }


# ══════════════════════════════════════════════════════════════════════════
#  STANDARD (HIT-SCOPED) EVENTS  — from rules.js events arrays
# ══════════════════════════════════════════════════════════════════════════

METRICS_HIT = [
    # ── Page & Navigation ──────────────────────────────────────
    _metric(5, "Content View", "Content view event"),
    _metric(27, "Page Load", "Initial page load"),
    _metric(84, "Content Window Load", "Content window loaded"),
    _metric(87, "Content Link Click", "Content link clicked"),

    # ── Search ─────────────────────────────────────────────────
    _metric(233, "AutoSuggest Term Clicked", "Auto-suggest term selected"),

    # ── Commerce ───────────────────────────────────────────────
    _metric(22, "CTA Click", "Call-to-action clicked"),
    _metric(21, "CTA Impression", "Call-to-action impression"),
    _metric(39, "Content Export / Rows Exported", "Content export or rows exported"),
    _metric(47, "Form Submit", "Form submitted"),
    _metric(50, "Form Start", "Form started"),
    _metric(26, "Form Error", "Form error occurred"),

    # ── Content Lifecycle ──────────────────────────────────────
    _metric(11, "Content Share", "Content shared"),
    _metric(19, "Content Download", "Content downloaded"),
    _metric(79, "Content Addition / Import", "Content added or imported"),
    _metric(80, "Content Print", "Content printed"),
    _metric(123, "Content Download Start", "Content download initiated"),
    _metric(125, "Content Export Start", "Content export initiated"),
    _metric(188, "Content Addition Start", "Content addition started"),
    _metric(189, "Content Interaction Step", "Content interaction step"),
    _metric(190, "Content Edited", "Content edited"),
    _metric(191, "Content Edit Start", "Content edit initiated"),
    _metric(206, "Content Share Start", "Content share initiated"),
    _metric(210, "Copy to Clipboard", "Content copied to clipboard"),
    _metric(231, "Content Deletion", "Content deleted"),
    _metric(232, "Content Selection", "Content selected"),
    _metric(241, "Content Dismissal", "Content dismissed"),
    _metric(253, "Content Citation Change", "Citation changed"),
    _metric(318, "Content Download Request", "Content download requested"),

    # ── User & Account ─────────────────────────────────────────
    _metric(23, "Education Login", "Education login event"),
    _metric(172, "Claim Profile", "Profile claimed"),
    _metric(199, "Association Start", "Association process started"),
    _metric(200, "Associated", "Successfully associated"),
    _metric(204, "Button Click", "Generic button clicked"),
    _metric(213, "Claim Start", "Claim process started"),
    _metric(215, "Close Tab", "Tab closed"),
    _metric(247, "Follow Profile", "Profile followed"),
    _metric(269, "Button Hover", "Button hovered"),
    _metric(298, "Comp Login", "Complimentary login"),
    _metric(305, "Instructor Activity", "Instructor activity event"),
    _metric(333, "Account Association Start", "Account association started"),

    # ── Search Alerts ──────────────────────────────────────────
    _metric(235, "Edit Alert", "Alert edited"),
    _metric(236, "Edit Alert Start", "Alert edit initiated"),
    _metric(237, "Delete Alert", "Alert deleted"),
    _metric(238, "Delete Alert Start", "Alert delete initiated"),

    # ── Education ──────────────────────────────────────────────
    _metric(251, "Assignment Received", "Assignment received by student"),
    _metric(252, "Assignment Completed", "Assignment completed"),
    _metric(255, "Instructor Enrollment", "Instructor enrolled"),
    _metric(256, "Assignment Assigned/Attempted", "Assignment assigned or attempted"),
    _metric(258, "Assignment Started", "Assignment started"),
    _metric(259, "Assignment Graded", "Assignment graded"),
    _metric(260, "Education Numeric Grade", "Numeric grade value (counter)"),
    _metric(261, "Assignment Reassigned", "Assignment reassigned"),
    _metric(262, "Assessment Started", "Assessment started"),
    _metric(263, "Assessment Completed", "Assessment completed"),
    _metric(270, "Assignment Created", "Assignment created"),
    _metric(271, "Category Completed", "Category completed"),
    _metric(272, "Exam Completed", "Exam completed"),
    _metric(277, "Education Time Since Last Attempt", "Time since last attempt (counter)"),
    _metric(286, "Access Code Generation", "Access code generated"),
    _metric(289, "Cohort Report", "Cohort report accessed"),
    _metric(290, "Education Time to Complete", "Time to complete (counter)"),
    _metric(296, "Exam Started", "Exam started"),
    _metric(297, "Exam Created", "Exam created"),

    # ── GenAI ──────────────────────────────────────────────────
    _metric(340, "GenAI Result Word Count", "Gen AI result word count (counter)"),
    _metric(341, "GenAI Result Instances", "Gen AI result instances"),
    _metric(342, "GenAI Citations Count", "Gen AI citations count (counter)"),
    _metric(343, "GenAI Citation Instances", "Gen AI citation instances"),
    _metric(344, "GenAI Refinements Offered Count", "Gen AI refinements count (counter)"),
    _metric(345, "GenAI Refinement Instances", "Gen AI refinement instances"),
    _metric(346, "GenAI Content Updated", "Gen AI content updated"),
    _metric(347, "GenAI Closed", "Gen AI panel closed"),
    _metric(362, "GenAI Processing Time", "Gen AI processing time (counter)"),
    _metric(363, "GenAI Processing Instances", "Gen AI processing instances"),
    _metric(364, "GenAI Conversation", "Gen AI conversation (serialised)"),
    _metric(365, "GenAI Prompt", "Gen AI prompt (serialised)"),
    _metric(366, "GenAI Content Requested", "Gen AI content requested"),

    # ── Export ─────────────────────────────────────────────────
    _metric(246, "Rows Exported Count", "Number of exported rows (counter)"),
    _metric(334, "Rows Exported Failed Count", "Number of failed exported rows (counter)"),
]


# ══════════════════════════════════════════════════════════════════════════
#  MERCHANDISING (PRODUCT-SCOPED) EVENTS  — from setProductsVariable
# ══════════════════════════════════════════════════════════════════════════

METRICS_PRODUCT = [
    _metric(20, "Cart Revenue", "Revenue from cart additions", scope="product"),
    _metric(51, "GenAI Content Updated (Content)", "GenAI content update in content context", scope="product"),
    _metric(181, "Content Page View", "Content page view event", scope="product"),
    _metric(182, "Content Download (Content)", "Content download in content context", scope="product"),
    _metric(184, "Content Export (Content)", "Content export in content context", scope="product"),
    _metric(239, "Content Datapoints", "Number of datapoints (counter)", scope="product"),
    _metric(240, "Content Documents", "Number of documents (counter)", scope="product"),
    _metric(264, "Recommendation Views", "Recommendation views", scope="product"),
    _metric(319, "Content Download Request (Content)", "Content download request in content context", scope="product"),
    _metric(335, "Content Size", "Content size in bytes (counter)", scope="product"),
    _metric(336, "Content Size Instances", "Content size instances", scope="product"),
]


# ══════════════════════════════════════════════════════════════════════════
#  COMBINED — all metrics in one list
# ══════════════════════════════════════════════════════════════════════════

METRICS = METRICS_HIT + METRICS_PRODUCT
