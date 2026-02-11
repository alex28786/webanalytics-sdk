
/**
 * Legacy Adobe Analytics Plugins
 * Extracted from rule-pageDataTracker.js
 */

export function attachPlugins(s) {
    if (!s) return;

    s.Util = {};
    s.Util.getQueryParam = function getQueryParam(a, d, f) { function n(g, c) { c = c.split("?").join("&"); c = c.split("#").join("&"); var e = c.indexOf("&"); if (g && (-1 < e || c.indexOf("=") > e)) { e = c.substring(e + 1); e = e.split("&"); for (var h = 0, p = e.length; h < p; h++) { var l = e[h].split("="), q = l[1]; if (l[0].toLowerCase() === g.toLowerCase()) return decodeURIComponent(q || !0) } } return "" } if ("-v" === a) return { plugin: "getQueryParam", version: "4.0.1" }; var b = function () { if ("undefined" !== typeof window.s_c_il) for (var g = 0, c; g < window.s_c_il.length; g++)if (c = window.s_c_il[g], c._c && "s_c" === c._c) return c }(); "undefined" !== typeof b && (b.contextData.getQueryParam = "4.0"); if (a) { d = d || ""; f = (f || "undefined" !== typeof b && b.pageURL || location.href) + ""; (4 < d.length || -1 < d.indexOf("=")) && f && 4 > f.length && (b = d, d = f, f = b); b = ""; for (var m = a.split(","), r = m.length, k = 0; k < r; k++)a = n(m[k], f), "string" === typeof a ? (a = -1 < a.indexOf("#") ? a.substring(0, a.indexOf("#")) : a, b += b ? d + a : a) : b = "" === b ? a : b + (d + a); return b } };

    s.isTracked = function (v) {
        return s.split(s.linkTrackVars, ',').indexOf(v) !== -1;
    };
    s.getValue = function (path) {
        var value = window;
        //var attrMatch; // Unused
        var propChain = path.split('.')
        for (var i = 0, len = propChain.length; i < len; i++) {
            if (value == null) {
                return undefined;
            }
            var prop = propChain[i];
            value = value[prop];
        }
        return value;
    };
    s.productPrefix = function (value) {
        if (window.pageData && pageData.page && pageData.page.productName) {
            var prefix = pageData.page.productName.toLowerCase() + ':';
            if (value.indexOf(prefix) !== 0) {
                return prefix + value;
            }
        }
        return value;
    };
    s.trackEventsList = function (s, propName) {
        try {
            var eventList = s.events ? s.events.split(',') : [];
            var trackEventsList = s.linkTrackEvents ? s.linkTrackEvents.split(',') : [];
            var resultList = [];

            for (var i = 0; i < eventList.length; i++) {
                if (eventList[i].indexOf(':') >= 0) {
                    eventList[i] = eventList[i].substring(0, eventList[i].indexOf(':'));
                } else if (eventList[i].indexOf('=') >= 0) {
                    eventList[i] = eventList[i].substring(0, eventList[i].indexOf('='));
                }

                if (s.linkType) {
                    if (trackEventsList.indexOf(eventList[i]) >= 0) {
                        resultList.push(eventList[i]);
                    }
                } else {
                    resultList.push(eventList[i]);
                }
            }

            for (var i = 0; i < resultList.length; i++) {
                if (resultList[i].indexOf('event') == 0) {
                    resultList[i] = 'e' + resultList[i].substring(5, resultList[i].length);
                }
            }

            s[propName] = resultList.join(',');
            s.linkTrackVars = s.apl(s.linkTrackVars, propName, ',', 2);
        } catch (e) {
            s[propName] = '';
            // _satellite.notify("s.trackEventsList: " + e.message); // shim shouldn't rely on _satellite?
            console.warn("s.trackEventsList: " + e.message);
        }
    };
    s.isDST = function (d) {
        var isDST = false;
        try {
            s._tpDST = {
                2012: '3/11,11/4',
                2013: '3/10,11/3',
                2014: '3/9,11/2',
                2015: '3/8,11/1',
                2016: '3/13,11/6',
                2017: '3/12,11/5',
                2018: '3/11,11/4',
                2019: '3/10,11/3',
                2020: '3/8,11/1',
                2021: '3/14,11/7',
                2022: '3/13,11/6',
                2023: '3/12,11/5',
                2024: '3/10,11/3',
                2025: '3/9,11/2',
                2026: '3/8,11/1',
                2027: '3/14,11/7',
                2028: '3/12,11/5',
                2029: '3/11,11/4',
                2030: '3/10,11/3',
                2031: '3/9,11/2',
                2032: '3/14,11/7',
                2033: '3/13,11/6'
            };
            var dso = s._tpDST[d.getFullYear()].split(/,/);
            var dst_start, dst_end;
            dst_start = new Date(dso[0] + '/' + d.getFullYear());
            dst_end = new Date(dso[1] + '/' + d.getFullYear());

            dst_start = new Date(dst_start.getTime() + 60000 * 7);  // Start DST at 7:00AM UTC / 2:00  AM EST
            dst_end = new Date(dst_end.getTime() + 60000 * 6);  // End DST at 6:00AM UTC / 2:00 AM EDT

            isDST = (d > dst_start && d < dst_end);
        } catch (e) {
            isDST = false;
            console.warn("s.isDST: Error checking for DST:" + e.message);
        }

        return isDST;
    };
    s.getUrlWithHashbang = function () {
        var preUrlParamsStr = document.location.protocol + '//' + document.location.hostname + document.location.pathname;
        try {
            var str = document.location.href.toString();
            var _regex = /^[^\?]+/g;
            var m;
            while ((m = _regex.exec(str)) !== null) {
                if (m.index === _regex.lastIndex) { _regex.lastIndex++; }
                for (var groupIndex = 0; groupIndex < m.length; groupIndex++) {
                    switch (groupIndex) {
                        case 0:
                            preUrlParamsStr = m[groupIndex].toString();
                            break;
                        default:
                            break;
                    }
                }
            }
        } catch (e) {
            console.warn("s.getUrlWithHashbang: " + e.message);
        }
        return preUrlParamsStr;
    };
    s.extractHostname = function (url) {
        var hostname;
        if (url.indexOf("://") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }
        hostname = hostname.split(':')[0];
        hostname = hostname.split('?')[0];
        return hostname;
    };
    s.extractRootDomain = function (url) {
        var domain = s.extractHostname(url),
            splitArr = domain.split('.'),
            arrLen = splitArr.length;

        if (arrLen > 2) {
            domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
            if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
                domain = splitArr[arrLen - 3] + '.' + domain;
            }
        }
        return domain;
    };
    s.getCustomReportSuites = function () {
        // ... (Logic from original lines 235-292)
        // I will copy it verbatim
        if (s.prop2 == 'jb') {
            var site = 'ha', env = 'dev', newSectionName = '';
            if (window.pageData && pageData.page) {
                var srv = pageData.page.server || document.location.hostname, qp = s.Util.getQueryParam('code');

                env = document.location.hostname.match(/\-(qa|test|stag)/g) === null ? 'prod' : 'dev';
                if (srv == 'cell' || srv == 'www.cell.com' || qp == 'cell-site') {
                    site = 'ce';
                    newSectionName = 'cell';
                } else if (srv == 'www.thelancet.com' || qp == 'lancet-site') {
                    site = 'lc';
                    newSectionName = 'the lancet';
                } else {
                    site = 'ha';
                    newSectionName = 'other journal branded sites';
                }
            }

            s.channel = newSectionName;
            return 'elsevier-ha-' + env + ',elsevier-global-' + env;

        } else if (window.pageData && pageData.page && pageData.page.secondaryProductName) {
            var whitelist = ['sd', 'md', 'ev', 'ez', 'pr', 'sv', 'ss', 'mi', 'jb', 'id', 'ih', 'hb', 'pv', 'ds', 'jc', 'ec', 'ck', 'pm', 'ed', 'si', 'qu', 'ex', 'ws', 'st', 'dr', 'ps', 'gf', 've', 'pp', 'em', 'kn', 'ci', 'eb', 'hm', 'es', 'sc', 'eaq', 'fi', 'co', 'el', 'evo', 'so', 'me', 'nco', 'h2', 'cpem', 'cl', 'as', 'prx', 'tox', 'mt', 'ad', 'bd', 'my', 'cp', 'er', 'cs', 'pe', 'tb', 'cw', 'am', 'c2', 'ns', 'rn', 'bp', 'at', 'ep', 'iq', 'path', 'rad', 'stat', 'gsna', 'mc', 'api', 'cc', 'pb', 'med', 'bpdg', 'bpeg', 'bpex', 'uca', 'hps', 'hcp', 'aude', 'sutd', 'rh', 'jpoc', 'chem', 'ezel', 'vlt', 'eoap', 'brxt', 'plum', 'ic', 'et', 'cin', 'rx2', 'oa', 'eman', 'elsa', 'jf', 'ji', 'exl', 'zoom', 'fc'];
            var prods = [
                ['SANDBOX', 'sandbox'],
                ['MDY/mendeley', 'md'],
                ['SD/science', 'sd'],
                ['SC/scopus', 'sc'],
                ['SVE/SciVal', 'sv'],
                ['RA/researcher', 'pb'],
                ['ECOM/elscom', 'ec'],
                ['eman/eman', 'eman'],
                ['ERH/erh', 'rvh']
            ];
            var env = 'dev';
            var secSuite = pageData.page.secondaryProductName.toLowerCase();
            if (pageData.page.environment) {
                env = (pageData.page.environment == 'prod' || pageData.page.environment == 'cert') ? pageData.page.environment : 'dev';
            }
            if (whitelist.indexOf(secSuite) > -1) {
                s.eVar107 = secSuite;
                return s.account + ',elsevier-' + secSuite + '-' + env;
            } else {
                for (var i = 0; i < prods.length; i++) {
                    if (secSuite == prods[i][0].toLowerCase()) {
                        s.eVar107 = prods[i][1];
                        return s.account + ',elsevier-' + prods[i][1] + '-' + env;
                    }
                }
            }

            s.eVar107 = secSuite;
            return s.account;
        }

        return s.account;
    };
    s.removeFromList = function (removeList, removeDlm, fromList, fromDlm) {
        removeDlm = removeDlm || ',';
        fromDlm = fromDlm || ',';
        var rmv = removeList.split(removeDlm), frm = fromList.split(fromDlm), newList = [];
        for (var i = 0; i < frm.length; i++) {
            var removeCurrent = false;
            for (var j = 0; j < rmv.length; j++) {
                if (frm[i] == rmv[j]) {
                    removeCurrent = true;
                    break;
                }
            }

            if (!removeCurrent) {
                newList.push(frm[i]);
            }
        }
        return newList.join(fromDlm);
    }
    s.cleanUrlData = function (val) {
        if (!val) {
            return '';
        }
        val = val.replace(/\+/g, " ");
        val = val.replace(/[',"]/g, "");
        val = val.replace(/\t/g, "");
        val = val.replace(/\n/g, "");
        val = val.toLowerCase();
        return val;
    }
    s.getProductNum = function () {
        var s = this, pn, e = new Date();
        if (!s.c_r('pn')) pn = 1;
        else pn = parseInt(s.c_r('pn')) + 1;
        e.setTime(e.getTime() + (30 * 86400000));
        s.c_w('pn', pn, e);

        return pn;
    }
    s.getKPIName = function (events, prop2) {
        // ... (lines 333-378)
        var kpiMap = {
            'rx': ['2', '3', '5', '6', '9', '12', '23', '25', '37', '39', '87'],
            'rx2': ['2', '3', '5', '6', '9', '12', '23', '25', '37', '39', '87'],
            'sd': ['2', '3', '5', '9', '23', '37'],
            'knovel pi': ['2', '3', '5', '9', '19', '21', '22', '23', '37', '48'],
            'qu': ['3', '5', '19', '29', '30', '33', '39', '84'],
            'md': ['5', '39', '79', '23', '2', '9', '3', '37', '6', '19', '25', '48', '172', '21', '22'],
            'sc': ['5', '39', '79', '23', '2', '9', '3', '37', '6', '19', '25', '48', '172', '21', '22'],
            'sd': ['19', '21', '22', '6', '39', '25', '48'],
            'default': ['3', '37', '6', '5', '39', '19', '25', '48', '9', '12', '23', '2', '21', '22']
        }
        // ...
        var eventNameMap = {
            '2': 'registration',
            '3': 'search',
            '5': 'content view',
            '6': 'facet/filter search',
            '9': 'save alert',
            '12': 'save search',
            '19': 'file downloads',
            '21': 'cta impression',
            '22': 'cta click',
            '23': 'user login',
            '25': 'link out',
            '29': 'full-text html view',
            '30': 'pdf view',
            '33': 'abstract html view',
            '37': 'search results click',
            '39': 'content export',
            '48': 'add to my list',
            '79': 'content addition/import',
            '84': 'content detail/abstract window view',
            '87': 'in-page click',
            '172': 'profile self claim'
        }

        var kpis = (prop2 && kpiMap[prop2]) ? kpiMap[prop2] : kpiMap['default'];

        for (var i = 0; i < kpis.length; i++) {
            var e = kpis[i];
            var exp = new RegExp('event' + e + '(,|$)', 'g')
            if (eventNameMap[e] && events.match(exp)) {
                return eventNameMap[e];
            }
        }
        return '';
    };

    s.apl = new Function("l", "v", "d", "u", "" + "var s=this,m=0;if(!l)l='';if(u){var i,n,a=l.split(d);for(i=0;i<a." + "length;i++){n=a[i];m=m||(u==1?(n==v):(n.toLowerCase()==v.toLowerCas" + "e()));}}if(!m)l=l?l+d+v:v;return l");
    s.getValOnce = new Function("v", "c", "e", "" + "var s=this,a=new Date,v=v?v:v='',c=c?c:c='s_gvo',e=e?e:0,k=s.c_r(c" + ");if(v){a.setTime(a.getTime()+e*86400000);s.c_w(c,v,e?a:0);}return" + " v==k?'':v");
    s.getTimeParting = new Function("h", "z", "" + "var s=this,od;od=new Date('1/1/2000');if(od.getDay()!=6||od.getMont" + "h()!=0){return'Data Not Available';}else{var H,M,D,U,ds,de,tm,da=['" + "Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturda" + "y'],d=new Date();z=z?z:0;z=parseFloat(z);if(s._tpDST){var dso=s._tp" + "DST[d.getFullYear()].split(/,/);ds=new Date(dso[0]+'/'+d.getFullYea" + "r());de=new Date(dso[1]+'/'+d.getFullYear());if(h=='n'&&d>ds&&d<de)" + "{z=z+1;}else if(h=='s'&&(d>de||d<ds)){z=z+1;}}d=d.getTime()+(d.getT" + "imezoneOffset()*60000);d=new Date(d+(3600000*z));H=d.getHours();M=d" + ".getMinutes();M=M<30?'00':'30';D=d.getDay();U=' AM';if(H>=12){U=' P" + "M';H=H-12;}if(H==0){H=12;}D=da[D];tm=H+':'+M+U;return(tm+'|'+D);}");
    s.getDaysSinceLastVisit = new Function("c", "" + "var s=this,e=new Date(),es=new Date(),cval,cval_s,cval_ss,ct=e.getT" + "ime(),day=24*60*60*1000,f1,f2,f3,f4,f5;e.setTime(ct+3*365*day);es.s" + "etTime(ct+30*60*1000);f0='Cookies Not Supported';f1='First Visit';f" + "2='More than 30 days';f3='More than 7 days';f4='Less than 7 days';f" + "5='Less than 1 day';cval=s.c_r(c);if(cval.length==0){s.c_w(c,ct,e);" + "s.c_w(c+'_s',f1,es);}else{var d=ct-cval;if(d>30*60*1000){if(d>30*da" + "y){s.c_w(c,ct,e);s.c_w(c+'_s',f2,es);}else if(d<30*day+1 && d>7*day" + "){s.c_w(c,ct,e);s.c_w(c+'_s',f3,es);}else if(d<7*day+1 && d>day){s." + "c_w(c,ct,e);s.c_w(c+'_s',f4,es);}else if(d<day+1){s.c_w(c,ct,e);s.c" + "_w(c+'_s',f5,es);}}else{s.c_w(c,ct,e);cval_ss=s.c_r(c+'_s');s.c_w(c" + "+'_s',cval_ss,es);}}cval_s=s.c_r(c+'_s');if(cval_s.length==0) retur" + "n f0;else if(cval_s!=f1&&cval_s!=f2&&cval_s!=f3&&cval_s!=f4&&cval_s" + "!=f5) return '';else return cval_s;");
    s.getPreviousValue = new Function("v", "c", "el", "" + "var s=this,t=new Date,i,j,r='';t.setTime(t.getTime()+1800000);if(el" + "){if(s.events){i=s.split(el,',');j=s.split(s.events,',');for(x in i" + "){for(y in j){if(i[x]==j[y]){if(s.c_r(c)) r=s.c_r(c);v?s.c_w(c,v,t)" + ":s.c_w(c,'no value',t);return r}}}}}else{if(s.c_r(c)) r=s.c_r(c);v?" + "s.c_w(c,v,t):s.c_w(c,'no value',t);return r}");
    s.split = new Function("l", "d", "" + "var i,x=0,a=new Array;while(l){i=l.indexOf(d);i=i>-1?i:l.length;a[x" + "++]=l.substring(0,i);l=l.substring(i+d.length);}return a");
    s.p_fo = new Function("n", "" + "var s=this;if(!s.__fo){s.__fo=new Object;}if(!s.__fo[n]){s.__fo[n]=" + "new Object;return 1;}else {return 0;}");
    s.clickPast = new Function("scp", "ct_ev", "cp_ev", "cpc", "" + "var s=this,scp,ct_ev,cp_ev,cpc,ev,tct;if(s.p_fo(ct_ev)==1){if(!cpc)" + "{cpc='s_cpc';}ev=s.events?s.events+',':'';if(scp){s.events=ev+ct_ev" + ";s.c_w(cpc,1,0);}else{if(s.c_r(cpc)>=1){s.events=ev+cp_ev;s.c_w(cpc" + ",0,0);}}}");


    s.c_r = function (name) {
        const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
        return m ? decodeURIComponent(m.pop()) : "";
    };
    s.c_w = function (name, value, days) {
        const exp = days ? "; expires=" + new Date(Date.now() + days * 864e5).toUTCString() : "";
        document.cookie = name + "=" + encodeURIComponent(value) + exp + "; path=/";
        return value;
    };

    if (!s.__ccucr) {
        s.c_rr = s.c_r;
        s.__ccucr = true;
        function c_r(k) {
            var s = this, d = new Date, v = s.c_rr(k), c = s.c_rspers(), i, m, e;
            if (v) return v; k = s.escape ? s.escape(k) : encodeURIComponent(k);
            i = c.indexOf(' ' + k + '='); c = i < 0 ? s.c_rr('s_sess') : c;
            i = c.indexOf(' ' + k + '='); m = i < 0 ? i : c.indexOf('|', i);
            e = i < 0 ? i : c.indexOf(';', i); m = m > 0 ? m : e;
            v = i < 0 ? '' : s.unescape ? s.unescape(c.substring(i + 2 + k.length, m < 0 ? c.length : m)) : decodeURIComponent(c.substring(i + 2 + k.length, m < 0 ? c.length : m));
            return v;
        }
        function c_rspers() {
            var s = this, cv = s.c_rr("s_pers"), date = new Date().getTime(), expd = null, cvarr = [], vcv = "";
            if (!cv) return vcv; cvarr = cv.split(";"); for (var i = 0, l = cvarr.length; i < l; i++) {
                expd = cvarr[i].match(/\|([0-9]+)$/);
                if (expd && parseInt(expd[1]) >= date) { vcv += cvarr[i] + ";"; }
            } return vcv;
        }
        s.c_rspers = c_rspers;
        s.c_r = s.cookieRead = c_r;
    }
    if (!s.__ccucw) {
        s.c_wr = s.c_w;
        s.__ccucw = true;
        function c_w(k, v, e) {
            var ca = (window._satellite && _satellite.getVar) ? _satellite.getVar('Consent Adobe') : null;
            if (ca && ca.aa === false) {
                return false;
            }
            var s = this, d = new Date, ht = 0, pn = 's_pers', sn = 's_sess', pc = 0, sc = 0, pv, sv, c, i, t, f;
            d.setTime(d.getTime() - 60000); if (s.c_rr(k)) s.c_wr(k, '', d); k = s.escape ? s.escape(k) : encodeURIComponent(k);
            pv = s.c_rspers(); i = pv.indexOf(' ' + k + '='); if (i > -1) { pv = pv.substring(0, i) + pv.substring(pv.indexOf(';', i) + 1); pc = 1; }
            sv = s.c_rr(sn); i = sv.indexOf(' ' + k + '='); if (i > -1) {
                sv = sv.substring(0, i) + sv.substring(sv.indexOf(';', i) + 1);
                sc = 1;
            } d = new Date; if (e) {
                if (e == 1) e = new Date, f = e.getYear(), e.setYear(f + 5 + (f < 1900 ? 1900 : 0));
                if (e.getTime() > d.getTime()) {
                    pv += ' ' + k + '=' + (s.escape ? s.escape(v) : encodeURIComponent(v)) + '|' + e.getTime() + ';';
                    pc = 1;
                }
            } else {
                sv += ' ' + k + '=' + (s.escape ? s.escape(v) : encodeURIComponent(v)) + ';';
                sc = 1;
            } sv = sv.replace(/%00/g, ''); pv = pv.replace(/%00/g, ''); if (sc) s.c_wr(sn, sv, 0);
            if (pc) {
                t = pv; while (t && t.indexOf(';') != -1) {
                    var t1 = parseInt(t.substring(t.indexOf('|') + 1, t.indexOf(';')));
                    t = t.substring(t.indexOf(';') + 1); ht = ht < t1 ? t1 : ht;
                } d.setTime(ht); s.c_wr(pn, pv, d);
            }
            return v == s.c_r(s.unescape ? s.unescape(k) : decodeURIComponent(k));
        }
        s.c_w = s.cookieWrite = c_w;
    }
    s.getFullReferringDomains = function () {
        try {
            return new URL(document.referrer).hostname || "";
        } catch (e) {
            return "";
        }
    }
}
