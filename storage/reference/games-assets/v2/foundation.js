! function(t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e(require("responsive"), require("react"), require("@nyt/native-bridge")) : "function" == typeof define && define.amd ? define(["responsive", "react", "@nyt/native-bridge"], e) : (t = t || self).Foundation = e(t.Responsive, t.React, t.InitNativeBridge)
}(this, function(r, t, i) {
    "use strict";
    r = r && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
    var l = window,
        p = document,
        o = encodeURIComponent,
        e = localStorage,
        n = sessionStorage;

    function h(t, e) {
        t.classList.add(e)
    }

    function m(t, e) {
        t.classList.remove(e)
    }

    function v(t, e, n) {
        t.setAttribute(e, n)
    }

    function y(t, e, n, r) {
        t.addEventListener(e, n, r)
    }

    function g(t) {
        return p.getElementById(t)
    }

    function u(t, e) {
        t.appendChild(e)
    }

    function a(e, t) {
        ! function(t) {
            for (; t.children.length;) t.removeChild(t.children[0])
        }(e), t.forEach(function(t) {
            u(e, t)
        })
    }

    function d(t) {
        return t.currentTarget.events[t.type](t)
    }

    function s(t, e) {
        for (var r = 1 < arguments.length && void 0 !== e ? e : {}, n = [], i = [], o = arguments.length; 2 < o;) n.push(arguments[--o]);
        for (; n.length;) {
            var a = n.pop();
            if (a && a.pop)
                for (var s = a.length; 0 < s; --s) n.push(a[s]);
            else null != a && !0 !== a && !1 !== a && i.push(a)
        }
        var c = p.createElement(t);
        return i.forEach(function(t) {
            var e;
            u(c, "string" == typeof(e = t) || "number" == typeof e ? p.createTextNode(t) : t)
        }), Object.keys(r).forEach(function(t) {
            var e, n = r[t];
            "o" === t[0] && "n" === t[1] ? (e = t.slice(2).toLowerCase(), c.events || (c.events = {}), c.events[e] = n, y(c, e, d)) : null != n && !1 !== n && c.setAttribute(t, n)
        }), c
    }
    var c = l.env,
        f = void 0 === c ? "" : c,
        _ = l.featureFlags,
        b = void 0 === _ ? {} : _,
        S = f.version,
        w = "pz-version",
        E = S !== e.getItem(w);
    try {
        e.setItem(w, S)
    } catch (yt) {
        console.error(yt.error)
    }

    function x(t) {
        return "js-".concat(t)
    }

    function k() {
        return Date.now()
    }

    function T(e) {
        var n = [];
        return Object.keys(e).forEach(function(t) {
            n.push("".concat(o(t), "=").concat(o(e[t])))
        }), "?".concat(n.join("&"))
    }
    var O = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(t) {
            var e = 16 * Math.random() | 0;
            return ("x" === t ? e : 3 & e | 8).toString(16)
        }),
        I = function(t, e, n, r, i, o, a, s, c, u, l, p) {
            var d = [],
                f = "getItem",
                h = "setItem",
                m = "removeItem",
                v = "".concat(n, "-check"),
                y = u,
                g = l,
                _ = p;
            e && E && (e[m](v), e[m](n));

            function b(t) {
                for (; d.length;) d.shift()[t ? 1 : 0](t || y)
            }
            return {
                get: function() {
                    return g ? Promise.resolve(y) : new Promise(function(t, e) {
                        return d.push([t, e])
                    })
                },
                initialize: function() {
                    return e && e[f](v) === r && (_ = e[f](n)), Promise.resolve(_ && JSON.parse(_) || t()).then(function(t) {
                        if (g = !0, y = t, e && !_) try {
                            e[h](v, r), e[h](n, JSON.stringify(y))
                        } catch (t) {
                            console.error(t.error)
                        }
                        b()
                    }).catch(b)
                }
            }
        },
        C = (/NYT-S=([^;]+)/.exec(p.cookie || "") || [])[1],
        j = (/NYT-NO-ADS=([^;]+)/.exec(p.cookie || "") || [])[1];

    function R(e, t) {
        var n, r = Object.keys(e);
        return Object.getOwnPropertySymbols && (n = Object.getOwnPropertySymbols(e), t && (n = n.filter(function(t) {
            return Object.getOwnPropertyDescriptor(e, t).enumerable
        })), r.push.apply(r, n)), r
    }

    function A(r) {
        for (var t = 1; t < arguments.length; t++) {
            var i = null != arguments[t] ? arguments[t] : {};
            t % 2 ? R(Object(i), !0).forEach(function(t) {
                var e, n;
                e = r, t = i[n = t], n in e ? Object.defineProperty(e, n, {
                    value: t,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : e[n] = t
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(i)) : R(Object(i)).forEach(function(t) {
                Object.defineProperty(r, t, Object.getOwnPropertyDescriptor(i, t))
            })
        }
        return r
    }
    var D = "responseType",
        N = "withCredentials",
        P = "setRequestHeader",
        L = "withCookie",
        q = "json",
        M = "cookie",
        F = {
            withCookie: !0,
            withCredentials: !0
        };
    F[D] = q;

    function U(i, o, t) {
        var a = A(A({}, F), t);
        return new Promise(function(e, n) {
            var t;
            if (!(null !== (t = window) && void 0 !== t && t.isHybridWebView || navigator.onLine)) return n(new Error("No internet"));
            var r = new XMLHttpRequest;
            r[N] = a[N], r.open(i, o, 1), a[L] && (a[M] ? r[P]("nyt-s", a[M]) : r[P]("nyt-s", C)), r[P]("Content-type", a.data ? "application/json" : "application/x-www-form-urlencoded"), r.onload = function() {
                try {
                    var t = r.responseText;
                    e(t && a[D] === q ? JSON.parse(t) : t)
                } catch (t) {
                    n(new Error("Something went wrong"))
                }
            }, y(r, "error", function(t) {
                return n(function(t) {
                    if (!(t.status < 400)) {
                        var e = new Error("bad req");
                        return e.status = t.status, e
                    }
                }(t))
            }), r.send(a.data && JSON.stringify(a.data))
        })
    }
    var H = {
            get: function(t, e) {
                return U("GET", t, e)
            },
            post: function(t, e, n) {
                return U("POST", t, A(A({}, n), {}, {
                    data: e
                }))
            },
            put: function(t, e, n) {
                return U("PUT", t, A(A({}, n), {}, {
                    data: e
                }))
            },
            delete: function(t, e) {
                return U("DELETE", t, e)
            }
        },
        B = I(function() {
            return H.get("/puzzles/user?bust=".concat(k()))
        }, n, "pz-user", C),
        W = l.userType,
        Y = "fluid",
        z = [
            [990, [Y, [728, 90],
                [970, 90],
                [970, 250],
                [1605, 300]
            ]],
            [750, [Y, [728, 90],
                [1605, 300]
            ]],
            [440, [Y, [300, 250],
                [300, 420]
            ]],
            [0, [Y, [300, 250]]]
        ];
    l.AdSlot4 = l.AdSlot4 || {
        cmd: []
    };

    function G(n) {
        J.cmd.push(function() {
            var t = r.width.value,
                e = t < 2 ? ["small", "medium"][t] : "large",
                t = function(t, e) {
                    e = e || l.location.href, t = t.replace(/[[\]]/g, "\\$&"), e = new RegExp("[?&]".concat(t, "(=([^&#]*)|&|#|$)")).exec(e);
                    return e ? e[2] ? decodeURIComponent(e[2].replace(/\+/g, "")) : "" : null
                }("ad-keywords"),
                e = {
                    plat: "web",
                    prop: "nyt",
                    typ: "games",
                    vp: e,
                    sub: W.entitlement,
                    page_view_id: O
                };
            t && (e.adv = t), J.init({
                adTargeting: e,
                adUnitPath: "".concat("29390238/NYT/crosswords", "/").concat(n),
                sizeMapping: {
                    default: z
                }
            }), J.events.subscribe({
                name: "AdRendered",
                scope: "all",
                callback: function(t) {
                    var e = t.slot,
                        t = t.size,
                        e = p.getElementById(e.getSlotElementId());
                    t && 0 === t[1] ? e && h(e, "fluid") : e && m(e, "fluid")
                }
            })
        })
    }
    var J = l.AdSlot4,
        X = ["transitionend", "webkitTransitionEnd", "oTransitionEnd", "msTransitionEnd"],
        V = Object.keys(X).find(function(t) {
            return "on".concat(X[t].toLowerCase()) in window
        });

    function $(t) {
        var n = [],
            r = document.getElementById(t),
            i = {
                value: r.offsetWidth,
                subscribe: function(t) {
                    return n.push(t),
                        function() {
                            n.splice(n.indexOf(t), 1)
                        }
                }
            };
        return r.addEventListener(V, function() {
            var t = r.offsetWidth;
            if (i.value = t, n.length)
                for (var e = n.length; 0 < e;) n[--e](t)
        }, !1), i
    }
    var K = document.body.classList.contains("pz-mobile"),
        Q = ($("ratio-hook"), $("width-hook"), l.navigator),
        Z = I(function() {
            return H.get("/puzzles/device")
        }, e, "pz-device", Q.userAgent);

    function tt(t, e) {
        return function(t) {
            if (Array.isArray(t)) return t
        }(t) || function(t, e) {
            var n = null == t ? null : "undefined" != typeof Symbol && t[Symbol.iterator] || t["@@iterator"];
            if (null != n) {
                var r, i, o = [],
                    a = !0,
                    s = !1;
                try {
                    for (n = n.call(t); !(a = (r = n.next()).done) && (o.push(r.value), !e || o.length !== e); a = !0);
                } catch (t) {
                    s = !0, i = t
                } finally {
                    try {
                        a || null == n.return || n.return()
                    } finally {
                        if (s) throw i
                    }
                }
                return o
            }
        }(t, e) || function(t, e) {
            if (t) {
                if ("string" == typeof t) return et(t, e);
                var n = Object.prototype.toString.call(t).slice(8, -1);
                return "Map" === (n = "Object" === n && t.constructor ? t.constructor.name : n) || "Set" === n ? Array.from(t) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? et(t, e) : void 0
            }
        }(t, e) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function et(t, e) {
        (null == e || e > t.length) && (e = t.length);
        for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
        return r
    }

    function nt(t, e) {
        for (var n = "".concat(2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : "Web Feedback", " (").concat(O.slice(-6), ")"), r = l.screen, i = p.documentElement, o = (new Date).getTimezoneOffset(), a = [l.location.pathname, r.width, r.height, i.clientWidth, i.clientHeight, "UTC".concat(0 < o ? "" : "+").concat(o / -60), t.id, W.hasDigi ? "Yes" : "No", W.hasXwd ? "Yes" : "No", function() {
                try {
                    var t = p.cookie.match(/nyt-xwd-hashd=(.+);/),
                        e = t && t[1];
                    return !0 === e || "true" === e
                } catch (t) {
                    return !1
                }
            }() ? "Yes" : "No", O], s = e.feedback, c = /%s/, u = 0; u < a.length;) s = s.replace(c, a[u]), u += 1;
        return St + T({
            subject: n,
            body: s
        })
    }

    function rt(n) {
        return Promise.all([B.get(), Z.get()]).then(function(t) {
            var e = tt(t, 2),
                t = e[0],
                e = e[1];
            return nt(t, e, n)
        }).catch(function() {
            return St
        })
    }

    function it(t, e) {
        return {
            name: t,
            value: void 0 === e ? -1 : e,
            delta: 0,
            entries: [],
            id: "v1-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12)
        }
    }

    function ot(t, e) {
        try {
            if (PerformanceObserver.supportedEntryTypes.includes(t)) {
                if ("first-input" === t && !("PerformanceEventTiming" in self)) return;
                var n = new PerformanceObserver(function(t) {
                    return t.getEntries().map(e)
                });
                return n.observe({
                    type: t,
                    buffered: !0
                }), n
            }
        } catch (t) {}
    }

    function at(e, n) {
        function r(t) {
            "pagehide" !== t.type && "hidden" !== document.visibilityState || (e(t), n && (removeEventListener("visibilitychange", r, !0), removeEventListener("pagehide", r, !0)))
        }
        addEventListener("visibilitychange", r, !0), addEventListener("pagehide", r, !0)
    }

    function st(e) {
        addEventListener("pageshow", function(t) {
            t.persisted && e(t)
        }, !0)
    }

    function ct(t, e, n) {
        var r;
        return function() {
            0 <= e.value && (n || wt.has(e) || "hidden" === document.visibilityState) && (e.delta = e.value - (r || 0), !e.delta && void 0 !== r || (r = e.value, t(e)))
        }
    }

    function ut(t, e) {
        function n(t) {
            t.hadRecentInput || (o.value += t.value, o.entries.push(t), r())
        }
        var r, i, o = it("CLS", 0);
        (i = ot("layout-shift", n)) && (r = ct(t, o, e), at(function() {
            i.takeRecords().map(n), r()
        }), st(function() {
            o = it("CLS", 0), r = ct(t, o, e)
        }))
    }

    function lt() {
        return "hidden" === document.visibilityState ? 0 : 1 / 0
    }

    function pt() {
        at(function(t) {
            t = t.timeStamp;
            Et = t
        }, !0)
    }

    function dt() {
        return Et < 0 && (Et = lt(), pt(), st(function() {
            setTimeout(function() {
                Et = lt(), pt()
            }, 0)
        })), {
            get timeStamp() {
                return Et
            }
        }
    }

    function ft(t, e) {
        yt || (yt = e, gt = t, _t = new Date, Ot(removeEventListener), Tt())
    }

    function ht(t) {
        var e, n, r, i;

        function o() {
            ft(n, r), i()
        }

        function a() {
            i()
        }
        t.cancelable && (e = (1e12 < t.timeStamp ? new Date : performance.now()) - t.timeStamp, "pointerdown" == t.type ? (n = e, r = t, i = function() {
            removeEventListener("pointerup", o, xt), removeEventListener("pointercancel", a, xt)
        }, addEventListener("pointerup", o, xt), addEventListener("pointercancel", a, xt)) : ft(e, t))
    }

    function mt(t, e) {
        function n(t) {
            t.startTime < r.timeStamp && (i.value = t.processingStart - t.startTime, i.entries.push(t), wt.add(i), a())
        }
        var r = dt(),
            i = it("FID"),
            o = ot("first-input", n),
            a = ct(t, i, e);
        o && at(function() {
            o.takeRecords().map(n), o.disconnect()
        }, !0), o && st(function() {
            i = it("FID"), a = ct(t, i, e), bt = [], gt = -1, yt = null, Ot(addEventListener), bt.push(n), Tt()
        })
    }

    function vt(e, n) {
        function t(t) {
            var e = t.startTime;
            e < o.timeStamp && (a.value = e, a.entries.push(t)), r()
        }
        var r, i, o = dt(),
            a = it("LCP"),
            s = ot("largest-contentful-paint", t);
        s && (r = ct(e, a, n), i = function() {
            wt.has(a) || (s.takeRecords().map(t), s.disconnect(), wt.add(a), r())
        }, ["keydown", "click"].forEach(function(t) {
            addEventListener(t, i, {
                once: !0,
                capture: !0
            })
        }), at(i, !0), st(function(t) {
            a = it("LCP"), r = ct(e, a, n), requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    a.value = performance.now() - t.timeStamp, wt.add(a), r()
                })
            })
        }))
    }
    var yt, gt, _t, bt, St = "mailto:nytgames@nytimes.com",
        wt = new("function" == typeof WeakSet ? WeakSet : Set),
        Et = -1,
        xt = {
            passive: !0,
            capture: !0
        },
        kt = new Date,
        Tt = function() {
            var e;
            0 <= gt && gt < _t - kt && (e = {
                entryType: "first-input",
                name: yt.type,
                target: yt.target,
                cancelable: yt.cancelable,
                startTime: yt.timeStamp,
                processingStart: yt.timeStamp + gt
            }, bt.forEach(function(t) {
                t(e)
            }), bt = [])
        },
        Ot = function(e) {
            ["mousedown", "keydown", "touchstart", "pointerdown"].forEach(function(t) {
                return e(t, ht, xt)
            })
        };

    function It(e, t) {
        var n, r = Object.keys(e);
        return Object.getOwnPropertySymbols && (n = Object.getOwnPropertySymbols(e), t && (n = n.filter(function(t) {
            return Object.getOwnPropertyDescriptor(e, t).enumerable
        })), r.push.apply(r, n)), r
    }

    function Ct(t, e, n) {
        return e in t ? Object.defineProperty(t, e, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : t[e] = n, t
    }
    var jt = "dataLayer",
        Rt = "games-crosswords";
    l[jt] = l[jt] || [], window.isHybridWebView || l[jt].push({
        event: "gtm.js",
        "gtm.start": k()
    });

    function At(t, e) {
        window.isHybridWebView && window.NativeBridge ? window.NativeBridge.sendAnalytic("moduleInteraction" === t ? "interaction" : t, e) : (e = function(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n = null != arguments[t] ? arguments[t] : {};
                t % 2 ? It(Object(n), !0).forEach(function(t) {
                    Ct(e, t, n[t])
                }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : It(Object(n)).forEach(function(t) {
                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
                })
            }
            return e
        }({
            event: t
        }, e), l[jt].push(e))
    }

    function Dt() {
        function t(t) {
            var e;
            t && At("userDataReady", t), At("pageDataReady", {
                application: {
                    name: Rt,
                    environment: f.name
                },
                asset: {
                    url: Mt
                },
                pageview: {
                    id: O
                }
            }), e = k(), setInterval(function() {
                p.hasFocus() && At("heartbeat", {
                    pageview: {
                        heartbeat: {
                            timeSincePageDataReady: k() - e,
                            heartbeatInterval: 5e3
                        }
                    }
                })
            }, 5e3)
        }
        window.isHybridWebView || function(r, i) {
            var o = !(2 < arguments.length && void 0 !== arguments[2]) || arguments[2];
            new Promise(function(t, e) {
                var n = p.createElement("script");
                n.async = o, r ? (n.src = r, n.onload = t, n.onerror = e) : i && (n.innerHTML = i, t()), p.body.appendChild(n)
            })
        }(f.gtm), Ft.initialize(), Ft.get().then(t).catch(function() {
            return t()
        })
    }

    function Nt(t) {
        var e = t.name,
            n = t.label,
            r = t.context,
            t = void 0 === (t = t.element) ? null : t;
        "undefined" != typeof window && At("moduleInteraction", {
            eventData: {
                pagetype: "game",
                trigger: "module",
                type: "click"
            },
            module: {
                type: "click",
                element: t || {
                    name: e,
                    label: n
                },
                context: r,
                label: n
            }
        })
    }

    function Pt(t) {
        var e = t.name,
            n = t.delta,
            n = {
                eventAction: "Web Vitals",
                eventLabel: t.id,
                pageview: {
                    performance: Ct({}, e.toLowerCase(), Math.round("CLS" === e ? 1e3 * n : n))
                }
            };
        At("performance", n)
    }

    function Lt() {
        ut(Pt), mt(Pt), vt(Pt)
    }
    var qt = p.querySelector("link[rel=canonical]"),
        Mt = (qt || p.location).href,
        Ft = I(function() {
            if (window.isHybridWebView) return null;
            var t = T({
                    sourceApp: Rt,
                    referrer: p.referrer,
                    assetUrl: Mt
                }),
                t = "".concat(f.tagx, "/svc/nyt/data-layer").concat(t);
            return H.get(t, {
                withCookie: !1
            })
        }),
        Ut = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        Ht = function(n) {
            return function(t) {
                var e = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : null;
                if (Ut.includes(t)) return Nt({
                    name: n,
                    label: "daily-archive",
                    context: e
                });
                switch (t) {
                    case "The Crossword":
                        return Nt({
                            name: n,
                            label: "daily-page",
                            context: e
                        });
                    case "The Mini":
                        return Nt({
                            name: n,
                            label: "mini-page",
                            context: e
                        });
                    case "Wordplay, the Crossword Column":
                        return Nt({
                            name: n,
                            label: "wordplay",
                            context: e
                        });
                    case "Spelling Bee":
                        return Nt({
                            name: n,
                            label: "spelling-bee",
                            context: e
                        });
                    case "Letter Boxed":
                        return Nt({
                            name: n,
                            label: "letter-boxed",
                            context: e
                        });
                    case "Tiles":
                        return Nt({
                            name: n,
                            label: "tiles",
                            context: e
                        });
                    case "Sudoku":
                        return Nt({
                            name: n,
                            label: "sudoku",
                            context: e
                        });
                    case "Vertex":
                        return Nt({
                            name: n,
                            label: "vertex",
                            context: e
                        });
                    case "All Games":
                        return Nt({
                            name: n,
                            label: "nav-all-games",
                            context: e
                        });
                    case "Statistics":
                        return Nt({
                            name: n,
                            label: "stats",
                            context: e
                        });
                    case "Crossword Archives":
                        return Nt({
                            name: n,
                            label: "daily-archive",
                            context: e
                        });
                    case "download-app":
                        return Nt({
                            name: n,
                            label: "download-app",
                            context: e
                        });
                    case "monthly-bonus":
                        return Nt({
                            name: n,
                            label: "monthly-bonus",
                            context: e
                        });
                    case "variety-puzzles":
                        return Nt({
                            name: n,
                            label: "variety-puzzles",
                            context: e
                        });
                    case "How to Solve The New York Times Crossword":
                    case "Featured Article":
                        return Nt({
                            name: n,
                            label: "featured-article",
                            context: e
                        });
                    default:
                        return null
                }
            }
        },
        Bt = Ht("nav"),
        Wt = Ht("hub");

    function Yt(t) {
        return function(t) {
            if (Array.isArray(t)) return zt(t)
        }(t) || function(t) {
            if ("undefined" != typeof Symbol && null != t[Symbol.iterator] || null != t["@@iterator"]) return Array.from(t)
        }(t) || function(t, e) {
            if (t) {
                if ("string" == typeof t) return zt(t, e);
                var n = Object.prototype.toString.call(t).slice(8, -1);
                return "Map" === (n = "Object" === n && t.constructor ? t.constructor.name : n) || "Set" === n ? Array.from(t) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? zt(t, e) : void 0
            }
        }(t) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function zt(t, e) {
        (null == e || e > t.length) && (e = t.length);
        for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
        return r
    }
    var Gt, Jt, Xt, Vt, $t, c = (Jt = g(x("global-nav")), Xt = g(x("mobile-toolbar")), Vt = "show-mobile-toolbar", $t = {
        text: function(t, e) {
            return s("span", {
                class: "pz-nav__toolbar-item",
                onClick: e
            }, t)
        }
    }, {
        create: function(t) {
            a(Xt, t.map(Kt))
        },
        activate: function() {
            Gt || (Gt = !0, h(Jt, Vt))
        },
        deactivate: function() {
            Gt && (Gt = !1, m(Jt, Vt))
        }
    });

    function Kt(t) {
        return $t[t.type](t.value, t.action)
    }

    function Qt(t) {
        return (l.abra || {})[t] || null
    }
    var Zt, te = {},
        _ = {
            get: Qt,
            reset: function() {
                te = {}
            },
            reportExposure: function(t) {
                te[t] || (te[t] = 1, l.dataLayer.push({
                    event: "ab-expose",
                    abtest: {
                        test: t,
                        variant: Qt(t) || "0"
                    }
                }))
            }
        },
        ee = "__viewers__";
    "IntersectionObserver" in l && "IntersectionObserverEntry" in l && "intersectionRatio" in l.IntersectionObserverEntry.prototype && ("isIntersecting" in l.IntersectionObserverEntry.prototype || Object.defineProperty(l.IntersectionObserverEntry.prototype, "isIntersecting", {
        get: function() {
            return 0 < this.intersectionRatio
        }
    }), l.__observeInView__ = !0);

    function ne(t, e) {
        window.__observeInView__ && (Zt = Zt || new l.IntersectionObserver(function(t) {
            t.forEach(function(e) {
                e.isIntersecting && e.target[ee].forEach(function(t) {
                    return t(e)
                })
            })
        }, {
            threshold: .4
        }), t[ee] ? t[ee].push(e) : (t[ee] = [e], Zt.observe(t)))
    }

    function re(e, t) {
        var n, r = Object.keys(e);
        return Object.getOwnPropertySymbols && (n = Object.getOwnPropertySymbols(e), t && (n = n.filter(function(t) {
            return Object.getOwnPropertyDescriptor(e, t).enumerable
        })), r.push.apply(r, n)), r
    }

    function ie(r) {
        for (var t = 1; t < arguments.length; t++) {
            var i = null != arguments[t] ? arguments[t] : {};
            t % 2 ? re(Object(i), !0).forEach(function(t) {
                var e, n;
                e = r, t = i[n = t], n in e ? Object.defineProperty(e, n, {
                    value: t,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : e[n] = t
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(i)) : re(Object(i)).forEach(function(t) {
                Object.defineProperty(r, t, Object.getOwnPropertyDescriptor(i, t))
            })
        }
        return r
    }

    function oe(t) {
        var e = t.target.getAttribute("data-region") || "",
            n = t.target.getAttribute("data-track") || "",
            r = t.target.getAttribute("data-label") || t.target.textContent,
            i = {};
        "noticeOptOut" === n && (i = {
            name: t.target.getAttribute("data-element-name"),
            url: t.target.href || "",
            label: r
        }), At("moduleInteraction", {
            eventData: {
                pagetype: "game",
                trigger: "module",
                type: "click"
            },
            module: {
                name: se[n],
                label: r,
                region: e,
                element: ie({}, i)
            }
        })
    }

    function ae(t) {
        var e = {},
            n = t.target.getAttribute("data-region") || "",
            r = t.target.getAttribute("data-track") || "",
            t = t.target.textContent;
        e[n] || (At("impression", {
            eventData: {
                pagetype: "game",
                trigger: "module",
                type: "impression"
            },
            module: {
                name: se[r],
                label: t,
                region: n
            }
        }), e[n] = !0)
    }
    var se = {
        linkCANotice: "california notices link",
        linkOptOut: "ccpa opt-out link",
        optedOut: "ccpa opted-out indicator",
        modalPrivacy: "ccpa notice of opt-out privacy policy link",
        snackbar: "ccpa snackbar message",
        noticeOptOut: "ccpa notice of opt-out element"
    };

    function ce(t) {
        return function(t) {
            if (Array.isArray(t)) return ue(t)
        }(t) || function(t) {
            if ("undefined" != typeof Symbol && null != t[Symbol.iterator] || null != t["@@iterator"]) return Array.from(t)
        }(t) || function(t, e) {
            if (t) {
                if ("string" == typeof t) return ue(t, e);
                var n = Object.prototype.toString.call(t).slice(8, -1);
                return "Map" === (n = "Object" === n && t.constructor ? t.constructor.name : n) || "Set" === n ? Array.from(t) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ue(t, e) : void 0
            }
        }(t) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function ue(t, e) {
        (null == e || e > t.length) && (e = t.length);
        for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
        return r
    }
    var le = "prod" === f.name ? "https://purr.nytimes.com" : "https://purr.dev.nytimes.com";
    H.get("".concat(le, "/v1/purr-cache"), {
        withCookie: !1
    });

    function pe(t) {
        return h(t, "dimmed")
    }

    function de(t) {
        return m(t, "dimmed")
    }

    function fe() {
        var c, u, t = ce(document.getElementsByClassName("ccpa-impression")),
            l = ce(document.getElementsByClassName("ccpa-opt-out"));

        function p(t) {
            function e(t) {
                var e = !(t instanceof Error),
                    n = C ? "Your preference has been saved, we will no longer sell your information." : "Your request to not sell your data will be stored for this browser and device.",
                    r = e ? (s = C ? "As a California resident, you have additional rights under the California Consumer Privacy Act of 2018. While The New York Times Company does not “sell” personal information of its readers as the term “sell” is traditionally understood, “sell” under the CCPA is broadly defined. To learn more, review the text below." : "If you clear your cookies, your preference will be forgotten. As a California resident, you have additional rights under the California Consumer Privacy Act of 2018. While The New York Times Company does not “sell” personal information of its readers as the term “sell” is traditionally understood, “sell” under the CCPA is broadly defined. To learn more, review the text below.", '\n  <div class="ccpa-snackbar" role="status" data-region="popup">\n    <div class="ccpa-snackbar__dismiss-icon ccpa-modal-link" role="button" data-region="footer" data-element-name="X button" data-label="X" data-track="noticeOptOut"></div>\n    <div class="ccpa-snackbar__header">'.concat(n, '</div>\n    <div class=ccpa-snackbar__msg-container>\n    <div class="ccpa-snackbar__msg">').concat(s, '</div>\n      <div class="ccpa-snackbar__terms">\n        <p>The New York Times Company does not sell personal information of its readers as the term "sell" is traditionally understood. But "sell" under the CCPA is broadly defined. It includes the sharing of personal information with third parties in exchange for something of value, even if no money changes hands. For example, sharing an advertising or device identifier to a third party may be considered a “sale” under the CCPA.</p>\n        <p>To the extent The New York Times Company "sells" your personal information (as the term "sell" is defined under the CCPA), you have the right to opt-out of that “sale” on a going-forward basis at any time. To exercise this right, click the “Do Not Sell My Personal Information” link in the footer of our website or under your “Account,” which you have already done. You can also submit a request to opt-out by emailing us at <a href="mailto:privacy@nytimes.com">privacy@nytimes.com</a> with the subject line “California Resident - Do Not Sell.”</p>\n        <p>Once you have opted out, you will see a change to “We No Longer Sell Your Personal Information.” If you have an account with certain Times Services (specifically nytimes.com, cooking.nytimes.com, nytimes.com/crosswords, the New York Times app, the New York Times Cooking app and the New York Times Crossword app) and are logged in, we will save your preference and honor your opt-out request across browsers and devices so long as you remain logged in. If you are not logged in, or do not have an account with any Times Services listed above, your opt-out of the “sale” of personal information will be specific to the browser or device from which you have clicked “Do Not Sell My Personal Information” and until you clear your cookies (or local storage in apps) on this browser or device.</p>\n        <p>If your browser or device is using a “do not track” setting, we will detect it and honor it on that specific browser or device only. If you wish to have a “do not track” experience across all of your browsers and devices, please make sure that all of your browsers and devices are set on “do not track.”</p>\n        <p>After you opt out of the “sale” of your personal information, we will no longer "sell" your personal information to third parties (except in an aggregated or de-identified manner so it is no longer personal information), but we will continue to share your personal information with our service providers, which process it on our behalf. Exercising your right to opt out of the “sale” of your personal information does not mean that you will stop seeing ads on our sites and apps.</p>\n        <p>To opt-out of interest-based advertising as much as technically possible, go to <a class="test-manage-trackers-link ccpa-modal-link" data-region="footer" data-track="noticeOptOut" data-region="footer" data-element-name="manage trackers link" target="_blank" rel="noopener noreferrer" href="http://www.nytimes.com/privacy/cookie-policy#how-do-i-manage-trackers">"How Do I Manage Trackers"</a> in our Cookie Policy. To opt out of the “sale” of your personal information from participating companies, please visit the Digital Advertising Alliance <a class="ccpa-modal-link test-daa-link-web" data-region="footer" data-element-name="DAA web link" data-track="noticeOptOut" target="_blank" rel="noopener noreferrer" href="https://optout.privacyrights.info/?c=1">website</a> or <a class="ccpa-modal-link test-daa-link-apps" target="_blank" rel="noopener noreferrer" href="https://www.privacyrights.info/appchoices" data-region="footer" data-element-name="DAA apps link" data-track="noticeOptOut">apps</a>. We do not control these opt-out mechanisms and are not responsible for their operation.</p>\n        <p>You can designate someone else to make a request on your behalf. To protect your information, we will ask for a signed permission from you authorizing the other person to submit a request on your behalf. We will contact you to verify your identity before we respond to your authorized agent’s request.</p>\n        <p>After 12 months, we may ask you if you want to opt into the “sale” of your personal information.</p>\n        <p>For further information, please refer to our <a href="https://www.nytimes.com/privacy/privacy-policy" class="test-privacy-policy-link ccpa-modal-link" target="_blank" rel="noopener noreferrer" data-region="footer" data-element-name="privacy policy link" data-track="noticeOptOut">Privacy Policy</a>.</p>\n      </div>\n    </div>\n    <div class="ccpa-bottom">\n      <div role="button" class="ccpa-snackbar__dismiss ccpa-modal-link" data-region="footer" data-track="noticeOptOut" data-element-name="dismiss button">DISMISS</div>\n      <a href="https://www.nytimes.com/privacy/privacy-policy" class="test-privacy-learn-more ccpa-modal-link ccpa-privacy-link" target="_blank" rel="noopener noreferrer" data-region="footer" data-element-name="privacy policy link" data-track="noticeOptOut">Learn more about your privacy</a>\n    </div>\n  </div>\n')) : '\n  <div class="ccpa-snackbar error" role="status">\n    <div class="ccpa-snackbar__error">Something went wrong. Please try again.</div>\n  </div>\n';
                document.body.insertAdjacentHTML("beforeend", r);
                var i = ce(document.querySelectorAll(".pz-footer, .pz-header, .pz-content")),
                    o = ce(document.querySelectorAll(".ccpa-modal-link")),
                    a = document.querySelector(".ccpa-snackbar"),
                    t = document.querySelector(".ccpa-snackbar__dismiss"),
                    s = document.querySelector(".ccpa-snackbar__dismiss-icon"),
                    r = function() {
                        u = !1, c && clearTimeout(c), h(a, "dismissed"), i.map(de)
                    };
                t && t.addEventListener("click", r), s && s.addEventListener("click", r), o.forEach(function(t) {
                    t.addEventListener("click", oe)
                }), setTimeout(function() {
                    h(a, "enter"), e && i.map(pe)
                }, 30), e || (c = setTimeout(r, 7e3)), e && (l.forEach(function(t) {
                    var e = t.firstChild,
                        n = e.className,
                        e = e.dataset.region;
                    t.innerHTML = '<span class="'.concat(n, '" data-region="').concat(e, '" data-track="optedOut">We No Longer Sell Your Personal Information</span>'), t.removeEventListener("click", p)
                }), At("impression", {
                    module: {
                        name: "ccpa snackbar message",
                        label: n
                    }
                }))
            }
            t.preventDefault(), u || (u = !0, H.post("".concat(le, "/v1/preferences"), {
                ccpa_pref: "opt-out"
            }, {
                withCookie: !1
            }).then(e).catch(e))
        }
        ce(document.querySelectorAll(".ccpa-link")).forEach(function(t) {
            t.addEventListener("click", oe)
        }), t.forEach(function(t) {
            ne(t, ae)
        }), l.forEach(function(t) {
            y(t, "click", p)
        })
    }
    var he = function(t, e) {
        return (he = Object.setPrototypeOf || {
                __proto__: []
            }
            instanceof Array && function(t, e) {
                t.__proto__ = e
            } || function(t, e) {
                for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n])
            })(t, e)
    };

    function me(t, e) {
        function n() {
            this.constructor = t
        }
        he(t, e), t.prototype = null === e ? Object.create(e) : (n.prototype = e.prototype, new n)
    }
    var ve, ye, ge, _e, be, Se, we = function() {
        return (we = Object.assign || function(t) {
            for (var e, n = 1, r = arguments.length; n < r; n++)
                for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t
        }).apply(this, arguments)
    };

    function Ee(t) {
        var e = "function" == typeof Symbol && Symbol.iterator,
            n = e && t[e],
            r = 0;
        if (n) return n.call(t);
        if (t && "number" == typeof t.length) return {
            next: function() {
                return {
                    value: (t = t && r >= t.length ? void 0 : t) && t[r++],
                    done: !t
                }
            }
        };
        throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.")
    }

    function xe() {
        for (var t = [], e = 0; e < arguments.length; e++) t = t.concat(function(t, e) {
            var n = "function" == typeof Symbol && t[Symbol.iterator];
            if (!n) return t;
            var r, i, o = n.call(t),
                a = [];
            try {
                for (;
                    (void 0 === e || 0 < e--) && !(r = o.next()).done;) a.push(r.value)
            } catch (t) {
                i = {
                    error: t
                }
            } finally {
                try {
                    r && !r.done && (n = o.return) && n.call(o)
                } finally {
                    if (i) throw i.error
                }
            }
            return a
        }(arguments[e]));
        return t
    }

    function ke() {
        for (var t = [], e = 0; e < arguments.length; e++) t = t.concat(function(t, e) {
            var n = "function" == typeof Symbol && t[Symbol.iterator];
            if (!n) return t;
            var r, i, o = n.call(t),
                a = [];
            try {
                for (;
                    (void 0 === e || 0 < e--) && !(r = o.next()).done;) a.push(r.value)
            } catch (t) {
                i = {
                    error: t
                }
            } finally {
                try {
                    r && !r.done && (n = o.return) && n.call(o)
                } finally {
                    if (i) throw i.error
                }
            }
            return a
        }(arguments[e]));
        return t
    }(w = ve = ve || {}).Ok = "ok", w.Exited = "exited", w.Crashed = "crashed", w.Abnormal = "abnormal", (S = {}).Ok = "ok", S.Errored = "errored", S.Crashed = "crashed", (n = ye = ye || {}).Fatal = "fatal", n.Error = "error", n.Warning = "warning", n.Log = "log", n.Info = "info", n.Debug = "debug", n.Critical = "critical", (ge = ye = ye || {}).fromString = function(t) {
        switch (t) {
            case "debug":
                return ge.Debug;
            case "info":
                return ge.Info;
            case "warn":
            case "warning":
                return ge.Warning;
            case "error":
                return ge.Error;
            case "fatal":
                return ge.Fatal;
            case "critical":
                return ge.Critical;
            default:
                return ge.Log
        }
    }, (Y = _e = _e || {}).Unknown = "unknown", Y.Skipped = "skipped", Y.Success = "success", Y.RateLimit = "rate_limit", Y.Invalid = "invalid", Y.Failed = "failed", (be = _e = _e || {}).fromHttpCode = function(t) {
        return 200 <= t && t < 300 ? be.Success : 429 === t ? be.RateLimit : 400 <= t && t < 500 ? be.Invalid : 500 <= t ? be.Failed : be.Unknown
    }, (e = Se = Se || {}).Explicit = "explicitly_set", e.Sampler = "client_sampler", e.Rate = "client_rate", e.Inheritance = "inheritance";
    var Te = function() {
        return (Te = Object.assign || function(t) {
            for (var e, n = 1, r = arguments.length; n < r; n++)
                for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t
        }).apply(this, arguments)
    };

    function Oe() {
        for (var t = [], e = 0; e < arguments.length; e++) t = t.concat(function(t, e) {
            var n = "function" == typeof Symbol && t[Symbol.iterator];
            if (!n) return t;
            var r, i, o = n.call(t),
                a = [];
            try {
                for (;
                    (void 0 === e || 0 < e--) && !(r = o.next()).done;) a.push(r.value)
            } catch (t) {
                i = {
                    error: t
                }
            } finally {
                try {
                    r && !r.done && (n = o.return) && n.call(o)
                } finally {
                    if (i) throw i.error
                }
            }
            return a
        }(arguments[e]));
        return t
    }

    function Ie(t) {
        return (Ie = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
        } : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        })(t)
    }

    function Ce(t) {
        switch (Object.prototype.toString.call(t)) {
            case "[object Error]":
            case "[object Exception]":
            case "[object DOMException]":
                return 1;
            default:
                return Me(t, Error)
        }
    }

    function je(t) {
        return "[object ErrorEvent]" === Object.prototype.toString.call(t)
    }

    function Re(t) {
        return "[object DOMError]" === Object.prototype.toString.call(t)
    }

    function Ae(t) {
        return "[object String]" === Object.prototype.toString.call(t)
    }

    function De(t) {
        return null === t || "object" !== Ie(t) && "function" != typeof t
    }

    function Ne(t) {
        return "[object Object]" === Object.prototype.toString.call(t)
    }

    function Pe(t) {
        return "undefined" != typeof Event && Me(t, Event)
    }

    function Le(t) {
        return "undefined" != typeof Element && Me(t, Element)
    }

    function qe(t) {
        return Boolean(t && t.then && "function" == typeof t.then)
    }

    function Me(t, e) {
        try {
            return t instanceof e
        } catch (t) {
            return !1
        }
    }

    function Fe(t, e) {
        try {
            for (var n, r = t, i = [], o = 0, a = 0, s = " > ".length; r && o++ < 5 && !("html" === (n = function(t, e) {
                    var n, r, i, o, a = t,
                        s = [];
                    if (!a || !a.tagName) return "";
                    s.push(a.tagName.toLowerCase());
                    var t = null !== (t = e) && void 0 !== t && t.length ? e.filter(function(t) {
                        return a.getAttribute(t)
                    }).map(function(t) {
                        return [t, a.getAttribute(t)]
                    }) : null;
                    if (null !== (e = t) && void 0 !== e && e.length) t.forEach(function(t) {
                        s.push("[" + t[0] + '="' + t[1] + '"]')
                    });
                    else if (a.id && s.push("#" + a.id), (t = a.className) && Ae(t))
                        for (n = t.split(/\s+/), o = 0; o < n.length; o++) s.push("." + n[o]);
                    var c = ["type", "name", "title", "alt"];
                    for (o = 0; o < c.length; o++) r = c[o], (i = a.getAttribute(r)) && s.push("[" + r + '="' + i + '"]');
                    return s.join("")
                }(r, e)) || 1 < o && 80 <= a + i.length * s + n.length);) i.push(n), a += n.length, r = r.parentNode;
            return i.reverse().join(" > ")
        } catch (t) {
            return "<unknown>"
        }
    }
    var Ue = function(t, e) {
        return (Ue = Object.setPrototypeOf || {
                __proto__: []
            }
            instanceof Array && function(t, e) {
                t.__proto__ = e
            } || function(t, e) {
                for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n])
            })(t, e)
    };
    var He = function() {
        return (He = Object.assign || function(t) {
            for (var e, n = 1, r = arguments.length; n < r; n++)
                for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t
        }).apply(this, arguments)
    };

    function Be(t) {
        var e = "function" == typeof Symbol && Symbol.iterator,
            n = e && t[e],
            r = 0;
        if (n) return n.call(t);
        if (t && "number" == typeof t.length) return {
            next: function() {
                return {
                    value: (t = t && r >= t.length ? void 0 : t) && t[r++],
                    done: !t
                }
            }
        };
        throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.")
    }
    var We = Object.setPrototypeOf || ({
            __proto__: []
        }
        instanceof Array ? function(t, e) {
            return t.__proto__ = e, t
        } : function(t, e) {
            for (var n in e) t.hasOwnProperty(n) || (t[n] = e[n]);
            return t
        });
    var Ye, ze, Ge, Je = (Ye = Error, Ue(ze = Ve, Ge = Ye), ze.prototype = null === Ge ? Object.create(Ge) : (Xe.prototype = Ge.prototype, new Xe), Ve);

    function Xe() {
        this.constructor = ze
    }

    function Ve(t) {
        var e = this.constructor,
            n = Ye.call(this, t) || this;
        return n.message = t, n.name = e.prototype.constructor.name, We(n, e.prototype), n
    }
    var $e = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+))?@)([\w.-]+)(?::(\d+))?\/(.+)/,
        Ke = "Invalid Dsn",
        Qe = (Ze.prototype.toString = function(t) {
            var e = this,
                n = e.host,
                r = e.path,
                i = e.pass,
                o = e.port,
                a = e.projectId;
            return e.protocol + "://" + e.publicKey + ((t = void 0 === t ? !1 : t) && i ? ":" + i : "") + "@" + n + (o ? ":" + o : "") + "/" + (r && r + "/") + a
        }, Ze.prototype._fromString = function(t) {
            var e = $e.exec(t);
            if (!e) throw new Je(Ke);
            var n = function(t, e) {
                    var n = "function" == typeof Symbol && t[Symbol.iterator];
                    if (!n) return t;
                    var r, i, o = n.call(t),
                        a = [];
                    try {
                        for (;
                            (void 0 === e || 0 < e--) && !(r = o.next()).done;) a.push(r.value)
                    } catch (t) {
                        i = {
                            error: t
                        }
                    } finally {
                        try {
                            r && !r.done && (n = o.return) && n.call(o)
                        } finally {
                            if (i) throw i.error
                        }
                    }
                    return a
                }(e.slice(1), 6),
                r = n[0],
                i = n[1],
                o = n[2],
                a = void 0 === o ? "" : o,
                s = n[3],
                t = n[4],
                e = void 0 === t ? "" : t,
                o = "",
                t = n[5],
                n = t.split("/");
            1 < n.length && (o = n.slice(0, -1).join("/"), t = n.pop()), !t || (n = t.match(/^\d+/)) && (t = n[0]), this._fromComponents({
                host: s,
                pass: a,
                path: o,
                projectId: t,
                port: e,
                protocol: r,
                publicKey: i
            })
        }, Ze.prototype._fromComponents = function(t) {
            "user" in t && !("publicKey" in t) && (t.publicKey = t.user), this.user = t.publicKey || "", this.protocol = t.protocol, this.publicKey = t.publicKey || "", this.pass = t.pass || "", this.host = t.host, this.port = t.port || "", this.path = t.path || "", this.projectId = t.projectId
        }, Ze.prototype._validate = function() {
            var e = this;
            if (["protocol", "publicKey", "host", "projectId"].forEach(function(t) {
                    if (!e[t]) throw new Je(Ke + ": " + t + " missing")
                }), !this.projectId.match(/^\d+$/)) throw new Je(Ke + ": Invalid projectId " + this.projectId);
            if ("http" !== this.protocol && "https" !== this.protocol) throw new Je(Ke + ": Invalid protocol " + this.protocol);
            if (this.port && isNaN(parseInt(this.port, 10))) throw new Je(Ke + ": Invalid port " + this.port)
        }, Ze);

    function Ze(t) {
        "string" == typeof t ? this._fromString(t) : this._fromComponents(t), this._validate()
    }

    function tn() {
        return "[object process]" === Object.prototype.toString.call("undefined" != typeof process ? process : 0)
    }

    function en(t, e) {
        return t.require(e)
    }

    function nn(t) {
        try {
            n = en(module, t)
        } catch (t) {}
        try {
            var e = en(module, "process").cwd,
                n = en(module, e() + "/node_modules/" + t)
        } catch (t) {}
        return n
    }

    function rn(t, e) {
        return void 0 === e && (e = 0), "string" != typeof t || 0 === e || t.length <= e ? t : t.substr(0, e) + "..."
    }

    function on(t, e) {
        if (!Array.isArray(t)) return "";
        for (var n = [], r = 0; r < t.length; r++) {
            var i = t[r];
            try {
                n.push(String(i))
            } catch (t) {
                n.push("[value cannot be serialized]")
            }
        }
        return n.join(e)
    }

    function an(t, e) {
        return !!Ae(t) && ("[object RegExp]" === Object.prototype.toString.call(e) ? e.test(t) : "string" == typeof e && -1 !== t.indexOf(e))
    }
    var sn = {};

    function cn() {
        return tn() ? global : "undefined" != typeof window ? window : "undefined" != typeof self ? self : sn
    }

    function un() {
        var t = cn(),
            e = t.crypto || t.msCrypto;
        if (void 0 !== e && e.getRandomValues) {
            t = new Uint16Array(8);
            e.getRandomValues(t), t[3] = 4095 & t[3] | 16384, t[4] = 16383 & t[4] | 32768;
            e = function(t) {
                for (var e = t.toString(16); e.length < 4;) e = "0" + e;
                return e
            };
            return e(t[0]) + e(t[1]) + e(t[2]) + e(t[3]) + e(t[4]) + e(t[5]) + e(t[6]) + e(t[7])
        }
        return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(t) {
            var e = 16 * Math.random() | 0;
            return ("x" === t ? e : 3 & e | 8).toString(16)
        })
    }

    function ln(t) {
        if (!t) return {};
        var e = t.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
        if (!e) return {};
        var n = e[6] || "",
            t = e[8] || "";
        return {
            host: e[4],
            path: e[5],
            protocol: e[2],
            relative: e[5] + n + t
        }
    }

    function pn(t) {
        if (t.message) return t.message;
        if (t.exception && t.exception.values && t.exception.values[0]) {
            var e = t.exception.values[0];
            return e.type && e.value ? e.type + ": " + e.value : e.type || e.value || t.event_id || "<unknown>"
        }
        return t.event_id || "<unknown>"
    }

    function dn(t) {
        var e = cn();
        if (!("console" in e)) return t();
        var n = e.console,
            r = {};
        ["debug", "info", "warn", "error", "log", "assert"].forEach(function(t) {
            t in e.console && n[t].__sentry_original__ && (r[t] = n[t], n[t] = n[t].__sentry_original__)
        });
        t = t();
        return Object.keys(r).forEach(function(t) {
            n[t] = r[t]
        }), t
    }

    function fn(t, e, n) {
        t.exception = t.exception || {}, t.exception.values = t.exception.values || [], t.exception.values[0] = t.exception.values[0] || {}, t.exception.values[0].value = t.exception.values[0].value || e || "", t.exception.values[0].type = t.exception.values[0].type || n || "Error"
    }

    function hn(e, n) {
        void 0 === n && (n = {});
        try {
            e.exception.values[0].mechanism = e.exception.values[0].mechanism || {}, Object.keys(n).forEach(function(t) {
                e.exception.values[0].mechanism[t] = n[t]
            })
        } catch (t) {}
    }
    var mn = cn(),
        vn = "Sentry Logger ",
        qt = (yn.prototype.disable = function() {
            this._enabled = !1
        }, yn.prototype.enable = function() {
            this._enabled = !0
        }, yn.prototype.log = function() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            this._enabled && dn(function() {
                mn.console.log(vn + "[Log]: " + t.join(" "))
            })
        }, yn.prototype.warn = function() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            this._enabled && dn(function() {
                mn.console.warn(vn + "[Warn]: " + t.join(" "))
            })
        }, yn.prototype.error = function() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            this._enabled && dn(function() {
                mn.console.error(vn + "[Error]: " + t.join(" "))
            })
        }, yn);

    function yn() {
        this._enabled = !1
    }
    mn.__SENTRY__ = mn.__SENTRY__ || {};
    var gn = mn.__SENTRY__.logger || (mn.__SENTRY__.logger = new qt),
        _n = (bn.prototype.memoize = function(t) {
            if (this._hasWeakSet) return !!this._inner.has(t) || (this._inner.add(t), !1);
            for (var e = 0; e < this._inner.length; e++)
                if (this._inner[e] === t) return !0;
            return this._inner.push(t), !1
        }, bn.prototype.unmemoize = function(t) {
            if (this._hasWeakSet) this._inner.delete(t);
            else
                for (var e = 0; e < this._inner.length; e++)
                    if (this._inner[e] === t) {
                        this._inner.splice(e, 1);
                        break
                    }
        }, bn);

    function bn() {
        this._hasWeakSet = "function" == typeof WeakSet, this._inner = this._hasWeakSet ? new WeakSet : []
    }
    var Sn = "<anonymous>";

    function wn(t) {
        try {
            return t && "function" == typeof t ? t.name || Sn : Sn
        } catch (t) {
            return Sn
        }
    }

    function En(t) {
        return (En = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
        } : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        })(t)
    }

    function xn(t, e, n) {
        if (e in t) {
            var r = t[e],
                n = n(r);
            if ("function" == typeof n) try {
                n.prototype = n.prototype || {}, Object.defineProperties(n, {
                    __sentry_original__: {
                        enumerable: !1,
                        value: r
                    }
                })
            } catch (t) {}
            t[e] = n
        }
    }

    function kn(t) {
        if (Ce(t)) {
            var e = t,
                n = {
                    message: e.message,
                    name: e.name,
                    stack: e.stack
                };
            for (r in e) Object.prototype.hasOwnProperty.call(e, r) && (n[r] = e[r]);
            return n
        }
        if (Pe(t)) {
            var r, i = t,
                o = {};
            o.type = i.type;
            try {
                o.target = Le(i.target) ? Fe(i.target) : Object.prototype.toString.call(i.target)
            } catch (t) {
                o.target = "<unknown>"
            }
            try {
                o.currentTarget = Le(i.currentTarget) ? Fe(i.currentTarget) : Object.prototype.toString.call(i.currentTarget)
            } catch (t) {
                o.currentTarget = "<unknown>"
            }
            for (r in "undefined" != typeof CustomEvent && Me(t, CustomEvent) && (o.detail = i.detail), i) Object.prototype.hasOwnProperty.call(i, r) && (o[r] = i);
            return o
        }
        return t
    }

    function Tn(t) {
        return t = JSON.stringify(t), ~-encodeURI(t).split(/%..|./).length
    }

    function On(t, e) {
        return "domain" === e && t && "object" === En(t) && t._events ? "[Domain]" : "domainEmitter" === e ? "[DomainEmitter]" : "undefined" != typeof global && t === global ? "[Global]" : "undefined" != typeof window && t === window ? "[Window]" : "undefined" != typeof document && t === document ? "[Document]" : Ne(e = t) && "nativeEvent" in e && "preventDefault" in e && "stopPropagation" in e ? "[SyntheticEvent]" : "number" == typeof t && t != t ? "[NaN]" : void 0 === t ? "[undefined]" : "function" == typeof t ? "[Function: " + wn(t) + "]" : "symbol" === En(t) ? "[" + String(t) + "]" : "bigint" == typeof t ? "[BigInt: " + String(t) + "]" : t
    }

    function In(t, e, n, r) {
        if (void 0 === n && (n = 1 / 0), void 0 === r && (r = new _n), 0 === n) return i = e, o = Object.prototype.toString.call(i), "string" == typeof i ? i : "[object Object]" === o ? "[Object]" : "[object Array]" === o ? "[Array]" : De(i = On(i)) ? i : o;
        var i, o;
        if (null != e && "function" == typeof e.toJSON) return e.toJSON();
        t = On(e, t);
        if (De(t)) return t;
        var a, s = kn(e),
            c = Array.isArray(e) ? [] : {};
        if (r.memoize(e)) return "[Circular ~]";
        for (a in s) Object.prototype.hasOwnProperty.call(s, a) && (c[a] = In(a, s[a], n - 1, r));
        return r.unmemoize(e), c
    }

    function Cn(t, n) {
        try {
            return JSON.parse(JSON.stringify(t, function(t, e) {
                return In(t, e, n)
            }))
        } catch (t) {
            return "**non-serializable**"
        }
    }

    function jn(t) {
        var e, n;
        if (Ne(t)) {
            var r = t,
                i = {};
            try {
                for (var o = Be(Object.keys(r)), a = o.next(); !a.done; a = o.next()) {
                    var s = a.value;
                    void 0 !== r[s] && (i[s] = jn(r[s]))
                }
            } catch (t) {
                e = {
                    error: t
                }
            } finally {
                try {
                    a && !a.done && (n = o.return) && n.call(o)
                } finally {
                    if (e) throw e.error
                }
            }
            return i
        }
        return Array.isArray(t) ? t.map(jn) : t
    }

    function Rn() {
        if ("fetch" in cn()) try {
            return new Headers, new Request(""), new Response, 1
        } catch (t) {
            return
        }
    }

    function An(t) {
        return t && /^function fetch\(\)\s+\{\s+\[native code\]\s+\}$/.test(t.toString())
    }
    var Dn, Nn = cn(),
        Pn = {},
        Ln = {};

    function qn(t) {
        var r, a, s, c, e;
        if (!Ln[t]) switch (Ln[t] = !0, t) {
            case "console":
                "console" in Nn && ["debug", "info", "warn", "error", "log", "assert"].forEach(function(r) {
                    r in Nn.console && xn(Nn.console, r, function(n) {
                        return function() {
                            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                            Fn("console", {
                                args: t,
                                level: r
                            }), n && Function.prototype.apply.call(n, Nn.console, t)
                        }
                    })
                });
                break;
            case "dom":
                "document" in Nn && (c = Fn.bind(null, "dom"), e = Wn(c, !0), Nn.document.addEventListener("click", e, !1), Nn.document.addEventListener("keypress", e, !1), ["EventTarget", "Node"].forEach(function(t) {
                    t = Nn[t] && Nn[t].prototype;
                    t && t.hasOwnProperty && t.hasOwnProperty("addEventListener") && (xn(t, "addEventListener", function(a) {
                        return function(t, e, n) {
                            if ("click" === t || "keypress" == t) try {
                                var r, i = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {},
                                    o = i[t] = i[t] || {
                                        refCount: 0
                                    };
                                o.handler || (r = Wn(c), o.handler = r, a.call(this, t, r, n)), o.refCount += 1
                            } catch (t) {}
                            return a.call(this, t, e, n)
                        }
                    }), xn(t, "removeEventListener", function(o) {
                        return function(t, e, n) {
                            if ("click" === t || "keypress" == t) try {
                                var r = this.__sentry_instrumentation_handlers__ || {},
                                    i = r[t];
                                i && (--i.refCount, i.refCount <= 0 && (o.call(this, t, i.handler, n), i.handler = void 0, delete r[t]), 0 === Object.keys(r).length && delete this.__sentry_instrumentation_handlers__)
                            } catch (t) {}
                            return o.call(this, t, e, n)
                        }
                    }))
                }));
                break;
            case "xhr":
                "XMLHttpRequest" in Nn && (a = [], s = [], xn(e = XMLHttpRequest.prototype, "open", function(o) {
                    return function() {
                        for (var n = [], t = 0; t < arguments.length; t++) n[t] = arguments[t];
                        var r = this,
                            e = n[1];
                        r.__sentry_xhr__ = {
                            method: Ae(n[0]) ? n[0].toUpperCase() : n[0],
                            url: n[1]
                        }, Ae(e) && "POST" === r.__sentry_xhr__.method && e.match(/sentry_key/) && (r.__sentry_own_request__ = !0);

                        function i() {
                            if (4 === r.readyState) {
                                try {
                                    r.__sentry_xhr__ && (r.__sentry_xhr__.status_code = r.status)
                                } catch (t) {}
                                try {
                                    var t, e = a.indexOf(r); - 1 !== e && (a.splice(e), t = s.splice(e)[0], r.__sentry_xhr__ && void 0 !== t[0] && (r.__sentry_xhr__.body = t[0]))
                                } catch (t) {}
                                Fn("xhr", {
                                    args: n,
                                    endTimestamp: Date.now(),
                                    startTimestamp: Date.now(),
                                    xhr: r
                                })
                            }
                        }
                        return "onreadystatechange" in r && "function" == typeof r.onreadystatechange ? xn(r, "onreadystatechange", function(n) {
                            return function() {
                                for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                                return i(), n.apply(r, t)
                            }
                        }) : r.addEventListener("readystatechange", i), o.apply(r, n)
                    }
                }), xn(e, "send", function(n) {
                    return function() {
                        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                        return a.push(this), s.push(t), Fn("xhr", {
                            args: t,
                            startTimestamp: Date.now(),
                            xhr: this
                        }), n.apply(this, t)
                    }
                }));
                break;
            case "fetch":
                ! function() {
                    if (Rn()) {
                        var t = cn();
                        if (An(t.fetch)) return 1;
                        var e = !1,
                            t = t.document;
                        if (t && "function" == typeof t.createElement) try {
                            var n = t.createElement("iframe");
                            n.hidden = !0, t.head.appendChild(n), n.contentWindow && n.contentWindow.fetch && (e = An(n.contentWindow.fetch)), t.head.removeChild(n)
                        } catch (t) {
                            gn.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", t)
                        }
                        return e
                    }
                }() || xn(Nn, "fetch", function(r) {
                    return function() {
                        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                        var n = {
                            args: t,
                            fetchData: {
                                method: function(t) {
                                    void 0 === t && (t = []);
                                    if ("Request" in Nn && Me(t[0], Request) && t[0].method) return String(t[0].method).toUpperCase();
                                    if (t[1] && t[1].method) return String(t[1].method).toUpperCase();
                                    return "GET"
                                }(t),
                                url: function(t) {
                                    void 0 === t && (t = []);
                                    if ("string" == typeof t[0]) return t[0];
                                    if ("Request" in Nn && Me(t[0], Request)) return t[0].url;
                                    return String(t[0])
                                }(t)
                            },
                            startTimestamp: Date.now()
                        };
                        return Fn("fetch", He({}, n)), r.apply(Nn, t).then(function(t) {
                            return Fn("fetch", He(He({}, n), {
                                endTimestamp: Date.now(),
                                response: t
                            })), t
                        }, function(t) {
                            throw Fn("fetch", He(He({}, n), {
                                endTimestamp: Date.now(),
                                error: t
                            })), t
                        })
                    }
                });
                break;
            case "history":
                ! function() {
                    var t = cn(),
                        e = (e = t.chrome) && e.app && e.app.runtime,
                        t = "history" in t && !!t.history.pushState && !!t.history.replaceState;
                    return !e && t
                }() || (r = Nn.onpopstate, Nn.onpopstate = function() {
                    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                    var n = Nn.location.href;
                    if (Fn("history", {
                            from: Dn,
                            to: Dn = n
                        }), r) try {
                        return r.apply(this, t)
                    } catch (t) {}
                }, xn(Nn.history, "pushState", n), xn(Nn.history, "replaceState", n));
                break;
            case "error":
                Yn = Nn.onerror, Nn.onerror = function(t, e, n, r, i) {
                    return Fn("error", {
                        column: r,
                        error: i,
                        line: n,
                        msg: t,
                        url: e
                    }), !!Yn && Yn.apply(this, arguments)
                };
                break;
            case "unhandledrejection":
                Gn = Nn.onunhandledrejection, Nn.onunhandledrejection = function(t) {
                    return Fn("unhandledrejection", t), !Gn || Gn.apply(this, arguments)
                };
                break;
            default:
                gn.warn("unknown instrumentation type:", t)
        }

        function n(i) {
            return function() {
                for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                var n, r = 2 < t.length ? t[2] : void 0;
                return r && (n = Dn, r = String(r), Fn("history", {
                    from: n,
                    to: Dn = r
                })), i.apply(this, t)
            }
        }
    }

    function Mn(t) {
        t && "string" == typeof t.type && "function" == typeof t.callback && (Pn[t.type] = Pn[t.type] || [], Pn[t.type].push(t.callback), qn(t.type))
    }

    function Fn(e, t) {
        var n, r;
        if (e && Pn[e]) try {
            for (var i = Be(Pn[e] || []), o = i.next(); !o.done; o = i.next()) {
                var a = o.value;
                try {
                    a(t)
                } catch (t) {
                    gn.error("Error while triggering instrumentation handler.\nType: " + e + "\nName: " + wn(a) + "\nError: " + t)
                }
            }
        } catch (t) {
            n = {
                error: t
            }
        } finally {
            try {
                o && !o.done && (r = i.return) && r.call(i)
            } finally {
                if (n) throw n.error
            }
        }
    }
    var Un, Hn, Bn = 1e3;

    function Wn(n, r) {
        return void 0 === r && (r = !1),
            function(t) {
                var e;
                t && Hn !== t && ! function(t) {
                    if ("keypress" === t.type) {
                        try {
                            var e = t.target;
                            if (!e || !e.tagName) return 1;
                            if ("INPUT" === e.tagName || "TEXTAREA" === e.tagName || e.isContentEditable) return
                        } catch (t) {}
                        return 1
                    }
                }(t) && (e = "keypress" === t.type ? "input" : t.type, void 0 !== Un && ! function(t, e) {
                    if (!t) return 1;
                    if (t.type !== e.type) return 1;
                    try {
                        if (t.target !== e.target) return 1
                    } catch (t) {}
                }(Hn, t) || (n({
                    event: t,
                    name: e,
                    global: r
                }), Hn = t), clearTimeout(Un), Un = Nn.setTimeout(function() {
                    Un = void 0
                }, Bn))
            }
    }
    var Yn = null;
    var zn, Gn = null;
    (I = zn = zn || {}).PENDING = "PENDING", I.RESOLVED = "RESOLVED", I.REJECTED = "REJECTED";
    var Jn = (Xn.resolve = function(e) {
        return new Xn(function(t) {
            t(e)
        })
    }, Xn.reject = function(n) {
        return new Xn(function(t, e) {
            e(n)
        })
    }, Xn.all = function(t) {
        return new Xn(function(n, r) {
            var i, o;
            Array.isArray(t) ? 0 !== t.length ? (i = t.length, o = [], t.forEach(function(t, e) {
                Xn.resolve(t).then(function(t) {
                    o[e] = t, 0 === --i && n(o)
                }).then(null, r)
            })) : n([]) : r(new TypeError("Promise.all requires an array as input."))
        })
    }, Xn.prototype.then = function(r, i) {
        var t = this;
        return new Xn(function(e, n) {
            t._attachHandler({
                done: !1,
                onfulfilled: function(t) {
                    if (r) try {
                        return void e(r(t))
                    } catch (t) {
                        return void n(t)
                    } else e(t)
                },
                onrejected: function(t) {
                    if (i) try {
                        return void e(i(t))
                    } catch (t) {
                        return void n(t)
                    } else n(t)
                }
            })
        })
    }, Xn.prototype.catch = function(t) {
        return this.then(function(t) {
            return t
        }, t)
    }, Xn.prototype.finally = function(i) {
        var o = this;
        return new Xn(function(t, e) {
            var n, r;
            return o.then(function(t) {
                r = !1, n = t, i && i()
            }, function(t) {
                r = !0, n = t, i && i()
            }).then(function() {
                (r ? e : t)(n)
            })
        })
    }, Xn.prototype.toString = function() {
        return "[object SyncPromise]"
    }, Xn);

    function Xn(t) {
        var n = this;
        this._state = zn.PENDING, this._handlers = [], this._resolve = function(t) {
            n._setResult(zn.RESOLVED, t)
        }, this._reject = function(t) {
            n._setResult(zn.REJECTED, t)
        }, this._setResult = function(t, e) {
            n._state === zn.PENDING && (qe(e) ? e.then(n._resolve, n._reject) : (n._state = t, n._value = e, n._executeHandlers()))
        }, this._attachHandler = function(t) {
            n._handlers = n._handlers.concat(t), n._executeHandlers()
        }, this._executeHandlers = function() {
            var t;
            n._state !== zn.PENDING && (t = n._handlers.slice(), n._handlers = [], t.forEach(function(t) {
                t.done || (n._state === zn.RESOLVED && t.onfulfilled && t.onfulfilled(n._value), n._state === zn.REJECTED && t.onrejected && t.onrejected(n._value), t.done = !0)
            }))
        };
        try {
            t(this._resolve, this._reject)
        } catch (t) {
            this._reject(t)
        }
    }
    var Vn = ($n.prototype.isReady = function() {
        return void 0 === this._limit || this.length() < this._limit
    }, $n.prototype.add = function(t) {
        var e = this;
        if (!this.isReady()) return Jn.reject(new Je("Not adding Promise due to buffer limit reached."));
        var n = t();
        return -1 === this._buffer.indexOf(n) && this._buffer.push(n), n.then(function() {
            return e.remove(n)
        }).then(null, function() {
            return e.remove(n).then(null, function() {})
        }), n
    }, $n.prototype.remove = function(t) {
        return this._buffer.splice(this._buffer.indexOf(t), 1)[0]
    }, $n.prototype.length = function() {
        return this._buffer.length
    }, $n.prototype.drain = function(n) {
        var r = this;
        return new Jn(function(t) {
            var e = setTimeout(function() {
                n && 0 < n && t(!1)
            }, n);
            Jn.all(r._buffer).then(function() {
                clearTimeout(e), t(!0)
            }).then(null, function() {
                t(!0)
            })
        })
    }, $n);

    function $n(t) {
        this._limit = t, this._buffer = []
    }
    Ht = {
        nowSeconds: function() {
            return Date.now() / 1e3
        }
    };
    var Kn = (tn() ? function() {
            try {
                return en(module, "perf_hooks").performance
            } catch (t) {
                return
            }
        } : function() {
            var t = cn().performance;
            if (t && t.now) return {
                now: function() {
                    return t.now()
                },
                timeOrigin: Date.now() - t.now()
            }
        })(),
        w = void 0 === Kn ? Ht : {
            nowSeconds: function() {
                return (Kn.timeOrigin + Kn.now()) / 1e3
            }
        },
        Qn = Ht.nowSeconds.bind(Ht),
        Zn = w.nowSeconds.bind(w),
        tr = Zn,
        er = function() {
            var t = cn().performance;
            if (t && t.now) {
                var e = t.now(),
                    n = Date.now(),
                    r = t.timeOrigin ? Math.abs(t.timeOrigin + e - n) : 36e5,
                    i = r < 36e5,
                    o = t.timing && t.timing.navigationStart,
                    e = "number" == typeof o ? Math.abs(o + e - n) : 36e5;
                return i || e < 36e5 ? r <= e ? t.timeOrigin : o : n
            }
        }(),
        nr = (rr.clone = function(t) {
            var e = new rr;
            return t && (e._breadcrumbs = Oe(t._breadcrumbs), e._tags = Te({}, t._tags), e._extra = Te({}, t._extra), e._contexts = Te({}, t._contexts), e._user = t._user, e._level = t._level, e._span = t._span, e._session = t._session, e._transactionName = t._transactionName, e._fingerprint = t._fingerprint, e._eventProcessors = Oe(t._eventProcessors), e._requestSession = t._requestSession), e
        }, rr.prototype.addScopeListener = function(t) {
            this._scopeListeners.push(t)
        }, rr.prototype.addEventProcessor = function(t) {
            return this._eventProcessors.push(t), this
        }, rr.prototype.setUser = function(t) {
            return this._user = t || {}, this._session && this._session.update({
                user: t
            }), this._notifyScopeListeners(), this
        }, rr.prototype.getUser = function() {
            return this._user
        }, rr.prototype.getRequestSession = function() {
            return this._requestSession
        }, rr.prototype.setRequestSession = function(t) {
            return this._requestSession = t, this
        }, rr.prototype.setTags = function(t) {
            return this._tags = Te(Te({}, this._tags), t), this._notifyScopeListeners(), this
        }, rr.prototype.setTag = function(t, e) {
            var n;
            return this._tags = Te(Te({}, this._tags), ((n = {})[t] = e, n)), this._notifyScopeListeners(), this
        }, rr.prototype.setExtras = function(t) {
            return this._extra = Te(Te({}, this._extra), t), this._notifyScopeListeners(), this
        }, rr.prototype.setExtra = function(t, e) {
            var n;
            return this._extra = Te(Te({}, this._extra), ((n = {})[t] = e, n)), this._notifyScopeListeners(), this
        }, rr.prototype.setFingerprint = function(t) {
            return this._fingerprint = t, this._notifyScopeListeners(), this
        }, rr.prototype.setLevel = function(t) {
            return this._level = t, this._notifyScopeListeners(), this
        }, rr.prototype.setTransactionName = function(t) {
            return this._transactionName = t, this._notifyScopeListeners(), this
        }, rr.prototype.setTransaction = function(t) {
            return this.setTransactionName(t)
        }, rr.prototype.setContext = function(t, e) {
            var n;
            return null === e ? delete this._contexts[t] : this._contexts = Te(Te({}, this._contexts), ((n = {})[t] = e, n)), this._notifyScopeListeners(), this
        }, rr.prototype.setSpan = function(t) {
            return this._span = t, this._notifyScopeListeners(), this
        }, rr.prototype.getSpan = function() {
            return this._span
        }, rr.prototype.getTransaction = function() {
            var t, e = this.getSpan();
            return null !== e && void 0 !== e && e.transaction ? null === e || void 0 === e ? void 0 : e.transaction : null !== (t = null === e || void 0 === e ? void 0 : e.spanRecorder) && void 0 !== t && t.spans[0] ? e.spanRecorder.spans[0] : void 0
        }, rr.prototype.setSession = function(t) {
            return t ? this._session = t : delete this._session, this._notifyScopeListeners(), this
        }, rr.prototype.getSession = function() {
            return this._session
        }, rr.prototype.update = function(t) {
            if (!t) return this;
            if ("function" != typeof t) return t instanceof rr ? (this._tags = Te(Te({}, this._tags), t._tags), this._extra = Te(Te({}, this._extra), t._extra), this._contexts = Te(Te({}, this._contexts), t._contexts), t._user && Object.keys(t._user).length && (this._user = t._user), t._level && (this._level = t._level), t._fingerprint && (this._fingerprint = t._fingerprint), t._requestSession && (this._requestSession = t._requestSession)) : Ne(t) && (this._tags = Te(Te({}, this._tags), t.tags), this._extra = Te(Te({}, this._extra), t.extra), this._contexts = Te(Te({}, this._contexts), t.contexts), t.user && (this._user = t.user), t.level && (this._level = t.level), t.fingerprint && (this._fingerprint = t.fingerprint), t.requestSession && (this._requestSession = t.requestSession)), this;
            t = t(this);
            return t instanceof rr ? t : this
        }, rr.prototype.clear = function() {
            return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._requestSession = void 0, this._span = void 0, this._session = void 0, this._notifyScopeListeners(), this
        }, rr.prototype.addBreadcrumb = function(t, e) {
            e = "number" == typeof e ? Math.min(e, 100) : 100;
            if (e <= 0) return this;
            t = Te({
                timestamp: Qn()
            }, t);
            return this._breadcrumbs = Oe(this._breadcrumbs, [t]).slice(-e), this._notifyScopeListeners(), this
        }, rr.prototype.clearBreadcrumbs = function() {
            return this._breadcrumbs = [], this._notifyScopeListeners(), this
        }, rr.prototype.applyToEvent = function(t, e) {
            var n;
            return this._extra && Object.keys(this._extra).length && (t.extra = Te(Te({}, this._extra), t.extra)), this._tags && Object.keys(this._tags).length && (t.tags = Te(Te({}, this._tags), t.tags)), this._user && Object.keys(this._user).length && (t.user = Te(Te({}, this._user), t.user)), this._contexts && Object.keys(this._contexts).length && (t.contexts = Te(Te({}, this._contexts), t.contexts)), this._level && (t.level = this._level), this._transactionName && (t.transaction = this._transactionName), this._span && (t.contexts = Te({
                trace: this._span.getTraceContext()
            }, t.contexts), (n = null === (n = this._span.transaction) || void 0 === n ? void 0 : n.name) && (t.tags = Te({
                transaction: n
            }, t.tags))), this._applyFingerprint(t), t.breadcrumbs = Oe(t.breadcrumbs || [], this._breadcrumbs), t.breadcrumbs = 0 < t.breadcrumbs.length ? t.breadcrumbs : void 0, this._notifyEventProcessors(Oe(ir(), this._eventProcessors), t, e)
        }, rr.prototype._notifyEventProcessors = function(r, i, o, a) {
            var s = this;
            return void 0 === a && (a = 0), new Jn(function(e, t) {
                var n = r[a];
                null === i || "function" != typeof n ? e(i) : (qe(n = n(Te({}, i), o)) ? n.then(function(t) {
                    return s._notifyEventProcessors(r, t, o, a + 1).then(e)
                }) : s._notifyEventProcessors(r, n, o, a + 1).then(e)).then(null, t)
            })
        }, rr.prototype._notifyScopeListeners = function() {
            var e = this;
            this._notifyingListeners || (this._notifyingListeners = !0, this._scopeListeners.forEach(function(t) {
                t(e)
            }), this._notifyingListeners = !1)
        }, rr.prototype._applyFingerprint = function(t) {
            t.fingerprint = t.fingerprint ? Array.isArray(t.fingerprint) ? t.fingerprint : [t.fingerprint] : [], this._fingerprint && (t.fingerprint = t.fingerprint.concat(this._fingerprint)), t.fingerprint && !t.fingerprint.length && delete t.fingerprint
        }, rr);

    function rr() {
        this._notifyingListeners = !1, this._scopeListeners = [], this._eventProcessors = [], this._breadcrumbs = [], this._user = {}, this._tags = {}, this._extra = {}, this._contexts = {}
    }

    function ir() {
        var t = cn();
        return t.__SENTRY__ = t.__SENTRY__ || {}, t.__SENTRY__.globalEventProcessors = t.__SENTRY__.globalEventProcessors || [], t.__SENTRY__.globalEventProcessors
    }

    function or(t) {
        ir().push(t)
    }
    var ar = (sr.prototype.update = function(t) {
        var e;
        (t = void 0 === t ? {} : t).user && (!this.ipAddress && t.user.ip_address && (this.ipAddress = t.user.ip_address), this.did || t.did || (this.did = t.user.id || t.user.email || t.user.username)), this.timestamp = t.timestamp || Zn(), t.ignoreDuration && (this.ignoreDuration = t.ignoreDuration), t.sid && (this.sid = 32 === t.sid.length ? t.sid : un()), void 0 !== t.init && (this.init = t.init), !this.did && t.did && (this.did = "" + t.did), "number" == typeof t.started && (this.started = t.started), this.ignoreDuration ? this.duration = void 0 : "number" == typeof t.duration ? this.duration = t.duration : (e = this.timestamp - this.started, this.duration = 0 <= e ? e : 0), t.release && (this.release = t.release), t.environment && (this.environment = t.environment), !this.ipAddress && t.ipAddress && (this.ipAddress = t.ipAddress), !this.userAgent && t.userAgent && (this.userAgent = t.userAgent), "number" == typeof t.errors && (this.errors = t.errors), t.status && (this.status = t.status)
    }, sr.prototype.close = function(t) {
        t ? this.update({
            status: t
        }) : this.status === ve.Ok ? this.update({
            status: ve.Exited
        }) : this.update()
    }, sr.prototype.toJSON = function() {
        return jn({
            sid: "" + this.sid,
            init: this.init,
            started: new Date(1e3 * this.started).toISOString(),
            timestamp: new Date(1e3 * this.timestamp).toISOString(),
            status: this.status,
            errors: this.errors,
            did: "number" == typeof this.did || "string" == typeof this.did ? "" + this.did : void 0,
            duration: this.duration,
            attrs: jn({
                release: this.release,
                environment: this.environment,
                ip_address: this.ipAddress,
                user_agent: this.userAgent
            })
        })
    }, sr);

    function sr(t) {
        this.errors = 0, this.sid = un(), this.duration = 0, this.status = ve.Ok, this.init = !0, this.ignoreDuration = !1;
        var e = Zn();
        this.timestamp = e, this.started = e, t && this.update(t)
    }
    var cr = 4,
        ur = (lr.prototype.isOlderThan = function(t) {
            return this._version < t
        }, lr.prototype.bindClient = function(t) {
            (this.getStackTop().client = t) && t.setupIntegrations && t.setupIntegrations()
        }, lr.prototype.pushScope = function() {
            var t = nr.clone(this.getScope());
            return this.getStack().push({
                client: this.getClient(),
                scope: t
            }), t
        }, lr.prototype.popScope = function() {
            return !(this.getStack().length <= 1) && !!this.getStack().pop()
        }, lr.prototype.withScope = function(t) {
            var e = this.pushScope();
            try {
                t(e)
            } finally {
                this.popScope()
            }
        }, lr.prototype.getClient = function() {
            return this.getStackTop().client
        }, lr.prototype.getScope = function() {
            return this.getStackTop().scope
        }, lr.prototype.getStack = function() {
            return this._stack
        }, lr.prototype.getStackTop = function() {
            return this._stack[this._stack.length - 1]
        }, lr.prototype.captureException = function(t, e) {
            var n = this._lastEventId = un(),
                r = e;
            if (!e) {
                e = void 0;
                try {
                    throw new Error("Sentry syntheticException")
                } catch (t) {
                    e = t
                }
                r = {
                    originalException: t,
                    syntheticException: e
                }
            }
            return this._invokeClient("captureException", t, Te(Te({}, r), {
                event_id: n
            })), n
        }, lr.prototype.captureMessage = function(t, e, n) {
            var r = this._lastEventId = un(),
                i = n;
            if (!n) {
                n = void 0;
                try {
                    throw new Error(t)
                } catch (t) {
                    n = t
                }
                i = {
                    originalException: t,
                    syntheticException: n
                }
            }
            return this._invokeClient("captureMessage", t, e, Te(Te({}, i), {
                event_id: r
            })), r
        }, lr.prototype.captureEvent = function(t, e) {
            var n = this._lastEventId = un();
            return this._invokeClient("captureEvent", t, Te(Te({}, e), {
                event_id: n
            })), n
        }, lr.prototype.lastEventId = function() {
            return this._lastEventId
        }, lr.prototype.addBreadcrumb = function(t, e) {
            var n, r, i = this.getStackTop(),
                o = i.scope,
                a = i.client;
            o && a && (a = (i = a.getOptions && a.getOptions() || {}).beforeBreadcrumb, n = void 0 === a ? null : a, (i = void 0 === (a = i.maxBreadcrumbs) ? 100 : a) <= 0 || (a = Qn(), r = Te({
                timestamp: a
            }, t), null !== (t = n ? dn(function() {
                return n(r, e)
            }) : r) && o.addBreadcrumb(t, i)))
        }, lr.prototype.setUser = function(t) {
            var e = this.getScope();
            e && e.setUser(t)
        }, lr.prototype.setTags = function(t) {
            var e = this.getScope();
            e && e.setTags(t)
        }, lr.prototype.setExtras = function(t) {
            var e = this.getScope();
            e && e.setExtras(t)
        }, lr.prototype.setTag = function(t, e) {
            var n = this.getScope();
            n && n.setTag(t, e)
        }, lr.prototype.setExtra = function(t, e) {
            var n = this.getScope();
            n && n.setExtra(t, e)
        }, lr.prototype.setContext = function(t, e) {
            var n = this.getScope();
            n && n.setContext(t, e)
        }, lr.prototype.configureScope = function(t) {
            var e = this.getStackTop(),
                n = e.scope,
                e = e.client;
            n && e && t(n)
        }, lr.prototype.run = function(t) {
            var e = dr(this);
            try {
                t(this)
            } finally {
                dr(e)
            }
        }, lr.prototype.getIntegration = function(e) {
            var t = this.getClient();
            if (!t) return null;
            try {
                return t.getIntegration(e)
            } catch (t) {
                return gn.warn("Cannot retrieve integration " + e.id + " from the current Hub"), null
            }
        }, lr.prototype.startSpan = function(t) {
            return this._callExtensionMethod("startSpan", t)
        }, lr.prototype.startTransaction = function(t, e) {
            return this._callExtensionMethod("startTransaction", t, e)
        }, lr.prototype.traceHeaders = function() {
            return this._callExtensionMethod("traceHeaders")
        }, lr.prototype.captureSession = function(t) {
            if (t = void 0 === t ? !1 : t) return this.endSession();
            this._sendSessionUpdate()
        }, lr.prototype.endSession = function() {
            var t;
            null !== (t = null === (t = null === (t = this.getStackTop()) || void 0 === t ? void 0 : t.scope) || void 0 === t ? void 0 : t.getSession()) && void 0 !== t && t.close(), this._sendSessionUpdate(), null !== (t = null === (t = this.getStackTop()) || void 0 === t ? void 0 : t.scope) && void 0 !== t && t.setSession()
        }, lr.prototype.startSession = function(t) {
            var e = this.getStackTop(),
                n = e.scope,
                r = e.client,
                i = r && r.getOptions() || {},
                e = i.release,
                r = i.environment,
                i = (cn().navigator || {}).userAgent,
                i = new ar(Te(Te(Te({
                    release: e,
                    environment: r
                }, n && {
                    user: n.getUser()
                }), i && {
                    userAgent: i
                }), t));
            return n && ((t = n.getSession && n.getSession()) && t.status === ve.Ok && t.update({
                status: ve.Exited
            }), this.endSession(), n.setSession(i)), i
        }, lr.prototype._sendSessionUpdate = function() {
            var t = this.getStackTop(),
                e = t.scope,
                t = t.client;
            !e || (e = e.getSession && e.getSession()) && t && t.captureSession && t.captureSession(e)
        }, lr.prototype._invokeClient = function(t) {
            for (var e = [], n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
            var r = this.getStackTop(),
                i = r.scope,
                r = r.client;
            r && r[t] && r[t].apply(r, Oe(e, [i]))
        }, lr.prototype._callExtensionMethod = function(t) {
            for (var e = [], n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
            var r = pr().__SENTRY__;
            if (r && r.extensions && "function" == typeof r.extensions[t]) return r.extensions[t].apply(this, e);
            gn.warn("Extension method " + t + " couldn't be found, doing nothing.")
        }, lr);

    function lr(t, e, n) {
        void 0 === e && (e = new nr), this._version = n = void 0 === n ? cr : n, this._stack = [{}], this.getStackTop().scope = e, this.bindClient(t)
    }

    function pr() {
        var t = cn();
        return t.__SENTRY__ = t.__SENTRY__ || {
            extensions: {},
            hub: void 0
        }, t
    }

    function dr(t) {
        var e = pr(),
            n = mr(e);
        return vr(e, t), n
    }

    function fr() {
        var t = pr();
        return hr(t) && !mr(t).isOlderThan(cr) || vr(t, new ur), (tn() ? function(e) {
            var t, n, r;
            try {
                var i, o = null === (r = null === (n = null === (t = pr().__SENTRY__) || void 0 === t ? void 0 : t.extensions) || void 0 === n ? void 0 : n.domain) || void 0 === r ? void 0 : r.active;
                return o ? (hr(o) && !mr(o).isOlderThan(cr) || (i = mr(e).getStackTop(), vr(o, new ur(i.client, nr.clone(i.scope)))), mr(o)) : mr(e)
            } catch (t) {
                return mr(e)
            }
        } : mr)(t)
    }

    function hr(t) {
        return t && t.__SENTRY__ && t.__SENTRY__.hub
    }

    function mr(t) {
        return t && t.__SENTRY__ && t.__SENTRY__.hub || (t.__SENTRY__ = t.__SENTRY__ || {}, t.__SENTRY__.hub = new ur), t.__SENTRY__.hub
    }

    function vr(t, e) {
        return t && (t.__SENTRY__ = t.__SENTRY__ || {}, t.__SENTRY__.hub = e, 1)
    }

    function yr(t) {
        for (var e = [], n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
        var r = fr();
        if (r && r[t]) return r[t].apply(r, ke(e));
        throw new Error("No hub defined or " + t + " was not found on the hub, please open a bug report.")
    }
    var gr = (_r.prototype.getDsn = function() {
        return this._dsnObject
    }, _r.prototype.forceEnvelope = function() {
        return !!this._tunnel
    }, _r.prototype.getBaseApiEndpoint = function() {
        var t = this.getDsn(),
            e = t.protocol ? t.protocol + ":" : "",
            n = t.port ? ":" + t.port : "";
        return e + "//" + t.host + n + (t.path ? "/" + t.path : "") + "/api/"
    }, _r.prototype.getStoreEndpoint = function() {
        return this._getIngestEndpoint("store")
    }, _r.prototype.getStoreEndpointWithUrlEncodedAuth = function() {
        return this.getStoreEndpoint() + "?" + this._encodedAuth()
    }, _r.prototype.getEnvelopeEndpointWithUrlEncodedAuth = function() {
        return this.forceEnvelope() ? this._tunnel : this._getEnvelopeEndpoint() + "?" + this._encodedAuth()
    }, _r.prototype.getStoreEndpointPath = function() {
        var t = this.getDsn();
        return (t.path ? "/" + t.path : "") + "/api/" + t.projectId + "/store/"
    }, _r.prototype.getRequestHeaders = function(t, e) {
        var n = this.getDsn(),
            r = ["Sentry sentry_version=7"];
        return r.push("sentry_client=" + t + "/" + e), r.push("sentry_key=" + n.publicKey), n.pass && r.push("sentry_secret=" + n.pass), {
            "Content-Type": "application/json",
            "X-Sentry-Auth": r.join(", ")
        }
    }, _r.prototype.getReportDialogEndpoint = function(t) {
        void 0 === t && (t = {});
        var e, n = this.getDsn(),
            r = this.getBaseApiEndpoint() + "embed/error-page/",
            i = [];
        for (e in i.push("dsn=" + n.toString()), t) "dsn" !== e && ("user" === e ? t.user && (t.user.name && i.push("name=" + encodeURIComponent(t.user.name)), t.user.email && i.push("email=" + encodeURIComponent(t.user.email))) : i.push(encodeURIComponent(e) + "=" + encodeURIComponent(t[e])));
        return i.length ? r + "?" + i.join("&") : r
    }, _r.prototype._getEnvelopeEndpoint = function() {
        return this._getIngestEndpoint("envelope")
    }, _r.prototype._getIngestEndpoint = function(t) {
        return this._tunnel || "" + this.getBaseApiEndpoint() + this.getDsn().projectId + "/" + t + "/"
    }, _r.prototype._encodedAuth = function() {
        var e, t = {
            sentry_key: this.getDsn().publicKey,
            sentry_version: "7"
        };
        return e = t, Object.keys(e).map(function(t) {
            return encodeURIComponent(t) + "=" + encodeURIComponent(e[t])
        }).join("&")
    }, _r);

    function _r(t, e, n) {
        void 0 === e && (e = {}), this.dsn = t, this._dsnObject = new Qe(t), this.metadata = e, this._tunnel = n
    }
    var br = function() {
        return (br = Object.assign || function(t) {
            for (var e, n = 1, r = arguments.length; n < r; n++)
                for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t
        }).apply(this, arguments)
    };

    function Sr() {
        for (var t = [], e = 0; e < arguments.length; e++) t = t.concat(function(t, e) {
            var n = "function" == typeof Symbol && t[Symbol.iterator];
            if (!n) return t;
            var r, i, o = n.call(t),
                a = [];
            try {
                for (;
                    (void 0 === e || 0 < e--) && !(r = o.next()).done;) a.push(r.value)
            } catch (t) {
                i = {
                    error: t
                }
            } finally {
                try {
                    r && !r.done && (n = o.return) && n.call(o)
                } finally {
                    if (i) throw i.error
                }
            }
            return a
        }(arguments[e]));
        return t
    }
    var wr = [];

    function Er(t) {
        return t.reduce(function(t, e) {
            return t.every(function(t) {
                return e.name !== t.name
            }) && t.push(e), t
        }, [])
    }

    function xr(t) {
        var e, n, r = {};
        return t = (e = t).defaultIntegrations && Sr(e.defaultIntegrations) || [], n = e.integrations, e = Sr(Er(t)), Array.isArray(n) ? e = Sr(e.filter(function(e) {
            return n.every(function(t) {
                return t.name !== e.name
            })
        }), Er(n)) : "function" == typeof n && (e = n(e), e = Array.isArray(e) ? e : [e]), -1 !== (t = e.map(function(t) {
            return t.name
        })).indexOf("Debug") && e.push.apply(e, Sr(e.splice(t.indexOf("Debug"), 1))), e.forEach(function(t) {
            r[t.name] = t, t = t, -1 === wr.indexOf(t.name) && (t.setupOnce(or, fr), wr.push(t.name), gn.log("Integration installed: " + t.name))
        }), r
    }
    kr.prototype.captureException = function(t, e, n) {
        var r = this,
            i = e && e.event_id;
        return this._process(this._getBackend().eventFromException(t, e).then(function(t) {
            return r._captureEvent(t, e, n)
        }).then(function(t) {
            i = t
        })), i
    }, kr.prototype.captureMessage = function(t, e, n, r) {
        var i = this,
            o = n && n.event_id,
            t = De(t) ? this._getBackend().eventFromMessage(String(t), e, n) : this._getBackend().eventFromException(t, n);
        return this._process(t.then(function(t) {
            return i._captureEvent(t, n, r)
        }).then(function(t) {
            o = t
        })), o
    }, kr.prototype.captureEvent = function(t, e, n) {
        var r = e && e.event_id;
        return this._process(this._captureEvent(t, e, n).then(function(t) {
            r = t
        })), r
    }, kr.prototype.captureSession = function(t) {
        this._isEnabled() ? "string" != typeof t.release ? gn.warn("Discarded session because of missing or non-string release") : (this._sendSession(t), t.update({
            init: !1
        })) : gn.warn("SDK not enabled, will not capture session.")
    }, kr.prototype.getDsn = function() {
        return this._dsn
    }, kr.prototype.getOptions = function() {
        return this._options
    }, kr.prototype.flush = function(t) {
        var n = this;
        return this._isClientProcessing(t).then(function(e) {
            return n._getBackend().getTransport().close(t).then(function(t) {
                return e && t
            })
        })
    }, kr.prototype.close = function(t) {
        var e = this;
        return this.flush(t).then(function(t) {
            return e.getOptions().enabled = !1, t
        })
    }, kr.prototype.setupIntegrations = function() {
        this._isEnabled() && (this._integrations = xr(this._options))
    }, kr.prototype.getIntegration = function(e) {
        try {
            return this._integrations[e.id] || null
        } catch (t) {
            return gn.warn("Cannot retrieve integration " + e.id + " from the current Client"), null
        }
    }, kr.prototype._updateSessionFromEvent = function(t, e) {
        var n, r = !1,
            i = !1,
            e = e.exception && e.exception.values;
        if (e) {
            i = !0;
            try {
                for (var o = function(t) {
                        var e = "function" == typeof Symbol && Symbol.iterator,
                            n = e && t[e],
                            r = 0;
                        if (n) return n.call(t);
                        if (t && "number" == typeof t.length) return {
                            next: function() {
                                return {
                                    value: (t = t && r >= t.length ? void 0 : t) && t[r++],
                                    done: !t
                                }
                            }
                        };
                        throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.")
                    }(e), a = o.next(); !a.done; a = o.next()) {
                    var s = a.value.mechanism;
                    if (s && !1 === s.handled) {
                        r = !0;
                        break
                    }
                }
            } catch (t) {
                c = {
                    error: t
                }
            } finally {
                try {
                    a && !a.done && (n = o.return) && n.call(o)
                } finally {
                    if (c) throw c.error
                }
            }
        }
        var c = t.status === ve.Ok;
        (c && 0 === t.errors || c && r) && (t.update(br(br({}, r && {
            status: ve.Crashed
        }), {
            errors: t.errors || Number(i || r)
        })), this.captureSession(t))
    }, kr.prototype._sendSession = function(t) {
        this._getBackend().sendSession(t)
    }, kr.prototype._isClientProcessing = function(r) {
        var i = this;
        return new Jn(function(t) {
            var e = 0,
                n = setInterval(function() {
                    0 == i._processing ? (clearInterval(n), t(!0)) : (e += 1, r && r <= e && (clearInterval(n), t(!1)))
                }, 1)
        })
    }, kr.prototype._getBackend = function() {
        return this._backend
    }, kr.prototype._isEnabled = function() {
        return !1 !== this.getOptions().enabled && void 0 !== this._dsn
    }, kr.prototype._prepareEvent = function(t, e, n) {
        var r = this,
            i = this.getOptions().normalizeDepth,
            o = void 0 === i ? 3 : i,
            i = br(br({}, t), {
                event_id: t.event_id || (n && n.event_id ? n.event_id : un()),
                timestamp: t.timestamp || Qn()
            });
        this._applyClientOptions(i), this._applyIntegrationsMetadata(i);
        t = e;
        n && n.captureContext && (t = nr.clone(t).update(n.captureContext));
        e = Jn.resolve(i);
        return (e = t ? t.applyToEvent(i, n) : e).then(function(t) {
            return "number" == typeof o && 0 < o ? r._normalizeEvent(t, o) : t
        })
    }, kr.prototype._normalizeEvent = function(t, e) {
        if (!t) return null;
        var n = br(br(br(br(br({}, t), t.breadcrumbs && {
            breadcrumbs: t.breadcrumbs.map(function(t) {
                return br(br({}, t), t.data && {
                    data: Cn(t.data, e)
                })
            })
        }), t.user && {
            user: Cn(t.user, e)
        }), t.contexts && {
            contexts: Cn(t.contexts, e)
        }), t.extra && {
            extra: Cn(t.extra, e)
        });
        return t.contexts && t.contexts.trace && (n.contexts.trace = t.contexts.trace), n
    }, kr.prototype._applyClientOptions = function(t) {
        var e = this.getOptions(),
            n = e.environment,
            r = e.release,
            i = e.dist,
            o = e.maxValueLength,
            o = void 0 === o ? 250 : o;
        "environment" in t || (t.environment = "environment" in e ? n : "production"), void 0 === t.release && void 0 !== r && (t.release = r), void 0 === t.dist && void 0 !== i && (t.dist = i), t.message && (t.message = rn(t.message, o));
        i = t.exception && t.exception.values && t.exception.values[0];
        i && i.value && (i.value = rn(i.value, o));
        t = t.request;
        t && t.url && (t.url = rn(t.url, o))
    }, kr.prototype._applyIntegrationsMetadata = function(t) {
        var e = Object.keys(this._integrations);
        0 < e.length && (t.sdk = t.sdk || {}, t.sdk.integrations = Sr(t.sdk.integrations || [], e))
    }, kr.prototype._sendEvent = function(t) {
        this._getBackend().sendEvent(t)
    }, kr.prototype._captureEvent = function(t, e, n) {
        return this._processEvent(t, e, n).then(function(t) {
            return t.event_id
        }, function(t) {
            gn.error(t)
        })
    }, kr.prototype._processEvent = function(t, e, n) {
        var r = this,
            i = this.getOptions(),
            o = i.beforeSend,
            i = i.sampleRate;
        if (!this._isEnabled()) return Jn.reject(new Je("SDK not enabled, will not capture event."));
        var a = "transaction" === t.type;
        return !a && "number" == typeof i && Math.random() > i ? Jn.reject(new Je("Discarding event because it's not included in the random sample (sampling rate = " + i + ")")) : this._prepareEvent(t, n, e).then(function(t) {
            if (null === t) throw new Je("An event processor returned null, will not send event.");
            if (e && e.data && !0 === e.data.__sentry__ || a || !o) return t;
            t = o(t, e);
            return r._ensureBeforeSendRv(t)
        }).then(function(t) {
            if (null === t) throw new Je("`beforeSend` returned `null`, will not send event.");
            var e = n && n.getSession && n.getSession();
            return !a && e && r._updateSessionFromEvent(e, t), r._sendEvent(t), t
        }).then(null, function(t) {
            if (t instanceof Je) throw t;
            throw r.captureException(t, {
                data: {
                    __sentry__: !0
                },
                originalException: t
            }), new Je("Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: " + t)
        })
    }, kr.prototype._process = function(t) {
        var e = this;
        this._processing += 1, t.then(function(t) {
            return --e._processing, t
        }, function(t) {
            return --e._processing, t
        })
    }, kr.prototype._ensureBeforeSendRv = function(t) {
        var e = "`beforeSend` method has to return `null` or a valid event.";
        if (qe(t)) return t.then(function(t) {
            if (!Ne(t) && null !== t) throw new Je(e);
            return t
        }, function(t) {
            throw new Je("beforeSend rejected with " + t)
        });
        if (!Ne(t) && null !== t) throw new Je(e);
        return t
    }, S = kr;

    function kr(t, e) {
        this._integrations = {}, this._processing = 0, this._backend = new t(e), (this._options = e).dsn && (this._dsn = new Qe(e.dsn))
    }
    var Tr = (Or.prototype.sendEvent = function(t) {
        return Jn.resolve({
            reason: "NoopTransport: Event has been skipped because no Dsn is configured.",
            status: _e.Skipped
        })
    }, Or.prototype.close = function(t) {
        return Jn.resolve(!0)
    }, Or);

    function Or() {}
    Ir.prototype.eventFromException = function(t, e) {
        throw new Je("Backend has to implement `eventFromException` method")
    }, Ir.prototype.eventFromMessage = function(t, e, n) {
        throw new Je("Backend has to implement `eventFromMessage` method")
    }, Ir.prototype.sendEvent = function(t) {
        this._transport.sendEvent(t).then(null, function(t) {
            gn.error("Error while sending event: " + t)
        })
    }, Ir.prototype.sendSession = function(t) {
        this._transport.sendSession ? this._transport.sendSession(t).then(null, function(t) {
            gn.error("Error while sending session: " + t)
        }) : gn.warn("Dropping session because custom transport doesn't implement sendSession")
    }, Ir.prototype.getTransport = function() {
        return this._transport
    }, Ir.prototype._setupTransport = function() {
        return new Tr
    }, n = Ir;

    function Ir(t) {
        this._options = t, this._options.dsn || gn.warn("No DSN provided, backend will not do anything."), this._transport = this._setupTransport()
    }

    function Cr(t) {
        if (t.metadata && t.metadata.sdk) {
            t = t.metadata.sdk;
            return {
                name: t.name,
                version: t.version
            }
        }
    }

    function jr(t, e) {
        var n = Cr(e),
            r = JSON.stringify(br(br({
                sent_at: (new Date).toISOString()
            }, n && {
                sdk: n
            }), e.forceEnvelope() && {
                dsn: e.getDsn().toString()
            })),
            n = "aggregates" in t ? "sessions" : "session";
        return {
            body: r + "\n" + JSON.stringify({
                type: n
            }) + "\n" + JSON.stringify(t),
            type: n,
            url: e.getEnvelopeEndpointWithUrlEncodedAuth()
        }
    }

    function Rr(t, e) {
        var n = Cr(e),
            r = t.type || "event",
            i = "transaction" === r || e.forceEnvelope(),
            o = t.debug_meta || {},
            a = o.transactionSampling,
            s = function(t, e) {
                var n = {};
                for (i in t) Object.prototype.hasOwnProperty.call(t, i) && e.indexOf(i) < 0 && (n[i] = t[i]);
                if (null != t && "function" == typeof Object.getOwnPropertySymbols)
                    for (var r = 0, i = Object.getOwnPropertySymbols(t); r < i.length; r++) e.indexOf(i[r]) < 0 && Object.prototype.propertyIsEnumerable.call(t, i[r]) && (n[i[r]] = t[i[r]]);
                return n
            }(o, ["transactionSampling"]),
            o = a || {},
            a = o.method,
            o = o.rate;
        0 === Object.keys(s).length ? delete t.debug_meta : t.debug_meta = s;
        var c, c = {
            body: JSON.stringify(n ? (c = t, (s = e.metadata.sdk) && (c.sdk = c.sdk || {}, c.sdk.name = c.sdk.name || s.name, c.sdk.version = c.sdk.version || s.version, c.sdk.integrations = Sr(c.sdk.integrations || [], s.integrations || []), c.sdk.packages = Sr(c.sdk.packages || [], s.packages || [])), c) : t),
            type: r,
            url: i ? e.getEnvelopeEndpointWithUrlEncodedAuth() : e.getStoreEndpointWithUrlEncodedAuth()
        };
        return i && (o = JSON.stringify(br(br({
            event_id: t.event_id,
            sent_at: (new Date).toISOString()
        }, n && {
            sdk: n
        }), e.forceEnvelope() && {
            dsn: e.getDsn().toString()
        })) + "\n" + JSON.stringify({
            type: r,
            sample_rates: [{
                id: a,
                rate: o
            }]
        }) + "\n" + c.body, c.body = o), c
    }
    var Ar, Dr = "6.8.0",
        Y = (Nr.prototype.setupOnce = function() {
            Ar = Function.prototype.toString, Function.prototype.toString = function() {
                for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                var n = this.__sentry_original__ || this;
                return Ar.apply(n, t)
            }
        }, Nr.id = "FunctionToString", Nr);

    function Nr() {
        this.name = Nr.id
    }
    var Pr = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/],
        e = (Lr.prototype.setupOnce = function() {
            or(function(t) {
                var e = fr();
                if (!e) return t;
                var n = e.getIntegration(Lr);
                if (n) {
                    e = e.getClient(), e = e ? e.getOptions() : {}, e = "function" == typeof n._mergeOptions ? n._mergeOptions(e) : {};
                    return "function" != typeof n._shouldDropEvent ? t : n._shouldDropEvent(t, e) ? null : t
                }
                return t
            })
        }, Lr.prototype._shouldDropEvent = function(t, e) {
            return this._isSentryError(t, e) ? (gn.warn("Event dropped due to being internal Sentry Error.\nEvent: " + pn(t)), !0) : this._isIgnoredError(t, e) ? (gn.warn("Event dropped due to being matched by `ignoreErrors` option.\nEvent: " + pn(t)), !0) : this._isDeniedUrl(t, e) ? (gn.warn("Event dropped due to being matched by `denyUrls` option.\nEvent: " + pn(t) + ".\nUrl: " + this._getEventFilterUrl(t)), !0) : !this._isAllowedUrl(t, e) && (gn.warn("Event dropped due to not being matched by `allowUrls` option.\nEvent: " + pn(t) + ".\nUrl: " + this._getEventFilterUrl(t)), !0)
        }, Lr.prototype._isSentryError = function(t, e) {
            if (!e.ignoreInternal) return !1;
            try {
                return t && t.exception && t.exception.values && t.exception.values[0] && "SentryError" === t.exception.values[0].type || !1
            } catch (t) {
                return !1
            }
        }, Lr.prototype._isIgnoredError = function(t, n) {
            return !(!n.ignoreErrors || !n.ignoreErrors.length) && this._getPossibleEventMessages(t).some(function(e) {
                return n.ignoreErrors.some(function(t) {
                    return an(e, t)
                })
            })
        }, Lr.prototype._isDeniedUrl = function(t, e) {
            if (!e.denyUrls || !e.denyUrls.length) return !1;
            var n = this._getEventFilterUrl(t);
            return !!n && e.denyUrls.some(function(t) {
                return an(n, t)
            })
        }, Lr.prototype._isAllowedUrl = function(t, e) {
            if (!e.allowUrls || !e.allowUrls.length) return !0;
            var n = this._getEventFilterUrl(t);
            return !n || e.allowUrls.some(function(t) {
                return an(n, t)
            })
        }, Lr.prototype._mergeOptions = function(t) {
            return {
                allowUrls: Sr(this._options.whitelistUrls || [], this._options.allowUrls || [], (t = void 0 === t ? {} : t).whitelistUrls || [], t.allowUrls || []),
                denyUrls: Sr(this._options.blacklistUrls || [], this._options.denyUrls || [], t.blacklistUrls || [], t.denyUrls || []),
                ignoreErrors: Sr(this._options.ignoreErrors || [], t.ignoreErrors || [], Pr),
                ignoreInternal: void 0 === this._options.ignoreInternal || this._options.ignoreInternal
            }
        }, Lr.prototype._getPossibleEventMessages = function(e) {
            if (e.message) return [e.message];
            if (e.exception) try {
                var t = e.exception.values && e.exception.values[0] || {},
                    n = t.type,
                    r = void 0 === n ? "" : n,
                    i = t.value,
                    o = void 0 === i ? "" : i;
                return ["" + o, r + ": " + o]
            } catch (t) {
                return gn.error("Cannot extract message for event " + pn(e)), []
            }
            return []
        }, Lr.prototype._getEventFilterUrl = function(e) {
            try {
                if (e.stacktrace) {
                    var t = e.stacktrace.frames;
                    return t && t[t.length - 1].filename || null
                }
                if (e.exception) {
                    var n = e.exception.values && e.exception.values[0].stacktrace && e.exception.values[0].stacktrace.frames;
                    return n && n[n.length - 1].filename || null
                }
                return null
            } catch (t) {
                return gn.error("Cannot extract url for event " + pn(e)), null
            }
        }, Lr.id = "InboundFilters", Lr);

    function Lr(t) {
        this._options = t = void 0 === t ? {} : t, this.name = Lr.id
    }
    var qr = "?",
        Mr = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
        Fr = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:file|https?|blob|chrome|webpack|resource|moz-extension|capacitor).*?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,
        Ur = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i,
        Hr = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
        Br = /\((\S*)(?::(\d+))(?::(\d+))\)/,
        Wr = /Minified React error #\d+;/i;

    function Yr(t) {
        var e = null,
            n = 0;
        t && ("number" == typeof t.framesToPop ? n = t.framesToPop : Wr.test(t.message) && (n = 1));
        try {
            if (e = function(t) {
                    if (!t || !t.stacktrace) return null;
                    for (var e, n = t.stacktrace, r = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i, i = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\((.*)\))? in (.*):\s*$/i, o = n.split("\n"), a = [], s = 0; s < o.length; s += 2) {
                        var c = null;
                        (e = r.exec(o[s])) ? c = {
                            url: e[2],
                            func: e[3],
                            args: [],
                            line: +e[1],
                            column: null
                        }: (e = i.exec(o[s])) && (c = {
                            url: e[6],
                            func: e[3] || e[4],
                            args: e[5] ? e[5].split(",") : [],
                            line: +e[1],
                            column: +e[2]
                        }), c && (!c.func && c.line && (c.func = qr), a.push(c))
                    }
                    return a.length ? {
                        message: Gr(t),
                        name: t.name,
                        stack: a
                    } : null
                }(t)) return zr(e, n)
        } catch (t) {}
        try {
            if (e = function(t) {
                    if (!t || !t.stack) return null;
                    for (var e, n, r = [], i = t.stack.split("\n"), o = 0; o < i.length; ++o) {
                        if (n = Mr.exec(i[o])) {
                            var a = n[2] && 0 === n[2].indexOf("native");
                            n[2] && 0 === n[2].indexOf("eval") && (e = Br.exec(n[2])) && (n[2] = e[1], n[3] = e[2], n[4] = e[3]);
                            var s = n[2] && 0 === n[2].indexOf("address at ") ? n[2].substr("address at ".length) : n[2],
                                c = n[1] || qr,
                                u = -1 !== c.indexOf("safari-extension"),
                                l = -1 !== c.indexOf("safari-web-extension");
                            (u || l) && (c = -1 !== c.indexOf("@") ? c.split("@")[0] : qr, s = u ? "safari-extension:" + s : "safari-web-extension:" + s), a = {
                                url: s,
                                func: c,
                                args: a ? [n[2]] : [],
                                line: n[3] ? +n[3] : null,
                                column: n[4] ? +n[4] : null
                            }
                        } else if (n = Ur.exec(i[o])) a = {
                            url: n[2],
                            func: n[1] || qr,
                            args: [],
                            line: +n[3],
                            column: n[4] ? +n[4] : null
                        };
                        else {
                            if (!(n = Fr.exec(i[o]))) continue;
                            n[3] && -1 < n[3].indexOf(" > eval") && (e = Hr.exec(n[3])) ? (n[1] = n[1] || "eval", n[3] = e[1], n[4] = e[2], n[5] = "") : 0 !== o || n[5] || void 0 === t.columnNumber || (r[0].column = t.columnNumber + 1), a = {
                                url: n[3],
                                func: n[1] || qr,
                                args: n[2] ? n[2].split(",") : [],
                                line: n[4] ? +n[4] : null,
                                column: n[5] ? +n[5] : null
                            }
                        }!a.func && a.line && (a.func = qr), r.push(a)
                    }
                    return r.length ? {
                        message: Gr(t),
                        name: t.name,
                        stack: r
                    } : null
                }(t)) return zr(e, n)
        } catch (t) {}
        return {
            message: Gr(t),
            name: t && t.name,
            stack: [],
            failed: !0
        }
    }

    function zr(e, t) {
        try {
            return we(we({}, e), {
                stack: e.stack.slice(t)
            })
        } catch (t) {
            return e
        }
    }

    function Gr(t) {
        t = t && t.message;
        return t ? t.error && "string" == typeof t.error.message ? t.error.message : t : "No error message"
    }
    var Jr = 50;

    function Xr(t) {
        var e = Kr(t.stack),
            t = {
                type: t.name,
                value: t.message
            };
        return e && e.length && (t.stacktrace = {
            frames: e
        }), void 0 === t.type && "" === t.value && (t.value = "Unrecoverable error caught"), t
    }

    function Vr(t, e, n) {
        t = {
            exception: {
                values: [{
                    type: Pe(t) ? t.constructor.name : n ? "UnhandledRejection" : "Error",
                    value: "Non-Error " + (n ? "promise rejection" : "exception") + " captured with keys: " + function(t, e) {
                        void 0 === e && (e = 40);
                        var n = Object.keys(kn(t));
                        if (n.sort(), !n.length) return "[object has no keys]";
                        if (n[0].length >= e) return rn(n[0], e);
                        for (var r = n.length; 0 < r; r--) {
                            var i = n.slice(0, r).join(", ");
                            if (!(i.length > e)) return r === n.length ? i : rn(i, e)
                        }
                        return ""
                    }(t)
                }]
            },
            extra: {
                __serialized__: function t(e, n, r) {
                    void 0 === r && (r = 102400);
                    var i = Cn(e, n = void 0 === n ? 3 : n);
                    return Tn(i) > r ? t(e, n - 1, r) : i
                }(t)
            }
        };
        return e && (e = Kr(Yr(e).stack), t.stacktrace = {
            frames: e
        }), t
    }

    function $r(t) {
        return {
            exception: {
                values: [Xr(t)]
            }
        }
    }

    function Kr(t) {
        if (!t || !t.length) return [];
        var e = t,
            n = e[0].func || "",
            t = e[e.length - 1].func || "";
        return -1 === n.indexOf("captureMessage") && -1 === n.indexOf("captureException") || (e = e.slice(1)), (e = -1 !== t.indexOf("sentryWrapped") ? e.slice(0, -1) : e).slice(0, Jr).map(function(t) {
            return {
                colno: null === t.column ? void 0 : t.column,
                filename: t.url || e[0].url,
                function: t.func || "?",
                in_app: !0,
                lineno: null === t.line ? void 0 : t.line
            }
        }).reverse()
    }

    function Qr(t, e, n) {
        if (void 0 === n && (n = {}), je(t) && t.error) return r = $r(Yr(t = t.error));
        if (Re(t) || (o = t, "[object DOMException]" === Object.prototype.toString.call(o))) {
            var r, i = t,
                o = i.name || (Re(i) ? "DOMError" : "DOMException"),
                o = i.message ? o + ": " + i.message : o;
            return fn(r = Zr(o, e, n), o), "code" in i && (r.tags = we(we({}, r.tags), {
                "DOMException.code": "" + i.code
            })), r
        }
        return Ce(t) ? r = $r(Yr(t)) : (Ne(t) || Pe(t) ? hn(r = Vr(t, e, n.rejection), {
            synthetic: !0
        }) : (fn(r = Zr(t, e, n), "" + t, void 0), hn(r, {
            synthetic: !0
        })), r)
    }

    function Zr(t, e, n) {
        t = {
            message: t
        };
        return (n = void 0 === n ? {} : n).attachStacktrace && e && (e = Kr(Yr(e).stack), t.stacktrace = {
            frames: e
        }), t
    }
    var ti = {
            event: "error",
            transaction: "transaction",
            session: "session",
            attachment: "attachment"
        },
        qt = (ei.prototype.sendEvent = function(t) {
            throw new Je("Transport Class has to implement `sendEvent` method")
        }, ei.prototype.close = function(t) {
            return this._buffer.drain(t)
        }, ei.prototype._handleResponse = function(t) {
            var e = t.requestType,
                n = t.response,
                r = t.headers,
                i = t.resolve,
                o = t.reject,
                t = _e.fromHttpCode(n.status);
            this._handleRateLimit(r) && gn.warn("Too many " + e + " requests, backing off until: " + this._disabledUntil(e)), t !== _e.Success ? o(n) : i({
                status: t
            })
        }, ei.prototype._disabledUntil = function(t) {
            return this._rateLimits[ti[t]] || this._rateLimits.all
        }, ei.prototype._isRateLimited = function(t) {
            return this._disabledUntil(t) > new Date(Date.now())
        }, ei.prototype._handleRateLimit = function(t) {
            var e, n, r, i, o = Date.now(),
                a = t["x-sentry-rate-limits"],
                t = t["retry-after"];
            if (a) {
                try {
                    for (var s = Ee(a.trim().split(",")), c = s.next(); !c.done; c = s.next()) {
                        var u = c.value.split(":", 2),
                            l = parseInt(u[0], 10),
                            p = 1e3 * (isNaN(l) ? 60 : l);
                        try {
                            for (var d = (r = void 0, Ee(u[1].split(";"))), f = d.next(); !f.done; f = d.next()) {
                                var h = f.value;
                                this._rateLimits[h || "all"] = new Date(o + p)
                            }
                        } catch (t) {
                            r = {
                                error: t
                            }
                        } finally {
                            try {
                                f && !f.done && (i = d.return) && i.call(d)
                            } finally {
                                if (r) throw r.error
                            }
                        }
                    }
                } catch (t) {
                    e = {
                        error: t
                    }
                } finally {
                    try {
                        c && !c.done && (n = s.return) && n.call(s)
                    } finally {
                        if (e) throw e.error
                    }
                }
                return !0
            }
            return !!t && (this._rateLimits.all = new Date(o + function(t, e) {
                if (!e) return 6e4;
                var n = parseInt("" + e, 10);
                return isNaN(n) ? (e = Date.parse("" + e), isNaN(e) ? 6e4 : e - t) : 1e3 * n
            }(o, t)), !0)
        }, ei);

    function ei(t) {
        this.options = t, this._buffer = new Vn(30), this._rateLimits = {}, this._api = new gr(t.dsn, t._metadata, t.tunnel), this.url = this._api.getStoreEndpointWithUrlEncodedAuth()
    }
    var ni, ri = (me(ii, ni = qt), ii.prototype.sendEvent = function(t) {
        return this._sendRequest(Rr(t, this._api), t)
    }, ii.prototype.sendSession = function(t) {
        return this._sendRequest(jr(t, this._api), t)
    }, ii.prototype._sendRequest = function(i, t) {
        var o = this;
        if (this._isRateLimited(i.type)) return Promise.reject({
            event: t,
            type: i.type,
            reason: "Transport for " + i.type + " requests locked till " + this._disabledUntil(i.type) + " due to too many requests.",
            status: 429
        });
        var e = {
            body: i.body,
            method: "POST",
            referrerPolicy: function() {
                if (Rn()) try {
                    return new Request("_", {
                        referrerPolicy: "origin"
                    }), 1
                } catch (t) {
                    return
                }
            }() ? "origin" : ""
        };
        return void 0 !== this.options.fetchParameters && Object.assign(e, this.options.fetchParameters), void 0 !== this.options.headers && (e.headers = this.options.headers), this._buffer.add(function() {
            return new Jn(function(n, r) {
                o._fetch(i.url, e).then(function(t) {
                    var e = {
                        "x-sentry-rate-limits": t.headers.get("X-Sentry-Rate-Limits"),
                        "retry-after": t.headers.get("Retry-After")
                    };
                    o._handleResponse({
                        requestType: i.type,
                        response: t,
                        headers: e,
                        resolve: n,
                        reject: r
                    })
                }).catch(r)
            })
        })
    }, ii);

    function ii(t, e) {
        void 0 === e && (e = function() {
            var t, e = cn();
            if (An(e.fetch)) return e.fetch.bind(e);
            var n = e.document,
                r = e.fetch;
            if ("function" == typeof(null === n || void 0 === n ? void 0 : n.createElement)) try {
                var i = n.createElement("iframe");
                i.hidden = !0, n.head.appendChild(i), null !== (t = i.contentWindow) && void 0 !== t && t.fetch && (r = i.contentWindow.fetch), n.head.removeChild(i)
            } catch (t) {
                gn.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", t)
            }
            return r.bind(e)
        }());
        t = ni.call(this, t) || this;
        return t._fetch = e, t
    }
    var oi, ai = (me(si, oi = qt), si.prototype.sendEvent = function(t) {
        return this._sendRequest(Rr(t, this._api), t)
    }, si.prototype.sendSession = function(t) {
        return this._sendRequest(jr(t, this._api), t)
    }, si.prototype._sendRequest = function(i, t) {
        var o = this;
        return this._isRateLimited(i.type) ? Promise.reject({
            event: t,
            type: i.type,
            reason: "Transport for " + i.type + " requests locked till " + this._disabledUntil(i.type) + " due to too many requests.",
            status: 429
        }) : this._buffer.add(function() {
            return new Jn(function(e, n) {
                var t, r = new XMLHttpRequest;
                for (t in r.onreadystatechange = function() {
                        var t;
                        4 === r.readyState && (t = {
                            "x-sentry-rate-limits": r.getResponseHeader("X-Sentry-Rate-Limits"),
                            "retry-after": r.getResponseHeader("Retry-After")
                        }, o._handleResponse({
                            requestType: i.type,
                            response: r,
                            headers: t,
                            resolve: e,
                            reject: n
                        }))
                    }, r.open("POST", i.url), o.options.headers) o.options.headers.hasOwnProperty(t) && r.setRequestHeader(t, o.options.headers[t]);
                r.send(i.body)
            })
        })
    }, si);

    function si() {
        return null !== oi && oi.apply(this, arguments) || this
    }
    var ci, ui = (me(li, ci = n), li.prototype.eventFromException = function(t, e) {
        return n = this._options, hn(n = Qr(t, (e = e) && e.syntheticException || void 0, {
            attachStacktrace: n.attachStacktrace
        }), {
            handled: !0,
            type: "generic"
        }), n.level = ye.Error, e && e.event_id && (n.event_id = e.event_id), Jn.resolve(n);
        var n
    }, li.prototype.eventFromMessage = function(t, e, n) {
        return void 0 === e && (e = ye.Info), r = this._options, n = n, void 0 === (e = e) && (e = ye.Info), (r = Zr(t, n && n.syntheticException || void 0, {
            attachStacktrace: r.attachStacktrace
        })).level = e, n && n.event_id && (r.event_id = n.event_id), Jn.resolve(r);
        var r
    }, li.prototype._setupTransport = function() {
        if (!this._options.dsn) return ci.prototype._setupTransport.call(this);
        var t = we(we({}, this._options.transportOptions), {
            dsn: this._options.dsn,
            tunnel: this._options.tunnel,
            _metadata: this._options._metadata
        });
        return new(this._options.transport || (Rn() ? ri : ai))(t)
    }, li);

    function li() {
        return null !== ci && ci.apply(this, arguments) || this
    }
    var pi = 0;

    function di(e, r, i) {
        if (void 0 === r && (r = {}), "function" != typeof e) return e;
        try {
            if (e.__sentry__) return e;
            if (e.__sentry_wrapped__) return e.__sentry_wrapped__
        } catch (t) {
            return e
        }

        function t() {
            var n = Array.prototype.slice.call(arguments);
            try {
                i && "function" == typeof i && i.apply(this, arguments);
                var t = n.map(function(t) {
                    return di(t, r)
                });
                return e.handleEvent ? e.handleEvent.apply(this, t) : e.apply(this, t)
            } catch (e) {
                throw pi += 1, setTimeout(function() {
                    --pi
                }), t = function(t) {
                    t.addEventProcessor(function(t) {
                            t = we({}, t);
                            return r.mechanism && (fn(t, void 0, void 0), hn(t, r.mechanism)), t.extra = we(we({}, t.extra), {
                                arguments: n
                            }), t
                        }),
                        function(t, e) {
                            var n;
                            try {
                                throw new Error("Sentry syntheticException")
                            } catch (t) {
                                n = t
                            }
                            yr("captureException", t, {
                                captureContext: e,
                                originalException: t,
                                syntheticException: n
                            })
                        }(e)
                }, yr("withScope", t), e
            }
        }
        try {
            for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n])
        } catch (t) {}
        e.prototype = e.prototype || {}, t.prototype = e.prototype, Object.defineProperty(e, "__sentry_wrapped__", {
            enumerable: !1,
            value: t
        }), Object.defineProperties(t, {
            __sentry__: {
                enumerable: !1,
                value: !0
            },
            __sentry_original__: {
                enumerable: !1,
                value: e
            }
        });
        try {
            Object.getOwnPropertyDescriptor(t, "name").configurable && Object.defineProperty(t, "name", {
                get: function() {
                    return e.name
                }
            })
        } catch (t) {}
        return t
    }
    fi.prototype.setupOnce = function() {
        Error.stackTraceLimit = 50, this._options.onerror && (gn.log("Global Handler attached: onerror"), this._installGlobalOnErrorHandler()), this._options.onunhandledrejection && (gn.log("Global Handler attached: onunhandledrejection"), this._installGlobalOnUnhandledRejectionHandler())
    }, fi.prototype._installGlobalOnErrorHandler = function() {
        var o = this;
        this._onErrorHandlerInstalled || (Mn({
            callback: function(t) {
                var e = t.error,
                    n = fr(),
                    r = n.getIntegration(fi),
                    i = e && !0 === e.__sentry_own_request__;
                !r || 0 < pi || i || (i = n.getClient(), hn(t = void 0 === e && Ae(t.msg) ? o._eventFromIncompleteOnError(t.msg, t.url, t.line, t.column) : o._enhanceEventWithInitialFrame(Qr(e || t.msg, void 0, {
                    attachStacktrace: i && i.getOptions().attachStacktrace,
                    rejection: !1
                }), t.url, t.line, t.column), {
                    handled: !1,
                    type: "onerror"
                }), n.captureEvent(t, {
                    originalException: e
                }))
            },
            type: "error"
        }), this._onErrorHandlerInstalled = !0)
    }, fi.prototype._installGlobalOnUnhandledRejectionHandler = function() {
        var i = this;
        this._onUnhandledRejectionHandlerInstalled || (Mn({
            callback: function(t) {
                var e = t;
                try {
                    "reason" in t ? e = t.reason : "detail" in t && "reason" in t.detail && (e = t.detail.reason)
                } catch (t) {}
                var n = fr(),
                    r = n.getIntegration(fi),
                    t = e && !0 === e.__sentry_own_request__;
                if (!r || 0 < pi || t) return !0;
                t = n.getClient(), t = De(e) ? i._eventFromRejectionWithPrimitive(e) : Qr(e, void 0, {
                    attachStacktrace: t && t.getOptions().attachStacktrace,
                    rejection: !0
                });
                t.level = ye.Error, hn(t, {
                    handled: !1,
                    type: "onunhandledrejection"
                }), n.captureEvent(t, {
                    originalException: e
                })
            },
            type: "unhandledrejection"
        }), this._onUnhandledRejectionHandlerInstalled = !0)
    }, fi.prototype._eventFromIncompleteOnError = function(t, e, n, r) {
        var i, o = je(t) ? t.message : t,
            t = o.match(/^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i);
        return t && (i = t[1], o = t[2]), this._enhanceEventWithInitialFrame({
            exception: {
                values: [{
                    type: i || "Error",
                    value: o
                }]
            }
        }, e, n, r)
    }, fi.prototype._eventFromRejectionWithPrimitive = function(t) {
        return {
            exception: {
                values: [{
                    type: "UnhandledRejection",
                    value: "Non-Error promise rejection captured with value: " + String(t)
                }]
            }
        }
    }, fi.prototype._enhanceEventWithInitialFrame = function(t, e, n, r) {
        t.exception = t.exception || {}, t.exception.values = t.exception.values || [], t.exception.values[0] = t.exception.values[0] || {}, t.exception.values[0].stacktrace = t.exception.values[0].stacktrace || {}, t.exception.values[0].stacktrace.frames = t.exception.values[0].stacktrace.frames || [];
        r = isNaN(parseInt(r, 10)) ? void 0 : r, n = isNaN(parseInt(n, 10)) ? void 0 : n, e = Ae(e) && 0 < e.length ? e : function() {
            try {
                return document.location.href
            } catch (t) {
                return ""
            }
        }();
        return 0 === t.exception.values[0].stacktrace.frames.length && t.exception.values[0].stacktrace.frames.push({
            colno: r,
            filename: e,
            function: "?",
            in_app: !0,
            lineno: n
        }), t
    }, fi.id = "GlobalHandlers", I = fi;

    function fi(t) {
        this.name = fi.id, this._onErrorHandlerInstalled = !1, this._onUnhandledRejectionHandlerInstalled = !1, this._options = we({
            onerror: !0,
            onunhandledrejection: !0
        }, t)
    }
    var hi = ["EventTarget", "Window", "Node", "ApplicationCache", "AudioTrackList", "ChannelMergerNode", "CryptoOperation", "EventSource", "FileReader", "HTMLUnknownElement", "IDBDatabase", "IDBRequest", "IDBTransaction", "KeyOperation", "MediaController", "MessagePort", "ModalWindow", "Notification", "SVGElementInstance", "Screen", "TextTrack", "TextTrackCue", "TextTrackList", "WebSocket", "WebSocketWorker", "Worker", "XMLHttpRequest", "XMLHttpRequestEventTarget", "XMLHttpRequestUpload"],
        Ht = (mi.prototype.setupOnce = function() {
            var t = cn();
            this._options.setTimeout && xn(t, "setTimeout", this._wrapTimeFunction.bind(this)), this._options.setInterval && xn(t, "setInterval", this._wrapTimeFunction.bind(this)), this._options.requestAnimationFrame && xn(t, "requestAnimationFrame", this._wrapRAF.bind(this)), this._options.XMLHttpRequest && "XMLHttpRequest" in t && xn(XMLHttpRequest.prototype, "send", this._wrapXHR.bind(this)), this._options.eventTarget && (Array.isArray(this._options.eventTarget) ? this._options.eventTarget : hi).forEach(this._wrapEventTarget.bind(this))
        }, mi.prototype._wrapTimeFunction = function(r) {
            return function() {
                for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                var n = t[0];
                return t[0] = di(n, {
                    mechanism: {
                        data: {
                            function: wn(r)
                        },
                        handled: !0,
                        type: "instrument"
                    }
                }), r.apply(this, t)
            }
        }, mi.prototype._wrapRAF = function(e) {
            return function(t) {
                return e.call(this, di(t, {
                    mechanism: {
                        data: {
                            function: "requestAnimationFrame",
                            handler: wn(e)
                        },
                        handled: !0,
                        type: "instrument"
                    }
                }))
            }
        }, mi.prototype._wrapEventTarget = function(i) {
            var t = cn(),
                t = t[i] && t[i].prototype;
            t && t.hasOwnProperty && t.hasOwnProperty("addEventListener") && (xn(t, "addEventListener", function(r) {
                return function(t, e, n) {
                    try {
                        "function" == typeof e.handleEvent && (e.handleEvent = di(e.handleEvent.bind(e), {
                            mechanism: {
                                data: {
                                    function: "handleEvent",
                                    handler: wn(e),
                                    target: i
                                },
                                handled: !0,
                                type: "instrument"
                            }
                        }))
                    } catch (t) {}
                    return r.call(this, t, di(e, {
                        mechanism: {
                            data: {
                                function: "addEventListener",
                                handler: wn(e),
                                target: i
                            },
                            handled: !0,
                            type: "instrument"
                        }
                    }), n)
                }
            }), xn(t, "removeEventListener", function(i) {
                return function(t, e, n) {
                    try {
                        var r = null === e || void 0 === e ? void 0 : e.__sentry_wrapped__;
                        r && i.call(this, t, r, n)
                    } catch (t) {}
                    return i.call(this, t, e, n)
                }
            }))
        }, mi.prototype._wrapXHR = function(n) {
            return function() {
                for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                var r = this;
                return ["onload", "onerror", "onprogress", "onreadystatechange"].forEach(function(n) {
                    n in r && "function" == typeof r[n] && xn(r, n, function(t) {
                        var e = {
                            mechanism: {
                                data: {
                                    function: n,
                                    handler: wn(t)
                                },
                                handled: !0,
                                type: "instrument"
                            }
                        };
                        return t.__sentry_original__ && (e.mechanism.data.handler = wn(t.__sentry_original__)), di(t, e)
                    })
                }), n.apply(this, t)
            }
        }, mi.id = "TryCatch", mi);

    function mi(t) {
        this.name = mi.id, this._options = we({
            XMLHttpRequest: !0,
            eventTarget: !0,
            requestAnimationFrame: !0,
            setInterval: !0,
            setTimeout: !0
        }, t)
    }

    function vi(t) {
        return (vi = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
        } : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        })(t)
    }
    var yi = (gi.prototype.addSentryBreadcrumb = function(t) {
        this._options.sentry && fr().addBreadcrumb({
            category: "sentry." + ("transaction" === t.type ? "transaction" : "event"),
            event_id: t.event_id,
            level: t.level,
            message: pn(t)
        }, {
            event: t
        })
    }, gi.prototype.setupOnce = function() {
        var n = this;
        this._options.console && Mn({
            callback: function() {
                for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                n._consoleBreadcrumb.apply(n, xe(t))
            },
            type: "console"
        }), this._options.dom && Mn({
            callback: function() {
                for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                n._domBreadcrumb.apply(n, xe(t))
            },
            type: "dom"
        }), this._options.xhr && Mn({
            callback: function() {
                for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                n._xhrBreadcrumb.apply(n, xe(t))
            },
            type: "xhr"
        }), this._options.fetch && Mn({
            callback: function() {
                for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                n._fetchBreadcrumb.apply(n, xe(t))
            },
            type: "fetch"
        }), this._options.history && Mn({
            callback: function() {
                for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                n._historyBreadcrumb.apply(n, xe(t))
            },
            type: "history"
        })
    }, gi.prototype._consoleBreadcrumb = function(t) {
        var e = {
            category: "console",
            data: {
                arguments: t.args,
                logger: "console"
            },
            level: ye.fromString(t.level),
            message: on(t.args, " ")
        };
        if ("assert" === t.level) {
            if (!1 !== t.args[0]) return;
            e.message = "Assertion failed: " + (on(t.args.slice(1), " ") || "console.assert"), e.data.arguments = t.args.slice(1)
        }
        fr().addBreadcrumb(e, {
            input: t.args,
            level: t.level
        })
    }, gi.prototype._domBreadcrumb = function(t) {
        var e, n = "object" === vi(this._options.dom) ? this._options.dom.serializeAttribute : void 0;
        "string" == typeof n && (n = [n]);
        try {
            e = t.event.target ? Fe(t.event.target, n) : Fe(t.event, n)
        } catch (t) {
            e = "<unknown>"
        }
        0 !== e.length && fr().addBreadcrumb({
            category: "ui." + t.name,
            message: e
        }, {
            event: t.event,
            name: t.name,
            global: t.global
        })
    }, gi.prototype._xhrBreadcrumb = function(t) {
        var e, n, r, i;
        t.endTimestamp && (t.xhr.__sentry_own_request__ || (e = (i = t.xhr.__sentry_xhr__ || {}).method, n = i.url, r = i.status_code, i = i.body, fr().addBreadcrumb({
            category: "xhr",
            data: {
                method: e,
                url: n,
                status_code: r
            },
            type: "http"
        }, {
            xhr: t.xhr,
            input: i
        })))
    }, gi.prototype._fetchBreadcrumb = function(t) {
        t.endTimestamp && (t.fetchData.url.match(/sentry_key/) && "POST" === t.fetchData.method || (t.error ? fr().addBreadcrumb({
            category: "fetch",
            data: t.fetchData,
            level: ye.Error,
            type: "http"
        }, {
            data: t.error,
            input: t.args
        }) : fr().addBreadcrumb({
            category: "fetch",
            data: we(we({}, t.fetchData), {
                status_code: t.response.status
            }),
            type: "http"
        }, {
            input: t.args,
            response: t.response
        })))
    }, gi.prototype._historyBreadcrumb = function(t) {
        var e = cn(),
            n = t.from,
            r = t.to,
            i = ln(e.location.href),
            t = ln(n),
            e = ln(r);
        t.path || (t = i), i.protocol === e.protocol && i.host === e.host && (r = e.relative), i.protocol === t.protocol && i.host === t.host && (n = t.relative), fr().addBreadcrumb({
            category: "navigation",
            data: {
                from: n,
                to: r
            }
        })
    }, gi.id = "Breadcrumbs", gi);

    function gi(t) {
        this.name = gi.id, this._options = we({
            console: !0,
            dom: !0,
            fetch: !0,
            history: !0,
            sentry: !0,
            xhr: !0
        }, t)
    }
    var _i = "cause",
        bi = 5,
        w = (Si.prototype.setupOnce = function() {
            or(function(t, e) {
                var n = fr().getIntegration(Si);
                return n ? n._handler(t, e) : t
            })
        }, Si.prototype._handler = function(t, e) {
            if (!(t.exception && t.exception.values && e && Me(e.originalException, Error))) return t;
            e = this._walkErrorTree(e.originalException, this._key);
            return t.exception.values = xe(e, t.exception.values), t
        }, Si.prototype._walkErrorTree = function(t, e, n) {
            if (void 0 === n && (n = []), !Me(t[e], Error) || n.length + 1 >= this._limit) return n;
            var r = Xr(Yr(t[e]));
            return this._walkErrorTree(t[e], e, xe([r], n))
        }, Si.id = "LinkedErrors", Si);

    function Si(t) {
        void 0 === t && (t = {}), this.name = Si.id, this._key = t.key || _i, this._limit = t.limit || bi
    }
    var wi = cn(),
        qt = (Ei.prototype.setupOnce = function() {
            or(function(t) {
                var e;
                if (fr().getIntegration(Ei)) {
                    if (!wi.navigator && !wi.location && !wi.document) return t;
                    var n = (null === (i = t.request) || void 0 === i ? void 0 : i.url) || (null === (e = wi.location) || void 0 === e ? void 0 : e.href),
                        r = (wi.document || {}).referrer,
                        i = (wi.navigator || {}).userAgent,
                        i = we(we(we({}, null === (e = t.request) || void 0 === e ? void 0 : e.headers), r && {
                            Referer: r
                        }), i && {
                            "User-Agent": i
                        }),
                        i = we(we({}, n && {
                            url: n
                        }), {
                            headers: i
                        });
                    return we(we({}, t), {
                        request: i
                    })
                }
                return t
            })
        }, Ei.id = "UserAgent", Ei);

    function Ei() {
        this.name = Ei.id
    }
    xi.prototype.setupOnce = function(t, r) {
        t(function(e) {
            var n = r().getIntegration(xi);
            if (n) {
                try {
                    if (n._shouldDropEvent(e, n._previousEvent)) return null
                } catch (t) {
                    return n._previousEvent = e
                }
                return n._previousEvent = e
            }
            return e
        })
    }, xi.prototype._shouldDropEvent = function(t, e) {
        return !!e && (!!this._isSameMessageEvent(t, e) || !!this._isSameExceptionEvent(t, e))
    }, xi.prototype._isSameMessageEvent = function(t, e) {
        var n = t.message,
            r = e.message;
        return !(!n && !r) && (!(n && !r || !n && r) && (n === r && (!!this._isSameFingerprint(t, e) && !!this._isSameStacktrace(t, e))))
    }, xi.prototype._getFramesFromEvent = function(t) {
        var e = t.exception;
        if (e) try {
            return e.values[0].stacktrace.frames
        } catch (t) {
            return
        } else if (t.stacktrace) return t.stacktrace.frames
    }, xi.prototype._isSameStacktrace = function(t, e) {
        var n = this._getFramesFromEvent(t),
            r = this._getFramesFromEvent(e);
        if (!n && !r) return !0;
        if (n && !r || !n && r) return !1;
        if (r.length !== n.length) return !1;
        for (var i = 0; i < r.length; i++) {
            var o = r[i],
                a = n[i];
            if (o.filename !== a.filename || o.lineno !== a.lineno || o.colno !== a.colno || o.function !== a.function) return !1
        }
        return !0
    }, xi.prototype._getExceptionFromEvent = function(t) {
        return t.exception && t.exception.values && t.exception.values[0]
    }, xi.prototype._isSameExceptionEvent = function(t, e) {
        var n = this._getExceptionFromEvent(e),
            r = this._getExceptionFromEvent(t);
        return !(!n || !r) && (n.type === r.type && n.value === r.value && (!!this._isSameFingerprint(t, e) && !!this._isSameStacktrace(t, e)))
    }, xi.prototype._isSameFingerprint = function(t, e) {
        t = t.fingerprint, e = e.fingerprint;
        if (!t && !e) return !0;
        if (t && !e || !t && e) return !1;
        try {
            return !(t.join("") !== e.join(""))
        } catch (t) {
            return !1
        }
    }, xi.id = "Dedupe", n = xi;

    function xi() {
        this.name = xi.id
    }
    var ki, Ti = (me(Oi, ki = S), Oi.prototype.showReportDialog = function(t) {
        var e;
        void 0 === t && (t = {}), cn().document && (this._isEnabled() ? (e = void 0 === (e = we(we({}, t), {
            dsn: t.dsn || this.getDsn()
        })) ? {} : e).eventId ? e.dsn ? ((t = document.createElement("script")).async = !0, t.src = new gr(e.dsn).getReportDialogEndpoint(e), e.onLoad && (t.onload = e.onLoad), (document.head || document.body).appendChild(t)) : gn.error("Missing dsn option in showReportDialog call") : gn.error("Missing eventId option in showReportDialog call") : gn.error("Trying to call showReportDialog with Sentry Client disabled"))
    }, Oi.prototype._prepareEvent = function(t, e, n) {
        return t.platform = t.platform || "javascript", ki.prototype._prepareEvent.call(this, t, e, n)
    }, Oi.prototype._sendEvent = function(t) {
        var e = this.getIntegration(yi);
        e && e.addSentryBreadcrumb(t), ki.prototype._sendEvent.call(this, t)
    }, Oi);

    function Oi(t) {
        return (t = void 0 === t ? {} : t)._metadata = t._metadata || {}, t._metadata.sdk = t._metadata.sdk || {
            name: "sentry.javascript.browser",
            packages: [{
                name: "npm:@sentry/browser",
                version: Dr
            }],
            version: Dr
        }, ki.call(this, ui, t) || this
    }
    var Ii = [new e, new Y, new Ht, new yi, new I, new w, new n, new qt];

    function Ci(t) {
        var e, n;
        void 0 === (t = void 0 === t ? {} : t).defaultIntegrations && (t.defaultIntegrations = Ii), void 0 !== t.release || (e = cn()).SENTRY_RELEASE && e.SENTRY_RELEASE.id && (t.release = e.SENTRY_RELEASE.id), void 0 === t.autoSessionTracking && (t.autoSessionTracking = !0),
            function(t, e) {
                var n;
                !0 === e.debug && gn.enable();
                var r = fr();
                null !== (n = r.getScope()) && void 0 !== n && n.update(e.initialScope), e = new t(e), r.bindClient(e)
            }(Ti, t), t.autoSessionTracking && (void 0 !== cn().document ? "function" == typeof(n = fr()).startSession && "function" == typeof n.captureSession && (n.startSession({
                ignoreDuration: !0
            }), n.captureSession(), Mn({
                callback: function(t) {
                    var e = t.from,
                        t = t.to;
                    void 0 !== e && e !== t && (n.startSession({
                        ignoreDuration: !0
                    }), n.captureSession())
                },
                type: "history"
            })) : gn.warn("Session tracking in non-browser environment with @sentry/browser is not supported."))
    }
    var ji = function(t, e) {
        return (ji = Object.setPrototypeOf || {
                __proto__: []
            }
            instanceof Array && function(t, e) {
                t.__proto__ = e
            } || function(t, e) {
                for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n])
            })(t, e)
    };

    function Ri(t, e) {
        function n() {
            this.constructor = t
        }
        ji(t, e), t.prototype = null === e ? Object.create(e) : (n.prototype = e.prototype, new n)
    }
    var Ai, Di, Ni = function() {
        return (Ni = Object.assign || function(t) {
            for (var e, n = 1, r = arguments.length; n < r; n++)
                for (var i in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t
        }).apply(this, arguments)
    };

    function Pi(t, e) {
        var n = "function" == typeof Symbol && t[Symbol.iterator];
        if (!n) return t;
        var r, i, o = n.call(t),
            a = [];
        try {
            for (;
                (void 0 === e || 0 < e--) && !(r = o.next()).done;) a.push(r.value)
        } catch (t) {
            i = {
                error: t
            }
        } finally {
            try {
                r && !r.done && (n = o.return) && n.call(o)
            } finally {
                if (i) throw i.error
            }
        }
        return a
    }

    function Li() {
        for (var t = [], e = 0; e < arguments.length; e++) t = t.concat(Pi(arguments[e]));
        return t
    }(Ht = Ai = Ai || {}).Ok = "ok", Ht.DeadlineExceeded = "deadline_exceeded", Ht.Unauthenticated = "unauthenticated", Ht.PermissionDenied = "permission_denied", Ht.NotFound = "not_found", Ht.ResourceExhausted = "resource_exhausted", Ht.InvalidArgument = "invalid_argument", Ht.Unimplemented = "unimplemented", Ht.Unavailable = "unavailable", Ht.InternalError = "internal_error", Ht.UnknownError = "unknown_error", Ht.Cancelled = "cancelled", Ht.AlreadyExists = "already_exists", Ht.FailedPrecondition = "failed_precondition", Ht.Aborted = "aborted", Ht.OutOfRange = "out_of_range", Ht.DataLoss = "data_loss", (Di = Ai = Ai || {}).fromHttpCode = function(t) {
        if (t < 400) return Di.Ok;
        if (400 <= t && t < 500) switch (t) {
            case 401:
                return Di.Unauthenticated;
            case 403:
                return Di.PermissionDenied;
            case 404:
                return Di.NotFound;
            case 409:
                return Di.AlreadyExists;
            case 413:
                return Di.FailedPrecondition;
            case 429:
                return Di.ResourceExhausted;
            default:
                return Di.InvalidArgument
        }
        if (500 <= t && t < 600) switch (t) {
            case 501:
                return Di.Unimplemented;
            case 503:
                return Di.Unavailable;
            case 504:
                return Di.DeadlineExceeded;
            default:
                return Di.InternalError
        }
        return Di.UnknownError
    };
    var qi = new RegExp("^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$");

    function Mi(t) {
        var e;
        return (t = void 0 === t ? null === (e = fr().getClient()) || void 0 === e ? void 0 : e.getOptions() : t) && ("tracesSampleRate" in t || "tracesSampler" in t)
    }

    function Fi(t) {
        return null === (t = null === (t = void 0 === t ? fr() : t) || void 0 === t ? void 0 : t.getScope()) || void 0 === t ? void 0 : t.getTransaction()
    }

    function Ui() {
        var t = Fi();
        t && (gn.log("[Tracing] Transaction: " + Ai.InternalError + " -> Global error occured"), t.setStatus(Ai.InternalError))
    }
    var Hi = (Bi.prototype.add = function(t) {
        this.spans.length > this._maxlen ? t.spanRecorder = void 0 : this.spans.push(t)
    }, Bi);

    function Bi(t) {
        void 0 === t && (t = 1e3), this.spans = [], this._maxlen = t
    }
    Wi.prototype.child = function(t) {
        return this.startChild(t)
    }, Wi.prototype.startChild = function(t) {
        t = new Wi(Ni(Ni({}, t), {
            parentSpanId: this.spanId,
            sampled: this.sampled,
            traceId: this.traceId
        }));
        return t.spanRecorder = this.spanRecorder, t.spanRecorder && t.spanRecorder.add(t), t.transaction = this.transaction, t
    }, Wi.prototype.setTag = function(t, e) {
        var n;
        return this.tags = Ni(Ni({}, this.tags), ((n = {})[t] = e, n)), this
    }, Wi.prototype.setData = function(t, e) {
        var n;
        return this.data = Ni(Ni({}, this.data), ((n = {})[t] = e, n)), this
    }, Wi.prototype.setStatus = function(t) {
        return this.status = t, this
    }, Wi.prototype.setHttpStatus = function(t) {
        this.setTag("http.status_code", String(t));
        t = Ai.fromHttpCode(t);
        return t !== Ai.UnknownError && this.setStatus(t), this
    }, Wi.prototype.isSuccess = function() {
        return this.status === Ai.Ok
    }, Wi.prototype.finish = function(t) {
        this.endTimestamp = "number" == typeof t ? t : tr()
    }, Wi.prototype.toTraceparent = function() {
        var t = "";
        return void 0 !== this.sampled && (t = this.sampled ? "-1" : "-0"), this.traceId + "-" + this.spanId + t
    }, Wi.prototype.toContext = function() {
        return jn({
            data: this.data,
            description: this.description,
            endTimestamp: this.endTimestamp,
            op: this.op,
            parentSpanId: this.parentSpanId,
            sampled: this.sampled,
            spanId: this.spanId,
            startTimestamp: this.startTimestamp,
            status: this.status,
            tags: this.tags,
            traceId: this.traceId
        })
    }, Wi.prototype.updateWithContext = function(t) {
        var e;
        return this.data = null != (e = t.data) ? e : {}, this.description = t.description, this.endTimestamp = t.endTimestamp, this.op = t.op, this.parentSpanId = t.parentSpanId, this.sampled = t.sampled, this.spanId = null != (e = t.spanId) ? e : this.spanId, this.startTimestamp = null != (e = t.startTimestamp) ? e : this.startTimestamp, this.status = t.status, this.tags = null != (e = t.tags) ? e : {}, this.traceId = null != (t = t.traceId) ? t : this.traceId, this
    }, Wi.prototype.getTraceContext = function() {
        return jn({
            data: 0 < Object.keys(this.data).length ? this.data : void 0,
            description: this.description,
            op: this.op,
            parent_span_id: this.parentSpanId,
            span_id: this.spanId,
            status: this.status,
            tags: 0 < Object.keys(this.tags).length ? this.tags : void 0,
            trace_id: this.traceId
        })
    }, Wi.prototype.toJSON = function() {
        return jn({
            data: 0 < Object.keys(this.data).length ? this.data : void 0,
            description: this.description,
            op: this.op,
            parent_span_id: this.parentSpanId,
            span_id: this.spanId,
            start_timestamp: this.startTimestamp,
            status: this.status,
            tags: 0 < Object.keys(this.tags).length ? this.tags : void 0,
            timestamp: this.endTimestamp,
            trace_id: this.traceId
        })
    }, I = Wi;

    function Wi(t) {
        if (this.traceId = un(), this.spanId = un().substring(16), this.startTimestamp = tr(), this.tags = {}, this.data = {}, !t) return this;
        t.traceId && (this.traceId = t.traceId), t.spanId && (this.spanId = t.spanId), t.parentSpanId && (this.parentSpanId = t.parentSpanId), "sampled" in t && (this.sampled = t.sampled), t.op && (this.op = t.op), t.description && (this.description = t.description), t.data && (this.data = t.data), t.tags && (this.tags = t.tags), t.status && (this.status = t.status), t.startTimestamp && (this.startTimestamp = t.startTimestamp), t.endTimestamp && (this.endTimestamp = t.endTimestamp)
    }
    var Yi, zi = (Ri(Gi, Yi = I), Gi.prototype.setName = function(t) {
        this.name = t
    }, Gi.prototype.initSpanRecorder = function(t) {
        void 0 === t && (t = 1e3), this.spanRecorder || (this.spanRecorder = new Hi(t)), this.spanRecorder.add(this)
    }, Gi.prototype.setMeasurements = function(t) {
        this._measurements = Ni({}, t)
    }, Gi.prototype.setMetadata = function(t) {
        this.metadata = Ni(Ni({}, this.metadata), t)
    }, Gi.prototype.finish = function(t) {
        var e = this;
        if (void 0 === this.endTimestamp) {
            if (this.name || (gn.warn("Transaction has no name, falling back to `<unlabeled transaction>`."), this.name = "<unlabeled transaction>"), Yi.prototype.finish.call(this, t), !0 === this.sampled) {
                t = this.spanRecorder ? this.spanRecorder.spans.filter(function(t) {
                    return t !== e && t.endTimestamp
                }) : [];
                this._trimEnd && 0 < t.length && (this.endTimestamp = t.reduce(function(t, e) {
                    return !t.endTimestamp || !e.endTimestamp || t.endTimestamp > e.endTimestamp ? t : e
                }).endTimestamp);
                t = {
                    contexts: {
                        trace: this.getTraceContext()
                    },
                    spans: t,
                    start_timestamp: this.startTimestamp,
                    tags: this.tags,
                    timestamp: this.endTimestamp,
                    transaction: this.name,
                    type: "transaction",
                    debug_meta: this.metadata
                };
                return 0 < Object.keys(this._measurements).length && (gn.log("[Measurements] Adding measurements to transaction", JSON.stringify(this._measurements, void 0, 2)), t.measurements = this._measurements), gn.log("[Tracing] Finishing " + this.op + " transaction: " + this.name + "."), this._hub.captureEvent(t)
            }
            gn.log("[Tracing] Discarding transaction because its trace was not chosen to be sampled.")
        }
    }, Gi.prototype.toContext = function() {
        var t = Yi.prototype.toContext.call(this);
        return jn(Ni(Ni({}, t), {
            name: this.name,
            trimEnd: this._trimEnd
        }))
    }, Gi.prototype.updateWithContext = function(t) {
        var e;
        return Yi.prototype.updateWithContext.call(this, t), this.name = null != (e = t.name) ? e : "", this._trimEnd = t.trimEnd, this
    }, Gi);

    function Gi(t, e) {
        var n = Yi.call(this, t) || this;
        return n._measurements = {}, n._hub = fr(), Me(e, ur) && (n._hub = e), n.name = t.name || "", n.metadata = t.metadata || {}, n._trimEnd = t.trimEnd, n.transaction = n
    }
    var Ji, Xi = (Ri(Vi, Ji = Hi), Vi.prototype.add = function(e) {
        var n = this;
        e.spanId !== this.transactionSpanId && (e.finish = function(t) {
            e.endTimestamp = "number" == typeof t ? t : tr(), n._popActivity(e.spanId)
        }, void 0 === e.endTimestamp && this._pushActivity(e.spanId)), Ji.prototype.add.call(this, e)
    }, Vi);

    function Vi(t, e, n, r) {
        void 0 === n && (n = "");
        r = Ji.call(this, r) || this;
        return r._pushActivity = t, r._popActivity = e, r.transactionSpanId = n, r
    }
    var $i, Ki = (Ri(Qi, $i = zi), Qi.prototype.finish = function(n) {
        var e, t, r = this;
        if (void 0 === n && (n = tr()), this._finished = !0, this.activities = {}, this.spanRecorder) {
            gn.log("[Tracing] finishing IdleTransaction", new Date(1e3 * n).toISOString(), this.op);
            try {
                for (var i = function(t) {
                        var e = "function" == typeof Symbol && Symbol.iterator,
                            n = e && t[e],
                            r = 0;
                        if (n) return n.call(t);
                        if (t && "number" == typeof t.length) return {
                            next: function() {
                                return {
                                    value: (t = t && r >= t.length ? void 0 : t) && t[r++],
                                    done: !t
                                }
                            }
                        };
                        throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.")
                    }(this._beforeFinishCallbacks), o = i.next(); !o.done; o = i.next())(0, o.value)(this, n)
            } catch (t) {
                e = {
                    error: t
                }
            } finally {
                try {
                    o && !o.done && (t = i.return) && t.call(i)
                } finally {
                    if (e) throw e.error
                }
            }
            this.spanRecorder.spans = this.spanRecorder.spans.filter(function(t) {
                if (t.spanId === r.spanId) return !0;
                t.endTimestamp || (t.endTimestamp = n, t.setStatus(Ai.Cancelled), gn.log("[Tracing] cancelling span since transaction ended early", JSON.stringify(t, void 0, 2)));
                var e = t.startTimestamp < n;
                return e || gn.log("[Tracing] discarding Span since it happened after Transaction was finished", JSON.stringify(t, void 0, 2)), e
            }), gn.log("[Tracing] flushing IdleTransaction")
        } else gn.log("[Tracing] No active IdleTransaction");
        return this._onScope && Zi(this._idleHub), $i.prototype.finish.call(this, n)
    }, Qi.prototype.registerBeforeFinishCallback = function(t) {
        this._beforeFinishCallbacks.push(t)
    }, Qi.prototype.initSpanRecorder = function(t) {
        var e = this;
        this.spanRecorder || (this.spanRecorder = new Xi(function(t) {
            e._finished || e._pushActivity(t)
        }, function(t) {
            e._finished || e._popActivity(t)
        }, this.spanId, t), gn.log("Starting heartbeat"), this._pingHeartbeat()), this.spanRecorder.add(this)
    }, Qi.prototype._pushActivity = function(t) {
        this._initTimeout && (clearTimeout(this._initTimeout), this._initTimeout = void 0), gn.log("[Tracing] pushActivity: " + t), this.activities[t] = !0, gn.log("[Tracing] new activities count", Object.keys(this.activities).length)
    }, Qi.prototype._popActivity = function(t) {
        var e, n = this;
        this.activities[t] && (gn.log("[Tracing] popActivity " + t), delete this.activities[t], gn.log("[Tracing] new activities count", Object.keys(this.activities).length)), 0 === Object.keys(this.activities).length && (t = this._idleTimeout, e = tr() + t / 1e3, setTimeout(function() {
            n._finished || n.finish(e)
        }, t))
    }, Qi.prototype._beat = function() {
        var t;
        clearTimeout(this._heartbeatTimer), this._finished || ((t = (t = Object.keys(this.activities)).length ? t.reduce(function(t, e) {
            return t + e
        }) : "") === this._prevHeartbeatString ? this._heartbeatCounter += 1 : this._heartbeatCounter = 1, this._prevHeartbeatString = t, 3 <= this._heartbeatCounter ? (gn.log("[Tracing] Transaction finished because of no change for 3 heart beats"), this.setStatus(Ai.DeadlineExceeded), this.setTag("heartbeat", "failed"), this.finish()) : this._pingHeartbeat())
    }, Qi.prototype._pingHeartbeat = function() {
        var t = this;
        gn.log("pinging Heartbeat -> current counter: " + this._heartbeatCounter), this._heartbeatTimer = setTimeout(function() {
            t._beat()
        }, 5e3)
    }, Qi);

    function Qi(t, e, n, r) {
        void 0 === n && (n = 1e3), void 0 === r && (r = !1);
        var i = $i.call(this, t, e) || this;
        return i._idleHub = e, i._idleTimeout = n, i._onScope = r, i.activities = {}, i._heartbeatTimer = 0, i._heartbeatCounter = 0, i._finished = !1, i._beforeFinishCallbacks = [], e && r && (Zi(e), gn.log("Setting idle transaction on scope. Span ID: " + i.spanId), e.configureScope(function(t) {
            return t.setSpan(i)
        })), i._initTimeout = setTimeout(function() {
            i._finished || i.finish()
        }, i._idleTimeout), i
    }

    function Zi(t) {
        !t || (t = t.getScope()) && t.getTransaction() && t.setSpan(void 0)
    }

    function to(t) {
        return (to = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
        } : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        })(t)
    }

    function eo() {
        var t = this.getScope();
        if (t) {
            t = t.getSpan();
            if (t) return {
                "sentry-trace": t.toTraceparent()
            }
        }
        return {}
    }

    function no(t, e, n) {
        return Mi() ? void 0 !== t.sampled ? (t.setMetadata({
            transactionSampling: {
                method: Se.Explicit
            }
        }), t) : ("function" == typeof e.tracesSampler ? (r = e.tracesSampler(n), t.setMetadata({
            transactionSampling: {
                method: Se.Sampler,
                rate: Number(r)
            }
        })) : void 0 !== n.parentSampled ? (r = n.parentSampled, t.setMetadata({
            transactionSampling: {
                method: Se.Inheritance
            }
        })) : (r = e.tracesSampleRate, t.setMetadata({
            transactionSampling: {
                method: Se.Rate,
                rate: Number(r)
            }
        })), function(t) {
            if (isNaN(t) || "number" != typeof t && "boolean" != typeof t) return gn.warn("[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got " + JSON.stringify(t) + " of type " + JSON.stringify(to(t)) + "."), !1;
            if (t < 0 || 1 < t) return gn.warn("[Tracing] Given sample rate is invalid. Sample rate must be between 0 and 1. Got " + t + "."), !1;
            return !0
        }(r) ? r ? (t.sampled = Math.random() < r, t.sampled ? gn.log("[Tracing] starting " + t.op + " transaction - " + t.name) : gn.log("[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = " + Number(r) + ")"), t) : (gn.log("[Tracing] Discarding transaction because " + ("function" == typeof e.tracesSampler ? "tracesSampler returned 0 or false" : "a negative sampling decision was inherited or tracesSampleRate is set to 0")), t.sampled = !1, t) : (gn.warn("[Tracing] Discarding transaction because of invalid sample rate."), t.sampled = !1, t)) : (t.sampled = !1, t);
        var r
    }

    function ro(t, e) {
        var n = (null === (r = this.getClient()) || void 0 === r ? void 0 : r.getOptions()) || {},
            r = new zi(t, this);
        return (r = no(r, n, Ni({
            parentSampled: t.parentSampled,
            transactionContext: t
        }, e))).sampled && r.initSpanRecorder(null === (n = n._experiments) || void 0 === n ? void 0 : n.maxSpans), r
    }
    var io = cn();

    function oo(t, e, n, r) {
        var i;
        return function() {
            n && e.isFinal && n.disconnect(), 0 <= e.value && (r || e.isFinal || "hidden" === document.visibilityState) && (e.delta = e.value - (i || 0), (e.delta || e.isFinal || void 0 === i) && (t(e), i = e.value))
        }
    }

    function ao(t, e) {
        return {
            name: t,
            value: e = void 0 === e ? -1 : e,
            delta: 0,
            entries: [],
            id: Date.now() + "-" + (Math.floor(Math.random() * (9e12 - 1)) + 1e12),
            isFinal: !1
        }
    }

    function so(t, e) {
        try {
            if (PerformanceObserver.supportedEntryTypes.includes(t)) {
                var n = new PerformanceObserver(function(t) {
                    return t.getEntries().map(e)
                });
                return n.observe({
                    type: t,
                    buffered: !0
                }), n
            }
        } catch (t) {}
    }

    function co(t) {
        yo = !t.persisted
    }

    function uo(e, t) {
        void 0 === t && (t = !1), go || (addEventListener("pagehide", co), addEventListener("beforeunload", function() {}), go = !0), addEventListener("visibilitychange", function(t) {
            t = t.timeStamp;
            "hidden" === document.visibilityState && e({
                timeStamp: t,
                isUnloading: yo
            })
        }, {
            capture: !0,
            once: t
        })
    }

    function lo(t, e) {
        function n(t) {
            t.hadRecentInput || (i.value += t.value, i.entries.push(t), r())
        }
        void 0 === e && (e = !1);
        var r, i = ao("CLS", 0),
            o = so("layout-shift", n);
        o && (r = oo(t, i, o, e), uo(function(t) {
            t = t.isUnloading;
            o.takeRecords().map(n), t && (i.isFinal = !0), r()
        }))
    }

    function po() {
        return void 0 === mo && (mo = "hidden" === document.visibilityState ? 0 : 1 / 0, uo(function(t) {
            t = t.timeStamp;
            return mo = t
        }, !0)), {
            get timeStamp() {
                return mo
            }
        }
    }

    function fo(t) {
        function e(t) {
            t.startTime < r.timeStamp && (n.value = t.processingStart - t.startTime, n.entries.push(t), n.isFinal = !0, o())
        }
        var n = ao("FID"),
            r = po(),
            i = so("first-input", e),
            o = oo(t, n, i);
        i ? uo(function() {
            i.takeRecords().map(e), i.disconnect()
        }, !0) : window.perfMetrics && window.perfMetrics.onFirstInputDelay && window.perfMetrics.onFirstInputDelay(function(t, e) {
            e.timeStamp < r.timeStamp && (n.value = t, n.isFinal = !0, n.entries = [{
                entryType: "first-input",
                name: e.type,
                target: e.target,
                cancelable: e.cancelable,
                startTime: e.timeStamp,
                processingStart: e.timeStamp + t
            }], o())
        })
    }

    function ho(t, e) {
        function n(t) {
            var e = t.startTime;
            e < o.timeStamp ? (i.value = e, i.entries.push(t)) : i.isFinal = !0, r()
        }
        void 0 === e && (e = !1);
        var r, i = ao("LCP"),
            o = po(),
            a = so("largest-contentful-paint", n);
        a && (r = oo(t, i, a, e), e = function() {
            i.isFinal || (a.takeRecords().map(n), i.isFinal = !0, r())
        }, (vo = vo || new Promise(function(e) {
            return ["scroll", "keydown", "pointerdown"].map(function(t) {
                addEventListener(t, e, {
                    once: !0,
                    passive: !0,
                    capture: !0
                })
            })
        })).then(e), uo(e, !0))
    }
    var mo, vo, yo = !1,
        go = !1,
        _o = cn(),
        bo = (So.prototype.addPerformanceEntries = function(c) {
            var u = this;
            if (_o && _o.performance && _o.performance.getEntries && er) {
                gn.log("[Tracing] Adding & adjusting spans using Performance API");
                var l, p, d, f, h, r, m = er / 1e3;
                if (_o.document)
                    for (var t = 0; t < document.scripts.length; t++)
                        if ("true" === document.scripts[t].dataset.entry) {
                            l = document.scripts[t].src;
                            break
                        } _o.performance.getEntries().slice(this._performanceCursor).forEach(function(t) {
                    var e, n, r, i = t.startTime / 1e3,
                        o = t.duration / 1e3;
                    if (!("navigation" === c.op && m + i < c.startTimestamp)) switch (t.entryType) {
                        case "navigation":
                            wo({
                                    transaction: e = c,
                                    entry: n = t,
                                    event: "unloadEvent",
                                    timeOrigin: r = m
                                }), wo({
                                    transaction: e,
                                    entry: n,
                                    event: "redirect",
                                    timeOrigin: r
                                }), wo({
                                    transaction: e,
                                    entry: n,
                                    event: "domContentLoadedEvent",
                                    timeOrigin: r
                                }), wo({
                                    transaction: e,
                                    entry: n,
                                    event: "loadEvent",
                                    timeOrigin: r
                                }), wo({
                                    transaction: e,
                                    entry: n,
                                    event: "connect",
                                    timeOrigin: r
                                }), wo({
                                    transaction: e,
                                    entry: n,
                                    event: "secureConnection",
                                    timeOrigin: r,
                                    eventEnd: "connectEnd",
                                    description: "TLS/SSL"
                                }), wo({
                                    transaction: e,
                                    entry: n,
                                    event: "fetch",
                                    timeOrigin: r,
                                    eventEnd: "domainLookupStart",
                                    description: "cache"
                                }), wo({
                                    transaction: e,
                                    entry: n,
                                    event: "domainLookup",
                                    timeOrigin: r,
                                    description: "DNS"
                                }),
                                function(t, e, n) {
                                    Eo(t, {
                                        op: "browser",
                                        description: "request",
                                        startTimestamp: n + e.requestStart / 1e3,
                                        endTimestamp: n + e.responseEnd / 1e3
                                    }), Eo(t, {
                                        op: "browser",
                                        description: "response",
                                        startTimestamp: n + e.responseStart / 1e3,
                                        endTimestamp: n + e.responseEnd / 1e3
                                    })
                                }(e, n, r), f = m + t.responseStart / 1e3, h = m + t.requestStart / 1e3;
                            break;
                        case "mark":
                        case "paint":
                        case "measure":
                            var a = function(t, e, n, r, i) {
                                n = i + n, r = n + r;
                                return Eo(t, {
                                    description: e.name,
                                    endTimestamp: r,
                                    op: e.entryType,
                                    startTimestamp: n
                                }), n
                            }(c, t, i, o, m);
                            void 0 === d && "sentry-tracing-init" === t.name && (d = a);
                            var s = po(),
                                s = t.startTime < s.timeStamp;
                            "first-paint" === t.name && s && (gn.log("[Measurements] Adding FP"), u._measurements.fp = {
                                value: t.startTime
                            }, u._measurements["mark.fp"] = {
                                value: a
                            }), "first-contentful-paint" === t.name && s && (gn.log("[Measurements] Adding FCP"), u._measurements.fcp = {
                                value: t.startTime
                            }, u._measurements["mark.fcp"] = {
                                value: a
                            });
                            break;
                        case "resource":
                            s = t.name.replace(window.location.origin, ""), a = function(t, e, n, r, i, o) {
                                if ("xmlhttprequest" === e.initiatorType || "fetch" === e.initiatorType) return;
                                var a = {};
                                "transferSize" in e && (a["Transfer Size"] = e.transferSize);
                                "encodedBodySize" in e && (a["Encoded Body Size"] = e.encodedBodySize);
                                "decodedBodySize" in e && (a["Decoded Body Size"] = e.decodedBodySize);
                                r = o + r, i = r + i;
                                return Eo(t, {
                                    description: n,
                                    endTimestamp: i,
                                    op: e.initiatorType ? "resource." + e.initiatorType : "resource",
                                    startTimestamp: r,
                                    data: a
                                }), i
                            }(c, t, s, i, o, m);
                            void 0 === p && -1 < (l || "").indexOf(s) && (p = a)
                    }
                }), void 0 !== p && void 0 !== d && Eo(c, {
                    description: "evaluation",
                    endTimestamp: d,
                    op: "script",
                    startTimestamp: p
                }), this._performanceCursor = Math.max(performance.getEntries().length - 1, 0), this._trackNavigator(c), "pageload" === c.op && (r = er / 1e3, "number" == typeof f && (gn.log("[Measurements] Adding TTFB"), this._measurements.ttfb = {
                    value: 1e3 * (f - c.startTimestamp)
                }, "number" == typeof h && h <= f && (this._measurements["ttfb.requestTime"] = {
                    value: 1e3 * (f - h)
                })), ["fcp", "fp", "lcp"].forEach(function(t) {
                    var e, n;
                    !u._measurements[t] || r >= c.startTimestamp || (e = u._measurements[t].value, n = Math.abs(1e3 * (r + e / 1e3 - c.startTimestamp)), gn.log("[Measurements] Normalized " + t + " from " + e + " to " + n + " (" + (n - e) + ")"), u._measurements[t].value = n)
                }), this._measurements["mark.fid"] && this._measurements.fid && Eo(c, {
                    description: "first input delay",
                    endTimestamp: this._measurements["mark.fid"].value + this._measurements.fid.value / 1e3,
                    op: "web.vitals",
                    startTimestamp: this._measurements["mark.fid"].value
                }), c.setMeasurements(this._measurements), this._tagMetricInfo(c))
            }
        }, So.prototype._tagMetricInfo = function(n) {
            this._lcpEntry && (gn.log("[Measurements] Adding LCP Data"), this._lcpEntry.element && n.setTag("lcp.element", Fe(this._lcpEntry.element)), this._lcpEntry.id && n.setTag("lcp.id", this._lcpEntry.id), this._lcpEntry.url && n.setTag("lcp.url", this._lcpEntry.url.trim().slice(0, 200)), n.setTag("lcp.size", this._lcpEntry.size)), this._clsEntry && (gn.log("[Measurements] Adding CLS Data"), this._clsEntry.sources.map(function(t, e) {
                return n.setTag("cls.source." + (e + 1), Fe(t.node))
            }))
        }, So.prototype._trackCLS = function() {
            var n = this;
            lo(function(t) {
                var e = t.entries.pop();
                e && (gn.log("[Measurements] Adding CLS"), n._measurements.cls = {
                    value: t.value
                }, n._clsEntry = e)
            })
        }, So.prototype._trackNavigator = function(t) {
            var e, n = _o.navigator;
            n && ((e = n.connection) && (e.effectiveType && t.setTag("effectiveConnectionType", e.effectiveType), e.type && t.setTag("connectionType", e.type), xo(e.rtt) && (this._measurements["connection.rtt"] = {
                value: e.rtt
            }), xo(e.downlink) && (this._measurements["connection.downlink"] = {
                value: e.downlink
            })), xo(n.deviceMemory) && t.setTag("deviceMemory", String(n.deviceMemory)), xo(n.hardwareConcurrency) && t.setTag("hardwareConcurrency", String(n.hardwareConcurrency)))
        }, So.prototype._trackLCP = function() {
            var i = this;
            ho(function(t) {
                var e, n, r = t.entries.pop();
                r && (e = er / 1e3, n = r.startTime / 1e3, gn.log("[Measurements] Adding LCP"), i._measurements.lcp = {
                    value: t.value
                }, i._measurements["mark.lcp"] = {
                    value: e + n
                }, i._lcpEntry = r)
            })
        }, So.prototype._trackFID = function() {
            var r = this;
            fo(function(t) {
                var e, n = t.entries.pop();
                n && (e = er / 1e3, n = n.startTime / 1e3, gn.log("[Measurements] Adding FID"), r._measurements.fid = {
                    value: t.value
                }, r._measurements["mark.fid"] = {
                    value: e + n
                })
            })
        }, So);

    function So() {
        this._measurements = {}, this._performanceCursor = 0, !tn() && null !== _o && void 0 !== _o && _o.performance && (_o.performance.mark && _o.performance.mark("sentry-tracing-init"), this._trackCLS(), this._trackLCP(), this._trackFID())
    }

    function wo(t) {
        var e = t.transaction,
            n = t.entry,
            r = t.event,
            i = t.timeOrigin,
            o = t.eventEnd,
            t = t.description,
            o = o ? n[o] : n[r + "End"],
            n = n[r + "Start"];
        n && o && Eo(e, {
            op: "browser",
            description: null != t ? t : r,
            startTimestamp: i + n / 1e3,
            endTimestamp: i + o / 1e3
        })
    }

    function Eo(t, e) {
        var n = e.startTimestamp,
            e = function(t, e) {
                var n = {};
                for (i in t) Object.prototype.hasOwnProperty.call(t, i) && e.indexOf(i) < 0 && (n[i] = t[i]);
                if (null != t && "function" == typeof Object.getOwnPropertySymbols)
                    for (var r = 0, i = Object.getOwnPropertySymbols(t); r < i.length; r++) e.indexOf(i[r]) < 0 && Object.prototype.propertyIsEnumerable.call(t, i[r]) && (n[i[r]] = t[i[r]]);
                return n
            }(e, ["startTimestamp"]);
        return n && t.startTimestamp > n && (t.startTimestamp = n), t.startChild(Ni({
            startTimestamp: n
        }, e))
    }

    function xo(t) {
        return "number" == typeof t && isFinite(t)
    }
    var ko = {
        traceFetch: !0,
        traceXHR: !0,
        tracingOrigins: ["localhost", /^\//]
    };

    function To(t) {
        function e(e) {
            if (a[e]) return a[e];
            var t = i;
            return a[e] = t.some(function(t) {
                return an(e, t)
            }) && !an(e, "sentry_key"), a[e]
        }
        var n = Ni(Ni({}, ko), t),
            r = n.traceFetch,
            t = n.traceXHR,
            i = n.tracingOrigins,
            o = n.shouldCreateSpanForRequest,
            a = {},
            s = e;
        "function" == typeof o && (s = function(t) {
            return e(t) && o(t)
        });
        var c = {};
        r && Mn({
            callback: function(t) {
                var e, n, r;
                e = t, n = s, t = c, Mi() && e.fetchData && n(e.fetchData.url) && (e.endTimestamp && e.fetchData.__span ? (r = t[e.fetchData.__span]) && (e.response ? r.setHttpStatus(e.response.status) : e.error && r.setStatus(Ai.InternalError), r.finish(), delete t[e.fetchData.__span]) : (n = Fi()) && (r = n.startChild({
                    data: Ni(Ni({}, e.fetchData), {
                        type: "fetch"
                    }),
                    description: e.fetchData.method + " " + e.fetchData.url,
                    op: "http"
                }), e.fetchData.__span = r.spanId, t[r.spanId] = r, n = e.args[0] = e.args[0], e = (t = e.args[1] = e.args[1] || {}).headers, (e = Me(n, Request) ? n.headers : e) ? "function" == typeof e.append ? e.append("sentry-trace", r.toTraceparent()) : e = Array.isArray(e) ? Li(e, [
                    ["sentry-trace", r.toTraceparent()]
                ]) : Ni(Ni({}, e), {
                    "sentry-trace": r.toTraceparent()
                }) : e = {
                    "sentry-trace": r.toTraceparent()
                }, t.headers = e))
            },
            type: "fetch"
        }), t && Mn({
            callback: function(t) {
                ! function(t, e, n) {
                    var r;
                    if (Mi() && (null === (r = t.xhr) || void 0 === r || !r.__sentry_own_request__) && null !== (i = t.xhr) && void 0 !== i && i.__sentry_xhr__ && e(t.xhr.__sentry_xhr__.url)) {
                        var i = t.xhr.__sentry_xhr__;
                        if (t.endTimestamp && t.xhr.__sentry_xhr_span_id__)(o = n[t.xhr.__sentry_xhr_span_id__]) && (o.setHttpStatus(i.status_code), o.finish(), delete n[t.xhr.__sentry_xhr_span_id__]);
                        else {
                            e = Fi();
                            if (e) {
                                var o = e.startChild({
                                    data: Ni(Ni({}, i.data), {
                                        type: "xhr",
                                        method: i.method,
                                        url: i.url
                                    }),
                                    description: i.method + " " + i.url,
                                    op: "http"
                                });
                                if (t.xhr.__sentry_xhr_span_id__ = o.spanId, n[t.xhr.__sentry_xhr_span_id__] = o, t.xhr.setRequestHeader) try {
                                    t.xhr.setRequestHeader("sentry-trace", o.toTraceparent())
                                } catch (t) {}
                            }
                        }
                    }
                }(t, s, c)
            },
            type: "xhr"
        })
    }
    var Oo = cn();
    var Io = Ni({
            idleTimeout: 1e3,
            markBackgroundTransactions: !0,
            maxTransactionDuration: 600,
            routingInstrumentation: function(n, t, e) {
                var r, i;
                void 0 === t && (t = !0), void 0 === e && (e = !0), Oo && Oo.location ? (r = Oo.location.href, t && (i = n({
                    name: Oo.location.pathname,
                    op: "pageload"
                })), e && Mn({
                    callback: function(t) {
                        var e = t.to,
                            t = t.from;
                        void 0 === t && r && -1 !== r.indexOf(e) ? r = void 0 : t !== e && (r = void 0, i && (gn.log("[Tracing] Finishing current transaction with op: " + i.op), i.finish()), i = n({
                            name: Oo.location.pathname,
                            op: "navigation"
                        }))
                    },
                    type: "history"
                })) : gn.warn("Could not initialize routing instrumentation due to invalid location")
            },
            startTransactionOnLocationChange: !0,
            startTransactionOnPageLoad: !0
        }, ko),
        w = (Co.prototype.setupOnce = function(t, e) {
            var n = this;
            this._getCurrentHub = e, this._emitOptionsWarning && (gn.warn("[Tracing] You need to define `tracingOrigins` in the options. Set an array of urls or patterns to trace."), gn.warn("[Tracing] We added a reasonable default for you: " + ko.tracingOrigins));
            var r = this.options,
                i = r.routingInstrumentation,
                o = r.startTransactionOnLocationChange,
                a = r.startTransactionOnPageLoad,
                s = r.markBackgroundTransactions,
                c = r.traceFetch,
                u = r.traceXHR,
                e = r.tracingOrigins,
                r = r.shouldCreateSpanForRequest;
            i(function(t) {
                return n._createRouteTransaction(t)
            }, a, o), s && (io && io.document ? io.document.addEventListener("visibilitychange", function() {
                var t = Fi();
                io.document.hidden && t && (gn.log("[Tracing] Transaction: " + Ai.Cancelled + " -> since tab moved to the background, op: " + t.op), t.status || t.setStatus(Ai.Cancelled), t.setTag("visibilitychange", "document.hidden"), t.finish())
            }) : gn.warn("[Tracing] Could not set up background tab detection due to lack of global document")), To({
                traceFetch: c,
                traceXHR: u,
                tracingOrigins: e,
                shouldCreateSpanForRequest: r
            })
        }, Co.prototype._createRouteTransaction = function(t) {
            var i = this;
            if (this._getCurrentHub) {
                var e = this.options,
                    n = e.beforeNavigate,
                    r = e.idleTimeout,
                    o = e.maxTransactionDuration,
                    a = "pageload" === t.op ? function() {
                        var t = function(t) {
                            t = document.querySelector("meta[name=" + t + "]");
                            return t ? t.getAttribute("content") : null
                        }("sentry-trace");
                        if (t) return function(t) {
                            var e = t.match(qi);
                            if (e) {
                                t = void 0;
                                return "1" === e[3] ? t = !0 : "0" === e[3] && (t = !1), {
                                    traceId: e[1],
                                    parentSampled: t,
                                    parentSpanId: e[2]
                                }
                            }
                        }(t);
                        return
                    }() : void 0,
                    s = Ni(Ni(Ni({}, t), a), {
                        trimEnd: !0
                    }),
                    c = "function" == typeof n ? n(s) : s,
                    e = void 0 === c ? Ni(Ni({}, s), {
                        sampled: !1
                    }) : c;
                !1 === e.sampled && gn.log("[Tracing] Will not send " + e.op + " transaction because of beforeNavigate."), gn.log("[Tracing] Starting " + e.op + " transaction on scope");
                var a = this._getCurrentHub(),
                    n = cn().location,
                    e = (s = e, c = r, e = !0, r = {
                        location: n
                    }, a = (null === (a = (n = a).getClient()) || void 0 === a ? void 0 : a.getOptions()) || {}, (e = no(e = new Ki(s, n, c, e), a, Ni({
                        parentSampled: s.parentSampled,
                        transactionContext: s
                    }, r))).sampled && e.initSpanRecorder(null === (a = a._experiments) || void 0 === a ? void 0 : a.maxSpans), e);
                return e.registerBeforeFinishCallback(function(t, e) {
                    var n, r;
                    i._metrics.addPerformanceEntries(t), n = 1e3 * o, t = e - (r = t).startTimestamp, e && (n < t || t < 0) && (r.setStatus(Ai.DeadlineExceeded), r.setTag("maxTransactionDurationExceeded", "true"))
                }), e
            }
            gn.warn("[Tracing] Did not create " + t.op + " transaction because _getCurrentHub is invalid.")
        }, Co.id = "BrowserTracing", Co);

    function Co(t) {
        this.name = Co.id, this._metrics = new bo, this._emitOptionsWarning = !1;
        var e = ko.tracingOrigins;
        t && t.tracingOrigins && Array.isArray(t.tracingOrigins) && 0 !== t.tracingOrigins.length ? e = t.tracingOrigins : this._emitOptionsWarning = !0, this.options = Ni(Ni(Ni({}, Io), t), {
            tracingOrigins: e
        })
    }
    jo.prototype.setupOnce = function() {
        this._router ? function(n, t) {
            void 0 === t && (t = []);
            t.forEach(function(t) {
                return i = (e = n)[r = t], e[r] = function() {
                    for (var e, t = [], n = 0; n < arguments.length; n++) t[n] = arguments[n];
                    return i.call.apply(i, Li([this], (e = r, t.map(function(t) {
                        return "function" == typeof t ? Ro(t, e) : Array.isArray(t) ? t.map(function(t) {
                            return "function" == typeof t ? Ro(t, e) : t
                        }) : t
                    }))))
                }, e;
                var e, r, i
            })
        }(this._router, this._methods) : gn.error("ExpressIntegration is missing an Express instance")
    }, jo.id = "Express", n = jo;

    function jo(t) {
        void 0 === t && (t = {}), this.name = jo.id, this._router = t.router || t.app, this._methods = (Array.isArray(t.methods) ? t.methods : []).concat("use")
    }

    function Ro(a, s) {
        var t = a.length;
        switch (t) {
            case 2:
                return function(t, e) {
                    var n, r = e.__sentry_transaction;
                    return r && (n = r.startChild({
                        description: a.name,
                        op: "middleware." + s
                    }), e.once("finish", function() {
                        n.finish()
                    })), a.call(this, t, e)
                };
            case 3:
                return function(t, e, n) {
                    var r = e.__sentry_transaction,
                        i = null === r || void 0 === r ? void 0 : r.startChild({
                            description: a.name,
                            op: "middleware." + s
                        });
                    a.call(this, t, e, function() {
                        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                        null !== i && void 0 !== i && i.finish(), n.call.apply(n, Li([this], t))
                    })
                };
            case 4:
                return function(t, e, n, r) {
                    var i = n.__sentry_transaction,
                        o = null === i || void 0 === i ? void 0 : i.startChild({
                            description: a.name,
                            op: "middleware." + s
                        });
                    a.call(this, t, e, n, function() {
                        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                        null !== o && void 0 !== o && o.finish(), r.call.apply(r, Li([this], t))
                    })
                };
            default:
                throw new Error("Express middleware takes 2-4 arguments. Got: " + t)
        }
    }
    Ao.prototype.setupOnce = function(t, a) {
        var e = nn("pg");
        e ? xn(e.Client.prototype, "query", function(o) {
            return function(t, n, r) {
                var e = a().getScope(),
                    e = null === e || void 0 === e ? void 0 : e.getSpan(),
                    i = null === e || void 0 === e ? void 0 : e.startChild({
                        description: "string" == typeof t ? t : t.text,
                        op: "db"
                    });
                if ("function" == typeof r) return o.call(this, t, n, function(t, e) {
                    null !== i && void 0 !== i && i.finish(), r(t, e)
                });
                if ("function" == typeof n) return o.call(this, t, function(t, e) {
                    null !== i && void 0 !== i && i.finish(), n(t, e)
                });
                t = void 0 !== n ? o.call(this, t, n) : o.call(this, t);
                return qe(t) ? t.then(function(t) {
                    return null !== i && void 0 !== i && i.finish(), t
                }) : (null !== i && void 0 !== i && i.finish(), t)
            }
        }) : gn.error("Postgres Integration was unable to require `pg` package.")
    }, Ao.id = "Postgres", qt = Ao;

    function Ao() {
        this.name = Ao.id
    }
    Do.prototype.setupOnce = function(t, a) {
        var e = nn("mysql/lib/Connection.js");
        e ? xn(e, "createQuery", function(n) {
            return function(t, r, i) {
                var e = a().getScope(),
                    e = null === e || void 0 === e ? void 0 : e.getSpan(),
                    o = null === e || void 0 === e ? void 0 : e.startChild({
                        description: "string" == typeof t ? t : t.sql,
                        op: "db"
                    });
                return "function" == typeof i ? n.call(this, t, r, function(t, e, n) {
                    null !== o && void 0 !== o && o.finish(), i(t, e, n)
                }) : "function" == typeof r ? n.call(this, t, function(t, e, n) {
                    null !== o && void 0 !== o && o.finish(), r(t, e, n)
                }) : n.call(this, t, r, i)
            }
        }) : gn.error("Mysql Integration was unable to require `mysql` package.")
    }, Do.id = "Mysql", Ht = Do;

    function Do() {
        this.name = Do.id
    }
    var No = ["aggregate", "bulkWrite", "countDocuments", "createIndex", "createIndexes", "deleteMany", "deleteOne", "distinct", "drop", "dropIndex", "dropIndexes", "estimatedDocumentCount", "find", "findOne", "findOneAndDelete", "findOneAndReplace", "findOneAndUpdate", "indexes", "indexExists", "indexInformation", "initializeOrderedBulkOp", "insertMany", "insertOne", "isCapped", "mapReduce", "options", "parallelCollectionScan", "rename", "replaceOne", "stats", "updateMany", "updateOne"],
        Po = {
            bulkWrite: ["operations"],
            countDocuments: ["query"],
            createIndex: ["fieldOrSpec"],
            createIndexes: ["indexSpecs"],
            deleteMany: ["filter"],
            deleteOne: ["filter"],
            distinct: ["key", "query"],
            dropIndex: ["indexName"],
            find: ["query"],
            findOne: ["query"],
            findOneAndDelete: ["filter"],
            findOneAndReplace: ["filter", "replacement"],
            findOneAndUpdate: ["filter", "update"],
            indexExists: ["indexes"],
            insertMany: ["docs"],
            insertOne: ["doc"],
            mapReduce: ["map", "reduce"],
            rename: ["newName"],
            replaceOne: ["filter", "doc"],
            updateMany: ["filter", "update"],
            updateOne: ["filter", "update"]
        },
        I = (Lo.prototype.setupOnce = function(t, e) {
            var n = this._useMongoose ? "mongoose" : "mongodb",
                r = nn(n);
            r ? this._instrumentOperations(r.Collection, this._operations, e) : gn.error("Mongo Integration was unable to require `" + n + "` package.")
        }, Lo.prototype._instrumentOperations = function(e, t, n) {
            var r = this;
            t.forEach(function(t) {
                return r._patchOperation(e, t, n)
            })
        }, Lo.prototype._patchOperation = function(t, c, u) {
            var l;
            c in t.prototype && (l = this._getSpanContextFromOperationArguments.bind(this), xn(t.prototype, c, function(s) {
                return function() {
                    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                    var n = t[t.length - 1],
                        r = u().getScope(),
                        i = null === r || void 0 === r ? void 0 : r.getSpan();
                    if ("function" != typeof n || "mapReduce" === c && 2 === t.length) {
                        var o = null === i || void 0 === i ? void 0 : i.startChild(l(this, c, t)),
                            r = s.call.apply(s, Li([this], t));
                        return qe(r) ? r.then(function(t) {
                            return null !== o && void 0 !== o && o.finish(), t
                        }) : (null !== o && void 0 !== o && o.finish(), r)
                    }
                    var a = null === i || void 0 === i ? void 0 : i.startChild(l(this, c, t.slice(0, -1)));
                    return s.call.apply(s, Li([this], t.slice(0, -1), [function(t, e) {
                        null !== a && void 0 !== a && a.finish(), n(t, e)
                    }]))
                }
            }))
        }, Lo.prototype._getSpanContextFromOperationArguments = function(t, e, n) {
            var r = {
                    collectionName: t.collectionName,
                    dbName: t.dbName,
                    namespace: t.namespace
                },
                i = {
                    op: "db",
                    description: e,
                    data: r
                },
                o = Po[e],
                t = Array.isArray(this._describeOperations) ? this._describeOperations.includes(e) : this._describeOperations;
            if (!o || !t) return i;
            try {
                if ("mapReduce" === e) {
                    var a = Pi(n, 2),
                        s = a[0],
                        c = a[1];
                    r[o[0]] = "string" == typeof s ? s : s.name || "<anonymous>", r[o[1]] = "string" == typeof c ? c : c.name || "<anonymous>"
                } else
                    for (var u = 0; u < o.length; u++) r[o[u]] = JSON.stringify(n[u])
            } catch (t) {}
            return i
        }, Lo.id = "Mongo", Lo);

    function Lo(t) {
        void 0 === t && (t = {}), this.name = Lo.id, this._operations = Array.isArray(t.operations) ? t.operations : No, this._describeOperations = !("describeOperations" in t) || t.describeOperations, this._useMongoose = !!t.useMongoose
    }
    var qo, Mo, Fo, Uo = Ni(Ni({}, Object.freeze({
        __proto__: null,
        Express: n,
        Postgres: qt,
        Mysql: Ht,
        Mongo: I
    })), {
        BrowserTracing: w
    });
    (Mo = pr()).__SENTRY__ && (Mo.__SENTRY__.extensions = Mo.__SENTRY__.extensions || {}, Mo.__SENTRY__.extensions.startTransaction || (Mo.__SENTRY__.extensions.startTransaction = ro), Mo.__SENTRY__.extensions.traceHeaders || (Mo.__SENTRY__.extensions.traceHeaders = eo)), tn() && (Fo = pr()).__SENTRY__ && (qo = {
        mongodb: function() {
            return new(en(module, "./integrations/mongo").Mongo)
        },
        mongoose: function() {
            return new(en(module, "./integrations/mongo").Mongo)({
                mongoose: !0
            })
        },
        mysql: function() {
            return new(en(module, "./integrations/mysql").Mysql)
        },
        pg: function() {
            return new(en(module, "./integrations/postgres").Postgres)
        }
    }, 0 < (Mo = Object.keys(qo).filter(function(t) {
        return !!nn(t)
    }).map(function(t) {
        try {
            return qo[t]()
        } catch (t) {
            return
        }
    }).filter(function(t) {
        return t
    })).length && (Fo.__SENTRY__.integrations = Li(Fo.__SENTRY__.integrations || [], Mo))), Mn({
        callback: Ui,
        type: "error"
    }), Mn({
        callback: Ui,
        type: "unhandledrejection"
    });
    var Ho, Bo, Wo;
    return function() {
            var t, e, n, r = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : window;
            !r.isHybridWebView && "android" !== r.newsreaderAppPlatform || (r.navigator.native = {
                bridgeCommands: {
                    gamesBackToHub: {
                        enabled: !0
                    },
                    gamesCacheRefresh: {
                        enabled: !0
                    },
                    gamesGetUserDetails: {
                        enabled: !0
                    },
                    sendAnalytic: {
                        enabled: !0
                    },
                    gamesInitializeState: {
                        enabled: !0
                    },
                    gamesSendEmail: {
                        enabled: !0
                    },
                    setPullToRefreshEnabled: {
                        enabled: !0
                    }
                }
            }, r.config = {
                OS: "iOS"
            }, r.asset = {
                uri: "fakeAssetUri"
            }, -1 !== ((null === (t = document) || void 0 === t || null === (e = t.location) || void 0 === e ? void 0 : e.search.toLowerCase()) || "").indexOf("hybrid=") && (r.NYTG = r.NYTG || {}, r.NYTG.enqueue = function(t) {
                var t = JSON.parse(t),
                    e = {
                        id: t.id,
                        success: !0,
                        error: {
                            details: ""
                        },
                        values: {
                            type: t.type
                        }
                    };
                console.log("[NativeBridge] Successfully enqueued: ".concat(JSON.stringify(t, null, 2))), requestAnimationFrame(function() {
                    r.NYTG.onCommandResult ? r.NYTG.onCommandResult(e) : console.error("[NativeBridge] NYTG.onCommandResult is undefined")
                })
            }), e = i.initNativeBridge(r, !0), n = e.callNativeBridgeCommand, e.sendAnalytic = function(t, e) {
                return n("sendAnalytic", {
                    eventName: t,
                    options: e || {}
                })
            }, e.setPullToRefreshEnabled = function(t) {
                return n("setPullToRefreshEnabled", {
                    value: t
                })
            }, e.gamesBackToHub = function() {
                return n("gamesBackToHub")
            }, e.gamesCacheRefresh = function() {
                return n("gamesCacheRefresh")
            }, e.gamesGetUserDetails = function() {
                return n("gamesGetUserDetails")
            }, e.gamesInitializeState = function() {
                return n("gamesInitializeState")
            }, e.gamesSendEmail = function(t) {
                var e = t.type,
                    t = t.debugInfo;
                return n("gamesSendEmail", {
                    type: e,
                    debugInfo: t
                })
            }, e.hybridConfig().then(function(t) {
                r.hybridConfig = t
            }), r.NativeBridge = e)
        }(), Lt(), Ho = l.sentryConfig, Bo = Ho.dsn, Ho = Ho.release, Bo && ((Ho = {
            dsn: Bo,
            release: Ho,
            integrations: [new Uo.BrowserTracing],
            tracesSampleRate: .2
        })._metadata = Ho._metadata || {}, Ho._metadata.sdk = Ho._metadata.sdk || {
            name: "sentry.javascript.react",
            packages: [{
                name: "npm:@sentry/react",
                version: Dr
            }],
            version: Dr
        }, Ci(Ho)), "ontouchstart" in l || l.DocumentTouch || h(p.documentElement, "pz-dont-touch"), B.initialize(), Z.initialize(),
        function() {
            var t, n, r, i, o, a;
            Yt(document.querySelectorAll(".js-nav-tracker")).forEach(function(t) {
                var e = t.dataset.trackNav;
                t.addEventListener("click", function() {
                    Bt(e)
                })
            }), (t = g(x("hybrid-back"))) && window.isHybridWebView && window.NativeBridge && y(t, "click", function() {
                window.NativeBridge.gamesBackToHub()
            }), window.isHybridWebView && window.NativeBridge && (n = document.querySelectorAll(".".concat(x("nav-login"))), r = document.querySelectorAll(".".concat(x("nav-logout"))), i = document.querySelectorAll(".".concat(x("nav-subscribe"))), o = document.querySelectorAll(".".concat(x("nav-account-details"))), a = function(t) {
                return t.forEach(function(t) {
                    h(t, "hybrid-hidden")
                })
            }, window.NativeBridge.gamesGetUserDetails().then(function(t) {
                if (!t.success) throw new Error(t.error);
                var e = t.values.gamesGetUserDetails,
                    t = e.isUserLoggedIn,
                    e = e.isSubscribed;
                t ? a(n) : (a(r), a(o)), e && a(i)
            }).catch(function(t) {
                console.error("Getting user details failed", t), a(r), a(o)
            })), setTimeout(function() {
                Yt(document.querySelectorAll(".js-hub-tracker")).forEach(function(t) {
                    var e = t.dataset.trackHub,
                        n = t.dataset.trackHubContext || null;
                    t.addEventListener("click", function() {
                        Wt(e, n)
                    }, !0)
                })
            }, 0);
            var s, c, u = !1,
                l = -1,
                p = g(x("nav-burger")),
                e = g(x("nav-drawer"));

            function d() {
                u = !0, h(e, "open"), h(p, "active"), v(p, "aria-expanded", u), v(e, "aria-hidden", !u)
            }

            function f() {
                u = !1, m(e, "open"), h(e, "closing"), setTimeout(function() {
                    m(e, "closing")
                }, 500), m(p, "active"), v(p, "aria-expanded", u), v(e, "aria-hidden", !u)
            }(p || e) && (s = [].concat(Yt(e.querySelectorAll(".pz-nav-drawer__link")), Yt(e.querySelectorAll(".pz-nav__button"))), c = s.map(function(t) {
                t = t.textContent;
                return t[0] ? t[0].toUpperCase() : ""
            }), y(p, "click", function() {
                (u ? f : d)(), p.blur()
            }), y(p, "keydown", function(t) {
                var e = t.key,
                    n = t.keyCode;
                if ("Escape" !== e && "Esc" !== e) {
                    if ("Enter" !== e && "Space" !== e && 32 !== n) return "ArrowDown" === e ? (t.preventDefault(), d(), void s[l = 0].focus()) : void("ArrowUp" === e && (t.preventDefault(), d(), l = s.length - 1, s[l].focus()));
                    u ? f() : (d(), s[l = 0].focus())
                } else f()
            }), y(e, "keydown", function(t) {
                var e = t.key,
                    n = t.keyCode,
                    r = t.shiftKey;
                return "Escape" === e || "Esc" === e ? (f(), void p.focus()) : "ArrowDown" === e || "ArrowRight" === e || "Tab" === e && !r ? (t.preventDefault(), l === s.length - 1 ? l = 0 : l += 1, void s[l].focus()) : "ArrowUp" === e || "ArrowLeft" === e || "Tab" === e && r ? (t.preventDefault(), 0 === l ? l = s.length - 1 : --l, void s[l].focus()) : void(65 <= n && n <= 90 && (0 <= (t = c.findIndex(function(t, e) {
                    return t === String.fromCharCode(n) && e !== l
                })) && s[l = t].focus()))
            }), g(x("logo-nav")).addEventListener("click", function() {
                var t = {
                    eventData: {
                        pagetype: "game",
                        trigger: "module",
                        type: "click"
                    },
                    module: {
                        name: "click",
                        context: "",
                        element: {
                            name: window.location.href,
                            label: "games-logo"
                        }
                    }
                };
                At("moduleInteraction", t)
            }))
        }(), (Wo = g(x("feedback-link"))) && rt().then(function(t) {
            Wo.setAttribute("href", t)
        }), !K && (/iPad/.test(Q.platform) || "MacIntel" === Q.platform && 1 < Q.maxTouchPoints) && (p.cookie = "inferredIpad=true;domain=nytimes.com;", l.location.reload()), W.isErsatzShortz && j ? l.dataLayer = [] : (J && J.loadScripts && J.loadScripts({
            pageType: "games",
            section: "crosswords"
        }), l.addEventListener("load", function(t) {
            fe(), G(l.adUnitPath || "default"), Dt()
        })), {
            env: f,
            featureFlags: b,
            device: Z,
            user: B,
            userType: W,
            getFeedbackLink: rt,
            mobileNavTools: c,
            track: At,
            trackClick: Nt,
            reportWebVitals: Lt,
            xhr: H,
            abra: _,
            refreshAds: function() {
                J.cmd.push(function() {
                    J.refreshAds()
                })
            },
            getGameData: function() {
                return l.gameData
            }
        }
});
//# sourceMappingURL=foundation.bf8c1d62d9ba40904593ed53e5d97530e987af80.js.map