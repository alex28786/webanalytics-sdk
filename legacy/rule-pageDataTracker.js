// load visitor id as early as possible
(function ensureEcidStored () {
    // Check if the ID is already in local storage (persistent, safe)
    if (localStorage.getItem("aa_ecid")) {
        return; 
    }

    // If not found, fetch it asynchronously
    window.alloy("getIdentity", { namespaces: ["ECID"] })
        .then(result => {
            if (result.identity?.ECID) {
                // Store the ID persistently
                localStorage.setItem("aa_ecid", result.identity.ECID);
            }
        })
        .catch(console.error);
})();

(function createSatelliteShim() {
    if (window.__sShim) return;
    window.__sShim = { version: "0.5.0" };

    // --- per-hit legacy s factory ------------------------------------------------
    function createHitS(ctx, eventName) {
        // Inherit all plugin methods from the global host (window.s)
        const s = Object.create(window.s);

        // 1) Define Page View events
        const PAGE_VIEW_EVENTS = ["newPage", "searchResultsUpdated"];
        const isPageView = PAGE_VIEW_EVENTS.indexOf(eventName) !== -1;

        // 2) Set link properties based on event type
        // If not a page view, it's a link hit ('o' = custom link)
        s.linkType = isPageView ? "" : (ctx?.linkType || "o");
        
        // Set linkName to eventName for link hits; empty for page views
        s.linkName = isPageView ? "" : (eventName || ctx?.linkName || "manual_link_hit");

        // Per-hit fields (data only; keeps methods on prototype)
        s.usePlugins = true;
        s.abort = false;

        s.linkTrackVars = "";
        s.linkTrackEvents = "";
        s.events = "";
        s.products = "";
        s.contextData = {};

        s.pageName = undefined;
        s.server = undefined;
        s.channel = undefined;
        s.campaign = undefined;
        s.state = undefined;
        s.zip = undefined;

        s.referrer = document.referrer || "";
        s.pageURL = location.href;

        //s.linkType = ctx && ctx.hitType === "link" ? (ctx.linkType || "o") : "";
        //s.linkName = (ctx && ctx.linkName) || "";
        s.linkURL = (ctx && ctx.linkURL) || "";

        s.version = "sshim-" + window.__sShim.version

        return s;
    }

    // --- public legacy namespace -------------------------------------------------
    window.s = window.s || {};

    /**
     *  ###### LEGACY PLUGINS
     */
    // #region Plugins

    s.Util = {};
    s.Util.getQueryParam = function getQueryParam(a, d, f) { function n(g, c) { c = c.split("?").join("&"); c = c.split("#").join("&"); var e = c.indexOf("&"); if (g && (-1 < e || c.indexOf("=") > e)) { e = c.substring(e + 1); e = e.split("&"); for (var h = 0, p = e.length; h < p; h++) { var l = e[h].split("="), q = l[1]; if (l[0].toLowerCase() === g.toLowerCase()) return decodeURIComponent(q || !0) } } return "" } if ("-v" === a) return { plugin: "getQueryParam", version: "4.0.1" }; var b = function () { if ("undefined" !== typeof window.s_c_il) for (var g = 0, c; g < window.s_c_il.length; g++)if (c = window.s_c_il[g], c._c && "s_c" === c._c) return c }(); "undefined" !== typeof b && (b.contextData.getQueryParam = "4.0"); if (a) { d = d || ""; f = (f || "undefined" !== typeof b && b.pageURL || location.href) + ""; (4 < d.length || -1 < d.indexOf("=")) && f && 4 > f.length && (b = d, d = f, f = b); b = ""; for (var m = a.split(","), r = m.length, k = 0; k < r; k++)a = n(m[k], f), "string" === typeof a ? (a = -1 < a.indexOf("#") ? a.substring(0, a.indexOf("#")) : a, b += b ? d + a : a) : b = "" === b ? a : b + (d + a); return b } };

    s.isTracked = function (v) {
        return s.split(s.linkTrackVars, ',').indexOf(v) !== -1;
    };
    s.getValue = function (path) {
        var value = window;
        var attrMatch;
        propChain = path.split('.')
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
            _satellite.notify("s.trackEventsList: " + e.message);
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
            _satellite.notify("s.isDST: Error checking for DST:" + e.message);
        }

        return isDST;
    };
    s.getUrlWithHashbang = function () {
        var preUrlParamsStr = document.location.protocol + '//' + document.location.hostname + document.location.pathname;
        try {
            // set the default value!

            // We must handle ck's "#!" that will sit in document.location.hash but also must account for librarial macros.
            str = document.location.href.toString();
            // split only the doc section of the URI out of the URI before ?
            _regex = /^[^\?]+/g; // gets all before the first param
            var m;
            while ((m = _regex.exec(str)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === _regex.lastIndex) { _regex.lastIndex++; }
                for (groupIndex = 0; groupIndex < m.length; groupIndex++) {
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
            _satellite.notify("s.getUrlWithHashbang: " + e.message);
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
    }
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
    // TODO replace plugin with websdk version
    //s.getPercentPageViewed = new Function("n", "" + "var s=this,W=window,EL=W.addEventListener,AE=W.attachEvent,E=['load" + "','unload','scroll','resize','zoom','keyup','mouseup','touchend','o" + "rientationchange','pan'];W.s_Obj=s;s_PPVid=(n=='-'?s.pageName:n)||s" + ".pageName||location.href;if(!W.s_PPVevent){s.s_PPVg=function(n,r){v" + "ar k='s_ppv',p=k+'l',c=s.c_r(n||r?k:p),a=c.indexOf(',')>-1?c.split(" + "',',10):[''],l=a.length,i;a[0]=unescape(a[0]);r=r||(n&&n!=a[0])||0;" + "a.length=10;if(typeof a[0]!='string')a[0]='';for(i=1;i<10;i++)a[i]=" + "!r&&i<l?parseInt(a[i])||0:0;if(l<10||typeof a[9]!='string')a[9]='';" + "if(r){s.c_w(p,c);s.c_w(k,'?')}return a};W.s_PPVevent=function(e){va" + "r W=window,D=document,B=D.body,E=D.documentElement,S=window.screen|" + "|0,Ho='offsetHeight',Hs='scrollHeight',Ts='scrollTop',Wc='clientWid" + "th',Hc='clientHeight',C=100,M=Math,J='object',N='number',s=W.s_Obj|" + "|W.s||0;e=e&&typeof e==J?e.type||'':'';if(!e.indexOf('on'))e=e.subs" + "tring(2);s_PPVi=W.s_PPVi||0;if(W.s_PPVt&&!e){clearTimeout(s_PPVt);s" + "_PPVt=0;if(s_PPVi<2)s_PPVi++}if(typeof s==J){var h=M.max(B[Hs]||E[H" + "s],B[Ho]||E[Ho],B[Hc]||E[Hc]),X=W.innerWidth||E[Wc]||B[Wc]||0,Y=W.i" + "nnerHeight||E[Hc]||B[Hc]||0,x=S?S.width:0,y=S?S.height:0,r=M.round(" + "C*(W.devicePixelRatio||1))/C,b=(D.pageYOffset||E[Ts]||B[Ts]||0)+Y,p" + "=h>0&&b>0?M.round(C*b/h):0,O=W.orientation,o=!isNaN(O)?M.abs(o)%180" + ":Y>X?0:90,L=e=='load'||s_PPVi<1,a=s.s_PPVg(s_PPVid,L),V=function(i," + "v,f,n){i=parseInt(typeof a==J&&a.length>i?a[i]:'0')||0;v=typeof v!=" + "N?i:v;v=f||v>i?v:i;return n?v:v>C?C:v<0?0:v};if(new RegExp('(iPod|i" + "Pad|iPhone)').exec(navigator.userAgent||'')&&o){o=x;x=y;y=o}o=o?'P'" + ":'L';a[9]=L?'':a[9].substring(0,1);s.c_w('s_ppv',escape(W.s_PPVid)+" + "','+V(1,p,L)+','+(L||!V(2)?p:V(2))+','+V(3,b,L,1)+','+X+','+Y+','+x" + "+','+y+','+r+','+a[9]+(a[9]==o?'':o))}if(!W.s_PPVt&&e!='unload')W.s" + "_PPVt=setTimeout(W.s_PPVevent,333)};for(var f=W.s_PPVevent,i=0;i<E." + "length;i++)if(EL)EL(E[i],f,false);else if(AE)AE('on'+E[i],f);f()};v" + "ar a=s.s_PPVg();return!n||n=='-'?a[1]:a");
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
            var ca = _satellite.getVar('Consent Adobe');
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
    // #endregion

    /**
     * ####### DO Plugins
     */
    window.s_doPlugins = function (s) {
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
        try {
            promos = [];
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

        s.eVar21 = _satellite.getVar('Promo - Clicked ID');
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
        var accountRemap = _satellite.getVar('Account');
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
            var userId = _satellite.getVar('Visitor - User ID');
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
            var uniqueAccountId = _satellite.getVar('Visitor - Account ID');
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

                var resultsOnPage = _satellite.getVar('Search - Results per Page')
                    , currentPage = s.getValOnce(((!s.eVar19 || (s.eVar19 != s.prop21)) ? s.prop21 : '') + ':' + _satellite.getVar('Search - Current Page'), 'e13', 0);
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
            var ts = _satellite.getVar('Page - Load Timestamp')
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

                var sessionId = _satellite.getVar('Visitor - App Session ID');

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
            if (s.getValOnce(_satellite.getVar('Search - Criteria'), 'e78', 0)) {
                s.events = s.apl(s.events, 'event78', ',', 2);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event78', ',', 2);
                if (window.eventData && eventData.search) {
                    eventData.search.resultsPosition = '';
                }
            }
        }

        // link-out
        if (s.eVar37 && s.products && s.isTracked('eVar37')) {
            s.events = s.apl(s.events, 'event44', ',', 2);
            s.linkTrackVars = s.apl(s.linkTrackVars, 'events', ',', 2);
            s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event44', ',', 2);
        }

        // forms
        var formName = _satellite.getVar('Form - Step + Name');
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
        if ((formName.indexOf('register') > -1 || formName.indexOf('registration') > -1) && s.isTracked('eVar43')) {
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
        if (!s.isTracked('eVar103') && window.eventData && eventData.conversionDriver && eventData.conversionDriver.name) {
            s.eVar103 = eventData.conversionDriver.name;
            s.eVar110 = 'D=pageName';
            s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar103,eVar110', ',', 2);
        }

        // copy conversion driver over with linear allocation
        if (s.eVar103 && s.isTracked('eVar103')) {
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
        s.prop65 = _satellite.getVar('Page - Online State');
        if (s.prop65) {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'prop65', ',', 2);
        }

        // copy user ids - a&e ids
        var userId = _satellite.getVar('Visitor - User ID');
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
        if (s.isTracked('list3')) {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'prop36', ',', 2);
        }
        if (s.isTracked('eVar33')) {
            s.linkTrackVars = s.apl(s.linkTrackVars, 'prop37', ',', 2);
        }

        s.prop38 = _satellite.getVar("Maturity Level");
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop38', ',', 2);

        s.prop39 = _satellite.getVar("Source");
        s.linkTrackVars = s.apl(s.linkTrackVars, 'prop39', ',', 2);
        if (s.prop39 && s.prop39 == 'id') {
            s.prop42 = s.eVar33 ? 'D=v33' : '';
            if (s.isTracked('eVar33')) {
                s.linkTrackVars = s.apl(s.linkTrackVars, 'prop42', ',', 2);
            }
        }

        // get KPI name
        s.prop3 = s.getKPIName(s.events);

        // blacklisted
        s.abort = _satellite.getVar('s_blacklist');
    };

    /**
     * ####### XDM mapper
     */
    // #region xdm mapper
    const EVAR_MAX = 200, PROP_MAX = 75;
    const PAGE_EVENTS = new Set(["pageLoad", "newPage", "searchResultsUpdated"]);
    const AUTH = { unknown: "ambiguous", authenticated: "authenticated" };

    const csvSet = s =>
        new Set(String(s || "").split(",").map(v => v.trim()).filter(Boolean));
    const parseEvents = str =>
        String(str || "").split(",").map(v => v.trim()).filter(Boolean);
    const setIfEmpty = (obj, key, val) => {
        if (val == null || val === "") return;
        if (obj[key] == null) obj[key] = val;
    };

    function parseProducts(productsStr) {
        if (!productsStr || typeof productsStr !== "string") return [];
        var entries = productsStr.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        var items = [];

        for (var i = 0; i < entries.length; i++) {
            var parts = entries[i].split(";");

            var category = parts[0] ? parts[0] : undefined;
            var product = parts[1] ? parts[1] : undefined;

            var extras = [];
            var quantity, price;

            // quantity (parts[2]) may be missing or polluted with kvps (contains '=' or '|')
            var qRaw = parts[2];
            if (qRaw != null && qRaw !== "" && !/[=|]/.test(qRaw) && isFinite(Number(qRaw))) {
                quantity = Number(qRaw);
            } else if (qRaw) {
                extras.push(qRaw);
            }

            // price (parts[3]) may be missing or polluted with kvps (contains '=' or '|')
            var pRaw = parts[3];
            if (pRaw != null && pRaw !== "" && !/[=|]/.test(pRaw) && isFinite(Number(pRaw))) {
                price = Number(pRaw);
            } else if (pRaw) {
                extras.push(pRaw);
            }

            // remaining segments (index >= 4) are extras
            for (var j = 4; j < parts.length; j++) {
                if (parts[j]) extras.push(parts[j]);
            }

            // flatten extras split by '|' into kvps/flags
            var kvp = {};
            for (var k = 0; k < extras.length; k++) {
                var chunk = String(extras[k]);
                var tokens = chunk.split("|");
                for (var t = 0; t < tokens.length; t++) {
                    var tok = tokens[t].trim();
                    if (!tok) continue;
                    var eq = tok.indexOf("=");
                    if (eq > 0) {
                        var key = tok.slice(0, eq).trim();
                        var val = tok.slice(eq + 1).trim();
                        if (key) kvp[key] = val;
                    } else {
                        kvp[tok] = true;
                    }
                }
            }

            items.push({
                category: category,
                product: product,
                quantity: (typeof quantity === "number" && isFinite(quantity)) ? quantity : undefined,
                price: (typeof price === "number" && isFinite(price)) ? price : undefined,
                attributes: kvp
            });
        }
        return items;
    }

    // --- merge productListItems (append-only, avoid dupes by SKU/name+category) ----
    function mergeProductListItems(existing, toAdd) {
        if (!Array.isArray(existing)) existing = [];
        if (!Array.isArray(toAdd) || !toAdd.length) return existing;

        function key(it) {
            return [it.SKU || it.name || "", it.category || ""].join("|");
        }

        var seen = new Set(existing.map(key));
        for (var i = 0; i < toAdd.length; i++) {
            var k = key(toAdd[i]);
            if (!seen.has(k)) {
                existing.push(toAdd[i]);
                seen.add(k);
            }
        }
        return existing;
    }

    // --- map AA events tokens to XDM commerce counters ------------------------------
    function applyCommerceEventCounters(xdm, allowEvt, aaEventTokens) {
        if (!Array.isArray(aaEventTokens) || !aaEventTokens.length) return;

        // Normalize set for quick lookup
        var evSet = new Set(aaEventTokens.filter(Boolean));

        // Only set if the corresponding token is allowed for link hits (respect linkTrackEvents)
        function bump(path, token) {
            if (!allowEvt || allowEvt(token)) {
                var tgt = path.reduce(function (obj, key) {
                    obj[key] = obj[key] || {};
                    return obj[key];
                }, xdm);
                tgt.value = typeof tgt.value === "number" ? tgt.value + 1 : 1;
            }
        }

        if (evSet.has("prodView")) bump(["commerce", "productViews"], "prodView");
        if (evSet.has("scView")) bump(["commerce", "productListViews"], "scView");
        if (evSet.has("scCheckout")) bump(["commerce", "checkouts"], "scCheckout");
        if (evSet.has("purchase")) bump(["commerce", "purchases"], "purchase");
    }

    // --- main mapper ----------------------------------------------------------------
    window.s_mapIntoXdm = function s_mapIntoXdm(s, xdm, { eventName, hitType } = {}) {
        if (!s || s.abort) return xdm || {};

        // --- helpers
        // #region helpers
        function allowVarFactory(varsCsv) {
            // For link calls, respect linkTrackVars strictly: if not set -> track nothing
            if (!varsCsv) return () => false;
            const set = csvSet(varsCsv);
            return (n) => set.has("*") || set.has(n);
        }

        function allowEvtFactory(evtsCsv) {
            // For link calls, respect linkTrackEvents strictly: if not set -> track no events
            if (!evtsCsv) return () => false;
            const set = csvSet(evtsCsv);
            // Normalize tokens like "event342=11" / "event364:abc" / "event51"
            return (tokenOrId) => {
                const str = String(tokenOrId || "");
                const m = /^event(\d+)/i.exec(str);
                const id = m ? `event${m[1]}` : str;
                return set.has("*") || set.has(id);
            };
        }

        function resolveCopyTarget(token) {
            // token can be "v7", "c29", "pageName", or "g"
            if (!token) return null;
            const t = token.toString().trim().toLowerCase();
            if (t[0] === "v") return "eVar" + parseInt(t.slice(1), 10);
            if (t[0] === "c") return "prop" + parseInt(t.slice(1), 10);
            if (t === "pagename") return "::pageName";
            if (t === "g") return "::g";
            return null;
        }

        function resolveCopyChain(varName, sObj, seen = new Set()) {
            let val = sObj[varName];
            if (typeof val !== "string") {
                return val != null ? val + "" : val;
            }
            if (!/^D=/i.test(val)) return val;

            let current = varName;
            let curVal = val;

            while (typeof curVal === "string" && /^D=/i.test(curVal)) {
                if (seen.has(current)) break; // cycle guard
                seen.add(current);

                const token = curVal.slice(2); // after "D="
                const target = resolveCopyTarget(token);
                if (!target) break;

                if (target === "::pageName") return sObj.pageName;
                if (target === "::g") return sObj.pageURL; // full URL incl. params

                current = target;
                curVal = sObj[target];
            }
            return curVal;
        }

        function eventBucketName(evNum) {
            const n = Number(evNum);
            if (!isFinite(n) || n < 1) return null;
            const start = Math.floor((n - 1) / 100) * 100 + 1;
            const end = start + 99;
            return `event${start}to${end}`;
        }

        function addStructuredEvent(targetXdm, evToken) {
            // evToken: "event5", "event10:SER", "event230=5"
            const m = /^event(\d+)(?::([^=]+))?(?:=(.+))?$/i.exec(evToken);
            if (!m) return;
            const num = parseInt(m[1], 10);
            const ser = m[2];    // serialization id (after :)
            const valRaw = m[3]; // numeric/string value (after =)
            const bucket = eventBucketName(num);
            if (!bucket) return;

            targetXdm._experience = targetXdm._experience || {};
            targetXdm._experience.analytics = targetXdm._experience.analytics || {};
            targetXdm._experience.analytics[bucket] = targetXdm._experience.analytics[bucket] || {};
            const node = targetXdm._experience.analytics[bucket][`event${num}`] =
                targetXdm._experience.analytics[bucket][`event${num}`] || {};

            if (ser != null && ser !== "") {
                node.id = String(ser);
                node.value = 1
            } else if (valRaw != null) {
                node.value = Number(valRaw);
            } else {
                node.value = 1;
            }
        }

        // Add structured event into a *product item* (merchandising event)
        function addStructuredEventIntoProduct(item, keyOrToken, valMaybe) {
            // keyOrToken can be "event5", "event10:SER", "event230" (counter)
            // If valMaybe is provided (from "event342=11"), use value branch.
            const m = /^event(\d+)(?::([^=]+))?$/i.exec(String(keyOrToken));
            if (!m) return;
            const num = parseInt(m[1], 10);
            const ser = m[2]; // may be undefined if not a serialization key
            const bucket = eventBucketName(num);
            if (!bucket) return;

            item._experience = item._experience || {};
            item._experience.analytics = item._experience.analytics || {};
            const a = item._experience.analytics;
            a[bucket] = a[bucket] || {};
            const node = a[bucket][`event${num}`] = a[bucket][`event${num}`] || {};

            if (typeof valMaybe !== "undefined" && valMaybe !== null && valMaybe !== true) {
                node.value = Number(valMaybe);
            } else if (ser != null && ser !== "") {
                node.id = String(ser);
                node.val = 1
            } else {
                node.value = 1;
            }
        }

        function mapLinkType(t) {
            // AppMeasurement: 'd' download, 'e' exit, 'o' other (custom)
            const v = (t || "").toString().toLowerCase();
            if (v === "d") return "download";
            if (v === "e") return "exit";
            return "other";
        }
        var LIST_PROPS_CONFIG = {
            prop34: "|",
            prop36: ",",
            prop66: "|",
            prop67: "|",
            prop69: ","
        };

        // Configuration for hierarchies delimiter
        var HIER_DELIMITER = ":";

        // Helper: Parse delimited string into Key Value Pair array
        function parseListToKeyValuePairs(value, delimiter) {
            if (!value || value === "") return [];
            var items = value.split(delimiter);
            return items.map(function (item) {
                var trimmed = item.trim();
                return {
                    key: trimmed,
                    value: trimmed
                };
            });
        }

        // Helper: Parse hierarchy into structured format
        function parseHierarchy(value, delimiter) {
            if (!value || value === "") return null;
            var values = value.split(delimiter).map(function (v) { return v.trim(); }).join(delimiter);
            return {
                delimiter: delimiter,
                values: values
            };
        }

        // 1) resolve hit type
        var resolvedHitType = hitType || (PAGE_EVENTS.has(eventName) ? "page" : "link");

        // 2) allowed sets (strict for link; page allows all)
        var allowVar = resolvedHitType === "link"
            ? allowVarFactory(s.linkTrackVars)
            : () => true;

        var allowEvt = resolvedHitType === "link"
            ? allowEvtFactory(s.linkTrackEvents)
            : () => true;

        // 3) ensure base branches
        xdm = xdm || {};
        xdm.web = xdm.web || {};
        xdm.web.webPageDetails = xdm.web.webPageDetails || {};
        xdm.web.webReferrer = xdm.web.webReferrer || {};
        xdm._experience = xdm._experience || {};
        xdm._experience.analytics = xdm._experience.analytics || {};
        var cd = xdm._experience.analytics.customDimensions =
            xdm._experience.analytics.customDimensions || {};
        cd.eVars = cd.eVars || {};
        cd.props = cd.props || {};
        cd.lists = cd.lists || {};
        cd.listProps = cd.listProps || {};
        cd.hierarchies = cd.hierarchies || {};

        // 4) specials (standard AA → XDM mappings)
        setIfEmpty(xdm.web.webPageDetails, "name", s.pageName);
        setIfEmpty(xdm.web.webPageDetails, "server", s.server);
        setIfEmpty(xdm.web.webPageDetails, "URL", s.pageURL);
        setIfEmpty(xdm.web.webReferrer, "URL", s.referrer);
        if (allowVar("campaign")) {
            xdm.marketing = xdm.marketing || {};
            setIfEmpty(xdm.marketing, "trackingCode", s.campaign);
        }
        if (allowVar("channel")) setIfEmpty(xdm.web.webPageDetails, "siteSection", s.channel);

        if (allowVar("currencyCode") && s.currencyCode) {
            xdm.commerce = xdm.commerce || {};
            xdm.commerce.order = xdm.commerce.order || {};
            setIfEmpty(xdm.commerce.order, "currencyCode", s.currencyCode);
        }
        if (allowVar("purchaseID") && s.purchaseID) {
            xdm.commerce = xdm.commerce || {};
            xdm.commerce.order = xdm.commerce.order || {};
            setIfEmpty(xdm.commerce.order, "purchaseID", s.purchaseID);
        }

        // 5) eVars / props with legacy D= copy resolution
        for (var i = 1; i <= EVAR_MAX; i++) {
            var ek = "eVar" + i;
            if (!allowVar(ek) || cd.eVars[ek] != null) continue;
            var ev = resolveCopyChain(ek, s);
            if (ev != null && ev !== "") cd.eVars[ek] = ev;
        }
        for (var p = 1; p <= PROP_MAX; p++) {
            var pk = "prop" + p;
            if (!allowVar(pk) || cd.props[pk] != null) continue;
            var pv = resolveCopyChain(pk, s);
            if (pv != null && pv !== "") cd.props[pk] = pv;
        }

        // NEW: 5a) List Variables (list1, list2, list3)
        for (var l = 1; l <= 3; l++) {
            var listKey = "list" + l;
            if (!allowVar(listKey)) continue;
            var listValue = s[listKey];
            if (listValue && listValue !== "") {
                var kvPairs = parseListToKeyValuePairs(listValue, "|");
                if (kvPairs.length > 0) {
                    cd.lists[listKey] = {
                        list: kvPairs
                    };
                }
            }
        }

  // NEW: 5b) List Props (configured props with delimiters)
  for (var propKey in LIST_PROPS_CONFIG) {
    if (!LIST_PROPS_CONFIG.hasOwnProperty(propKey)) continue;
    if (!allowVar(propKey)) continue;
    
    var propValue = s[propKey];
    if (propValue && propValue !== "") {
      var delimiter = LIST_PROPS_CONFIG[propKey];
      var valuesArray = propValue.split(delimiter).map(function(v) { return v.trim(); });
      if (valuesArray.length > 0) {
        cd.listProps[propKey] = {
          delimiter: delimiter,
          values: valuesArray // Store as array per XDM spec
        };
      }
    }
  }

  // NEW: 5c) Hierarchy Variables (hier1, hier2, hier3)
  for (var h = 1; h <= 5; h++) {
    var hierKey = "hier" + h;
    if (!allowVar(hierKey)) continue;
    var hierValue = s[hierKey];
    if (hierValue && hierValue !== "") {
      var valuesArray = hierValue.split(HIER_DELIMITER).map(function(v) { return v.trim(); });
      if (valuesArray.length > 0) {
        cd.hierarchies[hierKey] = {
          delimiter: HIER_DELIMITER,
          values: valuesArray // Store as array per XDM spec
        };
      }
    }
  }

        // 6) events: respect linkTrackEvents on link calls (via allowEvt)
        var aaEventTokens = [];
        if (s.events) {
            var add = parseEvents(s.events).filter(allowEvt); // allowEvt understands = and : tokens now
            if (add.length) {
                // (a) merged flat tokens list (if you still consume it downstream)
                var existing = Array.isArray(xdm._experience.analytics.events)
                    ? xdm._experience.analytics.events
                    : [];
                var merged = Array.from(new Set(existing.concat(add)));
                //xdm._experience.analytics.events = merged;
                aaEventTokens = merged;

                // (b) structured mapping into bucketed event nodes with value/id
                merged.forEach(function (tok) { addStructuredEvent(xdm, tok); });
            }
        }
        // (c) optional commerce counters derived from AA tokens
        applyCommerceEventCounters(xdm, allowEvt, aaEventTokens);

        // 7) products -> XDM commerce.productListItems with merchandising eVars & events
        if (allowVar("products") && s.products) {
            var parsed = parseProducts(s.products);

            var toItems = parsed.map(function (it) {
                var qty = (typeof it.quantity === "number" && isFinite(it.quantity)) ? it.quantity : undefined;
                var price = (typeof it.price === "number" && isFinite(it.price)) ? it.price : undefined;
                var priceTotal = (price != null && qty != null) ? (price * qty) : price;

                // Base AA → XDM product fields
                var item = {
                    category: it.category,
                    quantity: qty,
                    priceTotal: priceTotal
                };
                if (it.product) {
                    item.SKU = it.product;   // preferred
                    item.name = it.product;  // convenience duplicate
                }

                /*
                // Keep original attributes (non-AA or downstream usage)
                if (it.attributes && Object.keys(it.attributes).length) {
                  item.attributes = it.attributes;
                }
                */

                // Merchandising eVars & Events from product syntax
                if (it.attributes && Object.keys(it.attributes).length) {
                    // Prepare branches
                    item._experience = item._experience || {};
                    item._experience.analytics = item._experience.analytics || {};
                    const a = item._experience.analytics;
                    a.customDimensions = a.customDimensions || {};
                    a.customDimensions.eVars = a.customDimensions.eVars || {};

                    // Walk attributes to detect eVarN and eventN[=v] or eventN:SER
                    Object.keys(it.attributes).forEach(function (key) {
                        const val = it.attributes[key];

                        // eVar merchandising
                        const mVar = /^eVar(\d+)$/i.exec(key);
                        if (mVar) {
                            const eIdx = parseInt(mVar[1], 10);
                            if (isFinite(eIdx) && eIdx >= 1 && eIdx <= EVAR_MAX) {
                                a.customDimensions.eVars[`eVar${eIdx}`] = (val === true || val == null) ? "1" : String(val);
                            }
                            return;
                        }

                        // event merchandising
                        // Handle three shapes:
                        //   1) key "event342" with val "11"        -> value=11
                        //   2) key "event364:SERIAL" with val true -> id="SERIAL"
                        //   3) key "event51" with val true         -> counter value=1
                        const mEvt = /^event(\d+)(?::([^=]+))?$/i.exec(key);
                        if (mEvt) {
                            const evNum = parseInt(mEvt[1], 10);
                            if (!isFinite(evNum) || evNum < 1) return;

                            // If value provided (case 1), set value. Else if serialization suffix present (case 2), set id. Else (case 3) counter = 1
                            if (val !== true && val !== undefined && val !== null) {
                                addStructuredEventIntoProduct(item, `event${evNum}`, val);
                            } else if (mEvt[2]) {
                                addStructuredEventIntoProduct(item, `event${evNum}:${mEvt[2]}`);
                            } else {
                                addStructuredEventIntoProduct(item, `event${evNum}`);
                            }
                        }
                    });
                }

                return item;
            }).filter(function (x) { return x.SKU || x.name; });

            if (toItems.length) {
                xdm.commerce = xdm.commerce || {};
                xdm.commerce.productListItems = mergeProductListItems(xdm.commerce.productListItems, toItems);
            }
        }

        // 8) eventType + link/page details + counters
        if (!xdm.eventType) {
            xdm.eventType = resolvedHitType === "link"
                ? "web.webinteraction.linkClicks"
                : "web.webpagedetails.pageViews";
        }

        if (resolvedHitType === "link") {
            xdm.web.webInteraction = xdm.web.webInteraction || {};
            // Populate link details
            setIfEmpty(xdm.web.webInteraction, "URL", s.linkURL);
            // Use eventName for link click name per request; fallback to s.linkName
            xdm.web.webInteraction.name = eventName || xdm.web.webInteraction.name || s.linkName || "";
            // Type: "other" for custom, else mapped from AA
            const mappedType = mapLinkType(s.linkType);
            xdm.web.webInteraction.type = mappedType === "other" ? "other" : mappedType;

            // increment linkClicks counter
            xdm.web.webInteraction.linkClicks = xdm.web.webInteraction.linkClicks || {};
            setIfEmpty(xdm.web.webInteraction.linkClicks, "value", 1);
        } else {
            // page view counter
            xdm.web.webPageDetails.pageViews = xdm.web.webPageDetails.pageViews || {};
            setIfEmpty(xdm.web.webPageDetails.pageViews, "value", 1);
        }

        // 9) DATA OBJECT FOR LEGACY ANALYTICS OVERRIDE
        // This ensures s.products is ALWAYS set in AA, bypassing XDM auto-mapping logic.
        var data = {
            "__adobe": {
                "analytics": {}
            }
        };

        // Map the raw products string directly if it exists and is allowed
        if (allowVar("products") && s.products) {
            data.__adobe.analytics.products = s.products;
        }

        // Handle Events with linkTrackEvents respect
        if (s.events) {
            // 1. Parse the string into tokens
            var rawTokens = parseEvents(s.events); 
            
            // 2. Filter using your existing allowEvt factory
            var filteredTokens = rawTokens.filter(allowEvt); 
            
            // 3. Re-join into a comma-separated string for the data object
            if (filteredTokens.length > 0) {
                data.__adobe.analytics.events = filteredTokens.join(",");
            }
        }

        // Return both objects so your alloy call can use them: alloy("sendEvent", { xdm, data });
        return {
            xdm: xdm,
            data: data
        };
    };

    // #endregion

    const rules = {
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
                s.events = s.apl(s.events, 'event290=' + _satellite.getVar("Education - Time to Complete"), ',', 1);
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
                s.events = s.apl(s.events, 'event277=' + _satellite.getVar("Education - Time Since Last Attempt"), ',', 1);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event290', ',', 1);
                s.events = s.apl(s.events, 'event290=' + _satellite.getVar("Education - Time to Complete"), ',', 1);
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
                s.events = s.apl(s.events, 'event260=' + _satellite.getVar("Education - Assignment Numeric Grade"), ',', 1);
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
                s.events = s.apl(s.events, 'event260=' + _satellite.getVar("Education - Assignment Numeric Grade"), ',', 1);
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
                s.eVar124 = _satellite.getVar('Event - Button Type');
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar124', ',', 2);
            }
        },
        buttonHover: {
            events: ["event269"],
            run: function (s) {
                s.eVar124 = _satellite.getVar('Event - Button Type');
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
                s.events = s.apl(s.events, 'event260=' + _satellite.getVar("Education - Assignment Numeric Grade"), ',', 1);
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
                s.eVar143 = _satellite.getVar('Page - Tabs');
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
                s.events = s.apl(s.events, 'event290=' + _satellite.getVar("Education - Time to Complete"), ',', 1);
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
                s.eVar112 = _satellite.getVar('Event - Step');
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
                var rows = _satellite.getVar('Event - Rows Exported');
                if (rows) {
                    s.events = s.apl(s.events, 'event246=' + rows, ',', 2);
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event246', ',', 2);
                }

                var rowsFailed = _satellite.getVar('Event - Rows Exported Failed');
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
                s.eVar112 = _satellite.getVar('Event - Step');
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
                s.eVar103 = _satellite.getVar('Event - Conversion Driver');
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
                s.events = s.apl(s.events, 'event260=' + _satellite.getVar("Education - Assignment Numeric Grade"), ',', 1);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event290', ',', 1);
                s.events = s.apl(s.events, 'event290=' + _satellite.getVar("Education - Time to Complete"), ',', 1);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event277', ',', 1);
                s.events = s.apl(s.events, 'event277=' + _satellite.getVar("Education - Time Since Last Attempt"), ',', 1);
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
                s.events = s.apl(s.events, 'event260=' + _satellite.getVar("Education - Assignment Numeric Grade"), ',', 1);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event290', ',', 1);
                s.events = s.apl(s.events, 'event290=' + _satellite.getVar("Education - Time to Complete"), ',', 1);
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
                s.events = s.apl(s.events, 'event290=' + _satellite.getVar("Education - Time to Complete"), ',', 1);
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
                s.events = s.apl(s.events, 'event291=' + _satellite.getVar("Education - Maximum Packets Issued"), ',', 1);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event293', ',', 1);
                s.events = s.apl(s.events, 'event293=' + _satellite.getVar("Education - Benchmark Score"), ',', 1);
                s.linkTrackEvents = s.apl(s.linkTrackEvents, 'event293', ',', 1);
                s.events = s.apl(s.events, 'event294=' + _satellite.getVar("Education - Days Until Due"), ',', 1);
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
                s.events = s.apl(s.events, 'event290=' + _satellite.getVar("Education - Time to Complete"), ',', 1);
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
                s.eVar137 = _satellite.getVar('Event - Sync Method');
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar137', ',', 2);

                s.eVar138 = _satellite.getVar('Event - Sync Duration');
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar138', ',', 2);
            }
        },
        syncFailure: {
            events: ["event209"],
            run: function (s) {
                s.eVar137 = _satellite.getVar('Event - Sync Method');
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar137', ',', 2);

                s.eVar138 = _satellite.getVar('Event - Sync Duration');
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar138', ',', 2);
            }
        },
        syncStart: {
            events: ["event207"],
            run: function (s) {
                s.eVar137 = _satellite.getVar('Event - Sync Method');
                s.linkTrackVars = s.apl(s.linkTrackVars, 'eVar137', ',', 2);

                s.eVar138 = _satellite.getVar('Event - Sync Duration');
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
                s.list2 = _satellite.getVar('Page - Widget Names');
                s.linkTrackVars = s.apl(s.linkTrackVars, 'list2', ',', 2);
            }
        },
        widgetImpression: {
            events: ["event178"],
            run: function (s) {
                s.list2 = _satellite.getVar('Page - Widget Names');
                s.linkTrackVars = s.apl(s.linkTrackVars, 'list2', ',', 2);
            }
        }

    };

    function resolveTrackValue(val, ctx) {
        if (typeof val !== "string") return val;
        const m = val.match(/^\^(.+)\^$/);
        if (m && m[1]) {
            try {
                return _satellite.getVar(m[1]);
            } catch (e) {
                try { _satellite.logger && _satellite.logger.log(`resolveTrackValue error for "%${m[1]}%": ${e && e.message}`); } catch (_) { }
            }
        }
        return val; // includes literals like "D=c29" or plain strings
    }

    // helper: apply a single rule to s (track, events, run) with debug logging
    function applyRuleToS(s, rule, eventName) {
        if (!rule || !s) return;

        // 1) track variables
        if (rule.track && typeof rule.track === "object") {
            try {
                Object.keys(rule.track).forEach((varName) => {
                    const resolved = resolveTrackValue(rule.track[varName]);
                    s[varName] = resolved;
                    // ensure tracked
                    s.linkTrackVars = s.apl(s.linkTrackVars, varName, ",", 1);
                });
            } catch (e) {
                try { _satellite.logger && _satellite.logger.log(`applyRuleToS(track) error for "${eventName}": ${e && e.message}`); } catch (_) { }
            }
        }

        // 2) events
        if (Array.isArray(rule.events)) {
            try {
                rule.events.forEach((evt) => {
                    const str = String(evt);
                    const eventId = str.split("=")[0];
                    s.linkTrackEvents = s.apl(s.linkTrackEvents, eventId, ",", 1);
                    s.events = s.apl(s.events, str, ",", 1);
                });
            } catch (e) {
                try { _satellite.logger && _satellite.logger.log(`applyRuleToS(events) error for "${eventName}": ${e && e.message}`); } catch (_) { }
            }
        }

        // 3) optional custom code
        if (typeof rule.run === "function") {
            try {
                rule.run(s);
            } catch (e) {
                try { _satellite.logger && _satellite.logger.log(`applyRuleToS(run) error for "${eventName}": ${e && e.message}`); } catch (_) { }
            }
        }
    }

    window.s_onBeforeEventSendHook = function (content, ctx) {
        // 1) derive eventName
        const eventName =
            content?.xdm?._experience?.analytics?.eventName ||
            content?.eventName ||
            "";

        // 2) always create a fresh s
        const s = createHitS(ctx, eventName);

        // 3) if there's a matching rule, apply it first (before doPlugins)
        try {
            const rule = (typeof rules === "object" && rules) ? rules[eventName] : undefined;
            if (rule) applyRuleToS(s, rule, eventName);
        } catch (e) {
            try { _satellite.logger && _satellite.logger.log(`rule processing error for "${eventName}": ${e && e.message}`); } catch (_) { }
        }

        // 4) run doPlugins on the same s (no guards; log on error)
        try {
            window.s_doPlugins(s);
        } catch (e) {
            try { _satellite.logger && _satellite.logger.log(`s_doPlugins error: ${e && e.message}`); } catch (_) { }
        }

        s.__didDoPlugins = true;
        if (content) content.__s = s;

        // 5) Identity Mapping
        const state = (s.eVar33 && /(reg(-|_|:))|registered/i.test(s.eVar33))
            ? AUTH.authenticated
            : AUTH.unknown;

        if (s.prop12) {
            const rawId = String(s.prop12).trim(); // e.g. "ae:1234567"

            content.xdm = content.xdm || {};
            content.xdm.identityMap = content.xdm.identityMap || {};

            // --- 1. Generic "userid" (The Catch-All) ---
            content.xdm.identityMap.userid = [{
                id: rawId,
                authenticatedState: state,
                primary: false 
            }];

            // --- 2. Specific "user_ae" (AE System Only) ---
            // Check if it starts with "ae:" (case insensitive)
            if (/^ae:/i.test(rawId)) {
                content.xdm.identityMap.user_ae = [{
                    id: rawId,
                    authenticatedState: state,
                    primary: false
                }];
            }
        }

        // 6) Integrated Merge
        // Call mapper and capture both XDM and Data branches
        const mappingResult = window.s_mapIntoXdm(s, content.xdm, { eventName });

        // Re-assign the enriched XDM (which now includes your identityMap + mapper output)
        content.xdm = mappingResult.xdm;

        // Assign the Data object for direct AA mapping
        content.data = mappingResult.data;
    };

})();


var pageDataTracker = {
    eventCookieName: 'eventTrack',
    debugCookie: 'els-aa-debugmode',
    debugCounter: 1,
    warnings: [],
    measures: {},
    timeoffset: 0

    , trackPageLoad: function (data) {
        if (window.pageData && ((pageData.page && pageData.page.noTracking == 'true') || window.pageData_isLoaded)) {
            return false;
        }

        this.updatePageData(data);

        this.initWarnings();
        if (!(window.pageData && pageData.page && pageData.page.name)) {
            console.error('pageDataTracker.trackPageLoad() called without pageData.page.name being defined!');
            return;
        }

        this.processIdPlusData(window.pageData);

        if (window.pageData && pageData.page && !pageData.page.loadTime) {
            pageData.page.loadTime = performance ? Math.round((performance.now())).toString() : '';
        }

        if (window.pageData && pageData.page) {
            var localTime = new Date().getTime();
            if (pageData.page.loadTimestamp) {
                // calculate timeoffset
                var serverTime = parseInt(pageData.page.loadTimestamp);
                if (!isNaN(serverTime)) {
                    this.timeoffset = pageData.page.loadTimestamp - localTime;
                }
            } else {
                pageData.page.loadTimestamp = localTime;
            }
        }

        this.validateData(window.pageData);

        try {
            var cookieTest = 'aa-cookie-test';
            this.setCookie(cookieTest, cookieTest);
            if (this.getCookie(cookieTest) != cookieTest) {
                this.warnings.push('dtm5');
            }
            this.deleteCookie(cookieTest);
        } catch (e) {
            this.warnings.push('dtm5');
        }

        this.registerCallbacks();
        this.setAnalyticsData();

        // handle any cookied event data
        this.getEvents();

        window.pageData_isLoaded = true;

        this.debugMessage('Init - trackPageLoad()', window.pageData);

        _satellite.logger.log("[pageDataTracker] trackPageLoad - calling alloy");
        this.triggerAlloy("newPage");
    }

    , trackEvent: function (event, data, callback) {
        if (window.pageData && pageData.page && pageData.page.noTracking == 'true') {
            return false;
        }

        if (!window.pageData_isLoaded) {
            if (this.isDebugEnabled()) {
                console.log('[AA] pageDataTracker.trackEvent() called without calling trackPageLoad() first.');
            }
            return false;
        }

        if (event) {
            this.initWarnings();
            if (event === 'newPage') {
                // auto fillings
                if (data && data.page && !data.page.loadTimestamp) {
                    data.page.loadTimestamp = '' + (new Date().getTime() + this.timeoffset);
                }
                this.processIdPlusData(data);
            }

            window.eventData = data ? data : {};
            window.eventData.eventName = event;
            if (!_satellite.getVar('blacklisted')) {
                this.handleEventData(event, data);

                if (event === 'newPage') {
                    this.validateData(window.pageData);
                }
                this.debugMessage('Event: ' + event, data);
                _satellite.logger.log("[pageDataTracker] trackEvent - calling alloy");
                this.triggerAlloy(event);
            } else {
                this.debugMessage('!! Blocked Event: ' + event, data);
            }
        }

        if (typeof (callback) == 'function') {
            callback.call();
        }
    }

    , triggerAlloy(eventName) {
        const xdm = {};

        // carry eventName so the hook can decide page vs link
        xdm._experience = xdm._experience || {};
        xdm._experience.analytics = xdm._experience.analytics || {};
        xdm._experience.analytics.eventName = eventName;

        // let the Web SDK callback run doPlugins + s->XDM merge
        window.alloy && window.alloy("sendEvent", { xdm });

        if(eventName == "newPage") {
            _satellite.track("newPage"); // support triggers like pendo
        }
    }

    , processIdPlusData: function (data) {
        if (data && data.visitor && data.visitor.idPlusData) {
            var idPlusFields = ['userId', 'accessType', 'accountId', 'accountName'];
            for (var i = 0; i < idPlusFields.length; i++) {
                if (typeof data.visitor.idPlusData[idPlusFields[i]] !== 'undefined') {
                    data.visitor[idPlusFields[i]] = data.visitor.idPlusData[idPlusFields[i]];
                }
            }
            data.visitor.idPlusData = undefined;
        }
    }

    , validateData: function (data) {
        if (!data) {
            this.warnings.push('dv0');
            return;
        }

        // top 5
        if (!(data.visitor && data.visitor.accessType)) {
            this.warnings.push('dv1');
        }
        if (data.visitor && (data.visitor.accountId || data.visitor.accountName)) {
            if (!data.visitor.accountName) {
                this.warnings.push('dv2');
            }
            if (!data.visitor.accountId) {
                this.warnings.push('dv3');
            }
        }
        if (!(data.page && data.page.productName)) {
            this.warnings.push('dv4');
        }
        if (!(data.page && data.page.businessUnit)) {
            this.warnings.push('dv5');
        }
        if (!(data.page && data.page.name)) {
            this.warnings.push('dv6');
        }

        // rp mandatory
        if (data.page && data.page.businessUnit && (data.page.businessUnit.toLowerCase().indexOf('els:rp:') !== -1 || data.page.businessUnit.toLowerCase().indexOf('els:rap:') !== -1)) {
            if (!(data.page && data.page.loadTimestamp)) {
                this.warnings.push('dv7');
            }
            if (!(data.page && data.page.loadTime)) {
                this.warnings.push('dv8');
            }
            if (!(data.visitor && data.visitor.ipAddress)) {
                this.warnings.push('dv9');
            }
            if (!(data.page && data.page.type)) {
                this.warnings.push('dv10');
            }
            if (!(data.page && data.page.language)) {
                this.warnings.push('dv11');
            }
        }

        // other
        if (data.page && data.page.environment) {
            var env = data.page.environment.toLowerCase();
            if (!(env === 'dev' || env === 'cert' || env === 'prod')) {
                this.warnings.push('dv12');
            }
        }
        if (data.content && data.content.constructor !== Array) {
            this.warnings.push('dv13');
        }

        if (data.visitor && data.visitor.accountId && data.visitor.accountId.indexOf(':') == -1) {
            this.warnings.push('dv14');
            data.visitor.accountId = "data violation"
        }
    }

    , initWarnings: function () {
        this.warnings = [];
        try {
            var hdn = document.head.childNodes;
            var libf = false;
            for (var i = 0; i < hdn.length; i++) {
                if (hdn[i].src && (hdn[i].src.indexOf('satelliteLib') !== -1 || hdn[i].src.indexOf('launch') !== -1)) {
                    libf = true;
                    break;
                }
            }
            if (!libf) {
                this.warnings.push('dtm1');
            }
        } catch (e) { }

        try {
            for (let element of document.querySelectorAll('*')) {
                // Check if the element has a src attribute and if it meets the criteria
                if (element.src && element.src.includes('assets.adobedtm.com') && element.src.includes('launch')) {
                    if (element.tagName.toLowerCase() !== 'script') {
                        this.warnings.push('dtm5');
                    }
                    if (!element.hasAttribute('async')) {
                        this.warnings.push('dtm4');
                    }
                }
            }
        } catch (e) { }
    }

    , getMessages: function () {
        return ['v1'].concat(this.warnings).join('|');
    }
    , addMessage: function (message) {
        this.warnings.push(message);
    }

    , getPerformance: function () {
        var copy = {};
        for (var attr in this.measures) {
            if (this.measures.hasOwnProperty(attr)) {
                copy[attr] = this.measures[attr];
            }
        }

        this.measures = {};
        return copy;
    }

    , dtmCodeDesc: {
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
    }

    , debugMessage: function (event, data) {
        if (this.isDebugEnabled()) {
            console.log('[AA] --------- [' + (this.debugCounter++) + '] Web Analytics Data ---------');
            console.log('[AA] ' + event);
            console.groupCollapsed("[AA] AA Data: ");
            if (window.eventData) {
                console.log("[AA] eventData:\n" + JSON.stringify(window.eventData, true, 2));
            }
            if (window.pageData) {
                console.log("[AA] pageData:\n" + JSON.stringify(window.pageData, true, 2));
            }
            console.groupEnd();
            if (this.warnings.length > 0) {
                console.groupCollapsed("[AA] Warnings (" + this.warnings.length + "): ");
                for (var i = 0; i < this.warnings.length; i++) {
                    var error = this.dtmCodeDesc[this.warnings[i]] ? this.dtmCodeDesc[this.warnings[i]] : 'Error Code: ' + this.warnings[i];
                    console.log('[AA] ' + error);
                }
                console.log('[AA] More can be found here: https://confluence.cbsels.com/display/AA/AA+Error+Catalog');
                console.groupEnd();
            }
            console.log("This mode can be disabled by calling 'pageDataTracker.disableDebug()'");
        }
    }

    , getTrackingCode: function () {
        var campaign = _satellite.getVar('Campaign - ID');
        if (!campaign) {
            campaign = window.sessionStorage ? sessionStorage.getItem('dgcid') : '';
        }
        return campaign;
    }

    , isDebugEnabled: function () {
        if (typeof this.debug === 'undefined') {
            this.debug = (document.cookie.indexOf(this.debugCookie) !== -1) || (window.pageData && pageData.page && pageData.page.environment && pageData.page.environment.toLowerCase() === 'dev');
            //this.debug = (document.cookie.indexOf(this.debugCookie) !== -1);
        }
        return this.debug;
    }

    , enableDebug: function (expire) {
        if (typeof expire === 'undefined') {
            expire = 86400;
        }
        console.log('You just enabled debug mode for Adobe Analytics tracking. This mode will persist for 24h.');
        console.log("This mode can be disabled by calling 'pageDataTracker.disableDebug()'");
        this.setCookie(this.debugCookie, 'true', expire, document.location.hostname);
        this.debug = true;
    }

    , disableDebug: function () {
        console.log('Debug mode is now disabled.');
        this.deleteCookie(this.debugCookie);
        this.debug = false;
    }

    , setAnalyticsData: function () {
        if (!(window.pageData && pageData.page && pageData.page.productName && pageData.page.name)) {
            return;
        }
        pageData.page.analyticsPagename = pageData.page.productName + ':' + pageData.page.name;

        var pageEls = pageData.page.name.indexOf(':') > -1 ? pageData.page.name.split(':') : [pageData.page.name];
        pageData.page.sectionName = pageData.page.productName + ':' + pageEls[0];
    }

    , getEvents: function () {
        pageData.savedEvents = {};
        pageData.eventList = [];

        var val = this.getCookie(this.eventCookieName);
        if (val) {
            pageData.savedEvents = val;
        }

        this.deleteCookie(this.eventCookieName);
    }

    , updatePageData(data) {
        window.pageData = window.pageData || {};
        if (data && typeof (data) === 'object') {
            for (var x in data) {
                if (data.hasOwnProperty(x) && data[x] instanceof Array) {
                    pageData[x] = data[x];
                } else if (data.hasOwnProperty(x) && typeof (data[x]) === 'object') {
                    if (!pageData[x]) {
                        pageData[x] = {};
                    }
                    for (var y in data[x]) {
                        if (data[x].hasOwnProperty(y)) {
                            pageData[x][y] = data[x][y];
                        }
                    }
                }
            }
        }
    }

    , handleEventData: function (event, data) {
        var val;
        switch (event) {
            case 'newPage':
                this.updatePageData(data);
                this.setAnalyticsData();
            case 'saveSearch':
            case 'searchResultsUpdated':
                if (data) {
                    // overwrite page-load object
                    if (data.search && typeof (data.search) == 'object') {
                        window.eventData.search.resultsPosition = '';
                        pageData.search = pageData.search || {};
                        var fields = ['advancedCriteria', 'criteria', 'currentPage', 'dataFormCriteria', 'facets', 'resultsByType', 'resultsPerPage', 'sortType', 'totalResults', 'type', 'database',
                            'suggestedClickPosition', 'suggestedLetterCount', 'suggestedResultCount', 'autoSuggestCategory', 'autoSuggestDetails', 'typedTerm', 'selectedTerm', 'channel',
                            'facetOperation', 'details'];
                        for (var i = 0; i < fields.length; i++) {
                            if (data.search[fields[i]]) {
                                pageData.search[fields[i]] = data.search[fields[i]];
                            }
                        }
                    }
                }
                this.setAnalyticsData();
                break;
            case 'navigationClick':
                if (data && data.link) {
                    window.eventData.navigationLink = {
                        name: ((data.link.location || 'no location') + ':' + (data.link.name || 'no name'))
                    };
                }
                break;
            case 'autoSuggestClick':
                if (data && data.search) {
                    val = {
                        autoSuggestSearchData: (
                            'letterct:' + (data.search.suggestedLetterCount || 'none') +
                            '|resultct:' + (data.search.suggestedResultCount || 'none') +
                            '|clickpos:' + (data.search.suggestedClickPosition || 'none')
                        ).toLowerCase(),
                        autoSuggestSearchTerm: (data.search.typedTerm || ''),
                        autoSuggestTypedTerm: (data.search.typedTerm || ''),
                        autoSuggestSelectedTerm: (data.search.selectedTerm || ''),
                        autoSuggestCategory: (data.search.autoSuggestCategory || ''),
                        autoSuggestDetails: (data.search.autoSuggestDetails || '')
                    };
                }
                break;
            case 'linkOut':
                if (data && data.content && data.content.length > 0) {
                    window.eventData.linkOut = data.content[0].linkOut;
                    window.eventData.referringProduct = _satellite.getVar('Page - Product Name') + ':' + data.content[0].id;
                }
                break;
            case 'socialShare':
                if (data && data.social) {
                    window.eventData.sharePlatform = data.social.sharePlatform || '';
                }
                break;
            case 'contentInteraction':
                if (data && data.action) {
                    window.eventData.action.name = pageData.page.productName + ':' + data.action.name;
                }
                break;
            case 'searchWithinContent':
                if (data && data.search) {
                    window.pageData.search = window.pageData.search || {};
                    pageData.search.withinContentCriteria = data.search.withinContentCriteria;
                }
                break;
            case 'contentShare':
                if (data && data.content) {
                    window.eventData.sharePlatform = data.content[0].sharePlatform;
                }
                break;
            case 'contentLinkClick':
                if (data && data.link) {
                    window.eventData.action = { name: pageData.page.productName + ':' + (data.link.type || 'no link type') + ':' + (data.link.name || 'no link name') };
                }
                break;
            case 'contentWindowLoad':
            case 'contentTabClick':
                if (data && data.content) {
                    window.eventData.tabName = data.content[0].tabName || '';
                    window.eventData.windowName = data.content[0].windowName || '';
                }
                break;
            case 'userProfileUpdate':
                if (data && data.user) {
                    if (Object.prototype.toString.call(data.user) === "[object Array]") {
                        window.eventData.user = data.user[0];
                    }
                }
                break;
            case 'videoStart':
                if (data.video) {
                    data.video.length = parseFloat(data.video.length || '0');
                    data.video.position = parseFloat(data.video.position || '0');
                    s.Media.open(data.video.id, data.video.length, s.Media.playerName);
                    s.Media.play(data.video.id, data.video.position);
                }
                break;
            case 'videoPlay':
                if (data.video) {
                    data.video.position = parseFloat(data.video.position || '0');
                    s.Media.play(data.video.id, data.video.position);
                }
                break;
            case 'videoStop':
                if (data.video) {
                    data.video.position = parseFloat(data.video.position || '0');
                    s.Media.stop(data.video.id, data.video.position);
                }
                break;
            case 'videoComplete':
                if (data.video) {
                    data.video.position = parseFloat(data.video.position || '0');
                    s.Media.stop(data.video.id, data.video.position);
                    s.Media.close(data.video.id);
                }
                break;
            case 'addWebsiteExtension':
                if (data && data.page) {
                    val = {
                        wx: data.page.websiteExtension
                    }
                }
                break;
        }

        if (val) {
            this.setCookie(this.eventCookieName, val);
        }
    }

    , registerCallbacks: function () {
        var self = this;
        if (window.usabilla_live) {
            window.usabilla_live('setEventCallback', function (category, action, label, value) {
                if (action == 'Campaign:Open') {
                    self.trackEvent('ctaImpression', {
                        cta: {
                            ids: ['usabillaid:' + label]
                        }
                    });
                } else if (action == 'Campaign:Success') {
                    self.trackEvent('ctaClick', {
                        cta: {
                            ids: ['usabillaid:' + label]
                        }
                    });
                }
            });
        }
    }

    , getConsortiumAccountId: function () {
        var id = '';
        if (window.pageData && pageData.visitor && (pageData.visitor.consortiumId || pageData.visitor.accountId)) {
            id = (pageData.visitor.consortiumId || 'no consortium ID') + '|' + (pageData.visitor.accountId || 'no account ID');
        }

        return id;
    }

    , getSearchClickPosition: function () {
        if (window.eventData && eventData.search && eventData.search.resultsPosition) {
            var pos = parseInt(eventData.search.resultsPosition), clickPos;
            if (!isNaN(pos)) {
                var page = pageData.search.currentPage ? parseInt(pageData.search.currentPage) : '', perPage = pageData.search.resultsPerPage ? parseInt(pageData.search.resultsPerPage) : '';
                if (!isNaN(page) && !isNaN(perPage)) {
                    clickPos = pos + ((page - 1) * perPage);
                }
            }
            return clickPos ? clickPos.toString() : eventData.search.resultsPosition;
        }
        return '';
    }

    , getSearchFacets: function () {
        var facetList = '';
        if (window.pageData && pageData.search && pageData.search.facets) {
            if (typeof (pageData.search.facets) == 'object') {
                for (var i = 0; i < pageData.search.facets.length; i++) {
                    var f = pageData.search.facets[i];
                    facetList += (facetList ? '|' : '') + f.name + '=' + f.values.join('^');
                }
            }
        }
        return facetList;
    }

    , getSearchResultsByType: function () {
        var resultTypes = '';
        if (window.pageData && pageData.search && pageData.search.resultsByType) {
            for (var i = 0; i < pageData.search.resultsByType.length; i++) {
                var r = pageData.search.resultsByType[i];
                resultTypes += (resultTypes ? '|' : '') + r.name + (r.results || r.values ? '=' + (r.results || r.values) : '');
            }
        }
        return resultTypes;
    }

    , getJournalInfo: function () {
        var info = '';
        if (window.pageData && pageData.journal && (pageData.journal.name || pageData.journal.specialty || pageData.journal.section || pageData.journal.issn || pageData.journal.issueNumber || pageData.journal.volumeNumber || pageData.journal.family || pageData.journal.publisher)) {
            var journal = pageData.journal;
            info = (journal.name || 'no name')
                + '|' + (journal.specialty || 'no specialty')
                + '|' + (journal.section || 'no section')
                + '|' + (journal.issn || 'no issn')
                + '|' + (journal.issueNumber || 'no issue #')
                + '|' + (journal.volumeNumber || 'no volume #')
                + '|' + (journal.family || 'no family')
                + '|' + (journal.publisher || 'no publisher');

        }
        return info;
    }

    , getBibliographicInfo: function (doc) {
        if (!doc || !(doc.publisher || doc.indexTerms || doc.publicationType || doc.publicationRights || doc.volumeNumber || doc.issueNumber || doc.subjectAreas || doc.isbn)) {
            return '';
        }

        var terms = doc.indexTerms ? doc.indexTerms.split('+') : '';
        if (terms) {
            terms = terms.slice(0, 5).join('+');
            terms = terms.length > 100 ? terms.substring(0, 100) : terms;
        }

        var areas = doc.subjectAreas ? doc.subjectAreas.split('>') : '';
        if (areas) {
            areas = areas.slice(0, 5).join('>');
            areas = areas.length > 100 ? areas.substring(0, 100) : areas;
        }

        var biblio = (doc.publisher || 'none')
            + '^' + (doc.publicationType || 'none')
            + '^' + (doc.publicationRights || 'none')
            + '^' + (terms || 'none')
            + '^' + (doc.volumeNumber || 'none')
            + '^' + (doc.issueNumber || 'none')
            + '^' + (areas || 'none')
            + '^' + (doc.isbn || 'none');

        return this.stripProductDelimiters(biblio).toLowerCase();
    }

    , getContentItem: function () {
        var docs = window.eventData && eventData.content ? eventData.content : pageData.content;
        if (docs && docs.length > 0) {
            return docs[0];
        }
    }

    , getFormattedDate: function (ts) {
        if (!ts) {
            return '';
        }

        var d = new Date(parseInt(ts) * 1000);

        // now do formatting
        var year = d.getFullYear()
            , month = ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1)
            , date = (d.getDate() < 10 ? '0' : '') + d.getDate()
            , hours = d.getHours() > 12 ? d.getHours() - 12 : d.getHours()
            , mins = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes()
            , ampm = d.getHours() > 12 ? 'pm' : 'am';

        hours = (hours < 10 ? '0' : '') + hours;
        return year + '-' + month + '-' + date;
    }

    , getVisitorId: function () {
        /*
        var orgId = '4D6368F454EC41940A4C98A6@AdobeOrg';
        if (Visitor && Visitor.getInstance(orgId)) {
            return Visitor.getInstance(orgId).getMarketingCloudVisitorID();
        } else {
            return ''
        }
        */
       return localStorage.getItem("aa_ecid") || '';
    }

    , setProductsVariable: function () {
        var prodList = window.eventData && eventData.content ? eventData.content : pageData.content
            , prods = [];
        if (prodList) {
            for (var i = 0; i < prodList.length; i++) {
                if (prodList[i].id || prodList[i].type || prodList[i].publishDate || prodList[i].onlineDate) {
                    if (!prodList[i].id) {
                        prodList[i].id = 'no id';
                    }
                    var prodName = (pageData.page.productName || 'xx').toLowerCase();
                    if (prodList[i].id.indexOf(prodName + ':') != 0) {
                        prodList[i].id = prodName + ':' + prodList[i].id;
                    }
                    prodList[i].id = this.stripProductDelimiters(prodList[i].id);
                    var merch = [];
                    if (prodList[i].format) {
                        merch.push('evar17=' + this.stripProductDelimiters(prodList[i].format.toLowerCase()));
                    }
                    if (prodList[i].type) {
                        var type = prodList[i].type;
                        if (prodList[i].accessType) {
                            type += ':' + prodList[i].accessType;
                        }
                        merch.push('evar20=' + this.stripProductDelimiters(type.toLowerCase()));

                        if (type.indexOf(':manuscript') > 0) {
                            /*
                            var regex = /[a-z]+:manuscript:id:([a-z]+-[a-z]-[0-9]+-[0-9]+)/gmi;
                            var m = regex.exec(prodList[i].id);
                            if(m) {
                                merch.push('evar200=' + m[1]);
                            }
                            merch.push('evar200=' + prodList[i].id);
                            */
                            a = prodList[i].id.lastIndexOf(':');
                            if (a > 0) {
                                merch.push('evar200=' + prodList[i].id.substring(a + 1).toUpperCase());
                            }
                        } else if (type.indexOf(':submission') > 0) {
                            merch.push('evar200=' + prodList[i].id);
                        }
                    }
                    if (!prodList[i].title) {
                        prodList[i].title = prodList[i].name;
                    }
                    if (prodList[i].title) {
                        merch.push('evar75=' + this.stripProductDelimiters(prodList[i].title.toLowerCase()));
                    }
                    if (prodList[i].breadcrumb) {
                        merch.push('evar63=' + this.stripProductDelimiters(prodList[i].breadcrumb).toLowerCase());
                    }
                    var nowTs = new Date().getTime() / 1000;
                    if (prodList[i].onlineDate && !isNaN(prodList[i].onlineDate)) {
                        if (prodList[i].onlineDate > 32503680000) {
                            prodList[i].onlineDate = prodList[i].onlineDate / 1000;
                        }
                        merch.push('evar122=' + this.stripProductDelimiters(pageDataTracker.getFormattedDate(prodList[i].onlineDate)));
                        var onlineAge = Math.floor((nowTs - prodList[i].onlineDate) / 86400);
                        onlineAge = (onlineAge === 0) ? 'zero' : onlineAge;
                        merch.push('evar128=' + onlineAge);
                    }
                    if (prodList[i].publishDate && !isNaN(prodList[i].publishDate)) {
                        if (prodList[i].publishDate > 32503680000) {
                            prodList[i].publishDate = prodList[i].publishDate / 1000;
                        }
                        merch.push('evar123=' + this.stripProductDelimiters(pageDataTracker.getFormattedDate(prodList[i].publishDate)));
                        var publishAge = Math.floor((nowTs - prodList[i].publishDate) / 86400);
                        publishAge = (publishAge === 0) ? 'zero' : publishAge;
                        merch.push('evar127=' + publishAge);
                    }
                    if (prodList[i].onlineDate && prodList[i].publishDate) {
                        merch.push('evar38=' + this.stripProductDelimiters(pageDataTracker.getFormattedDate(prodList[i].onlineDate) + '^' + pageDataTracker.getFormattedDate(prodList[i].publishDate)));
                    }
                    if (prodList[i].mapId) {
                        merch.push('evar70=' + this.stripProductDelimiters(prodList[i].mapId));
                    }
                    if (prodList[i].relevancyScore) {
                        merch.push('evar71=' + this.stripProductDelimiters(prodList[i].relevancyScore));
                    }
                    if (prodList[i].status) {
                        merch.push('evar73=' + this.stripProductDelimiters(prodList[i].status));
                    }
                    if (prodList[i].previousStatus) {
                        merch.push('evar111=' + this.stripProductDelimiters(prodList[i].previousStatus));
                    }
                    if (prodList[i].entitlementType) {
                        merch.push('evar80=' + this.stripProductDelimiters(prodList[i].entitlementType));
                    }
                    if (prodList[i].recordType) {
                        merch.push('evar93=' + this.stripProductDelimiters(prodList[i].recordType));
                    }
                    if (prodList[i].exportType) {
                        merch.push('evar99=' + this.stripProductDelimiters(prodList[i].exportType));
                    }
                    if (prodList[i].importType) {
                        merch.push('evar142=' + this.stripProductDelimiters(prodList[i].importType));
                    }
                    if (prodList[i].section) {
                        merch.push('evar100=' + this.stripProductDelimiters(prodList[i].section));
                    }
                    if (prodList[i].detail) {
                        merch.push('evar104=' + this.stripProductDelimiters(prodList[i].detail.toLowerCase()));
                    } else if (prodList[i].details) {
                        merch.push('evar104=' + this.stripProductDelimiters(prodList[i].details.toLowerCase()));
                    }
                    if (prodList[i].position) {
                        merch.push('evar116=' + this.stripProductDelimiters(prodList[i].position));
                    }
                    if (prodList[i].publicationTitle) {
                        merch.push('evar129=' + this.stripProductDelimiters(prodList[i].publicationTitle));
                    }
                    if (prodList[i].specialIssueTitle) {
                        merch.push('evar130=' + this.stripProductDelimiters(prodList[i].specialIssueTitle));
                    }
                    if (prodList[i].specialIssueNumber) {
                        merch.push('evar131=' + this.stripProductDelimiters(prodList[i].specialIssueNumber));
                    }
                    if (prodList[i].referenceModuleTitle) {
                        merch.push('evar139=' + this.stripProductDelimiters(prodList[i].referenceModuleTitle));
                    }
                    if (prodList[i].referenceModuleISBN) {
                        merch.push('evar140=' + this.stripProductDelimiters(prodList[i].referenceModuleISBN));
                    }
                    if (prodList[i].volumeTitle) {
                        merch.push('evar132=' + this.stripProductDelimiters(prodList[i].volumeTitle));
                    }
                    if (prodList[i].publicationSection) {
                        merch.push('evar133=' + this.stripProductDelimiters(prodList[i].publicationSection));
                    }
                    if (prodList[i].publicationSpecialty) {
                        merch.push('evar134=' + this.stripProductDelimiters(prodList[i].publicationSpecialty));
                    }
                    if (prodList[i].issn) {
                        merch.push('evar135=' + this.stripProductDelimiters(prodList[i].issn));
                    }
                    if (prodList[i].id2) {
                        merch.push('evar159=' + this.stripProductDelimiters(prodList[i].id2));
                    }
                    if (prodList[i].id3) {
                        merch.push('evar160=' + this.stripProductDelimiters(prodList[i].id3));
                    }
                    if (prodList[i].provider) {
                        merch.push('evar164=' + this.stripProductDelimiters(prodList[i].provider));
                    }
                    if (prodList[i].citationStyle) {
                        merch.push('evar170=' + this.stripProductDelimiters(prodList[i].citationStyle));
                    }

                    var biblio = this.getBibliographicInfo(prodList[i]);
                    if (biblio) {
                        merch.push('evar28=' + biblio);
                    }

                    if (prodList[i].turnawayId) {
                        pageData.eventList.push('product turnaway');
                    }

                    var price = prodList[i].price || '', qty = prodList[i].quantity || '', evts = [];
                    if (price && qty) {
                        qty = parseInt(qty || '1');
                        price = parseFloat(price || '0');
                        price = (price * qty).toFixed(2);

                        if (window.eventData && eventData.eventName && eventData.eventName == 'cartAdd') {
                            evts.push('event20=' + price);
                        }
                    }

                    var type = window.pageData && pageData.page && pageData.page.type ? pageData.page.type : '', evt = window.eventData && eventData.eventName ? eventData.eventName : '';
                    if (type.match(/^CP\-/gi) !== null && (!evt || evt == 'newPage' || evt == 'contentView')) {
                        evts.push('event181=1');
                    }
                    if (evt == 'contentDownload' || type.match(/^CP\-DL/gi) !== null) {
                        evts.push('event182=1');
                    }
                    if (evt == 'contentDownloadRequest') {
                        evts.push('event319=1');
                    }
                    if (evt == 'contentExport') {
                        evts.push('event184=1');
                    }
                    if (this.eventFires('recommendationViews')) {
                        evts.push('event264=1');
                    }

                    if (prodList[i].datapoints) {
                        evts.push('event239=' + prodList[i].datapoints);
                    }
                    if (prodList[i].documents) {
                        evts.push('event240=' + prodList[i].documents);
                    }
                    if (prodList[i].size) {
                        evts.push('event335=' + prodList[i].size);
                        evts.push('event336=1')
                    }

                    if (evt == 'genAIContentUpdated') {
                        evts.push('event51=1');
                    }

                    prods.push([
                        ''					// empty category
                        , prodList[i].id		// id
                        , qty				// qty
                        , price				// price
                        , evts.join('|')		// events
                        , merch.join('|')	// merchandising eVars
                    ].join(';'));
                }
            }
        }

        return prods.join(',');
    }
    , eventFires: function (eventName) {
        var evt = window.eventData && eventData.eventName ? eventData.eventName : '';
        if (evt == eventName) {
            return true;
        }
        // initial pageload and new pages
        if ((!window.eventData || evt == 'newPage') && window.pageData && window.pageData.trackEvents) {
            var tEvents = window.pageData.trackEvents;
            for (var i = 0; i < tEvents.length; i++) {
                if (tEvents[i] == eventName) {
                    return true;
                }
            }
        }
        return false;
    }

    , md5: function (s) { function L(k, d) { return (k << d) | (k >>> (32 - d)) } function K(G, k) { var I, d, F, H, x; F = (G & 2147483648); H = (k & 2147483648); I = (G & 1073741824); d = (k & 1073741824); x = (G & 1073741823) + (k & 1073741823); if (I & d) { return (x ^ 2147483648 ^ F ^ H) } if (I | d) { if (x & 1073741824) { return (x ^ 3221225472 ^ F ^ H) } else { return (x ^ 1073741824 ^ F ^ H) } } else { return (x ^ F ^ H) } } function r(d, F, k) { return (d & F) | ((~d) & k) } function q(d, F, k) { return (d & k) | (F & (~k)) } function p(d, F, k) { return (d ^ F ^ k) } function n(d, F, k) { return (F ^ (d | (~k))) } function u(G, F, aa, Z, k, H, I) { G = K(G, K(K(r(F, aa, Z), k), I)); return K(L(G, H), F) } function f(G, F, aa, Z, k, H, I) { G = K(G, K(K(q(F, aa, Z), k), I)); return K(L(G, H), F) } function D(G, F, aa, Z, k, H, I) { G = K(G, K(K(p(F, aa, Z), k), I)); return K(L(G, H), F) } function t(G, F, aa, Z, k, H, I) { G = K(G, K(K(n(F, aa, Z), k), I)); return K(L(G, H), F) } function e(G) { var Z; var F = G.length; var x = F + 8; var k = (x - (x % 64)) / 64; var I = (k + 1) * 16; var aa = Array(I - 1); var d = 0; var H = 0; while (H < F) { Z = (H - (H % 4)) / 4; d = (H % 4) * 8; aa[Z] = (aa[Z] | (G.charCodeAt(H) << d)); H++ } Z = (H - (H % 4)) / 4; d = (H % 4) * 8; aa[Z] = aa[Z] | (128 << d); aa[I - 2] = F << 3; aa[I - 1] = F >>> 29; return aa } function B(x) { var k = "", F = "", G, d; for (d = 0; d <= 3; d++) { G = (x >>> (d * 8)) & 255; F = "0" + G.toString(16); k = k + F.substr(F.length - 2, 2) } return k } function J(k) { k = k.replace(/rn/g, "n"); var d = ""; for (var F = 0; F < k.length; F++) { var x = k.charCodeAt(F); if (x < 128) { d += String.fromCharCode(x) } else { if ((x > 127) && (x < 2048)) { d += String.fromCharCode((x >> 6) | 192); d += String.fromCharCode((x & 63) | 128) } else { d += String.fromCharCode((x >> 12) | 224); d += String.fromCharCode(((x >> 6) & 63) | 128); d += String.fromCharCode((x & 63) | 128) } } } return d } var C = Array(); var P, h, E, v, g, Y, X, W, V; var S = 7, Q = 12, N = 17, M = 22; var A = 5, z = 9, y = 14, w = 20; var o = 4, m = 11, l = 16, j = 23; var U = 6, T = 10, R = 15, O = 21; s = J(s); C = e(s); Y = 1732584193; X = 4023233417; W = 2562383102; V = 271733878; for (P = 0; P < C.length; P += 16) { h = Y; E = X; v = W; g = V; Y = u(Y, X, W, V, C[P + 0], S, 3614090360); V = u(V, Y, X, W, C[P + 1], Q, 3905402710); W = u(W, V, Y, X, C[P + 2], N, 606105819); X = u(X, W, V, Y, C[P + 3], M, 3250441966); Y = u(Y, X, W, V, C[P + 4], S, 4118548399); V = u(V, Y, X, W, C[P + 5], Q, 1200080426); W = u(W, V, Y, X, C[P + 6], N, 2821735955); X = u(X, W, V, Y, C[P + 7], M, 4249261313); Y = u(Y, X, W, V, C[P + 8], S, 1770035416); V = u(V, Y, X, W, C[P + 9], Q, 2336552879); W = u(W, V, Y, X, C[P + 10], N, 4294925233); X = u(X, W, V, Y, C[P + 11], M, 2304563134); Y = u(Y, X, W, V, C[P + 12], S, 1804603682); V = u(V, Y, X, W, C[P + 13], Q, 4254626195); W = u(W, V, Y, X, C[P + 14], N, 2792965006); X = u(X, W, V, Y, C[P + 15], M, 1236535329); Y = f(Y, X, W, V, C[P + 1], A, 4129170786); V = f(V, Y, X, W, C[P + 6], z, 3225465664); W = f(W, V, Y, X, C[P + 11], y, 643717713); X = f(X, W, V, Y, C[P + 0], w, 3921069994); Y = f(Y, X, W, V, C[P + 5], A, 3593408605); V = f(V, Y, X, W, C[P + 10], z, 38016083); W = f(W, V, Y, X, C[P + 15], y, 3634488961); X = f(X, W, V, Y, C[P + 4], w, 3889429448); Y = f(Y, X, W, V, C[P + 9], A, 568446438); V = f(V, Y, X, W, C[P + 14], z, 3275163606); W = f(W, V, Y, X, C[P + 3], y, 4107603335); X = f(X, W, V, Y, C[P + 8], w, 1163531501); Y = f(Y, X, W, V, C[P + 13], A, 2850285829); V = f(V, Y, X, W, C[P + 2], z, 4243563512); W = f(W, V, Y, X, C[P + 7], y, 1735328473); X = f(X, W, V, Y, C[P + 12], w, 2368359562); Y = D(Y, X, W, V, C[P + 5], o, 4294588738); V = D(V, Y, X, W, C[P + 8], m, 2272392833); W = D(W, V, Y, X, C[P + 11], l, 1839030562); X = D(X, W, V, Y, C[P + 14], j, 4259657740); Y = D(Y, X, W, V, C[P + 1], o, 2763975236); V = D(V, Y, X, W, C[P + 4], m, 1272893353); W = D(W, V, Y, X, C[P + 7], l, 4139469664); X = D(X, W, V, Y, C[P + 10], j, 3200236656); Y = D(Y, X, W, V, C[P + 13], o, 681279174); V = D(V, Y, X, W, C[P + 0], m, 3936430074); W = D(W, V, Y, X, C[P + 3], l, 3572445317); X = D(X, W, V, Y, C[P + 6], j, 76029189); Y = D(Y, X, W, V, C[P + 9], o, 3654602809); V = D(V, Y, X, W, C[P + 12], m, 3873151461); W = D(W, V, Y, X, C[P + 15], l, 530742520); X = D(X, W, V, Y, C[P + 2], j, 3299628645); Y = t(Y, X, W, V, C[P + 0], U, 4096336452); V = t(V, Y, X, W, C[P + 7], T, 1126891415); W = t(W, V, Y, X, C[P + 14], R, 2878612391); X = t(X, W, V, Y, C[P + 5], O, 4237533241); Y = t(Y, X, W, V, C[P + 12], U, 1700485571); V = t(V, Y, X, W, C[P + 3], T, 2399980690); W = t(W, V, Y, X, C[P + 10], R, 4293915773); X = t(X, W, V, Y, C[P + 1], O, 2240044497); Y = t(Y, X, W, V, C[P + 8], U, 1873313359); V = t(V, Y, X, W, C[P + 15], T, 4264355552); W = t(W, V, Y, X, C[P + 6], R, 2734768916); X = t(X, W, V, Y, C[P + 13], O, 1309151649); Y = t(Y, X, W, V, C[P + 4], U, 4149444226); V = t(V, Y, X, W, C[P + 11], T, 3174756917); W = t(W, V, Y, X, C[P + 2], R, 718787259); X = t(X, W, V, Y, C[P + 9], O, 3951481745); Y = K(Y, h); X = K(X, E); W = K(W, v); V = K(V, g) } var i = B(Y) + B(X) + B(W) + B(V); return i.toLowerCase() }
    , stripProductDelimiters: function (val) {
        if (val) {
            return val.replace(/\;|\||\,/gi, '-');
        }
    }

    , setCookie: function (name, value, seconds, domain) {
        domain = document.location.hostname;
        var expires = '';
        var expiresNow = '';
        var date = new Date();
        date.setTime(date.getTime() + (-1 * 1000));
        expiresNow = "; expires=" + date.toGMTString();

        if (typeof (seconds) != 'undefined') {
            date.setTime(date.getTime() + (seconds * 1000));
            expires = '; expires=' + date.toGMTString();
        }

        var type = typeof (value);
        type = type.toLowerCase();
        if (type != 'undefined' && type != 'string') {
            value = JSON.stringify(value);
        }

        // fix scoping issues
        // keep writing the old cookie, but make it expire
        document.cookie = name + '=' + value + expiresNow + '; path=/';

        // now just set the right one
        document.cookie = name + '=' + value + expires + '; path=/; domain=' + domain;
    }

    , getCookie: function (name) {
        name = name + '=';
        var carray = document.cookie.split(';'), value;

        for (var i = 0; i < carray.length; i++) {
            var c = carray[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(name) == 0) {
                value = c.substring(name.length, c.length);
                try {
                    value = JSON.parse(value);
                } catch (ex) { }

                return value;
            }
        }

        return null;
    }

    , deleteCookie: function (name) {
        this.setCookie(name, '', -1);
        this.setCookie(name, '', -1, document.location.hostname);
    }

    , mapAdobeVars: function (s) {
        var vars = {
            pageName: 'Page - Analytics Pagename'
            , channel: 'Page - Section Name'
            , campaign: 'Campaign - ID'
            , currencyCode: 'Page - Currency Code'
            , purchaseID: 'Order - ID'
            , prop1: 'Visitor - Account ID'
            , prop2: 'Page - Product Name'
            , prop4: 'Page - Type'
            , prop6: 'Search - Type'
            , prop7: 'Search - Facet List'
            , prop8: 'Search - Feature Used'
            , prop12: 'Visitor - User ID'
            , prop13: 'Search - Sort Type'
            , prop14: 'Page - Load Time'
            , prop15: 'Support - Topic Name'
            , prop16: 'Page - Business Unit'
            , prop21: 'Search - Criteria'
            , prop24: 'Page - Language'
            , prop25: 'Page - Product Feature'
            , prop28: 'Support - Search Criteria'
            , prop30: 'Visitor - IP Address'
            , prop33: 'Page - Product Application Version'
            , prop34: 'Page - Website Extensions'
            , prop60: 'Search - Data Form Criteria'
            , prop63: 'Page - Extended Page Name'
            , prop65: 'Page - Online State'
            , prop67: 'Research Networks'
            , prop40: 'Page - UX Properties'

            , eVar3: 'Search - Total Results'
            , eVar7: 'Visitor - Account Name'
            , eVar15: 'Event - Search Results Click Position'
            , eVar19: 'Search - Advanced Criteria'
            , eVar21: 'Promo - Clicked ID'
            , eVar22: 'Page - Test ID'
            , eVar27: 'Event - AutoSuggest Search Data'
            , eVar157: 'Event - AutoSuggest Search Typed Term'
            , eVar156: 'Event - AutoSuggest Search Selected Term'
            , eVar162: 'Event - AutoSuggest Search Category'
            , eVar163: 'Event - AutoSuggest Search Details'
            , eVar33: 'Visitor - Access Type'
            , eVar34: 'Order - Promo Code'
            , eVar39: 'Order - Payment Method'
            , eVar41: 'Visitor - Industry'
            , eVar42: 'Visitor - SIS ID'
            , eVar43: 'Page - Error Type'
            , eVar44: 'Event - Updated User Fields'
            , eVar48: 'Email - Recipient ID'
            , eVar51: 'Email - Message ID'
            , eVar52: 'Visitor - Department ID'
            , eVar53: 'Visitor - Department Name'
            , eVar60: 'Search - Within Content Criteria'
            , eVar61: 'Search - Within Results Criteria'
            , eVar62: 'Search - Result Types'
            , eVar74: 'Page - Journal Info'
            , eVar59: 'Page - Journal Publisher'
            , eVar76: 'Email - Broadlog ID'
            , eVar78: 'Visitor - Details'
            , eVar80: 'Visitor - Usage Path Info'
            , eVar102: 'Form - Name'
            , eVar103: 'Event - Conversion Driver'
            , eVar105: 'Search - Current Page'
            , eVar106: 'Visitor - App Session ID'
            , eVar107: 'Page - Secondary Product Name'
            , eVar117: 'Search - Database'
            , eVar126: 'Page - Environment'
            , eVar141: 'Search - Criteria Original'
            , eVar143: 'Page - Tabs'
            , eVar161: 'Search - Channel'
            , eVar169: 'Search - Facet Operation'
            , eVar173: 'Search - Details'
            , eVar174: 'Campaign - Spredfast ID'
            , eVar175: 'Visitor - TMX Device ID'
            , eVar176: 'Visitor - TMX Request ID'
            , eVar148: 'Visitor - Platform Name'
            , eVar149: 'Visitor - Platform ID'
            , eVar152: 'Visitor - Product ID'
            , eVar153: 'Visitor - Superaccount ID'
            , eVar154: 'Visitor - Superaccount Name'
            , eVar177: 'Page - Context Domain'
            , eVar189: 'Page - Experimentation User Id'
            , eVar190: 'Page - Identity User'
            , eVar199: 'Page - ID+ Parameters'

            , list2: 'Page - Widget Names'
            , list3: 'Promo - IDs'
        };

        for (var i in vars) {
            s[i] = s[i] ? s[i] : _satellite.getVar(vars[i]);
        }
    }
};

// async support fallback
(function (w) {
    var eventBuffer = [];
    if (w.appData) {
        if (Array.isArray(w.appData)) {
            eventBuffer = w.appData;
        } else {
            console.error('Elsevier DataLayer "window.appData" must be specified as array');
            return;
        }
    }

    w.appData = [];

    var oldPush = w.appData.push;

    var appDataPush = function () {
        oldPush.apply(w.appData, arguments);
        for (var i = 0; i < arguments.length; i++) {
            var data = arguments[i];
            if (data.event) {
                if (data.event == 'pageLoad') {
                    w.pageDataTracker.trackPageLoad(data);
                } else {
                    w.pageDataTracker.trackEvent(data.event, data);
                }
            }
        }
    };

    w.appData.push = appDataPush;
    for (var i = 0; i < eventBuffer.length; i++) {
        var data = eventBuffer[i];
        w.appData.push(data);
    }
})(window);
