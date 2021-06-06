(function (t) {
    this.SqlWhereParser = t();
}(function () {
    let t;
    return (function t (e, r, n) {
        function o (s, u) {
            if (!r[s]) {
                if (!e[s]) {
                    const c = false;
                    if (!u && c) return c(s, !0);
                    if (i) return i(s, !0);
                    const a = new Error("Cannot find module '" + s + "'");
                    throw a.code = 'MODULE_NOT_FOUND', a;
                }
                const f = r[s] = {
                    exports: {}
                };
                e[s][0].call(f.exports, function (t) {
                    const r = e[s][1][t];
                    return o(r || t);
                }, f, f.exports, t, e, r, n);
            }
            return r[s].exports;
        }
        for (let s = 0; s < n.length; s++) o(n[s]);
        return o;
    }({
        1: [function (t, e, r) {
            'use strict';

            function n (t, e) {
                if (!(t instanceof e)) throw new TypeError('Cannot call a class as a function');
            }

            function o (t, e, r) {
                return e in t
                    ? Object.defineProperty(t, e, {
                        value: r,
                        enumerable: !0,
                        configurable: !0,
                        writable: !0
                    })
                    : t[e] = r, t;
            }
            const i = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
                ? function (t) {
                    return typeof t;
                }
                : function (t) {
                    return t && typeof Symbol === 'function' && t.constructor === Symbol && t !== Symbol.prototype ? 'symbol' : typeof t;
                };
            const s = (function () {
                function t (t, e) {
                    for (let r = 0; r < e.length; r++) {
                        const n = e[r];
                        n.enumerable = n.enumerable || !1, n.configurable = !0, 'value' in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                    }
                }
                return function (e, r, n) {
                    return r && t(e.prototype, r), n && t(e, n), e;
                };
            }());
            const u = t('es6-symbol');
            const c = t('tokenize-this');
            const a = u('-');
            const f = 1;
            const l = 2;
            const p = 3;
            const h = o({}, a, f);
            const y = (function () {
                function t (e, r, o) {
                    n(this, t), this.value = e, this.type = r, this.precedence = o;
                }
                return s(t, [{
                    key: 'toJSON',
                    value: function () {
                        return this.value;
                    }
                }, {
                    key: 'toString',
                    value: function () {
                        return '' + this.value;
                    }
                }]), t;
            }());
            const d = (function () {
                function t (e) {
                    const r = this;
                    n(this, t), e || (e = {}), e = Object.assign({}, this.constructor.defaultConfig, e), this.tokenizer = new c(e.tokenizer), this.operators = {}, e.operators.forEach(function (t, e) {
                        Object.keys(t).concat(Object.getOwnPropertySymbols(t)).forEach(function (n) {
                            r.operators[n] = new y(n, t[n], e);
                        });
                    });
                }
                return s(t, [{
                    key: 'parse',
                    value: function (t, e) {
                        const r = this;
                        const n = [];
                        const o = [];
                        let i = void 0;
                        let s = 0;
                        let u = !1;
                        for (e || (e = this.defaultEvaluator), this.tokenizer.tokenize('(' + t + ')', function (t, c) {
                            if (s++, typeof t !== 'string' || c) o.push(t), u = !1;
                            else {
                                let f = t.toUpperCase();
                                if (r.operators[f]) {
                                    if (i === 'BETWEEN' && f === 'AND') return void (i = 'AND');
                                    for (f !== '-' || s !== 1 && !u || (f = a); n[n.length - 1] && n[n.length - 1] !== '(' && r.operatorPrecedenceFromValues(f, n[n.length - 1]);) {
                                        for (var l = r.operators[n.pop()], p = [], h = l.type; h--;) p.unshift(o.pop());
                                        o.push(e(l.value, p));
                                    }
                                    n.push(f), i = f, u = !0;
                                } else if (t === '(') n.push(t), u = !0;
                                else if (t === ')') {
                                    for (; n.length && n[n.length - 1] !== '(';) {
                                        for (var y = r.operators[n.pop()], d = [], m = y.type; m--;) d.unshift(o.pop());
                                        o.push(e(y.value, d));
                                    }
                                    if (!n.length) throw new SyntaxError('Unmatched parenthesis.');
                                    n.pop(), u = !1;
                                } else o.push(t), u = !1;
                            }
                        }); n.length;) {
                            const c = n.pop();
                            if (c === '(') throw new SyntaxError('Unmatched parenthesis.');
                            for (var f = this.operators[c], l = [], p = f.type; p--;) l.unshift(o.pop());
                            o.push(e(f.value, l));
                        }
                        if (o.length > 1) throw new SyntaxError('Could not reduce to a single expression.');
                        return o[0];
                    }
                }, {
                    key: 'toArray',
                    value: function (t) {
                        const e = this;
                        let r = [];
                        let n = 0;
                        let o = void 0;
                        const i = [];
                        for (this.tokenizer.tokenize('(' + t + ')', function (t, s) {
                            switch (n++, t) {
                                case '(':
                                    i.push(r.length);
                                    break;
                                case ')':
                                    for (var u = i.pop(), c = r.splice(u, r.length); c && c.constructor === Array && c.length === 1;) c = c[0];
                                    r.push(c);
                                    break;
                                case '':
                                    break;
                                case ',':
                                    break;
                                default:
                                    var f = null;
                                    s || (f = e.getOperator(t), t === '-' && (n === 1 || o === '(' || o && o.constructor === y) && (f = e.getOperator(a))), r.push(f || t);
                            }
                            o = t;
                        }); r && r.constructor === Array && r.length === 1;) r = r[0];
                        return r;
                    }
                }, {
                    key: 'operatorPrecedenceFromValues',
                    value: function (t, e) {
                        return this.operators[e].precedence <= this.operators[t].precedence;
                    }
                }, {
                    key: 'getOperator',
                    value: function (t) {
                        return typeof t === 'string' ? this.operators[t.toUpperCase()] : (typeof t === 'undefined' ? 'undefined' : i(t)) === 'symbol' ? this.operators[t] : null;
                    }
                }, {
                    key: 'defaultEvaluator',
                    value: function (t, e) {
                        return t === a && (t = '-'), t === ',' ? [].concat(e[0], e[1]) : o({}, t, e);
                    }
                }], [{
                    key: 'defaultConfig',
                    get: function () {
                        return {
                            operators: [{
                                '!': f
                            }, h, {
                                '^': l
                            }, {
                                '*': l,
                                '/': l,
                                '%': l
                            }, {
                                '+': l,
                                '-': l
                            }, {
                                '=': l,
                                '<': l,
                                '>': l,
                                '<=': l,
                                '>=': l,
                                '!=': l
                            }, {
                                ',': l
                            }, {
                                NOT: f
                            }, {
                                BETWEEN: p,
                                IN: l,
                                IS: l,
                                LIKE: l
                            }, {
                                AND: l
                            }, {
                                OR: l
                            }],
                            tokenizer: {
                                shouldTokenize: ['(', ')', ',', '*', '/', '%', '+', '-', '=', '!=', '!', '<', '>', '<=', '>=', '^'],
                                shouldMatch: ['"', "'", '`'],
                                shouldDelimitBy: [' ', '\n', '\r', '\t']
                            }
                        };
                    }
                }, {
                    key: 'Operator',
                    get: function () {
                        return y;
                    }
                }, {
                    key: 'OPERATOR_UNARY_MINUS',
                    get: function () {
                        return a;
                    }
                }]), t;
            }());
            e.exports = d;
        }, {
            'es6-symbol': 2,
            'tokenize-this': 20
        }],
        2: [function (t, e, r) {
            'use strict';
            e.exports = t('./is-implemented')() ? Symbol : t('./polyfill');
        }, {
            './is-implemented': 3,
            './polyfill': 18
        }],
        3: [function (t, e, r) {
            'use strict';
            const n = {
                object: !0,
                symbol: !0
            };
            e.exports = function () {
                let t;
                if (typeof Symbol !== 'function') return !1;
                t = Symbol('test symbol');
                try {
                    String(t);
                } catch (t) {
                    return !1;
                }
                return !!n[typeof Symbol.iterator] && (!!n[typeof Symbol.toPrimitive] && !!n[typeof Symbol.toStringTag]);
            };
        }, {}],
        4: [function (t, e, r) {
            'use strict';
            e.exports = function (t) {
                return !!t && (typeof t === 'symbol' || !!t.constructor && (t.constructor.name === 'Symbol' && t[t.constructor.toStringTag] === 'Symbol'));
            };
        }, {}],
        5: [function (t, e, r) {
            'use strict';
            let n;
            const o = t('es5-ext/object/assign');
            const i = t('es5-ext/object/normalize-options');
            const s = t('es5-ext/object/is-callable');
            const u = t('es5-ext/string/#/contains');
            n = e.exports = function (t, e) {
                let r, n, s, c, a;
                return arguments.length < 2 || typeof t !== 'string' ? (c = e, e = t, t = null) : c = arguments[2], t == null ? (r = s = !0, n = !1) : (r = u.call(t, 'c'), n = u.call(t, 'e'), s = u.call(t, 'w')), a = {
                    value: e,
                    configurable: r,
                    enumerable: n,
                    writable: s
                }, c ? o(i(c), a) : a;
            }, n.gs = function (t, e, r) {
                let n, c, a, f;
                return typeof t !== 'string' ? (a = r, r = e, e = t, t = null) : a = arguments[3], e == null ? e = void 0 : s(e) ? r == null ? r = void 0 : s(r) || (a = r, r = void 0) : (a = e, e = r = void 0), t == null ? (n = !0, c = !1) : (n = u.call(t, 'c'), c = u.call(t, 'e')), f = {
                    get: e,
                    set: r,
                    configurable: n,
                    enumerable: c
                }, a ? o(i(a), f) : f;
            };
        }, {
            'es5-ext/object/assign': 6,
            'es5-ext/object/is-callable': 9,
            'es5-ext/object/normalize-options': 13,
            'es5-ext/string/#/contains': 15
        }],
        6: [function (t, e, r) {
            'use strict';
            e.exports = t('./is-implemented')() ? Object.assign : t('./shim');
        }, {
            './is-implemented': 7,
            './shim': 8
        }],
        7: [function (t, e, r) {
            'use strict';
            e.exports = function () {
                let t;
                const e = Object.assign;
                return typeof e === 'function' && (t = {
                    foo: 'raz'
                }, e(t, {
                    bar: 'dwa'
                }, {
                    trzy: 'trzy'
                }), t.foo + t.bar + t.trzy === 'razdwatrzy');
            };
        }, {}],
        8: [function (t, e, r) {
            'use strict';
            const n = t('../keys');
            const o = t('../valid-value');
            const i = Math.max;
            e.exports = function (t, e) {
                let r;
                let s;
                let u;
                const c = i(arguments.length, 2);
                for (t = Object(o(t)), u = function (n) {
                    try {
                        t[n] = e[n];
                    } catch (t) {
                        r || (r = t);
                    }
                }, s = 1; s < c; ++s) e = arguments[s], n(e).forEach(u);
                if (void 0 !== r) throw r;
                return t;
            };
        }, {
            '../keys': 10,
            '../valid-value': 14
        }],
        9: [function (t, e, r) {
            'use strict';
            e.exports = function (t) {
                return typeof t === 'function';
            };
        }, {}],
        10: [function (t, e, r) {
            'use strict';
            e.exports = t('./is-implemented')() ? Object.keys : t('./shim');
        }, {
            './is-implemented': 11,
            './shim': 12
        }],
        11: [function (t, e, r) {
            'use strict';
            e.exports = function () {
                try {
                    return Object.keys('primitive'), !0;
                } catch (t) {
                    return !1;
                }
            };
        }, {}],
        12: [function (t, e, r) {
            'use strict';
            const n = Object.keys;
            e.exports = function (t) {
                return n(t == null ? t : Object(t));
            };
        }, {}],
        13: [function (t, e, r) {
            'use strict';
            const n = Array.prototype.forEach;
            const o = Object.create;
            const i = function (t, e) {
                let r;
                for (r in t) e[r] = t[r];
            };
            e.exports = function (t) {
                const e = o(null);
                return n.call(arguments, function (t) {
                    t != null && i(Object(t), e);
                }), e;
            };
        }, {}],
        14: [function (t, e, r) {
            'use strict';
            e.exports = function (t) {
                if (t == null) throw new TypeError('Cannot use null or undefined');
                return t;
            };
        }, {}],
        15: [function (t, e, r) {
            'use strict';
            e.exports = t('./is-implemented')() ? String.prototype.contains : t('./shim');
        }, {
            './is-implemented': 16,
            './shim': 17
        }],
        16: [function (t, e, r) {
            'use strict';
            const n = 'razdwatrzy';
            e.exports = function () {
                return typeof n.contains === 'function' && (n.contains('dwa') === !0 && n.contains('foo') === !1);
            };
        }, {}],
        17: [function (t, e, r) {
            'use strict';
            const n = String.prototype.indexOf;
            e.exports = function (t) {
                return n.call(this, t, arguments[1]) > -1;
            };
        }, {}],
        18: [function (t, e, r) {
            'use strict';
            let n;
            let o;
            let i;
            let s;
            const u = t('d');
            const c = t('./validate-symbol');
            const a = Object.create;
            const f = Object.defineProperties;
            const l = Object.defineProperty;
            const p = Object.prototype;
            const h = a(null);
            if (typeof Symbol === 'function') {
                n = Symbol;
                try {
                    String(n()), s = !0;
                } catch (t) {}
            }
            const y = (function () {
                const t = a(null);
                return function (e) {
                    for (var r, n, o = 0; t[e + (o || '')];) ++o;
                    return e += o || '', t[e] = !0, r = '@@' + e, l(p, r, u.gs(null, function (t) {
                        n || (n = !0, l(this, r, u(t)), n = !1);
                    })), r;
                };
            }());
            i = function (t) {
                if (this instanceof i) throw new TypeError('TypeError: Symbol is not a constructor');
                return o(t);
            }, e.exports = o = function t (e) {
                let r;
                if (this instanceof t) throw new TypeError('TypeError: Symbol is not a constructor');
                return s
                    ? n(e)
                    : (r = a(i.prototype), e = void 0 === e ? '' : String(e), f(r, {
                            __description__: u('', e),
                            __name__: u('', y(e))
                        }));
            }, f(o, {
                for: u(function (t) {
                    return h[t] ? h[t] : h[t] = o(String(t));
                }),
                keyFor: u(function (t) {
                    let e;
                    c(t);
                    for (e in h) { if (h[e] === t) return e; }
                }),
                hasInstance: u('', n && n.hasInstance || o('hasInstance')),
                isConcatSpreadable: u('', n && n.isConcatSpreadable || o('isConcatSpreadable')),
                iterator: u('', n && n.iterator || o('iterator')),
                match: u('', n && n.match || o('match')),
                replace: u('', n && n.replace || o('replace')),
                search: u('', n && n.search || o('search')),
                species: u('', n && n.species || o('species')),
                split: u('', n && n.split || o('split')),
                toPrimitive: u('', n && n.toPrimitive || o('toPrimitive')),
                toStringTag: u('', n && n.toStringTag || o('toStringTag')),
                unscopables: u('', n && n.unscopables || o('unscopables'))
            }), f(i.prototype, {
                constructor: u(o),
                toString: u('', function () {
                    return this.__name__;
                })
            }), f(o.prototype, {
                toString: u(function () {
                    return 'Symbol (' + c(this).__description__ + ')';
                }),
                valueOf: u(function () {
                    return c(this);
                })
            }), l(o.prototype, o.toPrimitive, u('', function () {
                const t = c(this);
                return typeof t === 'symbol' ? t : t.toString();
            })), l(o.prototype, o.toStringTag, u('c', 'Symbol')), l(i.prototype, o.toStringTag, u('c', o.prototype[o.toStringTag])), l(i.prototype, o.toPrimitive, u('c', o.prototype[o.toPrimitive]));
        }, {
            './validate-symbol': 19,
            d: 5
        }],
        19: [function (t, e, r) {
            'use strict';
            const n = t('./is-symbol');
            e.exports = function (t) {
                if (!n(t)) throw new TypeError(t + ' is not a symbol');
                return t;
            };
        }, {
            './is-symbol': 4
        }],
        20: [function (e, r, n) {
            (function (o) {
                (function (e) {
                    if (typeof n === 'object' && typeof r !== 'undefined') r.exports = e();
                    else if (typeof t === 'function' && t.amd) t([], e);
                    else {
                        let i;
                        i = typeof window !== 'undefined' ? window : typeof o !== 'undefined' ? o : typeof self !== 'undefined' ? self : this, i.TokenizeThis = e();
                    }
                }(function () {
                    return (function t (r, n, o) {
                        function i (u, c) {
                            if (!n[u]) {
                                if (!r[u]) {
                                    const a = typeof e === 'function' && e;
                                    if (!c && a) return a(u, !0);
                                    if (s) return s(u, !0);
                                    const f = new Error("Cannot find module '" + u + "'");
                                    throw f.code = 'MODULE_NOT_FOUND', f;
                                }
                                const l = n[u] = {
                                    exports: {}
                                };
                                r[u][0].call(l.exports, function (t) {
                                    const e = r[u][1][t];
                                    return i(e || t);
                                }, l, l.exports, t, r, n, o);
                            }
                            return n[u].exports;
                        }
                        for (var s = typeof e === 'function' && e, u = 0; u < o.length; u++) i(o[u]);
                        return i;
                    }({
                        1: [function (t, e, r) {
                            'use strict';

                            function n (t, e) {
                                if (!(t instanceof e)) throw new TypeError('Cannot call a class as a function');
                            }
                            const o = (function () {
                                function t (t, e) {
                                    for (let r = 0; r < e.length; r++) {
                                        const n = e[r];
                                        n.enumerable = n.enumerable || !1, n.configurable = !0, 'value' in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
                                    }
                                }
                                return function (e, r, n) {
                                    return r && t(e.prototype, r), n && t(e, n), e;
                                };
                            }());
                            const i = 'modeNone';
                            const s = 'modeDefault';
                            const u = 'modeMatch';
                            const c = function (t, e) {
                                return t.length > e.length ? -1 : t.length < e.length ? 1 : 0;
                            };
                            const a = (function () {
                                function t (e, r, o) {
                                    n(this, t), this.factory = e, this.str = r, this.forEachToken = o, this.previousChr = '', this.toMatch = '', this.currentToken = '', this.modeStack = [i];
                                }
                                return o(t, [{
                                    key: 'getCurrentMode',
                                    value: function () {
                                        return this.modeStack[this.modeStack.length - 1];
                                    }
                                }, {
                                    key: 'setCurrentMode',
                                    value: function (t) {
                                        return this.modeStack.push(t);
                                    }
                                }, {
                                    key: 'completeCurrentMode',
                                    value: function () {
                                        const t = this.getCurrentMode();
                                        return t === s && this.pushDefaultModeTokenizables(), (t === u && this.currentToken === '' || this.currentToken !== '') && this.push(this.currentToken), this.currentToken = '', this.modeStack.pop();
                                    }
                                }, {
                                    key: 'push',
                                    value: function (t) {
                                        let e = '';
                                        if (this.factory.convertLiterals && this.getCurrentMode() !== u) {
                                            switch (t.toLowerCase()) {
                                                case 'null':
                                                    t = null;
                                                    break;
                                                case 'true':
                                                    t = !0;
                                                    break;
                                                case 'false':
                                                    t = !1;
                                                    break;
                                                default:
                                                    isFinite(t) && (t = Number(t));
                                            }
                                        } else e = this.toMatch;
                                        this.forEachToken && this.forEachToken(t, e);
                                    }
                                }, {
                                    key: 'tokenize',
                                    value: function () {
                                        for (let t = 0; t < this.str.length;) this.consume(this.str.charAt(t++));
                                        for (; this.getCurrentMode() !== i;) this.completeCurrentMode();
                                    }
                                }, {
                                    key: 'consume',
                                    value: function (t) {
                                        this[this.getCurrentMode()](t), this.previousChr = t;
                                    }
                                }, {
                                    key: i,
                                    value: function (t) {
                                        return this.factory.matchMap[t] ? (this.setCurrentMode(u), void (this.toMatch = t)) : (this.setCurrentMode(s), this.consume(t));
                                    }
                                }, {
                                    key: s,
                                    value: function (t) {
                                        return this.factory.delimiterMap[t] ? this.completeCurrentMode() : this.factory.matchMap[t] ? (this.completeCurrentMode(), this.consume(t)) : (this.currentToken += t, this.currentToken);
                                    }
                                }, {
                                    key: 'pushDefaultModeTokenizables',
                                    value: function () {
                                        for (var t = 0, e = 1 / 0, r = null; this.currentToken && t < this.factory.tokenizeList.length;) {
                                            const n = this.factory.tokenizeList[t++];
                                            const o = this.currentToken.indexOf(n);
                                            o !== -1 && o < e && (e = o, r = n);
                                        }
                                        if (r) return e > 0 && this.push(this.currentToken.substring(0, e)), e !== -1 ? (this.push(r), this.currentToken = this.currentToken.substring(e + r.length), this.pushDefaultModeTokenizables()) : void 0;
                                    }
                                }, {
                                    key: u,
                                    value: function (t) {
                                        if (t === this.toMatch) {
                                            if (this.previousChr !== this.factory.escapeCharacter) return this.completeCurrentMode();
                                            this.currentToken = this.currentToken.substring(0, this.currentToken.length - 1);
                                        }
                                        return this.currentToken += t, this.currentToken;
                                    }
                                }]), t;
                            }());
                            const f = (function () {
                                function t (e) {
                                    const r = this;
                                    n(this, t), e || (e = {}), e = Object.assign({}, this.constructor.defaultConfig, e), this.convertLiterals = e.convertLiterals, this.escapeCharacter = e.escapeCharacter, this.tokenizeList = [], this.tokenizeMap = {}, this.matchList = [], this.matchMap = {}, this.delimiterList = [], this.delimiterMap = {}, e.shouldTokenize.sort(c).forEach(function (t) {
                                        r.tokenizeMap[t] || (r.tokenizeList.push(t), r.tokenizeMap[t] = t);
                                    }), e.shouldMatch.forEach(function (t) {
                                        r.matchMap[t] || (r.matchList.push(t), r.matchMap[t] = t);
                                    }), e.shouldDelimitBy.forEach(function (t) {
                                        r.delimiterMap[t] || (r.delimiterList.push(t), r.delimiterMap[t] = t);
                                    });
                                }
                                return o(t, [{
                                    key: 'tokenize',
                                    value: function (t, e) {
                                        const r = new a(this, t, e);
                                        return r.tokenize();
                                    }
                                }], [{
                                    key: 'defaultConfig',
                                    get: function () {
                                        return {
                                            shouldTokenize: ['(', ')', ',', '*', '/', '%', '+', '-', '=', '!=', '!', '<', '>', '<=', '>=', '^'],
                                            shouldMatch: ['"', "'", '`'],
                                            shouldDelimitBy: [' ', '\n', '\r', '\t'],
                                            convertLiterals: !0,
                                            escapeCharacter: '\\'
                                        };
                                    }
                                }]), t;
                            }());
                            e.exports = f;
                        }, {}]
                    }, {}, [1]))(1);
                }));
            }).call({});
        }, {}]
    }, {}, [1]))(1);
}));
