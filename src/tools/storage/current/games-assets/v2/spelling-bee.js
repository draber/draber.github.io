! function(e, t) {
    "object" == typeof exports && "undefined" != typeof module ? t(require("react"), require("react-dom"), require("react-redux"), require("foundation"), require("redux-thunk"), require("redux"), require("reselect"), require("prop-types"), require("classnames"), require("responsive")) : "function" == typeof define && define.amd ? define(["react", "react-dom", "react-redux", "foundation", "redux-thunk", "redux", "reselect", "prop-types", "classnames", "responsive"], t) : t((e = e || self).React, e.ReactDOM, e.ReactRedux, e.Foundation, e.ReduxThunk, e.Redux, e.Reselect, e.PropTypes, e.classNames, e.Responsive)
}(this, function(f, m, e, y, a, i, t, n, b, g) {
    "use strict";
    var v = "default" in f ? f.default : f;

    function c(e) {
        return function(e) {
            if (Array.isArray(e)) return r(e)
        }(e) || function(e) {
            if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e)
        }(e) || function(e, t) {
            if (e) {
                if ("string" == typeof e) return r(e, t);
                var n = Object.prototype.toString.call(e).slice(8, -1);
                return "Map" === (n = "Object" === n && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? r(e, t) : void 0
            }
        }(e) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function r(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r
    }
    m = m && Object.prototype.hasOwnProperty.call(m, "default") ? m.default : m, a = a && Object.prototype.hasOwnProperty.call(a, "default") ? a.default : a, n = n && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n, b = b && Object.prototype.hasOwnProperty.call(b, "default") ? b.default : b;

    function l(e, t) {
        for (var n = c(e), r = n.length; r;) {
            --r;
            var o = Math.floor(Math.random() * r),
                a = n[r];
            if (n[r] = n[o], n[o] = a, t && (e[r] === n[r] || e[o] === n[o])) return l(e, !0)
        }
        return n
    }

    function h(o, a) {
        var i;
        return function() {
            for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
            var r = this;
            clearTimeout(i), i = setTimeout(function() {
                return o.apply(r, t)
            }, a)
        }
    }

    function d(e) {
        var t;
        return 2 * e < 1 ? (t = 2 * e, .5 * Math.pow(t, 3)) : (t = e - 2, .5 * Math.pow(t, 3) + 2)
    }

    function p() {
        return Date.now()
    }

    function w(e, t, n) {
        e.style[t] = n
    }

    function E(e, t) {
        e.classList.add(t)
    }

    function O(e, t) {
        e.length ? e.forEach(function(e) {
            e.classList.remove(t)
        }) : e.classList.remove(t)
    }

    function o() {
        var r = document.getElementById("pz-loading-bar").children[0];
        return new Promise(function(n) {
            (function e() {
                var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 10;
                r.style.right = "".concat(Math.max(100 - t, 0), "%"), t <= 100 ? k(30 + 150 * Math.random()).then(function() {
                    e(t + 20 * Math.random())
                }) : n()
            })()
        })
    }

    function S(r, o, e) {
        var a = document.getElementById("js-hook-game-wrapper"),
            i = r.offsetHeight,
            c = document.querySelector(".".concat("modal-card")),
            l = document.querySelectorAll(".".concat(z));
        w(a, C, r.style.backgroundColor || "white"), w(a, j, "relative"), w(a, N, T), w(a, _, "".concat(i, "px")), w(o, P, T), w(o, j, A), w(o, "top", 0), E(o, I), w(r, j, A), w(r, "top", 0), E(r, M), e && e();
        var u = o.offsetHeight,
            s = 1400;
        return window.isHybridWebView && w(document.body, C, r.style.backgroundColor || "white"), k(800).then(function() {
            l.length && O(l, z), w(o, P, L), E(o, R);
            var t, n, e = o.querySelector(".".concat(D));
            e && (s += 200 * e.children.length + 600, e = Array.from(e.children).concat(c), t = 200, n = 0, e.forEach(function(e) {
                    e && (n += t, w(e, "transitionDelay", "".concat(n, "ms")), E(e, z))
                })),
                function(a, i, c, l, u) {
                    var s = 5 < arguments.length && void 0 !== arguments[5] ? arguments[5] : d,
                        f = 6 < arguments.length && void 0 !== arguments[6] ? arguments[6] : "px";
                    return new Promise(function(n) {
                        var r = l - c,
                            o = p();
                        (function e() {
                            var t = 1 <= (t = (p() - o) / u) ? 1 : t;
                            a.style[i] = Math.min(c + s(t) * r + f, l), 1 === t ? n() : window.requestAnimationFrame(e)
                        })()
                    })
                }(a, _, i, u, 400).then(function() {
                    O(r, I), O(r, M), O(o, R), w(a, j, x), w(a, N, L), w(a, _, 0), w(r, j, x), w(o, j, x)
                })
        }), new Promise(function(e) {
            return setTimeout(e, s)
        })
    }

    function u(e) {
        var t = e.momentSystem,
            n = e.transitionTo,
            r = void 0 === (r = e.barBgColor) ? "rgba(0, 0, 0, 0.2)" : r,
            e = void 0 === (e = e.barColor) ? "#FFF" : e;
        return v.useEffect(function() {
            k(100).then(o).then(function() {
                t.transition("loading", n)
            })
        }, []), v.createElement("div", {
            className: "pz-loader",
            id: "pz-loading-bar",
            style: {
                background: r
            }
        }, v.createElement("div", {
            className: "pz-loader__fill",
            style: {
                background: e
            }
        }))
    }
    var k = function(t) {
            return new Promise(function(e) {
                setTimeout(e, t)
            })
        },
        j = "position",
        N = "overflow",
        P = "visibility",
        _ = "minHeight",
        C = "backgroundColor",
        T = "hidden",
        x = "static",
        L = "visible",
        A = "absolute",
        I = "on-stage",
        R = "fly-in",
        M = "fly-out",
        z = "slide-up",
        D = "sequence-animation",
        s = {
            $black: "#000",
            $white: "#fff",
            $blue1: "#083aaa",
            $blue2: "#2860d8",
            $blue3: "#4f85e5",
            $blue35: "#5aa0d5",
            $blue4: "#a7d8ff",
            $blue5: "#dcefff",
            $blue7: "#477aaa",
            "$error-red": "#ce2424",
            $gray1: "#333",
            $gray2: "#959595",
            $gray3: "#ccc",
            $gray4: "#dcdcdc",
            $gray5: "#e6e6e6",
            $gray6: "#f4f4f4",
            $gray7: "#fafafa",
            $gray8: "#c4c4c4",
            $gray9: "#c2c2c2",
            $gray10: "#d9d9d9",
            $gray11: "#eee",
            $blueGray1: "#787886",
            $gold1: "#c4a200",
            $gold2: "#e2c32f",
            $yellow1: "#ffda00",
            $green1: "#6dc3a1",
            $statsPink: "#f93aa7",
            $statsYellow: "#ffc600",
            "$spelling-bee-yellow": "#f8cd05",
            "$letter-boxed-pink": "#f8aa9e",
            "$vertex-tan": "#f7f5f6",
            $bannerBlue: "#4d88f9",
            "$daily-crossword-blue": "#6493e6",
            "$mini-crossword-blue": "#95befa",
            "$spelling-bee-gold": "#f7da21",
            "$tiles-green": "#b5e352",
            "$letter-boxed-red": "#e05c56",
            "$vertex-turquoise": "#00a2b3",
            "$sudoku-orange": "#fb9b00"
        };

    function B() {
        return (B = Object.assign || function(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n, r = arguments[t];
                for (n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
            }
            return e
        }).apply(this, arguments)
    }

    function W(e) {
        return v.createElement("button", B({
            type: "button",
            className: "pz-hybrid-back"
        }, e), v.createElement("span", {
            className: "pz-hybrid-back__text"
        }, "Back"))
    }

    function $() {
        return window.isHybridWebView && window.NativeBridge ? v.createElement(W, {
            onClick: window.NativeBridge.gamesBackToHub
        }) : null
    }

    function U(e) {
        return e = e.action, v.createElement("button", {
            type: "button",
            className: "pz-moment__close",
            "aria-label": "Close",
            onClick: e
        }, "×")
    }

    function G(e) {
        var t = e.icon,
            e = e.size;
        return v.createElement("div", {
            className: b("pz-moment__icon", void 0 === e ? "large" : e, t)
        })
    }

    function H(e) {
        var t = e.text,
            e = e.size;
        return v.createElement("h1", {
            className: b("pz-moment__title", void 0 === e ? "large" : e)
        }, t)
    }

    function q(e) {
        var t = e.text,
            e = e.variant;
        return v.createElement("h1", {
            className: b("pz-moment__description", void 0 === e ? "default" : e),
            dangerouslySetInnerHTML: {
                __html: t
            }
        })
    }

    function F(e) {
        return e = e.children, v.createElement("div", {
            className: "pz-moment__body"
        }, e)
    }

    function K(e) {
        var t = e.action,
            n = e.text,
            r = e.color,
            o = e.variant,
            e = e.icon;
        return v.createElement("button", {
            type: "button",
            className: b("pz-moment__button", void 0 === r ? "primary" : r, o),
            onClick: t
        }, n, "locked" === e && v.createElement("div", {
            className: "pz-moment__button--padlock"
        }))
    }

    function Y(e) {
        return e = e.date, v.createElement("span", {
            className: "pz-moment__info-date"
        }, e)
    }

    function V(e) {
        return e = e.editor, v.createElement("span", {
            className: "pz-moment__info-editor"
        }, "Edited by ".concat(e))
    }

    function X(e) {
        var t = e.bgColor,
            e = e.children;
        return v.createElement("div", {
            className: "pz-moment",
            style: {
                backgroundColor: s[void 0 === t ? "$gray3" : t]
            }
        }, e)
    }
    var J = ["icon", "title", "bgColor", "description", "isActive"];

    function Q(e, t) {
        if (null == e) return {};
        var n, r = function(e, t) {
            if (null == e) return {};
            var n, r, o = {},
                a = Object.keys(e);
            for (r = 0; r < a.length; r++) n = a[r], 0 <= t.indexOf(n) || (o[n] = e[n]);
            return o
        }(e, t);
        if (Object.getOwnPropertySymbols)
            for (var o = Object.getOwnPropertySymbols(e), a = 0; a < o.length; a++) n = o[a], 0 <= t.indexOf(n) || Object.prototype.propertyIsEnumerable.call(e, n) && (r[n] = e[n]);
        return r
    }

    function Z(e) {
        var t = e.icon,
            n = e.title,
            r = void 0 === (a = e.bgColor) ? "$gray3" : a,
            o = e.description,
            a = e.isActive,
            e = Q(e, J);
        return v.createElement("section", {
            className: "pz-moment__loading pz-moment__frame",
            id: "js-hook-pz-moment__loading",
            style: {
                backgroundColor: s[r]
            }
        }, v.createElement($, null), v.createElement(G, {
            icon: t,
            size: "large"
        }), v.createElement(H, {
            text: n,
            size: "large"
        }), v.createElement(q, {
            text: o
        }), a && v.createElement(u, e))
    }

    function ee(e) {
        return (ee = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        })(e)
    }

    function te() {
        return (te = Object.assign || function(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n, r = arguments[t];
                for (n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
            }
            return e
        }).apply(this, arguments)
    }

    function ne(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
    }

    function re(e, t) {
        return (re = Object.setPrototypeOf || function(e, t) {
            return e.__proto__ = t, e
        })(e, t)
    }

    function oe(n) {
        var r = function() {
            if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ("function" == typeof Proxy) return !0;
            try {
                return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {})), !0
            } catch (e) {
                return !1
            }
        }();
        return function() {
            var e, t = ie(n);
            return e = r ? (e = ie(this).constructor, Reflect.construct(t, arguments, e)) : t.apply(this, arguments), t = this, !(e = e) || "object" !== ee(e) && "function" != typeof e ? ae(t) : e
        }
    }

    function ae(e) {
        if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return e
    }

    function ie(e) {
        return (ie = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
            return e.__proto__ || Object.getPrototypeOf(e)
        })(e)
    }

    function ce(e) {
        return function(e) {
            if (Array.isArray(e)) return le(e)
        }(e) || function(e) {
            if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e)
        }(e) || function(e, t) {
            if (e) {
                if ("string" == typeof e) return le(e, t);
                var n = Object.prototype.toString.call(e).slice(8, -1);
                return "Map" === (n = "Object" === n && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? le(e, t) : void 0
            }
        }(e) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function le(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r
    }
    var ue, se, fe, me, de = ["modal", "gameplay", "settings", "general"],
        pe = ["tech", "gameplay", "settings"],
        ye = (ue = "SB", se = y.getGameData().today.id, fe = "".concat(ue, "-").concat(se), me = {
            interaction: {
                custom: function(e, t) {
                    var n = e.module,
                        r = n.name,
                        e = n.element,
                        n = e.name,
                        e = e.label;
                    be("moduleInteraction", void 0 === r ? "gameplay" : r, n, void 0 === e ? "" : e, "", t)
                }
            },
            impression: {
                custom: function(e) {
                    var t = e.module,
                        n = t.name,
                        e = t.region,
                        t = t.label;
                    be("impression", void 0 === n ? "gameplay" : n, e, void 0 === t ? "" : t)
                }
            }
        }, de.forEach(function(n) {
            me.interaction[n] = function(e, t) {
                return be("moduleInteraction", n, e, t, 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null)
            }
        }), pe.forEach(function(n) {
            me.impression[n] = function(e, t) {
                return be("impression", n, e, t)
            }
        }), me);

    function be(e, t, n, r, o, a) {
        y.track(e, "moduleInteraction" === e ? {
            module: {
                name: t,
                context: fe,
                label: o,
                element: {
                    name: n || "",
                    label: "string" == typeof r ? r : JSON.stringify(r)
                }
            },
            eventData: {
                pageType: "game",
                type: a ? "ob_click" : "click",
                trigger: "module",
                status: ""
            }
        } : {
            module: {
                name: t,
                context: fe,
                region: n || "",
                label: "string" == typeof r ? r : JSON.stringify(r)
            }
        })
    }

    function ge(e) {
        ye.interaction.modal("spelling-bee", e, 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : null)
    }

    function ve() {
        var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : "";
        return 0 === e.indexOf("nytimes://") || 0 === e.indexOf("nytxwd://")
    }

    function he(e) {
        return e = function(e) {
            var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : window;
            if (!t || !t.navigationLinks || !t.navigationLinks.subscribe) return Ee;
            t = t.navigationLinks.subscribe;
            return e && t[e] ? t[e] : Ee
        }(e), ve(e) ? function() {
            var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : "",
                t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : document;
            if (!e) return;
            t = t.createElement("a");
            t.href = e, t.click()
        }(e) : window.location.href = e, null
    }
    var we = {
            help: "help",
            ranks: "rankings",
            yesterday: "yesterdays-answers"
        },
        Ee = "https://www.nytimes.com/subscription/games";

    function Oe() {
        return (Oe = Object.assign || function(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n, r = arguments[t];
                for (n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
            }
            return e
        }).apply(this, arguments)
    }

    function Se(e) {
        return e = e.game, v.createElement(X, {
            bgColor: e.bgColor
        }, v.createElement("div", {
            className: "pz-moment__container alternate"
        }, v.createElement($, null), v.createElement("div", {
            className: "pz-moment__content sequence-animation"
        }, v.createElement(G, {
            icon: e.icon,
            size: "large"
        }), v.createElement(H, {
            text: e.title,
            size: "large"
        }), v.createElement(q, e.description), v.createElement("div", {
            className: "pz-moment__button-wrapper"
        }, (e.buttons || []).map(function(e, t) {
            return v.createElement(K, Oe({}, e, {
                key: t
            }))
        })), v.createElement("p", {
            className: "pz-moment__info"
        }, v.createElement(Y, {
            date: e.date
        }), v.createElement(V, {
            editor: e.editor
        })))))
    }
    var ke = ["transitionToGame", "handleSubscribe", "trackInteraction", "userType"];

    function je(t, e) {
        var n, r = Object.keys(t);
        return Object.getOwnPropertySymbols && (n = Object.getOwnPropertySymbols(t), e && (n = n.filter(function(e) {
            return Object.getOwnPropertyDescriptor(t, e).enumerable
        })), r.push.apply(r, n)), r
    }

    function Ne(r) {
        for (var e = 1; e < arguments.length; e++) {
            var o = null != arguments[e] ? arguments[e] : {};
            e % 2 ? je(Object(o), !0).forEach(function(e) {
                var t, n;
                t = r, e = o[n = e], n in t ? Object.defineProperty(t, n, {
                    value: e,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : t[n] = e
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(o)) : je(Object(o)).forEach(function(e) {
                Object.defineProperty(r, e, Object.getOwnPropertyDescriptor(o, e))
            })
        }
        return r
    }

    function Pe(e, t) {
        if (null == e) return {};
        var n, r = function(e, t) {
            if (null == e) return {};
            var n, r, o = {},
                a = Object.keys(e);
            for (r = 0; r < a.length; r++) n = a[r], 0 <= t.indexOf(n) || (o[n] = e[n]);
            return o
        }(e, t);
        if (Object.getOwnPropertySymbols)
            for (var o = Object.getOwnPropertySymbols(e), a = 0; a < o.length; a++) n = o[a], 0 <= t.indexOf(n) || Object.prototype.propertyIsEnumerable.call(e, n) && (r[n] = e[n]);
        return r
    }

    function _e(e) {
        var t = e.transitionToGame,
            n = e.handleSubscribe,
            r = e.trackInteraction,
            o = e.userType,
            e = Ne(Ne({}, Pe(e, ke)), {}, {
                buttons: [{
                    text: "Play",
                    action: function() {
                        t(), r("start-game")
                    }
                }],
                description: {
                    text: "How many words can you make with&nbsp;7&nbsp;letters?"
                }
            });
        return o.hasXwd || e.buttons.push({
            text: "Subscribe",
            color: "secondary",
            action: function() {
                n("spellingBeeCutoffStart"), r("subscribe-welcome")
            }
        }), v.createElement(Se, {
            game: e
        })
    }

    function Ce() {
        return (Ce = Object.assign || function(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n, r = arguments[t];
                for (n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
            }
            return e
        }).apply(this, arguments)
    }

    function Te(e) {
        return e = e.game, v.createElement(X, {
            bgColor: e.bgColor
        }, v.createElement("div", {
            className: "pz-moment__container alternate"
        }, v.createElement($, null), v.createElement("div", {
            className: "pz-moment__content sequence-animation"
        }, v.createElement(G, {
            icon: e.icon,
            size: "small"
        }), v.createElement(H, {
            text: e.title,
            size: "small"
        }), v.createElement(H, {
            text: "Welcome Back",
            size: "large"
        }), v.createElement(q, e.description), v.createElement("div", {
            className: "pz-moment__button-wrapper"
        }, (e.buttons || []).map(function(e, t) {
            return v.createElement(K, Ce({}, e, {
                key: t
            }))
        })), v.createElement("p", {
            className: "pz-moment__info"
        }, v.createElement(Y, {
            date: e.date
        }), v.createElement(V, {
            editor: e.editor
        })))))
    }
    var xe = ["wordCount", "transitionToGame", "handleSubscribe", "trackInteraction", "userType"];

    function Le(t, e) {
        var n, r = Object.keys(t);
        return Object.getOwnPropertySymbols && (n = Object.getOwnPropertySymbols(t), e && (n = n.filter(function(e) {
            return Object.getOwnPropertyDescriptor(t, e).enumerable
        })), r.push.apply(r, n)), r
    }

    function Ae(r) {
        for (var e = 1; e < arguments.length; e++) {
            var o = null != arguments[e] ? arguments[e] : {};
            e % 2 ? Le(Object(o), !0).forEach(function(e) {
                var t, n;
                t = r, e = o[n = e], n in t ? Object.defineProperty(t, n, {
                    value: e,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : t[n] = e
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(o)) : Le(Object(o)).forEach(function(e) {
                Object.defineProperty(r, e, Object.getOwnPropertyDescriptor(o, e))
            })
        }
        return r
    }

    function Ie(e, t) {
        if (null == e) return {};
        var n, r = function(e, t) {
            if (null == e) return {};
            var n, r, o = {},
                a = Object.keys(e);
            for (r = 0; r < a.length; r++) n = a[r], 0 <= t.indexOf(n) || (o[n] = e[n]);
            return o
        }(e, t);
        if (Object.getOwnPropertySymbols)
            for (var o = Object.getOwnPropertySymbols(e), a = 0; a < o.length; a++) n = o[a], 0 <= t.indexOf(n) || Object.prototype.propertyIsEnumerable.call(e, n) && (r[n] = e[n]);
        return r
    }

    function Re(e) {
        var t = e.wordCount,
            n = e.transitionToGame,
            r = e.handleSubscribe,
            o = e.trackInteraction,
            a = e.userType,
            t = Ae(Ae({}, Ie(e, xe)), {}, {
                buttons: [{
                    text: "Continue",
                    action: function() {
                        n(), o("continue")
                    }
                }],
                description: {
                    text: "You’ve found ".concat(t, "&nbsp;word").concat(1 < t ? "s" : "", ".")
                }
            });
        return a.hasXwd || t.buttons.push({
            text: "Subscribe",
            color: "secondary",
            action: function() {
                r("spellingBeeCutoffWelcomeBack"), o("subscribe-welcome-back")
            }
        }), v.createElement(Te, {
            game: t
        })
    }

    function Me(e) {
        y.track("impression", {
            module: {
                name: e,
                region: 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "",
                label: 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : "",
                context: 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : ""
            }
        })
    }
    var ze = ["handleSubscribe", "trackInteraction", "isActive"];

    function De(t, e) {
        var n, r = Object.keys(t);
        return Object.getOwnPropertySymbols && (n = Object.getOwnPropertySymbols(t), e && (n = n.filter(function(e) {
            return Object.getOwnPropertyDescriptor(t, e).enumerable
        })), r.push.apply(r, n)), r
    }

    function Be(r) {
        for (var e = 1; e < arguments.length; e++) {
            var o = null != arguments[e] ? arguments[e] : {};
            e % 2 ? De(Object(o), !0).forEach(function(e) {
                var t, n;
                t = r, e = o[n = e], n in t ? Object.defineProperty(t, n, {
                    value: e,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : t[n] = e
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(o)) : De(Object(o)).forEach(function(e) {
                Object.defineProperty(r, e, Object.getOwnPropertyDescriptor(o, e))
            })
        }
        return r
    }

    function We(e, t) {
        if (null == e) return {};
        var n, r = function(e, t) {
            if (null == e) return {};
            var n, r, o = {},
                a = Object.keys(e);
            for (r = 0; r < a.length; r++) n = a[r], 0 <= t.indexOf(n) || (o[n] = e[n]);
            return o
        }(e, t);
        if (Object.getOwnPropertySymbols)
            for (var o = Object.getOwnPropertySymbols(e), a = 0; a < o.length; a++) n = o[a], 0 <= t.indexOf(n) || Object.prototype.propertyIsEnumerable.call(e, n) && (r[n] = e[n]);
        return r
    }

    function $e(e) {
        var t = e.handleSubscribe,
            n = e.trackInteraction,
            r = e.isActive,
            e = Be(Be({}, We(e, ze)), {}, {
                buttons: [{
                    color: "secondary",
                    variant: "wide",
                    text: "Today’s Puzzle",
                    action: function() {
                        t("spellingBeeCutoffWelcomeBack"), n("susbcribe-welcome-back-tp")
                    },
                    icon: "locked"
                }, {
                    color: "primary",
                    variant: "wide",
                    text: "Subscribe",
                    action: function() {
                        t("spellingBeeCutoffWelcomeBack"), n("subscribe-welcome-back")
                    }
                }],
                description: {
                    text: "Subscribe to continue playing or come back tomorrow.",
                    variant: "subscribe"
                }
            });
        return r && Me("hardpaywall", "spelling-bee-cutoff-welcome"), v.createElement(Te, {
            game: e
        })
    }

    function Ue() {
        return window.isHybridWebView && window.NativeBridge ? window.NativeBridge.gamesBackToHub() : window.location.href = "/crosswords", null
    }
    var Ge = e.connect(function(e) {
        var t = e.foundWords,
            n = e.displayDate,
            r = e.editor,
            o = e.userType;
        return {
            wordCount: t.length,
            displayDate: n,
            editor: r,
            userType: o,
            cutoff: en(e)
        }
    }, function(e) {
        return {
            unlockGame: function() {
                return e(rn())
            }
        }
    })(function(e) {
        var t = e.wordCount,
            n = e.displayDate,
            r = e.editor,
            o = e.userType,
            a = e.cutoff,
            i = e.momentSystem,
            c = e.isActive,
            o = {
                icon: "spelling-bee",
                title: "Spelling Bee",
                date: n,
                editor: r,
                bgColor: "$spelling-bee-gold",
                wordCount: t,
                transitionToGame: function() {
                    i.transition("welcome", "game").then(function() {
                        e.unlockGame(), y.mobileNavTools.activate()
                    })
                },
                handleSubscribe: he,
                trackInteraction: ge,
                isActive: c,
                userType: o
            };
        return 0 < t ? a ? v.createElement($e, o) : v.createElement(Re, o) : v.createElement(_e, o)
    });

    function He() {
        return (He = Object.assign || function(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n, r = arguments[t];
                for (n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
            }
            return e
        }).apply(this, arguments)
    }

    function qe(e) {
        return e = e.game, v.createElement(X, {
            bgColor: e.bgColor
        }, v.createElement("div", {
            className: "pz-moment__container alternate"
        }, e.close && v.createElement(U, {
            action: e.close.action
        }), v.createElement("div", {
            className: "pz-moment__content sequence-animation"
        }, v.createElement(G, {
            icon: e.icon,
            size: "large"
        }), v.createElement(H, {
            text: e.title,
            size: "large"
        }), v.createElement(q, e.description), v.createElement("div", {
            className: "pz-moment__button-wrapper"
        }, (e.buttons || []).map(function(e, t) {
            return v.createElement(K, He({}, e, {
                key: t
            }))
        })), e.bodyText && v.createElement(F, null, e.bodyText))))
    }
    var Fe = ["transitionToGame", "wordCount", "score", "isActive", "trackInteraction", "trackImpression", "navigateBack", "isHalloween"];

    function Ke(t, e) {
        var n, r = Object.keys(t);
        return Object.getOwnPropertySymbols && (n = Object.getOwnPropertySymbols(t), e && (n = n.filter(function(e) {
            return Object.getOwnPropertyDescriptor(t, e).enumerable
        })), r.push.apply(r, n)), r
    }

    function Ye(r) {
        for (var e = 1; e < arguments.length; e++) {
            var o = null != arguments[e] ? arguments[e] : {};
            e % 2 ? Ke(Object(o), !0).forEach(function(e) {
                var t, n;
                t = r, e = o[n = e], n in t ? Object.defineProperty(t, n, {
                    value: e,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : t[n] = e
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(o)) : Ke(Object(o)).forEach(function(e) {
                Object.defineProperty(r, e, Object.getOwnPropertyDescriptor(o, e))
            })
        }
        return r
    }

    function Ve(e, t) {
        if (null == e) return {};
        var n, r = function(e, t) {
            if (null == e) return {};
            var n, r, o = {},
                a = Object.keys(e);
            for (r = 0; r < a.length; r++) n = a[r], 0 <= t.indexOf(n) || (o[n] = e[n]);
            return o
        }(e, t);
        if (Object.getOwnPropertySymbols)
            for (var o = Object.getOwnPropertySymbols(e), a = 0; a < o.length; a++) n = o[a], 0 <= t.indexOf(n) || Object.prototype.propertyIsEnumerable.call(e, n) && (r[n] = e[n]);
        return r
    }

    function Xe(e) {
        var t = e.transitionToGame,
            n = e.wordCount,
            r = e.score,
            o = e.isActive,
            a = e.trackInteraction,
            i = e.trackImpression,
            c = e.navigateBack,
            l = e.isHalloween,
            r = Ye(Ye({}, Ve(e, Fe)), {}, {
                icon: l ? "spelling-bee-spooky" : "spelling-bee-smarty",
                title: "Genius",
                buttons: [{
                    text: "Keep playing",
                    action: function() {
                        t()
                    }
                }, {
                    text: "More puzzles",
                    color: "secondary",
                    action: function() {
                        c(), a("back-to-hub", "genius-modal")
                    }
                }],
                description: {
                    text: "You reached the highest rank, with <em>".concat(n, " words</em> and <em>").concat(r, " points</em>.")
                }
            });
        return o && i("congrats-modal", "spelling-bee"), v.createElement(qe, {
            game: r
        })
    }
    var Je = ["wordCount", "score", "trackImpression", "trackInteraction", "transitionToGame", "navigateBack"];

    function Qe(t, e) {
        var n, r = Object.keys(t);
        return Object.getOwnPropertySymbols && (n = Object.getOwnPropertySymbols(t), e && (n = n.filter(function(e) {
            return Object.getOwnPropertyDescriptor(t, e).enumerable
        })), r.push.apply(r, n)), r
    }

    function Ze(r) {
        for (var e = 1; e < arguments.length; e++) {
            var o = null != arguments[e] ? arguments[e] : {};
            e % 2 ? Qe(Object(o), !0).forEach(function(e) {
                var t, n;
                t = r, e = o[n = e], n in t ? Object.defineProperty(t, n, {
                    value: e,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : t[n] = e
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(o)) : Qe(Object(o)).forEach(function(e) {
                Object.defineProperty(r, e, Object.getOwnPropertyDescriptor(o, e))
            })
        }
        return r
    }

    function et(e, t) {
        if (null == e) return {};
        var n, r = function(e, t) {
            if (null == e) return {};
            var n, r, o = {},
                a = Object.keys(e);
            for (r = 0; r < a.length; r++) n = a[r], 0 <= t.indexOf(n) || (o[n] = e[n]);
            return o
        }(e, t);
        if (Object.getOwnPropertySymbols)
            for (var o = Object.getOwnPropertySymbols(e), a = 0; a < o.length; a++) n = o[a], 0 <= t.indexOf(n) || Object.prototype.propertyIsEnumerable.call(e, n) && (r[n] = e[n]);
        return r
    }

    function tt(e) {
        var t = e.wordCount,
            n = e.score,
            r = (e.trackImpression, e.trackInteraction),
            o = (e.transitionToGame, e.navigateBack),
            n = Ze(Ze({}, et(e, Je)), {}, {
                icon: "spelling-bee-queen",
                title: "Queen Bee",
                buttons: [{
                    text: "More puzzles",
                    action: function() {
                        o(), r("back-to-hub", "completed-modal")
                    }
                }],
                description: {
                    text: "You found everything! All <em>".concat(t, " words</em> worth <em>").concat(n, " points</em>.")
                }
            });
        return v.createElement(qe, {
            game: n
        })
    }
    var nt = e.connect(function(e) {
        return {
            wordCount: e.foundWords.length,
            hasCompleted: Zt(e),
            isHalloween: /10-31/.test(e.printDate),
            score: Yt(e)
        }
    }, function(e) {
        return {
            unlockGame: function() {
                return e(rn())
            }
        }
    })(function(e) {
        var t = e.wordCount,
            n = e.momentSystem,
            r = e.hasCompleted,
            o = e.isActive,
            a = e.isHalloween,
            i = e.score,
            c = function() {
                n.transition("congrats", "game").then(function() {
                    e.unlockGame(), y.mobileNavTools.activate()
                })
            },
            c = {
                bgColor: "$white",
                wordCount: t,
                transitionToGame: c,
                trackInteraction: ge,
                trackImpression: Me,
                navigateBack: Ue,
                isActive: o,
                isHalloween: a,
                score: i,
                screen: "congrats",
                close: {
                    action: c
                }
            };
        return r ? v.createElement(tt, c) : v.createElement(Xe, c)
    });

    function rt(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != n) {
                var r, o, a = [],
                    i = !0,
                    c = !1;
                try {
                    for (n = n.call(e); !(i = (r = n.next()).done) && (a.push(r.value), !t || a.length !== t); i = !0);
                } catch (e) {
                    c = !0, o = e
                } finally {
                    try {
                        i || null == n.return || n.return()
                    } finally {
                        if (c) throw o
                    }
                }
                return a
            }
        }(e, t) || function(e, t) {
            if (e) {
                if ("string" == typeof e) return ot(e, t);
                var n = Object.prototype.toString.call(e).slice(8, -1);
                return "Map" === (n = "Object" === n && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ot(e, t) : void 0
            }
        }(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function ot(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r
    }

    function at() {
        window.localStorage.removeItem(mt)
    }

    function it(e) {
        var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : null;
        return y.xhr.get("".concat(y.env.api, "/svc/spelling-bee/v1/game/").concat(e, ".json"), {
            cookie: t
        }).then(function(e) {
            return e.errors ? null : e.answers || []
        }).catch(function(e) {
            console.error("unable to get remote progress", e)
        })
    }

    function ct(n, t, r) {
        function o() {
            if (window.SIMULATE_OFFLINE) return Promise.reject(new Error("simulating offline"));
            var e = (t = n.getState()).foundWords,
                t = t.userType.nytsCookie;
            ! function(e, t) {
                if (t.length) try {
                    window.localStorage.setItem(mt, JSON.stringify({
                        id: e,
                        words: t
                    }))
                } catch (e) {
                    console.error("local storage failure:", e)
                }
            }(a, e),
            function(e, t) {
                var n = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
                return t.length ? y.xhr.put("".concat(y.env.api, "/svc/spelling-bee/v1/game.json"), {
                    puzzleID: e,
                    answers: t
                }, {
                    cookie: n
                }) : Promise.resolve()
            }(a, e, t).catch(function(e) {
                console.error("unable to save remote progress", e)
            })
        }
        var a = (c = n.getState()).id,
            e = c.yesterday.id,
            i = c.userType.nytsCookie,
            c = function(e) {
                var t = window.localStorage.getItem(mt);
                if (t) try {
                    var n = JSON.parse(t),
                        r = n.words;
                    e !== n.id && (r = at())
                } catch (e) {
                    r = at(), console.error("could not parse local progress: ".concat(t))
                }
                return r
            }(a),
            l = 0;
        it(e, i).then(function(e) {
            e && r(e)
        }), c && (l = c.length, t(c)), it(a, i).then(function(e) {
            e && t(e), o()
        }), n.subscribe(function() {
            var e = n.getState(),
                t = e.foundWords,
                e = e.userType.nytsCookie;
            l !== t.length && (l = t.length, 0 === t.length ? (function(e) {
                var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : null;
                delete window.resetProgressComplete, y.xhr.delete("".concat(y.env.api, "/svc/spelling-bee/v1/game/").concat(e, ".json"), {
                    cookie: t
                }).then(function() {
                    window.resetProgressComplete = !0
                }).catch(function(e) {
                    console.error(e)
                })
            }(a, e), at()) : o())
        }), window.addEventListener("online", o)
    }
    var lt, n = window.location.origin,
        n = (lt = {
            redirect_uri: encodeURIComponent(n + window.location.pathname),
            response_type: "cookie",
            client_id: "games",
            application: "crosswords"
        }, Object.entries(lt).reduce(function(e, t, n) {
            var r = rt(t, 2),
                t = r[0],
                r = r[1],
                n = Object.keys(lt).length - 1 === n ? "" : "&";
            return "".concat(e).concat(t, "=").concat(r).concat(n)
        }, "")),
        ut = "https://myaccount.nytimes.com/auth/enter-email?".concat(n),
        nt = function(a, i) {
            function c(e) {
                return document.getElementById("js-hook-pz-moment__".concat(e))
            }
            var l = document.getElementById("portal-game-moments"),
                u = [].concat(ce(a.map(function(e) {
                    return e.name
                })), ["loading", "game"]);
            (e = document.getElementById("js-hook-pz-moment__game")) && E(e, "pz-moment__frame");
            var s = {
                    sequencingClass: D
                },
                e = function() {
                    ! function(e, t) {
                        if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
                        e.prototype = Object.create(t && t.prototype, {
                            constructor: {
                                value: e,
                                writable: !0,
                                configurable: !0
                            }
                        }), t && re(e, t)
                    }(o, f.Component);
                    var e, t, n, r = oe(o);

                    function o(e) {
                        return function(e, t) {
                            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                        }(this, o), (e = r.call(this, e)).state = {
                            currentMoment: ""
                        }, s.load = e.load.bind(ae(e)), s.getCurrentMoment = e.getCurrentMoment.bind(ae(e)), s.transition = e.momentTransition.bind(ae(e)), e
                    }
                    return e = o, (t = [{
                        key: "componentDidUpdate",
                        value: function(e, t) {
                            var n = this.state.currentMoment,
                                r = this.props.onEnter;
                            t.currentMoment !== n && r(n)
                        }
                    }, {
                        key: "getCurrentMoment",
                        value: function() {
                            return this.state.currentMoment
                        }
                    }, {
                        key: "momentTransition",
                        value: function(e, t) {
                            var n = this;
                            if (u.includes(e) && u.includes(t)) {
                                var r = c(e),
                                    o = c(t);
                                return S(r, o, function() {
                                    return n.setState({
                                        currentMoment: t
                                    })
                                })
                            }
                            console.error("".concat(e, " or ").concat(t, " is not a registered moment"))
                        }
                    }, {
                        key: "load",
                        value: function(e) {
                            var t;
                            u.includes(e) ? (t = c(e), E(t, I), this.setState({
                                currentMoment: e
                            })) : console.error("".concat(e, " is not a registered moment"))
                        }
                    }, {
                        key: "render",
                        value: function() {
                            var n = this.state.currentMoment;
                            return m.createPortal(v.createElement(v.Fragment, null, i && v.createElement(Z, te({
                                momentSystem: s,
                                isActive: "loading" === n
                            }, i)), a.map(function(e) {
                                var t = e.name,
                                    e = e.Content;
                                return v.createElement("section", {
                                    className: "pz-moment__frame pz-moment__".concat(t),
                                    key: t,
                                    id: "js-hook-pz-moment__".concat(t)
                                }, v.createElement(e, {
                                    momentSystem: s,
                                    isActive: n === t
                                }))
                            })), l)
                        }
                    }]) && ne(e.prototype, t), n && ne(e, n), o
                }();
            return e.defaultProps = {
                onEnter: function() {}
            }, {
                Moments: e,
                momentSystem: s
            }
        }([{
            name: "welcome",
            Content: Ge
        }, {
            name: "congrats",
            Content: nt
        }, {
            name: "cutoff",
            Content: function(e) {
                var t = e.isActive,
                    e = {
                        bgColor: "$white",
                        icon: "spelling-bee-loved",
                        title: "You’re good at this!",
                        buttons: [{
                            text: "Subscribe",
                            action: function() {
                                he("spellingBeeCutoffStop"), ge("subscribe-congrats")
                            }
                        }, {
                            text: "More puzzles",
                            color: "secondary",
                            action: function() {
                                Ue(), ge("back-to-hub", "cutoff-modal")
                            }
                        }],
                        bodyText: v.createElement(v.Fragment, null, "Have a Games subscription?", " ", v.createElement("a", {
                            href: function() {
                                var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : window,
                                    t = (null == e || null === (t = e.navigationLinks) || void 0 === t ? void 0 : t.login) || "";
                                return ve(t) ? t : ut
                            }(),
                            onClick: function() {
                                ge("login")
                            }
                        }, "Log in"), "."),
                        description: {
                            text: "Know more words? Subscribe to reach our Genius ranking.",
                            variant: "subscribe"
                        },
                        screen: "congrats"
                    };
                return t && Me("hardpaywall", "spelling-bee-cutoff"), v.createElement(qe, {
                    game: e
                })
            }
        }], {
            icon: "spelling-bee",
            title: "Spelling Bee",
            description: "How many words can you make with&nbsp;7&nbsp;letters?",
            bgColor: "$spelling-bee-gold",
            barBgColor: "rgba(255, 255, 255, 0.6)",
            barColor: "black",
            transitionTo: "welcome"
        }),
        st = nt.Moments,
        ft = nt.momentSystem,
        mt = "sb-today";

    function dt(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != n) {
                var r, o, a = [],
                    i = !0,
                    c = !1;
                try {
                    for (n = n.call(e); !(i = (r = n.next()).done) && (a.push(r.value), !t || a.length !== t); i = !0);
                } catch (e) {
                    c = !0, o = e
                } finally {
                    try {
                        i || null == n.return || n.return()
                    } finally {
                        if (c) throw o
                    }
                }
                return a
            }
        }(e, t) || yt(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function pt(e) {
        return function(e) {
            if (Array.isArray(e)) return bt(e)
        }(e) || function(e) {
            if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e)
        }(e) || yt(e) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function yt(e, t) {
        if (e) {
            if ("string" == typeof e) return bt(e, t);
            var n = Object.prototype.toString.call(e).slice(8, -1);
            return "Map" === (n = "Object" === n && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? bt(e, t) : void 0
        }
    }

    function bt(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r
    }

    function gt(t, e) {
        var n, r = Object.keys(t);
        return Object.getOwnPropertySymbols && (n = Object.getOwnPropertySymbols(t), e && (n = n.filter(function(e) {
            return Object.getOwnPropertyDescriptor(t, e).enumerable
        })), r.push.apply(r, n)), r
    }

    function vt(r) {
        for (var e = 1; e < arguments.length; e++) {
            var o = null != arguments[e] ? arguments[e] : {};
            e % 2 ? gt(Object(o), !0).forEach(function(e) {
                var t, n;
                t = r, e = o[n = e], n in t ? Object.defineProperty(t, n, {
                    value: e,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : t[n] = e
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(o)) : gt(Object(o)).forEach(function(e) {
                Object.defineProperty(r, e, Object.getOwnPropertyDescriptor(o, e))
            })
        }
        return r
    }

    function ht(e, t) {
        return e.length < 5 ? 1 : e.length + (t ? 7 : 0)
    }

    function wt(e, n) {
        return e.reduce(function(e, t) {
            return e + ht(t, n.includes(t))
        }, 0)
    }

    function Et(t, e) {
        var n = e.type,
            r = e.payload;
        switch (n) {
            case Rt:
                return vt(vt({}, t), {}, {
                    input: [].concat(pt(t.input), [r])
                });
            case Mt:
                return vt(vt({}, t), {}, {
                    input: t.input.slice(0, -1)
                });
            case It:
                return vt(vt({}, t), {}, {
                    outerLetters: l(t.outerLetters, !0)
                });
            case zt:
                return vt(vt({}, t), {}, {
                    input: []
                });
            case Dt:
                return vt(vt({}, t), {}, {
                    foundWords: [].concat(pt(t.foundWords), [r])
                });
            case Ut:
                return vt(vt({}, t), {}, {
                    isExpandedWordlist: !t.isExpandedWordlist
                });
            case "LOCK":
                return vt(vt({}, t), {}, {
                    isLocked: !0
                });
            case "UNLOCK":
                return vt(vt({}, t), {}, {
                    isLocked: !1
                });
            case Bt:
                return vt(vt({}, t), {}, {
                    message: r
                });
            case Wt:
                return vt(vt({}, t), {}, {
                    message: null
                });
            case $t:
                return vt(vt({}, t), {}, {
                    input: [],
                    message: null
                });
            case Ht:
                return vt(vt({}, t), {}, {
                    foundWords: [].concat(pt(t.foundWords), pt(r.filter(function(e) {
                        return t.answers.includes(e) && !t.foundWords.includes(e)
                    })))
                });
            case qt:
                return vt(vt({}, t), {}, {
                    yesterday: vt(vt({}, t.yesterday), {}, {
                        foundWords: pt(r || []),
                        fetched: !0
                    })
                });
            case Gt:
                return vt(vt({}, t), {}, {
                    foundWords: []
                });
            case Ft:
                return vt(vt({}, t), {}, {
                    userType: vt(vt({}, t.userType), r)
                });
            case Kt:
                return vt(vt({}, t), {}, {
                    currentMoment: r
                });
            default:
                return t
        }
    }

    function Ot(e) {
        return e.yesterday.foundWords
    }

    function St() {
        return {
            type: "LOCK"
        }
    }

    function kt() {
        return {
            type: Ut
        }
    }

    function jt(e) {
        return {
            type: Ht,
            payload: e
        }
    }

    function Nt(e) {
        return {
            type: qt,
            payload: e
        }
    }

    function Pt(o) {
        return function(e, t) {
            e({
                type: Bt,
                payload: o
            });
            var n = o.isError ? 1100 : 900,
                r = o.isError ? $t : Wt;
            return k(n).then(function() {
                t().message && e({
                    type: r
                })
            })
        }
    }

    function _t() {
        return function(e) {
            e({
                type: It
            })
        }
    }

    function Ct(i) {
        return function(e, t) {
            var n = t();
            if (!n.isLocked) {
                var r = i || n.input.join("");
                if (r.length) {
                    if (window.cheat && r.split("").every(function(e) {
                            return e === n.centerLetter
                        })) return window.cheat(r.length);
                    window.reset && function() {
                        var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : [],
                            t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : [];
                        return c(e).sort().join() === c(t).sort().join()
                    }(r.split(""), n.outerLetters) && window.reset();
                    var o, a, t = (o = n, t = (a = r).split(""), a.length < 4 ? "Too short" : t.some(function(e) {
                        return !o.validLetters.includes(e)
                    }) ? "Bad letters" : a.includes(o.centerLetter) ? o.answers.includes(a) ? o.foundWords.includes(a) ? "Already found" : void 0 : "Not in word list" : "Missing center letter");
                    t ? e(Pt({
                        value: t,
                        isError: !0
                    })) : (e({
                        type: Dt,
                        payload: r
                    }), a = n.pangrams.includes(r), t = ht(r, a), r = t, r = a ? "Pangram!" : 7 <= r ? "Awesome!" : 1 < r ? "Nice!" : "Good!", e({
                        type: zt
                    }), e(Pt({
                        value: r,
                        points: t,
                        isPangram: a
                    })))
                }
            }
        }
    }

    function Tt(u) {
        var s;
        return function(l) {
            return function(e) {
                var t = u.getState(),
                    n = l(e);
                if (e.type === Ut && (t.isExpandedWordlist ? ye.interaction.gameplay("spelling-bee", "word-list", (new Date).getTime() - s) : s = (new Date).getTime()), e.type === Dt) {
                    var r = u.getState(),
                        o = Xt(t),
                        a = Xt(r);
                    if (o < a)
                        for (var i = o + 1; i <= a; i += 1) {
                            var c = At[i][0];
                            ye.interaction.gameplay("spelling-bee", "level-up", "".concat(i, "-").concat(c.replace(" ", "-").toLowerCase()))
                        }
                    r.pangrams.includes(e.payload) && ye.interaction.gameplay("spelling-bee", "pangram"), !Zt(t) && Zt(r) && ye.interaction.gameplay("spelling-bee", "level-up", "".concat(Xt(r) + 1, "-completed"))
                }
                return n
            }
        }
    }

    function xt(a) {
        return function(o) {
            return function(e) {
                var t = a.getState(),
                    n = o(e);
                if (e.type === Dt) {
                    var r = a.getState();
                    if (r.isLocked) return;
                    e = !Qt(t) && Qt(r), t = !Zt(t) && Zt(r);
                    en(r) && (a.dispatch(St()), setTimeout(function() {
                        y.mobileNavTools.deactivate(), ft.transition("game", "cutoff")
                    }, 450)), (e || t) && (a.dispatch(St()), setTimeout(function() {
                        y.mobileNavTools.deactivate(), ft.transition("game", "congrats")
                    }, 450))
                }
                return n
            }
        }
    }
    var Lt, At = [
            ["Beginner", 0],
            ["Good Start", 2],
            ["Moving Up", 5],
            ["Good", 8],
            ["Solid", 15],
            ["Nice", 25],
            ["Great", 40],
            ["Amazing", 50],
            ["Genius", 70]
        ],
        It = "SHUFFLE",
        Rt = "INPUT_LETTER",
        Mt = "DELETE_LETTER",
        zt = "CLEAR_INPUT",
        Dt = "ACCEPT_WORD",
        Bt = "SHOW_MESSAGE",
        Wt = "CLEAR_MESSAGE",
        $t = "CLEAR_MESSAGE_AND_INPUT",
        Ut = "TOGGLE_WORDLIST",
        Gt = "RESET_GAME",
        Ht = "INSERT_FOUND_WORDS",
        qt = "SET_YESTERDAYS_FOUND_WORDS",
        Ft = "UPDATE_USER",
        Kt = "UPDATE_CURRENT_MOMENT",
        nt = function(e) {
            return wt(e.answers, e.pangrams)
        },
        Yt = function(e) {
            return wt(e.foundWords, e.pangrams)
        },
        Vt = t.createSelector(nt, function(n) {
            return At.map(function(e) {
                var t = dt(e, 2),
                    e = t[0],
                    t = t[1];
                return {
                    title: e,
                    minScore: Math.round(t / 100 * n)
                }
            })
        }),
        Xt = t.createSelector([Yt, Vt], function(e, t) {
            for (var n = 0; n < t.length && !(e < t[n].minScore); n += 1);
            return n - 1
        }),
        Jt = t.createSelector(Xt, function(e) {
            return At[e][0]
        }),
        Qt = t.createSelector([Yt, Xt], function(e, t) {
            return t === At.length - 1
        }),
        Zt = t.createSelector([Yt, nt], function(e, t) {
            return e === t
        }),
        en = t.createSelector([Xt, function(e) {
            return e.userType
        }], function(e, t) {
            return !t.hasXwd && 4 <= e
        }),
        tn = t.createSelector([Ot], function(e) {
            return new Set(e)
        }),
        nn = t.createSelector([function(e) {
            return e.yesterday.pangrams
        }], function(e) {
            return new Set(e)
        }),
        rn = function() {
            return {
                type: "UNLOCK"
            }
        },
        t = window,
        on = "touchstart",
        an = "touchend",
        cn = "mousedown",
        ln = "mouseup",
        un = "mouseout",
        sn = "addEventListener",
        fn = "removeEventListener",
        mn = "push-active",
        dn = !1;
    "function" == typeof t.addEventListener && (Lt = !1, Gn = Object.defineProperty({}, "passive", {
        get: function() {
            return Lt = !0
        }
    }), t.addEventListener("testPassiveEventSupport", En = function() {}, Gn), t.removeEventListener("testPassiveEventSupport", En, Gn), dn = Lt);

    function pn(t, n, r, o) {
        function e(e) {
            dn || e.preventDefault(), l && t.classList.add(mn), o && !c && (c = setTimeout(function() {
                i = setInterval(function() {
                    n(e)
                }, 90)
            }, 350)), n(e)
        }

        function a(e) {
            e.cancelable && e.preventDefault(), l && t.classList.remove(mn), i = i && clearInterval(i), c = c && clearTimeout(c), r && r(e)
        }
        var i, c, l = !!t.classList;
        return t[sn](on, e, yn), t[sn](cn, e), t[sn](an, a), t[sn](ln, a), t[sn](un, a),
            function() {
                i = i && clearInterval(i), c = c && clearTimeout(c), t[fn](on), t[fn](cn), t[fn](an), t[fn](ln), t[fn](un)
            }
    }
    var yn = {
        passive: !0
    };

    function bn(e) {
        return (bn = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        })(e)
    }

    function gn(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
    }

    function vn(e, t) {
        return (vn = Object.setPrototypeOf || function(e, t) {
            return e.__proto__ = t, e
        })(e, t)
    }

    function hn(n) {
        var r = function() {
            if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ("function" == typeof Proxy) return !0;
            try {
                return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {})), !0
            } catch (e) {
                return !1
            }
        }();
        return function() {
            var e, t = wn(n);
            return e = r ? (e = wn(this).constructor, Reflect.construct(t, arguments, e)) : t.apply(this, arguments), t = this, !(e = e) || "object" !== bn(e) && "function" != typeof e ? function(e) {
                if (void 0 !== e) return e;
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
            }(t) : e
        }
    }

    function wn(e) {
        return (wn = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
            return e.__proto__ || Object.getPrototypeOf(e)
        })(e)
    }
    var En = Math.pow(3, .5),
        On = 2 * En,
        Sn = [
            [0, En],
            [1, 0],
            [3, 0],
            [4, En],
            [3, On],
            [1, On]
        ].map(function(e) {
            return e.map(function(e) {
                return 30 * e
            }).join()
        }).join(" "),
        kn = function() {
            ! function(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        writable: !0,
                        configurable: !0
                    }
                }), t && vn(e, t)
            }(o, f.Component);
            var e, t, n, r = hn(o);

            function o() {
                return function(e, t) {
                    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                }(this, o), r.apply(this, arguments)
            }
            return e = o, (t = [{
                key: "componentDidMount",
                value: function() {
                    var e = this.props,
                        t = e.onUp,
                        e = e.onDown;
                    this.unbind = pn(this._el, e, t)
                }
            }, {
                key: "componentWillUnmount",
                value: function() {
                    this.unbind()
                }
            }, {
                key: "render",
                value: function() {
                    var t = this,
                        e = this.props,
                        n = e.activeKey,
                        r = e.letter,
                        e = e.type;
                    return v.createElement("svg", {
                        className: b("hive-cell", e),
                        viewBox: "0 0 ".concat(120, " ").concat(30 * On)
                    }, v.createElement("polygon", {
                        ref: function(e) {
                            t._el = e
                        },
                        className: b("cell-fill", {
                            "push-active": r === n
                        }),
                        points: Sn,
                        stroke: "white",
                        strokeWidth: 7.5
                    }), v.createElement("text", {
                        className: "cell-letter",
                        x: "50%",
                        y: "50%",
                        dy: "0.35em"
                    }, r))
                }
            }]) && gn(e.prototype, t), n && gn(e, n), o
        }();

    function jn(e) {
        return (jn = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        })(e)
    }

    function Nn(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
    }

    function Pn(e, t) {
        return (Pn = Object.setPrototypeOf || function(e, t) {
            return e.__proto__ = t, e
        })(e, t)
    }

    function _n(n) {
        var r = function() {
            if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ("function" == typeof Proxy) return !0;
            try {
                return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {})), !0
            } catch (e) {
                return !1
            }
        }();
        return function() {
            var e, t = Cn(n);
            return e = r ? (e = Cn(this).constructor, Reflect.construct(t, arguments, e)) : t.apply(this, arguments), t = this, !(e = e) || "object" !== jn(e) && "function" != typeof e ? function(e) {
                if (void 0 !== e) return e;
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
            }(t) : e
        }
    }

    function Cn(e) {
        return (Cn = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
            return e.__proto__ || Object.getPrototypeOf(e)
        })(e)
    }
    kn.defaultProps = {
        letter: "",
        activeKey: "",
        type: "center",
        onUp: function() {},
        onDown: function() {}
    };
    var Tn = function() {
        ! function(e, t) {
            if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    writable: !0,
                    configurable: !0
                }
            }), t && Pn(e, t)
        }(o, f.Component);
        var e, t, n, r = _n(o);

        function o() {
            return function(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }(this, o), r.apply(this, arguments)
        }
        return e = o, (t = [{
            key: "componentDidMount",
            value: function() {
                var e = this.props,
                    t = e.onDown,
                    n = e.onUp,
                    e = e.allowBurst;
                this.unbind = pn(this.button, t, n, e)
            }
        }, {
            key: "componentWillUnmount",
            value: function() {
                this.unbind()
            }
        }, {
            key: "render",
            value: function() {
                var t = this,
                    e = this.props,
                    n = e.className,
                    r = e.children,
                    o = e.outerRef;
                return v.createElement("div", {
                    ref: function(e) {
                        t.button = e, o && (o.current = e)
                    },
                    className: b(n, "sb-touch-button")
                }, r)
            }
        }]) && Nn(e.prototype, t), n && Nn(e, n), o
    }();

    function xn(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != n) {
                var r, o, a = [],
                    i = !0,
                    c = !1;
                try {
                    for (n = n.call(e); !(i = (r = n.next()).done) && (a.push(r.value), !t || a.length !== t); i = !0);
                } catch (e) {
                    c = !0, o = e
                } finally {
                    try {
                        i || null == n.return || n.return()
                    } finally {
                        if (c) throw o
                    }
                }
                return a
            }
        }(e, t) || function(e, t) {
            if (e) {
                if ("string" == typeof e) return Ln(e, t);
                var n = Object.prototype.toString.call(e).slice(8, -1);
                return "Map" === (n = "Object" === n && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ln(e, t) : void 0
            }
        }(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Ln(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r
    }
    Tn.defaultProps = {
        className: "",
        onDown: function() {},
        onUp: function() {},
        allowBurst: !1,
        children: null,
        outerRef: null
    };

    function An(e, t) {
        return window.getComputedStyle && parseInt(window.getComputedStyle(e)[t]) || 0
    }

    function In(e) {
        function t() {
            var e;
            i && (e = [l.current, u.current, s.current].reduce(function(e, t) {
                return e + ((t = t) ? t.clientWidth + An(t, "marginLeft") + An(t, "marginRight") : 0)
            }, 0), e = c.current.clientWidth < e, m(e))
        }
        var n = e.activeKey,
            r = e.deleteLetter,
            o = e.handleShuffle,
            a = e.submitWord,
            i = e.isVisible,
            c = e.boundingParentRef,
            l = v.useRef(),
            u = v.useRef(),
            s = v.useRef(),
            f = xn(v.useState(!1), 2),
            e = f[0],
            m = f[1];
        return v.useEffect(function() {
            t();
            var e = h(t);
            return window.addEventListener("resize", e),
                function() {
                    return window.removeEventListener("resize", e)
                }
        }, [i]), v.createElement("div", {
            className: b("hive-actions", {
                vertical: e
            })
        }, v.createElement(Tn, {
            className: b("hive-action", "hive-action__submit", {
                "action-active": "submit" === n
            }),
            onDown: function() {
                return a()
            },
            outerRef: s
        }, "Enter"), v.createElement(Tn, {
            allowBurst: !0,
            className: b("hive-action", "hive-action__delete", {
                "action-active": "delete" === n
            }),
            onDown: function() {
                return r()
            },
            outerRef: l
        }, "Delete"), v.createElement(Tn, {
            className: b("hive-action", "hive-action__shuffle", {
                "action-active": "shuffle" === n
            }),
            onDown: function() {
                return o()
            },
            outerRef: u
        }))
    }

    function Rn(e) {
        return (Rn = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        })(e)
    }

    function Mn(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
    }

    function zn(e, t) {
        return (zn = Object.setPrototypeOf || function(e, t) {
            return e.__proto__ = t, e
        })(e, t)
    }

    function Dn(n) {
        var r = function() {
            if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ("function" == typeof Proxy) return !0;
            try {
                return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {})), !0
            } catch (e) {
                return !1
            }
        }();
        return function() {
            var e, t = Wn(n);
            return e = r ? (e = Wn(this).constructor, Reflect.construct(t, arguments, e)) : t.apply(this, arguments), t = this, !(e = e) || "object" !== Rn(e) && "function" != typeof e ? Bn(t) : e
        }
    }

    function Bn(e) {
        if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return e
    }

    function Wn(e) {
        return (Wn = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
            return e.__proto__ || Object.getPrototypeOf(e)
        })(e)
    }

    function $n(e, t, n) {
        return t in e ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = n, e
    }
    var Un = function(e) {
            return !!("a" <= e && e <= "z" && 1 === e.length)
        },
        Gn = function() {
            ! function(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        writable: !0,
                        configurable: !0
                    }
                }), t && zn(e, t)
            }(o, f.Component);
            var e, t, n, r = Dn(o);

            function o(e) {
                var a;
                return function(e, t) {
                    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                }(this, o), $n(Bn(a = r.call(this, e)), "handleKeydown", function(e) {
                    var t, n = a.props,
                        r = n.inputLetter,
                        o = n.deleteLetter,
                        n = n.submitWord;
                    e.metaKey || ("Backspace" === e.key || "Delete" === e.key ? (t = "delete", o(), e.preventDefault()) : "Enter" === e.key ? (t = "submit", n(), e.preventDefault()) : " " === e.key ? (t = "shuffle", a.handleShuffle(), e.preventDefault()) : (e = e.key.toLowerCase(), Un(e) && r(e)), a.setState({
                        activeKey: t
                    }))
                }), $n(Bn(a), "handleKeyup", function() {
                    a.setState({
                        activeKey: null
                    })
                }), $n(Bn(a), "handleShuffle", function() {
                    var e = a.props.shuffleLetters;
                    a.state.shuffleStage || (a.setState({
                        shuffleStage: "beforeShuffle"
                    }), k(300).then(function() {
                        a.setState({
                            shuffleStage: "shuffling"
                        }), e()
                    }).then(function() {
                        return k(10)
                    }).then(function() {
                        return a.setState({
                            shuffleStage: "afterShuffle"
                        })
                    }).then(function() {
                        return k(300)
                    }).then(function() {
                        return a.setState({
                            shuffleStage: null
                        })
                    }))
                }), a.state = {
                    activeKey: null,
                    shuffleStage: null
                }, a
            }
            return e = o, (t = [{
                key: "componentDidMount",
                value: function() {
                    window.addEventListener("keydown", this.handleKeydown, !1), window.addEventListener("keyup", this.handleKeyup, !1)
                }
            }, {
                key: "componentWillUnmount",
                value: function() {
                    window.removeEventListener("keydown", this.handleKeydown), window.removeEventListener("keyup", this.handleKeyup)
                }
            }, {
                key: "render",
                value: function() {
                    var e = this.props,
                        t = e.outerLetters,
                        n = e.centerLetter,
                        r = e.inputLetter,
                        o = e.deleteLetter,
                        a = e.submitWord,
                        i = e.currentMoment,
                        c = e.boundingParentRef,
                        e = this.state,
                        l = e.activeKey,
                        e = e.shuffleStage,
                        t = [v.createElement(kn, {
                            key: n,
                            letter: n,
                            activeKey: l,
                            onDown: function() {
                                return r(n)
                            },
                            type: "center"
                        })].concat([t.map(function(e) {
                            return v.createElement(kn, {
                                key: e,
                                letter: e,
                                activeKey: l,
                                onDown: function() {
                                    return r(e)
                                },
                                className: l === e ? "cell-down" : "",
                                type: "outer"
                            })
                        })]);
                    return v.createElement(v.Fragment, null, v.createElement("div", {
                        className: "sb-hive"
                    }, v.createElement("div", {
                        className: b("hive", {
                            "fade-out": "beforeShuffle" === e
                        }, {
                            shuffling: "shuffling" === e
                        }, {
                            "fade-in": "afterShuffle" === e
                        })
                    }, t)), v.createElement(In, {
                        activeKey: l,
                        handleShuffle: this.handleShuffle,
                        submitWord: a,
                        deleteLetter: o,
                        isVisible: "game" === i,
                        boundingParentRef: c
                    }))
                }
            }]) && Mn(e.prototype, t), n && Mn(e, n), o
        }();
    Gn.defaultProps = {}, Gn.defaultProps = {
        boundingParentRef: {
            current: null
        }
    };
    var Hn = e.connect(function(e) {
        return {
            centerLetter: e.centerLetter,
            outerLetters: e.outerLetters,
            currentMoment: e.currentMoment
        }
    }, function(t) {
        return {
            deleteLetter: function() {
                return t(function(e, t) {
                    t = t();
                    t.isLocked || (t.message && t.message.isError ? e({
                        type: $t
                    }) : e({
                        type: Mt
                    }))
                })
            },
            inputLetter: function(e) {
                return t((n = e, function(e, t) {
                    t = t();
                    t.isLocked || (18 < t.input.length ? e(Pt({
                        value: "Too long",
                        isError: !0
                    })) : (t.message && t.message.isError && e({
                        type: $t
                    }), e({
                        type: Rt,
                        payload: n
                    })))
                }));
                var n
            },
            submitWord: function() {
                return t(Ct())
            },
            shuffleLetters: function() {
                return t(_t())
            }
        }
    })(Gn);

    function qn(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != n) {
                var r, o, a = [],
                    i = !0,
                    c = !1;
                try {
                    for (n = n.call(e); !(i = (r = n.next()).done) && (a.push(r.value), !t || a.length !== t); i = !0);
                } catch (e) {
                    c = !0, o = e
                } finally {
                    try {
                        i || null == n.return || n.return()
                    } finally {
                        if (c) throw o
                    }
                }
                return a
            }
        }(e, t) || function(e, t) {
            if (e) {
                if ("string" == typeof e) return Fn(e, t);
                var n = Object.prototype.toString.call(e).slice(8, -1);
                return "Map" === (n = "Object" === n && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Fn(e, t) : void 0
            }
        }(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Fn(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r
    }

    function Kn(e) {
        var t = e.value,
            n = e.centerLetter,
            e = void 0 !== (e = e.isPangram) && e,
            r = [],
            t = t.split(n),
            o = 0;
        return t.forEach(function(e, t) {
            o += 1, 0 < t && n && r.push(v.createElement("span", {
                key: o,
                className: "sb-anagram-key"
            }, n)), e && r.push(e)
        }), v.createElement("span", {
            className: b("sb-anagram", {
                pangram: e
            })
        }, r)
    }
    var Yn = e.connect(function(e) {
        var t = e.centerLetter,
            n = e.outerLetters,
            r = e.input;
        return {
            message: e.message,
            centerLetter: t,
            validLetters: [t].concat(n),
            input: r
        }
    })(function(e) {
        var n = e.input,
            r = e.centerLetter,
            o = e.validLetters,
            a = e.message,
            i = v.useRef(),
            c = v.useRef(),
            t = qn(v.useState(1), 2),
            e = t[0],
            l = t[1];
        v.useLayoutEffect(function() {
            var e = i.current.getBoundingClientRect().width,
                t = c.current.getBoundingClientRect().width;
            l(e < t ? e / t : 1)
        }, [n]);
        t = function(e) {
            var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : null;
            return v.createElement("span", {
                className: b("sb-hive-input-content", {
                    "has-error": a && a.isError,
                    "non-empty": 0 < n.length,
                    "is-accepting": a && !a.isError
                }),
                style: {
                    fontSize: "".concat(e, "em")
                },
                ref: t
            }, n.map(function(e, t) {
                return v.createElement("span", {
                    key: e + t,
                    className: b({
                        "sb-input-bright": r === e,
                        "sb-input-invalid": !o.includes(e)
                    })
                }, e)
            }))
        };
        return v.createElement("div", {
            className: "sb-hive-input",
            ref: i
        }, t(e), v.createElement("div", {
            className: "sb-hive-hidden-input"
        }, t(1, c)))
    });

    function Vn(e) {
        return function(e) {
            if (Array.isArray(e)) return Qn(e)
        }(e) || function(e) {
            if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e)
        }(e) || Jn(e) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Xn(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != n) {
                var r, o, a = [],
                    i = !0,
                    c = !1;
                try {
                    for (n = n.call(e); !(i = (r = n.next()).done) && (a.push(r.value), !t || a.length !== t); i = !0);
                } catch (e) {
                    c = !0, o = e
                } finally {
                    try {
                        i || null == n.return || n.return()
                    } finally {
                        if (c) throw o
                    }
                }
                return a
            }
        }(e, t) || Jn(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Jn(e, t) {
        if (e) {
            if ("string" == typeof e) return Qn(e, t);
            var n = Object.prototype.toString.call(e).slice(8, -1);
            return "Map" === (n = "Object" === n && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qn(e, t) : void 0
        }
    }

    function Qn(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r
    }
    En = function(e) {
        function t(e) {
            var t = c.current.scrollLeft,
                n = c.current.offsetWidth;
            c.current.scrollTo(t + ("prev" === e ? -1 : 1) * n, 0)
        }
        var r, o, a, n = e.words,
            i = e.centerLetter,
            c = v.useRef(),
            l = v.useRef(),
            u = Xn(v.useState(1), 2),
            s = u[0],
            f = u[1],
            m = Xn(v.useState(0), 2),
            d = m[0],
            p = m[1],
            e = 1 < s,
            u = e && !g.isMobile,
            m = v.useCallback((r = function() {
                var e = Math.round(c.current.scrollLeft / c.current.offsetWidth);
                p(e)
            }, o = 100, function() {
                if (!a) {
                    for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
                    r.apply(this, t), a = !0, setTimeout(function() {
                        a = !1
                    }, o)
                }
            }), []),
            y = v.useCallback(function() {
                var e, t, n, r;
                l.current ? (r = c.current.offsetWidth) && (e = c.current.scrollLeft, t = c.current.getBoundingClientRect().left, n = l.current.getBoundingClientRect().right, 0 < (r = Math.ceil((n + e - t) / r)) && f(r)) : f(1)
            }, [f]);
        return v.useEffect(y), v.useEffect(function() {
            var e = h(y, 100);
            return window.addEventListener("resize", e),
                function() {
                    return window.removeEventListener("resize", e)
                }
        }, []), v.createElement(v.Fragment, null, v.createElement("div", {
            className: "sb-wordlist-pag",
            ref: c,
            onScroll: m
        }, Vn(Array(s)).map(function(e, t) {
            return v.createElement("div", {
                key: t.toString(),
                className: "sb-wordlist-scroll-anchor",
                style: {
                    left: "".concat(100 * t, "%")
                }
            })
        }), v.createElement("ul", {
            className: b("sb-wordlist-items-pag", {
                single: 1 === n.length
            })
        }, n.map(function(e, t) {
            return v.createElement("li", {
                key: e,
                ref: t === n.length - 1 ? l : void 0
            }, v.createElement(Kn, {
                value: e,
                centerLetter: i
            }))
        }))), v.createElement("div", {
            className: "sb-kebob"
        }, u && v.createElement("button", {
            type: "button",
            onClick: function() {
                return t("prev")
            },
            className: b("sb-bob-arrow", "sb-bob-prev", {
                active: 0 < d
            })
        }, v.createElement("span", {
            className: "sb-bob-text"
        }, "Prev")), e && Vn(Array(s)).map(function(e, t) {
            return v.createElement("div", {
                className: b("sb-bob", {
                    active: t === d
                }),
                key: t.toString()
            })
        }), u && v.createElement("button", {
            type: "button",
            onClick: function() {
                return t("next")
            },
            className: b("sb-bob-arrow", "sb-bob-next", {
                active: d < s - 1
            })
        }, v.createElement("span", {
            className: "sb-bob-text"
        }, "Next"))))
    };
    En.defaultProps = {
        words: [],
        centerLetter: ""
    };
    var Zn = e.connect(function(e) {
            return {
                words: e.foundWords.slice().sort(function(e, t) {
                    return t < e ? 1 : -1
                }),
                centerLetter: e.centerLetter
            }
        })(En),
        er = e.connect(function(e) {
            return {
                wordCount: e.foundWords.length,
                recentWords: e.foundWords.slice().reverse(),
                centerLetter: e.centerLetter,
                isExpandedWordlist: e.isExpandedWordlist
            }
        }, function(e) {
            return {
                toggleWordlist: function() {
                    return e(kt())
                }
            }
        })(function(e) {
            var t = e.wordCount,
                n = e.recentWords,
                r = e.centerLetter,
                o = e.isExpandedWordlist,
                e = e.toggleWordlist;
            return v.createElement(Tn, {
                className: "sb-wordlist-heading-wrap",
                onDown: e
            }, v.createElement("div", {
                className: "sb-wordlist-summary"
            }, "You have found ", t, " ", 1 === t ? "word" : "words"), v.createElement("div", {
                className: "sb-recent-words-wrap"
            }, v.createElement("ul", {
                className: b("sb-recent-words", {
                    "sb-has-words": 0 < n.length
                })
            }, n.length ? n.map(function(e) {
                return v.createElement("li", {
                    key: e
                }, v.createElement(Kn, {
                    value: e,
                    centerLetter: r
                }))
            }) : v.createElement("li", {
                key: "none",
                className: "sb-placeholder-text"
            }, "Your words …"))), v.createElement("div", {
                className: "sb-toggle-expand"
            }, v.createElement("span", {
                className: b("sb-toggle-icon", {
                    "sb-toggle-icon-expanded": o
                })
            })))
        });

    function tr(e) {
        return (tr = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        })(e)
    }

    function nr(t, e) {
        var n, r = Object.keys(t);
        return Object.getOwnPropertySymbols && (n = Object.getOwnPropertySymbols(t), e && (n = n.filter(function(e) {
            return Object.getOwnPropertyDescriptor(t, e).enumerable
        })), r.push.apply(r, n)), r
    }

    function rr(r) {
        for (var e = 1; e < arguments.length; e++) {
            var o = null != arguments[e] ? arguments[e] : {};
            e % 2 ? nr(Object(o), !0).forEach(function(e) {
                var t, n;
                t = r, e = o[n = e], n in t ? Object.defineProperty(t, n, {
                    value: e,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : t[n] = e
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(o)) : nr(Object(o)).forEach(function(e) {
                Object.defineProperty(r, e, Object.getOwnPropertyDescriptor(o, e))
            })
        }
        return r
    }

    function or(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
    }

    function ar(e, t) {
        return (ar = Object.setPrototypeOf || function(e, t) {
            return e.__proto__ = t, e
        })(e, t)
    }

    function ir(n) {
        var r = function() {
            if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ("function" == typeof Proxy) return !0;
            try {
                return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {})), !0
            } catch (e) {
                return !1
            }
        }();
        return function() {
            var e, t = lr(n);
            return e = r ? (e = lr(this).constructor, Reflect.construct(t, arguments, e)) : t.apply(this, arguments), t = this, !(e = e) || "object" !== tr(e) && "function" != typeof e ? cr(t) : e
        }
    }

    function cr(e) {
        if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return e
    }

    function lr(e) {
        return (lr = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
            return e.__proto__ || Object.getPrototypeOf(e)
        })(e)
    }
    var ur = function() {
        var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {},
            t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : document.documentElement;
        return ["Hybrid summary:", "Viewport Size: ".concat(t.clientWidth, " x ").concat(t.clientHeight), "Logged In: ".concat(e.isLoggedIn ? "Yes" : "No"), "Xwd: ".concat(e.hasXwd ? "Yes" : "No"), "Regi: ".concat(e.regiId), "NYTS: ".concat(e.nytsCookie ? "Yes" : "No"), "Web Version: ".concat(window.env.version)].join("\n")
    };

    function sr(e) {
        return (sr = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        })(e)
    }

    function fr(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
        }
    }

    function mr(e, t) {
        return (mr = Object.setPrototypeOf || function(e, t) {
            return e.__proto__ = t, e
        })(e, t)
    }

    function dr(n) {
        var r = function() {
            if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ("function" == typeof Proxy) return !0;
            try {
                return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {})), !0
            } catch (e) {
                return !1
            }
        }();
        return function() {
            var e, t = yr(n);
            return e = r ? (e = yr(this).constructor, Reflect.construct(t, arguments, e)) : t.apply(this, arguments), t = this, !(e = e) || "object" !== sr(e) && "function" != typeof e ? pr(t) : e
        }
    }

    function pr(e) {
        if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return e
    }

    function yr(e) {
        return (yr = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
            return e.__proto__ || Object.getPrototypeOf(e)
        })(e)
    }
    var br = "suggest",
        gr = "feedback",
        vr = function() {
            ! function(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        writable: !0,
                        configurable: !0
                    }
                }), t && mr(e, t)
            }(a, v.Component);
            var e, t, n, o = dr(a);

            function a(e) {
                var r, t, n;
                return function(e, t) {
                    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                }(this, a), r = o.call(this, e), t = pr(r), n = function(e) {
                    var t = r.props,
                        n = t.type,
                        t = t.user;
                    window.isHybridWebView && window.NativeBridge && (e.preventDefault(), window.NativeBridge.gamesSendEmail({
                        type: n,
                        debugInfo: ur(t)
                    }))
                }, (e = "handleClick") in t ? Object.defineProperty(t, e, {
                    value: n,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : t[e] = n, r.state = {
                    href: "mailto:nytgames@nytimes.com"
                }, r
            }
            return e = a, (t = [{
                key: "componentDidMount",
                value: function() {
                    var t = this,
                        e = this.props.subject;
                    y.getFeedbackLink(e).then(function(e) {
                        return t.setState({
                            href: e
                        })
                    })
                }
            }, {
                key: "render",
                value: function() {
                    var e = this.props,
                        t = e.href,
                        n = e.subject,
                        r = e.children,
                        e = this.state.href,
                        n = t && n ? n : "",
                        e = t ? "".concat(t, "?subject=").concat(n) : e;
                    return v.createElement("a", {
                        rel: "noopener noreferrer",
                        target: "_blank",
                        href: e,
                        onClick: this.handleClick
                    }, r)
                }
            }]) && fr(e.prototype, t), n && fr(e, n), a
        }();
    vr.defaultProps = {
        subject: "",
        href: "",
        children: null,
        type: gr,
        user: {}
    };

    function hr(e) {
        return e = e.children, v.createElement("div", {
            className: "sb-modal-header"
        }, e)
    }

    function wr(e) {
        return e = e.children, v.createElement("div", {
            className: "sb-modal-body"
        }, e)
    }

    function Er(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != n) {
                var r, o, a = [],
                    i = !0,
                    c = !1;
                try {
                    for (n = n.call(e); !(i = (r = n.next()).done) && (a.push(r.value), !t || a.length !== t); i = !0);
                } catch (e) {
                    c = !0, o = e
                } finally {
                    try {
                        i || null == n.return || n.return()
                    } finally {
                        if (c) throw o
                    }
                }
                return a
            }
        }(e, t) || function(e, t) {
            if (e) {
                if ("string" == typeof e) return Or(e, t);
                var n = Object.prototype.toString.call(e).slice(8, -1);
                return "Map" === (n = "Object" === n && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Or(e, t) : void 0
            }
        }(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Or(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r
    }

    function Sr(e, t) {
        return kr.toggleModal(e, t)
    }
    var kr = function(a, i, c) {
            var l = {},
                e = function() {
                    ! function(e, t) {
                        if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
                        e.prototype = Object.create(t && t.prototype, {
                            constructor: {
                                value: e,
                                writable: !0,
                                configurable: !0
                            }
                        }), t && ar(e, t)
                    }(o, f.Component);
                    var e, t, n, r = ir(o);

                    function o(e) {
                        var t;
                        return function(e, t) {
                            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                        }(this, o), (t = r.call(this, e)).state = {
                            currentModal: e.initialModal || null,
                            isOpen: !!e.initialModal,
                            isClosing: !1,
                            hasAnimatedIn: !1
                        }, l.toggleModal = t.toggleModal.bind(cr(t)), l.lock = t.lock.bind(cr(t)), l.unlock = t.unlock.bind(cr(t)), l.getCurrentModal = t.getCurrentModal.bind(cr(t)), t.enqueueStates = t.enqueueStates.bind(cr(t)), t.handleScrimClick = t.handleScrimClick.bind(cr(t)), t
                    }
                    return e = o, (t = [{
                        key: "handleScrimClick",
                        value: function() {
                            this.state.hasAnimatedIn && l.toggleModal()
                        }
                    }, {
                        key: "getCurrentModal",
                        value: function() {
                            return this.state.currentModal
                        }
                    }, {
                        key: "enqueueStates",
                        value: function(e) {
                            var t = this,
                                n = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 150,
                                r = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 0;
                            e[r] && setTimeout(function() {
                                t.setState(rr({}, e[r]), t.enqueueStates(e, n, r + 1))
                            }, r ? n : 0)
                        }
                    }, {
                        key: "toggleModal",
                        value: function(e, t) {
                            var n = this.state,
                                r = n.isOpen,
                                o = n.locked,
                                a = n.currentModal,
                                i = this.props,
                                n = i.onOpen,
                                i = i.onClose;
                            o || ((e = "string" == typeof e && e) ? (n && n(e, t), r ? this.setState({
                                currentModal: e
                            }) : this.enqueueStates([{}, {
                                isOpen: !0,
                                currentModal: e
                            }, {
                                hasAnimatedIn: !0
                            }])) : (i && i(a, t), this.enqueueStates([{
                                isClosing: !0,
                                hasAnimatedIn: !1
                            }, {
                                isClosing: !1,
                                isOpen: !1,
                                currentModal: null
                            }])))
                        }
                    }, {
                        key: "lock",
                        value: function() {
                            this.setState({
                                locked: !0
                            })
                        }
                    }, {
                        key: "unlock",
                        value: function() {
                            this.setState({
                                locked: !1
                            })
                        }
                    }, {
                        key: "render",
                        value: function() {
                            var e = this.state,
                                t = e.isOpen,
                                n = e.isClosing,
                                r = e.currentModal,
                                e = a[r] || null;
                            return m.createPortal(v.createElement("div", {
                                className: b("sb-modal-system", {
                                    "sb-modal-open": t,
                                    "sb-modal-closing": n
                                })
                            }, v.createElement("div", {
                                role: "presentation",
                                className: "sb-modal-scrim",
                                onClick: this.handleScrimClick
                            }, v.createElement("div", {
                                className: "sb-modal-wrapper"
                            }, r && v.createElement(i, {
                                key: r,
                                toggleModal: l.toggleModal,
                                modalType: r
                            }, v.createElement(e, {
                                toggleModal: l.toggleModal,
                                modalType: r,
                                lock: l.lock,
                                unlock: l.unlock
                            }))))), c)
                        }
                    }]) && or(e.prototype, t), n && or(e, n), o
                }();
            e.defaultProps = {
                initialModal: null
            };
            return l.Modals = e, l.ModalButton = function(e) {
                var t = e.modal,
                    n = e.children,
                    r = e.className,
                    o = e.triggerName;
                return v.createElement("span", {
                    role: "presentation",
                    className: r,
                    onClick: function() {
                        l.toggleModal(t, o)
                    }
                }, n)
            }, l
        }({
            help: e.connect(function(e) {
                return {
                    userType: e.userType
                }
            })(function(e) {
                e = e.userType;
                return v.createElement(v.Fragment, null, v.createElement(hr, null, v.createElement("h3", {
                    className: "sb-modal-title"
                }, "How to Play Spelling", " ", "Bee"), v.createElement("h4", {
                    className: "sb-modal-subtitle"
                }, "Create words using letters from the", " ", "hive.")), v.createElement(wr, null, v.createElement("ul", {
                    className: "sb-modal-list"
                }, v.createElement("li", null, "Words must contain at least 4 letters."), v.createElement("li", null, "Words must include the center letter."), v.createElement("li", null, "Our word list does not include words that are obscure, hyphenated, or proper nouns."), v.createElement("li", null, "No cussing either, sorry."), v.createElement("li", null, "Letters can be used more than once.")), v.createElement("h4", {
                    className: "sb-modal-heading"
                }, "Score points to increase your rating."), v.createElement("ul", {
                    className: "sb-modal-list"
                }, v.createElement("li", null, "4-letter words are worth 1 point each."), v.createElement("li", null, "Longer words earn 1 point per letter."), v.createElement("li", null, "Each puzzle includes at least one “pangram” which uses every letter. These are worth 7 extra points!")), v.createElement("p", {
                    className: "sb-modal-message"
                }, "New puzzles are released daily at 3 a.m. ET."), v.createElement("p", {
                    className: "sb-modal-message"
                }, "Think we missed a word? Email us at", " ", v.createElement(vr, {
                    subject: "Spelling Bee Word Suggestion",
                    href: "mailto:buzzwords@nytimes.com",
                    type: br,
                    user: e
                }, "buzzwords@nytimes.com"), "."), v.createElement("p", {
                    className: "sb-modal-message"
                }, "Have feedback? Email us at ", v.createElement(vr, {
                    subject: "Spelling Bee Feedback",
                    type: gr,
                    user: e
                }, "nytgames@nytimes.com"), ".")))
            }),
            ranks: e.connect(function(e) {
                return {
                    ranks: Vt(e),
                    userType: e.userType
                }
            })(function(e) {
                var t = e.ranks,
                    e = e.userType;
                return v.createElement(v.Fragment, null, v.createElement(hr, null, v.createElement("h3", {
                    className: "sb-modal-title"
                }, "Rankings"), v.createElement("p", {
                    className: "sb-modal-message"
                }, "Ranks are based on a percentage of possible points in a puzzle. The minimum scores to reach each rank for today’s are:")), v.createElement(wr, null, v.createElement("ol", {
                    className: "sb-modal-list"
                }, t.map(function(e) {
                    var t = e.minScore,
                        e = e.title;
                    return v.createElement("li", {
                        key: e
                    }, v.createElement("span", {
                        className: "sb-modal-rank"
                    }, e), " (", t, ")")
                })), v.createElement("p", {
                    className: "sb-modal-message"
                }, "Think we missed a word? Email us at", v.createElement(vr, {
                    href: "mailto:buzzwords@nytimes.com",
                    subject: "Spelling Bee Word Suggestion",
                    type: br,
                    user: e
                }, " ", "buzzwords@nytimes.com"), "."), v.createElement("p", {
                    className: "sb-modal-message"
                }, "Have feedback? Email us at ", v.createElement(vr, {
                    subject: "Spelling Bee Feedback",
                    type: gr,
                    user: e
                }, "nytgames@nytimes.com"), ".")))
            }),
            yesterday: e.connect(function(e) {
                var t = e.yesterday;
                return {
                    displayDate: t.displayDate,
                    centerLetter: t.centerLetter,
                    validLetters: t.validLetters,
                    answers: t.answers,
                    foundWords: Ot(e),
                    foundWordSet: tn(e),
                    pangramSet: nn(e)
                }
            }, function(e) {
                return {
                    getRemoteProgress: function() {
                        return e(function(t, e) {
                            var n = e(),
                                e = n.yesterday.id,
                                n = n.userType.nytsCookie;
                            it(e, n).then(function(e) {
                                e && t(Nt(e))
                            })
                        })
                    }
                }
            })(function(e) {
                var t = e.displayDate,
                    n = e.centerLetter,
                    r = e.validLetters,
                    o = e.answers,
                    a = e.pangramSet,
                    i = e.foundWords,
                    c = e.foundWordSet,
                    l = e.getRemoteProgress;
                return v.useEffect(function() {
                    window.isHybridWebView && null === i && l()
                }, [i]), v.createElement(v.Fragment, null, v.createElement(hr, null, v.createElement("h3", {
                    className: "sb-modal-title"
                }, "Yesterday’s Answers"), v.createElement("div", {
                    className: "sb-modal-date__yesterday"
                }, t), v.createElement("div", {
                    className: "sb-modal-letters"
                }, r)), v.createElement(wr, null, v.createElement("ul", {
                    className: "sb-modal-wordlist-items"
                }, o.map(function(e) {
                    return v.createElement("li", {
                        key: e,
                        "data-testid": "yesterdays-answer-word"
                    }, v.createElement("span", {
                        className: b("check", {
                            checked: c.has(e)
                        })
                    }), v.createElement(Kn, {
                        value: e,
                        centerLetter: n,
                        isPangram: a.has(e)
                    }))
                }))))
            })
        }, function(e) {
            function t() {
                c(l.current.scrollTop + l.current.offsetHeight < l.current.scrollHeight)
            }
            var n = e.children,
                r = e.toggleModal,
                o = e.modalType,
                a = v.createElement("div", {
                    className: "sb-modal-top"
                }, v.createElement("div", {
                    role: "button",
                    className: "sb-modal-close",
                    onClick: function() {
                        return r()
                    }
                }, "×")),
                i = Er(v.useState(!1), 2),
                e = i[0],
                c = i[1],
                l = v.useRef();
            return v.useEffect(function() {
                return t(), l.current.addEventListener("scroll", t),
                    function() {
                        l.current.removeEventListener("scroll", t)
                    }
            }), v.createElement("div", {
                role: "button",
                className: b("sb-modal-frame", o),
                onClick: function(e) {
                    return e.stopPropagation()
                }
            }, a, v.createElement("div", {
                ref: l,
                className: b("sb-modal-content", {
                    "has-overflow": e
                })
            }, n))
        }, document.getElementById("portal-game-modals")),
        jr = kr.Modals,
        Nr = kr.ModalButton,
        Pr = e.connect(function(e) {
            return {
                score: Yt(e),
                ranks: Vt(e),
                rankIdx: Xt(e),
                rank: Jt(e)
            }
        })(function(e) {
            var t = e.score,
                n = e.rank,
                r = e.rankIdx,
                e = e.ranks;
            return v.createElement(Nr, {
                modal: "ranks",
                triggerName: "in-game"
            }, v.createElement("div", {
                className: "sb-progress",
                title: "Click to see today’s ranks"
            }, v.createElement("h4", {
                className: "sb-progress-rank"
            }, n), v.createElement("div", {
                className: "sb-progress-bar"
            }, v.createElement("div", {
                className: "sb-progress-line"
            }, v.createElement("div", {
                className: "sb-progress-dots"
            }, e.map(function(e, t) {
                return v.createElement("span", {
                    key: t,
                    className: b("sb-progress-dot", {
                        completed: t < r
                    })
                })
            }))), v.createElement("div", {
                className: b("sb-progress-marker", {
                    final: r === e.length - 1
                }),
                style: {
                    left: "".concat(r / (e.length - 1) * 100, "%")
                }
            }, v.createElement("span", {
                className: "sb-progress-value"
            }, t)))))
        }),
        _r = e.connect(function(e) {
            return {
                message: e.message
            }
        })(function(e) {
            e = e.message;
            return v.createElement("div", {
                className: b("sb-message-box", {
                    "error-message": e && e.isError,
                    "success-message": e && !e.isError,
                    "pangram-message": e && e.isPangram
                })
            }, e && v.createElement("span", {
                className: "sb-message"
            }, e.value), e && e.points && v.createElement("span", {
                className: "sb-message-points"
            }, "+", e.points))
        });
    y.mobileNavTools.create([{
        type: "text",
        value: "Help",
        action: function() {
            return Sr("help", "toolbar")
        }
    }, {
        type: "text",
        value: "Yesterday",
        action: function() {
            return Sr("yesterday", "toolbar")
        }
    }]);

    function Cr() {
        return g.isMobile ? null : m.createPortal(v.createElement(v.Fragment, null, v.createElement("div", null), v.createElement("div", null, v.createElement(Nr, {
            className: "pz-toolbar-button pz-toolbar-button__help",
            modal: "help",
            triggerName: "toolbar"
        }, "Help"), v.createElement(Nr, {
            className: "pz-toolbar-button pz-toolbar-button__yesterday",
            modal: "yesterday",
            triggerName: "toolbar"
        }, "Yesterday’s Answers"))), Tr)
    }
    var Tr = document.getElementById("portal-game-toolbar");

    function xr(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != n) {
                var r, o, a = [],
                    i = !0,
                    c = !1;
                try {
                    for (n = n.call(e); !(i = (r = n.next()).done) && (a.push(r.value), !t || a.length !== t); i = !0);
                } catch (e) {
                    c = !0, o = e
                } finally {
                    try {
                        i || null == n.return || n.return()
                    } finally {
                        if (c) throw o
                    }
                }
                return a
            }
        }(e, t) || function(e, t) {
            if (e) {
                if ("string" == typeof e) return Lr(e, t);
                var n = Object.prototype.toString.call(e).slice(8, -1);
                return "Map" === (n = "Object" === n && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Lr(e, t) : void 0
            }
        }(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Lr(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r
    }

    function Ar() {
        var e = xr(v.useState((null === (t = window.navigator) || void 0 === t ? void 0 : t.onLine) || !1), 2),
            t = e[0],
            n = e[1];
        return v.useEffect(function() {
            function e() {
                return n(!0)
            }

            function t() {
                return n(!1)
            }
            return window.addEventListener("online", e), window.addEventListener("offline", t),
                function() {
                    window.removeEventListener("online", e), window.removeEventListener("offline", t)
                }
        }, []), e = b("sb-offline-ticker", {
            "is-offline": !t
        }), v.createElement("div", {
            className: e,
            "aria-hidden": t
        }, "You're offline! Progress may not be saved.")
    }

    function Ir(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != n) {
                var r, o, a = [],
                    i = !0,
                    c = !1;
                try {
                    for (n = n.call(e); !(i = (r = n.next()).done) && (a.push(r.value), !t || a.length !== t); i = !0);
                } catch (e) {
                    c = !0, o = e
                } finally {
                    try {
                        i || null == n.return || n.return()
                    } finally {
                        if (c) throw o
                    }
                }
                return a
            }
        }(e, t) || function(e, t) {
            if (e) {
                if ("string" == typeof e) return Rr(e, t);
                var n = Object.prototype.toString.call(e).slice(8, -1);
                return "Map" === (n = "Object" === n && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rr(e, t) : void 0
            }
        }(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Rr(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r
    }

    function Mr() {
        var e = .01 * window.innerHeight;
        document.documentElement.style.setProperty("--vh", "".concat(e, "px"))
    }
    var zr = h(Mr, 100),
        Gn = e.connect(function(e) {
            var t = e.isExpandedWordlist,
                n = e.isLocked,
                r = e.userType;
            return {
                isExpandedWordlist: t,
                isLocked: n,
                hasCompleted: Zt(e),
                score: Yt(e),
                userType: r
            }
        }, function(t) {
            return {
                lockGame: function() {
                    return t(St())
                },
                unlockGame: function() {
                    return t(rn())
                },
                toggleWordlist: function() {
                    return t(kt())
                },
                updateUserType: function(e) {
                    return t({
                        type: Ft,
                        payload: e
                    })
                },
                getRemoteProgress: function(e) {
                    return t((r = e, function(t, e) {
                        var n = e(),
                            e = n.id,
                            n = n.yesterday;
                        it(e, r).then(function(e) {
                            e && t(jt(e))
                        }), it(n.id, r).then(function(e) {
                            e && t(Nt(e))
                        })
                    }));
                    var r
                },
                updateMoment: function(e) {
                    return t({
                        type: Kt,
                        payload: e
                    })
                }
            }
        })(function(e) {
            var t = e.isExpandedWordlist,
                n = e.userType,
                r = e.isLocked,
                o = e.lockGame,
                a = e.unlockGame,
                i = e.updateUserType,
                c = e.getRemoteProgress,
                l = e.toggleWordlist,
                u = e.updateMoment,
                s = v.useRef(),
                f = Ir(v.useState(!1), 2),
                e = f[0],
                m = f[1],
                d = v.useRef(t);
            v.useEffect(function() {
                d.current && !t && m(!0), d.current = t
            }, [t]);

            function p() {
                a(), y.mobileNavTools.activate()
            }
            return v.useEffect(function() {
                return window.isHybridWebView && window.NativeBridge ? (window.NativeBridge.gamesGetUserDetails().then(function(e) {
                        if (!e.success) throw new Error(e.error);
                        e = e.values.gamesGetUserDetails;
                        i({
                            isLoggedIn: e.isUserLoggedIn,
                            hasXwd: e.isSubscribed,
                            regiId: e.regiID,
                            nytsCookie: e.nytsCookie
                        })
                    }).catch(function(e) {
                        console.error("Getting user details failed", e)
                    }), window.NativeBridge.gamesInitializeState().then(function(e) {
                        if (!e.success) throw new Error(e.error);
                        e.values.gamesInitializeState.isReturningFromBackground ? (ft.load("game"), p()) : ft.load("loading")
                    }).catch(function(e) {
                        console.error("Failed to get initial state", e), ft.load("loading")
                    })) : ft.load("loading"), Mr(), window.addEventListener("resize", zr),
                    function() {
                        window.removeEventListener("resize", zr)
                    }
            }, []), v.useEffect(function() {
                if (window.isHybridWebView && window.NativeBridge) {
                    var e = function(e) {
                        "congrats" === ft.getCurrentMoment() ? (ft.transition("congrats", "game").then(p), e.respondWith({
                            gamesOnNavigateBack: !0
                        })) : (0, kr.getCurrentModal)() ? (Sr(), e.respondWith({
                            gamesOnNavigateBack: !0
                        })) : t ? (l(), e.respondWith({
                            gamesOnNavigateBack: !0
                        })) : e.respondWith({
                            gamesOnNavigateBack: !1
                        })
                    };
                    return window.NativeBridge.addEventListener("gamesOnNavigateBack", e),
                        function() {
                            window.NativeBridge.removeEventListener("gamesOnNavigateBack", e)
                        }
                }
            }, [t]), v.useEffect(function() {
                var e = n.nytsCookie;
                e && c(e)
            }, [n.nytsCookie]), v.createElement(v.Fragment, null, window.isHybridWebView && v.createElement(Ar, null), v.createElement("div", {
                className: b("sb-content-box", {
                    "sb-expanded": t,
                    "sb-contracting": e,
                    "sb-game-locked": r
                })
            }, v.createElement(Cr, null), v.createElement(st, {
                onEnter: u
            }), v.createElement(jr, {
                onOpen: function(e) {
                    o(), ge("".concat(we[e = e] || e))
                },
                onClose: p,
                initialModal: null
            }), v.createElement("div", {
                className: "sb-status-box"
            }, v.createElement("div", {
                className: "sb-progress-box"
            }, v.createElement(Pr, null)), v.createElement("div", {
                className: "sb-wordlist-box"
            }, v.createElement("div", {
                className: "sb-wordlist-heading"
            }, v.createElement(er, null)), v.createElement("div", {
                className: "sb-wordlist-drawer",
                onTransitionEnd: function() {
                    return m(!1)
                }
            }, v.createElement("div", {
                className: "sb-wordlist-window"
            }, v.createElement(Zn, null))))), v.createElement("div", {
                className: "sb-controls-box",
                ref: s
            }, v.createElement("div", {
                className: "sb-controls"
            }, v.createElement(_r, null), v.createElement(Yn, null), v.createElement(Hn, {
                boundingParentRef: s
            })))))
        }),
        En = document.getElementById("pz-game-root");
    m.render(v.createElement(e.Provider, {
        store: function(e) {
            var t = [i.applyMiddleware(a, xt, Tt)];
            window.__REDUX_DEVTOOLS_EXTENSION__ && t.push(window.__REDUX_DEVTOOLS_EXTENSION__());
            var n, r, o = i.createStore(Et, (r = (n = e).today, n = e.yesterday, vt(vt({}, r), {}, {
                input: [],
                foundWords: [],
                isExpandedWordlist: !1,
                isLocked: !0,
                message: null,
                yesterday: vt(vt({}, n), {}, {
                    foundWords: null
                }),
                userType: vt(vt({}, y.userType), {}, {
                    nytsCookie: null
                }),
                currentMoment: ""
            })), i.compose.apply(void 0, t));
            return ct(o, function(e) {
                return o.dispatch(jt(e))
            }, function(e) {
                return o.dispatch(Nt(e))
            }), o.dispatch(_t()), window.userType.inShortzMode && (window.cheat = function() {
                var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 1,
                    t = o.getState(),
                    n = t.answers,
                    r = t.foundWords;
                n.filter(function(e) {
                    return !r.includes(e)
                }).slice(0, e).forEach(function(e) {
                    return o.dispatch({
                        type: Dt,
                        payload: e
                    })
                })
            }, window.reset = function() {
                o.dispatch({
                    type: Gt
                })
            }), o
        }(y.getGameData())
    }, v.createElement(Gn, null)), En)
});
//# sourceMappingURL=spelling-bee.bf8c1d62d9ba40904593ed53e5d97530e987af80.js.map