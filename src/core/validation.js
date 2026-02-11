export const dtmCodeDesc = {
    "dv0": "Error: Page Name Missing - Page Name is not populated in the data layer.",
    "dv1": "Error: Site Section Missing - Site Section is not populated in the data layer.",
    "dv2": "Error: Site Section Lvl 2 Missing - Site Section Lvl 2 is not populated in the data layer.",
    "dv3": "Error: Site Section Lvl 3 Missing - Site Section Lvl 3 is not populated in the data layer.",
    "dv4": "Error: Server Missing - Server is not populated in the data layer.",
    "dv5": "Error: Page URL Missing - Page URL is not populated in the data layer.",
    "dv6": "Error: Referring URL Missing - Referring URL is not populated in the data layer.",
    "dv7": "Error: Visitor ID Missing - Visitor ID is not populated in the data layer.",
    "dv8": "Error: Visitor ID Lvl 2 Missing - Visitor ID Lvl 2 is not populated in the data layer.",
    "dv9": "Error: Visitor ID Lvl 3 Missing - Visitor ID Lvl 3 is not populated in the data layer.",
    "dv10": "Error: Visitor ID Lvl 4 Missing - Visitor ID Lvl 4 is not populated in the data layer."
};

export function initWarnings(warnings) {
    if (warnings && warnings.length > 0) {
        for (var i = 0; i < warnings.length; i++) {
            var code = warnings[i];
            if (dtmCodeDesc[code]) {
                console.warn(dtmCodeDesc[code]);
            } else {
                console.warn("Unknown Warning Code: " + code);
            }
        }
    }
}

export function validateData(data, warnings) {
    if (!data) {
        warnings.push('dv0');
        return;
    }
    // Expected structure:
    // data.page.pageInfo.pageName
    // data.page.category.primaryCategory (site section)
    // etc.

    // Check Page Name
    if (!data.page || !data.page.pageInfo || !data.page.pageInfo.pageName) {
        warnings.push('dv0');
    }

    // Check Site Section (Primary Category)
    if (!data.page || !data.page.category || !data.page.category.primaryCategory) {
        warnings.push('dv1');
    }

    // Additional validations can be added here based on dtmCodeDesc
    // Currently relying on legacy logic which seemed sparse in the snippet, 
    // but we can expand this as needed or copy exact logic if found.
    // The snippet showed: "if (!data) { this.warnings.push('dv0'); return; }"
    // and referenced `dtmCodeDesc`.
}
