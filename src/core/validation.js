export const dtmCodeDesc = {
    dtm1: 'satellite-lib must be placed in the <head> section',
    dtm2: 'trackPageLoad() must be placed and called before the closing </body> tag',
    dtm3: 'trackEvent() must be called at a stage where Document.readyState=complete (e.g. on the load event or a user event)',
    dtm4: 'Embed codes need to be loaded in async mode',
    dtm5: 'Embed codes not in type script',
    dv1: 'visitor.accessType not set but mandatory',
    dv2: 'visitor.accountName not set but mandatory',
    dv3: 'visitor.accountId not set but mandatory',
    dv4: 'page.productName not set but mandatory',
    dv5: 'page.businessUnit not set but mandatory',
    dv6: 'page.name not set but mandatory',
    dv7: 'page.loadTimestamp not set but mandatory',
    dv8: 'page.loadTime not set but mandatory',
    dv9: 'visitor.ipAddress not set but mandatory',
    dv10: 'page.type not set but mandatory',
    dv11: 'page.language not set but mandatory',
    dv12: 'page.environment must be set to \'prod\', \'cert\' or \'dev\'',
    dv13: 'content must be of type array of objects',
    dv14: 'account number must contain at least one \':\', e.g. \'ae:12345\''
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

    // top 5
    if (!(data.visitor && data.visitor.accessType)) {
        warnings.push('dv1');
    }
    if (data.visitor && (data.visitor.accountId || data.visitor.accountName)) {
        if (!data.visitor.accountName) {
            warnings.push('dv2');
        }
        if (!data.visitor.accountId) {
            warnings.push('dv3');
        }
    }
    if (!(data.page && data.page.productName)) {
        warnings.push('dv4');
    }
    if (!(data.page && data.page.businessUnit)) {
        warnings.push('dv5');
    }
    if (!(data.page && data.page.name)) {
        warnings.push('dv6');
    }

    // rp mandatory
    if (data.page && data.page.businessUnit && (data.page.businessUnit.toLowerCase().indexOf('els:rp:') !== -1 || data.page.businessUnit.toLowerCase().indexOf('els:rap:') !== -1)) {
        if (!(data.page && data.page.loadTimestamp)) {
            warnings.push('dv7');
        }
        if (!(data.page && data.page.loadTime)) {
            warnings.push('dv8');
        }
        if (!(data.visitor && data.visitor.ipAddress)) {
            warnings.push('dv9');
        }
        if (!(data.page && data.page.type)) {
            warnings.push('dv10');
        }
        if (!(data.page && data.page.language)) {
            warnings.push('dv11');
        }
    }

    // other
    if (data.page && data.page.environment) {
        var env = data.page.environment.toLowerCase();
        if (!(env === 'dev' || env === 'cert' || env === 'prod')) {
            warnings.push('dv12');
        }
    }
    if (data.content && data.content.constructor !== Array) {
        warnings.push('dv13');
    }

    if (data.visitor && data.visitor.accountId && data.visitor.accountId.indexOf(':') == -1) {
        warnings.push('dv14');
        data.visitor.accountId = "data violation"
    }
}
