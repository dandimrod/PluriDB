module.exports = function (db, JSON2) {
    // https://github.com/shaunpersad/sql-where-parser/blob/master/sql-where-parser.min.js
    // This is important since currently exports work like this on modules, will be reworked
    (() => {
        // eslint-disable-next-line
        return (function(t){this.SqlWhereParser=t()})(function(){let t;return function t(e,r,n){function o(s,u){if(!r[s]){if(!e[s]){const c=false;if(!u&&c)return c(s,!0);if(i)return i(s,!0);const a=new Error("Cannot find module '"+s+"'");throw a.code="MODULE_NOT_FOUND",a}const f=r[s]={exports:{}};e[s][0].call(f.exports,function(t){const r=e[s][1][t];return o(r||t)},f,f.exports,t,e,r,n)}return r[s].exports}for(let s=0;s<n.length;s++)o(n[s]);return o}({1:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}const i=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol==="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};const s=function(){function t(t,e){for(let r=0;r<e.length;r++){const n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}();const u=t("es6-symbol");const c=t("tokenize-this");const a=u("-");const f=1;const l=2;const p=3;const h=o({},a,f);const y=function(){function t(e,r,o){n(this,t),this.value=e,this.type=r,this.precedence=o}return s(t,[{key:"toJSON",value:function(){return this.value}},{key:"toString",value:function(){return""+this.value}}]),t}();const d=function(){function t(e){const r=this;n(this,t),e||(e={}),e=Object.assign({},this.constructor.defaultConfig,e),this.tokenizer=new c(e.tokenizer),this.operators={},e.operators.forEach(function(t,e){Object.keys(t).concat(Object.getOwnPropertySymbols(t)).forEach(function(n){r.operators[n]=new y(n,t[n],e)})})}return s(t,[{key:"parse",value:function(t,e){const r=this;const n=[];const o=[];let i=void 0;let s=0;let u=!1;for(e||(e=this.defaultEvaluator),this.tokenizer.tokenize("("+t+")",function(t,c){if(s++,typeof t!=="string"||c)o.push(t),u=!1;else{let f=t.toUpperCase();if(r.operators[f]){if(i==="BETWEEN"&&f==="AND")return void(i="AND");for(f!=="-"||s!==1&&!u||(f=a);n[n.length-1]&&n[n.length-1]!=="("&&r.operatorPrecedenceFromValues(f,n[n.length-1]);){for(var l=r.operators[n.pop()],p=[],h=l.type;h--;)p.unshift(o.pop());o.push(e(l.value,p))}n.push(f),i=f,u=!0}else if(t==="(")n.push(t),u=!0;else if(t===")"){for(;n.length&&n[n.length-1]!=="(";){for(var y=r.operators[n.pop()],d=[],m=y.type;m--;)d.unshift(o.pop());o.push(e(y.value,d))}if(!n.length)throw new SyntaxError("Unmatched parenthesis.");n.pop(),u=!1}else o.push(t),u=!1}});n.length;){const c=n.pop();if(c==="(")throw new SyntaxError("Unmatched parenthesis.");for(var f=this.operators[c],l=[],p=f.type;p--;)l.unshift(o.pop());o.push(e(f.value,l))}if(o.length>1)throw new SyntaxError("Could not reduce to a single expression.");return o[0]}},{key:"toArray",value:function(t){const e=this;let r=[];let n=0;let o=void 0;const i=[];for(this.tokenizer.tokenize("("+t+")",function(t,s){switch(n++,t){case"(":i.push(r.length);break;case")":for(var u=i.pop(),c=r.splice(u,r.length);c&&c.constructor===Array&&c.length===1;)c=c[0];r.push(c);break;case"":break;case",":break;default:var f=null;s||(f=e.getOperator(t),t==="-"&&(n===1||o==="("||o&&o.constructor===y)&&(f=e.getOperator(a))),r.push(f||t)}o=t});r&&r.constructor===Array&&r.length===1;)r=r[0];return r}},{key:"operatorPrecedenceFromValues",value:function(t,e){return this.operators[e].precedence<=this.operators[t].precedence}},{key:"getOperator",value:function(t){return typeof t==="string"?this.operators[t.toUpperCase()]:(typeof t==="undefined"?"undefined":i(t))==="symbol"?this.operators[t]:null}},{key:"defaultEvaluator",value:function(t,e){return t===a&&(t="-"),t===","?[].concat(e[0],e[1]):o({},t,e)}}],[{key:"defaultConfig",get:function(){return{operators:[{"!":f},h,{"^":l},{"*":l,"/":l,"%":l},{"+":l,"-":l},{"=":l,"<":l,">":l,"<=":l,">=":l,"!=":l},{",":l},{NOT:f},{BETWEEN:p,IN:l,IS:l,LIKE:l},{AND:l},{OR:l}],tokenizer:{shouldTokenize:["(",")",",","*","/","%","+","-","=","!=","!","<",">","<=",">=","^"],shouldMatch:['"',"'","`"],shouldDelimitBy:[" ","\n","\r","\t"]}}}},{key:"Operator",get:function(){return y}},{key:"OPERATOR_UNARY_MINUS",get:function(){return a}}]),t}();e.exports=d},{"es6-symbol":2,"tokenize-this":20}],2:[function(t,e,r){"use strict";e.exports=t("./is-implemented")()?Symbol:t("./polyfill")},{"./is-implemented":3,"./polyfill":18}],3:[function(t,e,r){"use strict";const n={object:!0,symbol:!0};e.exports=function(){let t;if(typeof Symbol!=="function")return!1;t=Symbol("test symbol");try{String(t)}catch(t){return!1}return!!n[typeof Symbol.iterator]&&(!!n[typeof Symbol.toPrimitive]&&!!n[typeof Symbol.toStringTag])}},{}],4:[function(t,e,r){"use strict";e.exports=function(t){return!!t&&(typeof t==="symbol"||!!t.constructor&&(t.constructor.name==="Symbol"&&t[t.constructor.toStringTag]==="Symbol"))}},{}],5:[function(t,e,r){"use strict";let n;const o=t("es5-ext/object/assign");const i=t("es5-ext/object/normalize-options");const s=t("es5-ext/object/is-callable");const u=t("es5-ext/string/#/contains");n=e.exports=function(t,e){let r,n,s,c,a;return arguments.length<2||typeof t!=="string"?(c=e,e=t,t=null):c=arguments[2],t==null?(r=s=!0,n=!1):(r=u.call(t,"c"),n=u.call(t,"e"),s=u.call(t,"w")),a={value:e,configurable:r,enumerable:n,writable:s},c?o(i(c),a):a},n.gs=function(t,e,r){let n,c,a,f;return typeof t!=="string"?(a=r,r=e,e=t,t=null):a=arguments[3],e==null?e=void 0:s(e)?r==null?r=void 0:s(r)||(a=r,r=void 0):(a=e,e=r=void 0),t==null?(n=!0,c=!1):(n=u.call(t,"c"),c=u.call(t,"e")),f={get:e,set:r,configurable:n,enumerable:c},a?o(i(a),f):f}},{"es5-ext/object/assign":6,"es5-ext/object/is-callable":9,"es5-ext/object/normalize-options":13,"es5-ext/string/#/contains":15}],6:[function(t,e,r){"use strict";e.exports=t("./is-implemented")()?Object.assign:t("./shim")},{"./is-implemented":7,"./shim":8}],7:[function(t,e,r){"use strict";e.exports=function(){let t;const e=Object.assign;return typeof e==="function"&&(t={foo:"raz"},e(t,{bar:"dwa"},{trzy:"trzy"}),t.foo+t.bar+t.trzy==="razdwatrzy")}},{}],8:[function(t,e,r){"use strict";const n=t("../keys");const o=t("../valid-value");const i=Math.max;e.exports=function(t,e){let r;let s;let u;const c=i(arguments.length,2);for(t=Object(o(t)),u=function(n){try{t[n]=e[n]}catch(t){r||(r=t)}},s=1;s<c;++s)e=arguments[s],n(e).forEach(u);if(void 0!==r)throw r;return t}},{"../keys":10,"../valid-value":14}],9:[function(t,e,r){"use strict";e.exports=function(t){return typeof t==="function"}},{}],10:[function(t,e,r){"use strict";e.exports=t("./is-implemented")()?Object.keys:t("./shim")},{"./is-implemented":11,"./shim":12}],11:[function(t,e,r){"use strict";e.exports=function(){try{return Object.keys("primitive"),!0}catch(t){return!1}}},{}],12:[function(t,e,r){"use strict";const n=Object.keys;e.exports=function(t){return n(t==null?t:Object(t))}},{}],13:[function(t,e,r){"use strict";const n=Array.prototype.forEach;const o=Object.create;const i=function(t,e){let r;for(r in t)e[r]=t[r]};e.exports=function(t){const e=o(null);return n.call(arguments,function(t){t!=null&&i(Object(t),e)}),e}},{}],14:[function(t,e,r){"use strict";e.exports=function(t){if(t==null)throw new TypeError("Cannot use null or undefined");return t}},{}],15:[function(t,e,r){"use strict";e.exports=t("./is-implemented")()?String.prototype.contains:t("./shim")},{"./is-implemented":16,"./shim":17}],16:[function(t,e,r){"use strict";const n="razdwatrzy";e.exports=function(){return typeof n.contains==="function"&&(n.contains("dwa")===!0&&n.contains("foo")===!1)}},{}],17:[function(t,e,r){"use strict";const n=String.prototype.indexOf;e.exports=function(t){return n.call(this,t,arguments[1])>-1}},{}],18:[function(t,e,r){"use strict";let n;let o;let i;let s;const u=t("d");const c=t("./validate-symbol");const a=Object.create;const f=Object.defineProperties;const l=Object.defineProperty;const p=Object.prototype;const h=a(null);if(typeof Symbol==="function"){n=Symbol;try{String(n()),s=!0}catch(t){}}const y=function(){const t=a(null);return function(e){for(var r,n,o=0;t[e+(o||"")];)++o;return e+=o||"",t[e]=!0,r="@@"+e,l(p,r,u.gs(null,function(t){n||(n=!0,l(this,r,u(t)),n=!1)})),r}}();i=function(t){if(this instanceof i)throw new TypeError("TypeError: Symbol is not a constructor");return o(t)},e.exports=o=function t(e){let r;if(this instanceof t)throw new TypeError("TypeError: Symbol is not a constructor");return s?n(e):(r=a(i.prototype),e=void 0===e?"":String(e),f(r,{__description__:u("",e),__name__:u("",y(e))}))},f(o,{for:u(function(t){return h[t]?h[t]:h[t]=o(String(t))}),keyFor:u(function(t){let e;c(t);for(e in h){if(h[e]===t)return e}}),hasInstance:u("",n&&n.hasInstance||o("hasInstance")),isConcatSpreadable:u("",n&&n.isConcatSpreadable||o("isConcatSpreadable")),iterator:u("",n&&n.iterator||o("iterator")),match:u("",n&&n.match||o("match")),replace:u("",n&&n.replace||o("replace")),search:u("",n&&n.search||o("search")),species:u("",n&&n.species||o("species")),split:u("",n&&n.split||o("split")),toPrimitive:u("",n&&n.toPrimitive||o("toPrimitive")),toStringTag:u("",n&&n.toStringTag||o("toStringTag")),unscopables:u("",n&&n.unscopables||o("unscopables"))}),f(i.prototype,{constructor:u(o),toString:u("",function(){return this.__name__})}),f(o.prototype,{toString:u(function(){return"Symbol ("+c(this).__description__+")"}),valueOf:u(function(){return c(this)})}),l(o.prototype,o.toPrimitive,u("",function(){const t=c(this);return typeof t==="symbol"?t:t.toString()})),l(o.prototype,o.toStringTag,u("c","Symbol")),l(i.prototype,o.toStringTag,u("c",o.prototype[o.toStringTag])),l(i.prototype,o.toPrimitive,u("c",o.prototype[o.toPrimitive]))},{"./validate-symbol":19,d:5}],19:[function(t,e,r){"use strict";const n=t("./is-symbol");e.exports=function(t){if(!n(t))throw new TypeError(t+" is not a symbol");return t}},{"./is-symbol":4}],20:[function(e,r,n){(function(o){(function(e){if(typeof n==="object"&&typeof r!=="undefined")r.exports=e();else if(typeof t==="function"&&t.amd)t([],e);else{let i;i=typeof window!=="undefined"?window:typeof o!=="undefined"?o:typeof self!=="undefined"?self:this,i.TokenizeThis=e()}})(function(){return function t(r,n,o){function i(u,c){if(!n[u]){if(!r[u]){const a=typeof e==="function"&&e;if(!c&&a)return a(u,!0);if(s)return s(u,!0);const f=new Error("Cannot find module '"+u+"'");throw f.code="MODULE_NOT_FOUND",f}const l=n[u]={exports:{}};r[u][0].call(l.exports,function(t){const e=r[u][1][t];return i(e||t)},l,l.exports,t,r,n,o)}return n[u].exports}for(var s=typeof e==="function"&&e,u=0;u<o.length;u++)i(o[u]);return i}({1:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}const o=function(){function t(t,e){for(let r=0;r<e.length;r++){const n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}();const i="modeNone";const s="modeDefault";const u="modeMatch";const c=function(t,e){return t.length>e.length?-1:t.length<e.length?1:0};const a=function(){function t(e,r,o){n(this,t),this.factory=e,this.str=r,this.forEachToken=o,this.previousChr="",this.toMatch="",this.currentToken="",this.modeStack=[i]}return o(t,[{key:"getCurrentMode",value:function(){return this.modeStack[this.modeStack.length-1]}},{key:"setCurrentMode",value:function(t){return this.modeStack.push(t)}},{key:"completeCurrentMode",value:function(){const t=this.getCurrentMode();return t===s&&this.pushDefaultModeTokenizables(),(t===u&&this.currentToken===""||this.currentToken!=="")&&this.push(this.currentToken),this.currentToken="",this.modeStack.pop()}},{key:"push",value:function(t){let e="";if(this.factory.convertLiterals&&this.getCurrentMode()!==u){switch(t.toLowerCase()){case"null":t=null;break;case"true":t=!0;break;case"false":t=!1;break;default:isFinite(t)&&(t=Number(t))}}else e=this.toMatch;this.forEachToken&&this.forEachToken(t,e)}},{key:"tokenize",value:function(){for(let t=0;t<this.str.length;)this.consume(this.str.charAt(t++));for(;this.getCurrentMode()!==i;)this.completeCurrentMode()}},{key:"consume",value:function(t){this[this.getCurrentMode()](t),this.previousChr=t}},{key:i,value:function(t){return this.factory.matchMap[t]?(this.setCurrentMode(u),void(this.toMatch=t)):(this.setCurrentMode(s),this.consume(t))}},{key:s,value:function(t){return this.factory.delimiterMap[t]?this.completeCurrentMode():this.factory.matchMap[t]?(this.completeCurrentMode(),this.consume(t)):(this.currentToken+=t,this.currentToken)}},{key:"pushDefaultModeTokenizables",value:function(){for(var t=0,e=1/0,r=null;this.currentToken&&t<this.factory.tokenizeList.length;){const n=this.factory.tokenizeList[t++];const o=this.currentToken.indexOf(n);o!==-1&&o<e&&(e=o,r=n)}if(r)return e>0&&this.push(this.currentToken.substring(0,e)),e!==-1?(this.push(r),this.currentToken=this.currentToken.substring(e+r.length),this.pushDefaultModeTokenizables()):void 0}},{key:u,value:function(t){if(t===this.toMatch){if(this.previousChr!==this.factory.escapeCharacter)return this.completeCurrentMode();this.currentToken=this.currentToken.substring(0,this.currentToken.length-1)}return this.currentToken+=t,this.currentToken}}]),t}();const f=function(){function t(e){const r=this;n(this,t),e||(e={}),e=Object.assign({},this.constructor.defaultConfig,e),this.convertLiterals=e.convertLiterals,this.escapeCharacter=e.escapeCharacter,this.tokenizeList=[],this.tokenizeMap={},this.matchList=[],this.matchMap={},this.delimiterList=[],this.delimiterMap={},e.shouldTokenize.sort(c).forEach(function(t){r.tokenizeMap[t]||(r.tokenizeList.push(t),r.tokenizeMap[t]=t)}),e.shouldMatch.forEach(function(t){r.matchMap[t]||(r.matchList.push(t),r.matchMap[t]=t)}),e.shouldDelimitBy.forEach(function(t){r.delimiterMap[t]||(r.delimiterList.push(t),r.delimiterMap[t]=t)})}return o(t,[{key:"tokenize",value:function(t,e){const r=new a(this,t,e);return r.tokenize()}}],[{key:"defaultConfig",get:function(){return{shouldTokenize:["(",")",",","*","/","%","+","-","=","!=","!","<",">","<=",">=","^"],shouldMatch:['"',"'","`"],shouldDelimitBy:[" ","\n","\r","\t"],convertLiterals:!0,escapeCharacter:"\\"}}}]),t}();e.exports=f},{}]},{},[1])(1)})}).call({})},{}]},{},[1])(1)});
    })();

    const PDBSQLParser = {
        parseText: async function (text) {
            // Delete all comments
            text = text.replace(/(?:\/\*(?:.|\n)*?\*\/|--.*)/g, '');

            let lines = text.split(';');
            lines = lines.map((line) => { return line.replace(/\n/g, ' ').trim(); });
            lines = lines.filter((line) => { return line.trim().length !== 0; });
            const result = [];
            for (let index = 0; index < lines.length; index++) {
                const line = lines[index];
                result[index] = await this.parseCommand(line);
            }
            return result;
        },
        parseCommand: async function (line) {
            let result;
            try {
                const queryArray = line.split(/\s+/g);
                if (queryArray[0].toLowerCase() !== 'end') {
                    if (db.utils.checkTransaction()) {
                        return db.utils.checkTransaction();
                    }
                }
                if (this.commands[queryArray[0].toLowerCase()] && queryArray[0].toLowerCase() !== 'utils') {
                    result = await this.commands[queryArray[0].toLowerCase()](line);
                } else {
                    result = { error: 'Operation not supported' };
                }
            } catch (error) {
                result = { error: 'Unexpected error' };
            }
            if (result.error) {
                db.utils.sendError();
            }
            return result;
        },
        commands: {
            // Post query processing
            // In database join processing
            select: async function (query) {
                const parsedQuery = /^select\s+(distint\s+)?(.*)\s+?from\s+(.*)$/i.exec(query);
                if (parsedQuery === null) {
                    return { error: 'Query malformed' };
                }
                const distint = !!parsedQuery[1];
                const columnList = parsedQuery[2].trim() === '*' ? true : parsedQuery[2].split(',').map(PDBSQLParser.commands.utils.columnParserSelect);
                const params = PDBSQLParser.commands.utils.splitter(parsedQuery[3], ['order by', 'join', 'where', 'limit', 'offset'], 'from');
                if (params.from) {
                    params.from = PDBSQLParser.commands.utils.trimString(params.from);
                } else {
                    return { error: 'No table detected' };
                }
                if (params['order by']) {
                    params['order by'] = params['order by'].split(',').map((column) => {
                        column = column.trim();
                        if (column.match(/desc$/i)) {
                            return { desc: true, column: PDBSQLParser.commands.utils.columnParserSelect(column.slice(0, -4).trim()) };
                        }
                        if (column.match(/asc$/i)) {
                            return { desc: false, column: PDBSQLParser.commands.utils.columnParserSelect(column.slice(0, -3).trim()) };
                        }
                        return { desc: true, column: PDBSQLParser.commands.utils.columnParserSelect(column) };
                    });
                }
                if (params.join) {
                    params.join = PDBSQLParser.commands.utils.join(params.join);
                }
                if (params.where) {
                    params.where = PDBSQLParser.commands.utils.where(params.where.trim(), params.from, params.join);
                }
                if (params.limit) {
                    params.limit = Number(params.limit.trim());
                }
                if (params.offset) {
                    params.offset = Number(params.offset.trim());
                }
                const queryResult = await db.data.getData(params.from, params.where, params.join);
                if (queryResult.error) {
                    return queryResult;
                }
                queryResult.result = Object.values(queryResult.result);
                if (columnList !== true) {
                    queryResult.result = queryResult.result.map((values) => {
                        const result = {};
                        columnList.forEach((column) => {
                            switch (column.type) {
                                case 'column':
                                    result[column.column] = values[column.column];
                                    break;
                                case 'compound':
                                    if (column.table === params.from) {
                                        result[column.column] = values[column.column];
                                    } else {
                                        const myJoin = params.join.find((join) => join.foreingTable === column.table);
                                        result[myJoin.column + '.' + column.column] = values[myJoin.column][myJoin.foreingColumn];
                                    }
                                    break;
                                case 'function':
                                    switch (column.exec.toLowerCase()) {
                                        case 'count':
                                            result[column.exec + '(' + column.column + ')'] = queryResult.result.length;
                                            break;
                                        case 'avg':
                                            result[column.exec + '(' + column.column + ')'] = queryResult.result.reduce((ac, col) => ac + col[column.column]) / queryResult.result.length;
                                            break;
                                        case 'sum':
                                            result[column.exec + '(' + column.column + ')'] = queryResult.result.reduce((ac, col) => ac + col[column.column]);
                                            break;
                                        case 'min':
                                            result[column.exec + '(' + column.column + ')'] = Math.min.apply(Math, queryResult.result.map(col => col[column.column]));
                                            break;
                                        case 'max':
                                            result[column.exec + '(' + column.column + ')'] = Math.max.apply(Math, queryResult.result.map(col => col[column.column]));
                                            break;
                                    }
                                    break;
                            }
                        });
                        return result;
                    });
                }
                if (distint) {
                    queryResult.result = queryResult.result.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i);
                }
                if (params['order by']) {
                    queryResult.result = queryResult.result.sort((a, b) => {
                        let result = 0;
                        for (let index = 0; index < params['order by'].length; index++) {
                            const order = params['order by'][index];
                            switch (typeof a[order.column]) {
                                case 'string':
                                    result = a[order.column].localeCompare(b[order.column]);
                                    break;
                                case 'number':
                                    result = a[order.column] - b[order.column];
                                    break;
                                case 'boolean':
                                    result = (a[order.column] === b[order.column]) ? 0 : a[order.column] ? -1 : 1;
                                    break;
                            }
                            if (order.desc) {
                                result = -result;
                            }
                            if (result !== 0) {
                                break;
                            }
                        }
                        return result;
                    });
                }
                if (params.limit !== false && !isNaN(params.limit)) {
                    if (!isNaN(params.offset)) {
                        queryResult.result = queryResult.result.slice(params.offset, params.limit + params.offset);
                    } else {
                        queryResult.result = queryResult.result.slice(0, params.limit);
                    }
                }

                return queryResult;
            },
            insert: async function (query) {
                const parsedQuery = /^insert\s+into\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`|)\s+(?:\((.*?)\)\s+)?values\s+\((.*)\)\s*$/i.exec(query);
                if (parsedQuery === null) {
                    return { error: 'Query malformed' };
                }
                const table = PDBSQLParser.commands.utils.trimString(parsedQuery[1]);
                let columns;
                const result = {};
                if (parsedQuery[2]) {
                    columns = parsedQuery[2].trim().split(',').map(column => PDBSQLParser.commands.utils.trimString(column));
                } else {
                    const tableData = db.tables.getTable(table);
                    if (tableData.error) {
                        return tableData;
                    }
                    columns = Object.keys(tableData.columns);
                }
                const values = parsedQuery[3].trim().split(',').map(PDBSQLParser.commands.utils.extractValues);
                try {
                    columns.forEach((column, index) => { result[column] = values[index]; });
                } catch (error) {
                    return { error: 'Not enough values for columns' };
                }
                return await db.data.createData(table, result);
            },
            // TODO
            update: async function (query) {
                const parsedQuery = /^update\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`|)\s+set\s+(.*)$/i.exec(query);
                if (parsedQuery === null) {
                    return { error: 'Query malformed' };
                }
                const table = PDBSQLParser.commands.utils.trimString(parsedQuery[1]);
                const params = PDBSQLParser.commands.utils.splitter(parsedQuery[2], ['join', 'where'], 'set');
                if (params.set) {
                    const result = {};
                    params.set.split(',').forEach((set) => {
                        const parsedSet = /^([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`|)\s*=\s*(.*)$/.exec(set);
                        const key = PDBSQLParser.commands.utils.trimString(parsedSet[1]);
                        const value = PDBSQLParser.commands.utils.extractValues(parsedSet[2]);
                        result[key] = value;
                    });
                    params.set = result;
                } else {
                    return { error: 'Query malformed' };
                }
                if (params.join) {
                    params.join = PDBSQLParser.commands.utils.join(params.join);
                }
                if (params.where) {
                    params.where = PDBSQLParser.commands.utils.where(params.where.trim(), params.from, params.join);
                }
                return await db.data.updateData(table, params.set, params.where, params.join);
            },
            delete: async function (query) {
                const parsedQuery = /^delete\s+from\s+(.*)$/gmi.exec(query);
                if (parsedQuery === null) {
                    return { error: 'Query malformed' };
                }
                const params = PDBSQLParser.commands.utils.splitter(parsedQuery[1], ['join', 'where'], 'from');
                if (params.from) {
                    params.from = PDBSQLParser.commands.utils.trimString(params.from);
                } else {
                    return { error: 'No table detected' };
                }
                if (params.join) {
                    params.join = PDBSQLParser.commands.utils.join(params.join);
                }
                if (params.where) {
                    params.where = PDBSQLParser.commands.utils.where(params.where.trim(), params.from, params.join);
                }
                return await db.data.deleteData(params.from, params.where, params.join);
            },
            // NEEDS REVIEW
            create: async function (query) {
                const parsedQuery = /^create\s+table\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`)\s+\(\s*(.*?)\s*\)$/i.exec(query);
                if (parsedQuery === null) {
                    return { error: 'Query malformed' };
                }
                const extractedColumns = PDBSQLParser.commands.utils.extractColumnsCreate(parsedQuery[2]);
                if (extractedColumns.error) {
                    return extractedColumns;
                }
                return await db.tables.createTable(PDBSQLParser.commands.utils.trimString(parsedQuery[1]), extractedColumns);
            },
            drop: async function (query) {
                const parsedQuery = /^drop\s+table\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`)\s*$/i.exec(query);
                if (parsedQuery === null) {
                    return { error: 'Query malformed' };
                }
                return await db.tables.deleteTable(PDBSQLParser.commands.utils.trimString(parsedQuery[1]));
            },
            show: async function (query) {
                const parsedQuery = /^show\s+(?:(tables)|columns\s+from\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`))$/i.exec(query);
                if (parsedQuery === null) {
                    return { error: 'Query malformed' };
                }
                if (parsedQuery[1]) {
                    return await db.tables.getTables();
                }
                if (parsedQuery[2]) {
                    return await db.tables.getTable(PDBSQLParser.commands.utils.trimString(parsedQuery[2]));
                }
                return { error: 'Query malformed' };
            },
            start: async function (query) {
                const parsedQuery = /start\s+transaction/i.exec(query);
                if (parsedQuery === null) {
                    return { error: 'Query malformed' };
                }
                return await db.utils.startTransaction();
            },
            end: async function (query) {
                const parsedQuery = /end\s+transaction/i.exec(query);
                if (parsedQuery === null) {
                    return { error: 'Query malformed' };
                }
                return await db.utils.endTransaction();
            },
            utils: {
                splitter: function (query, separators, first = '') {
                    const result = {};
                    result[first] = false;
                    let start = [];
                    separators.forEach((separator) => {
                        result[separator] = false;
                        start.push([separator, query.search(new RegExp(separator, 'i'))]);
                    });
                    start = start.sort((a, b) => { return a[1] - b[1]; });
                    start = start.filter(separator => separator[1] !== -1);
                    start.forEach((separator, index) => {
                        if (index === 0) {
                            if (separator[1] !== 0) {
                                result[first] = query.substring(0, separator[1]);
                            }
                        } else {
                            result[start[index - 1][0]] = query.substring(start[index - 1][0].length + start[index - 1][1], separator[1]);
                        }
                    });
                    if (start.length === 0) {
                        result[first] = query;
                    } else {
                        result[start[start.length - 1][0]] = query.substring(start[start.length - 1][0].length + start[start.length - 1][1], query.length);
                    }
                    return result;
                },
                trimString: function (element) {
                    element = element.trim();
                    if (element.startsWith('"') || element.startsWith("'") || element.startsWith('`')) {
                        return element.slice(1, -1);
                    } else {
                        return element;
                    }
                },
                columnParserSelect: function (column) {
                    const parsedColumn = /^((.*)\(\s*([^"'`\s]+|"[^"]+"|'[^']+'|`[^`]+`)\s*\))|(([^"'`\s.]+|"[^"]+"|'[^']+'|`[^`]+`)\.([^"'`\s.]+|"[^"]+"|'[^']+'|`[^`]+`))|([^"'`\s.]+|"[^"]+"|'[^']+'|`[^`]+`)$/i.exec(column.trim());
                    if (parsedColumn[1]) {
                        return { type: 'function', exec: parsedColumn[2], column: parsedColumn[3] };
                    }
                    if (parsedColumn[4]) {
                        return { type: 'compound', table: parsedColumn[5], column: parsedColumn[6] };
                    }
                    if (parsedColumn[7]) {
                        return { type: 'column', column: parsedColumn[7] };
                    }
                    return {};
                },
                extractColumnsCreate: function (parameters) {
                    const result = { keys: { primary: [], foreign: [] }, columns: {} };
                    let parametersList = parameters.split(',');
                    parametersList = parametersList.map(element => element.trim());
                    let error;
                    parametersList.some((parameterString) => {
                        if (/\s+KEY\s+/i.test(parameterString)) {
                            const primaryParameters = /^PRIMARY\s+KEY\s+\((.*)\)$/i.exec(parameterString);
                            if (primaryParameters !== null) {
                                primaryParameters.map(element => element.trim());
                                if (primaryParameters[1].includes(',')) {
                                    primaryParameters[1].split(',').forEach(parameter => result.keys.primary.push(parameter.trim()));
                                } else {
                                    result.keys.primary.push(primaryParameters[1]);
                                }
                            } else {
                                const foreingParameters = /^FOREIGN\s+KEY\s+\((.*?)\)\s*REFERENCES\s+(.*?)\((.*?)\)$/i.exec(parameterString);
                                if (foreingParameters !== null) {
                                    foreingParameters.map(element => element.trim());
                                    result.keys.foreign.push({ col: foreingParameters[1], refTable: foreingParameters[2], refCol: foreingParameters[3] });
                                } else {
                                    error = 'Malformed query';
                                    return true;
                                }
                            }
                        } else {
                            const parametersBreak = /^(.*?)\s+(.*?\(.*?\)|.*?)(?:\s+(.+?))?$/i.exec(parameterString);
                            if (parametersBreak !== null) {
                                const column = {
                                    constraints: []
                                };
                                const datatype = this.extractDatatype(parametersBreak[2]);
                                if (datatype.error) {
                                    error = datatype.error;
                                    return true;
                                }
                                column.type = datatype;
                                // TODO:CONSTRAINTS
                                result.columns[parametersBreak[1]] = column;
                            } else {
                                error = 'Malformed query';
                                return true;
                            }
                        }
                        return false;
                    });
                    if (error) {
                        return { error };
                    }
                    return result;
                },
                extractDatatype: function (datatype) {
                    datatype = datatype.toLowerCase();
                    if (datatype.includes('CHAR')) {
                        return 'string';
                    }
                    if (datatype.includes('BINARY')) {
                        return 'string';
                    }
                    if (datatype.includes('TEXT')) {
                        return 'string';
                    }
                    if (datatype.includes('BLOB')) {
                        return 'string';
                    }
                    // NUMBER
                    if (datatype.includes('BIT')) {
                        return 'number';
                    }
                    if (datatype.includes('INT')) {
                        return 'number';
                    }
                    if (datatype.includes('FLOAT')) {
                        return 'number';
                    }
                    if (datatype.includes('DOUBLE')) {
                        return 'number';
                    }
                    if (datatype.includes('DEC')) {
                        return 'number';
                    }
                    // BOOLEAN
                    if (datatype.includes('BOOL')) {
                        return 'boolean';
                    }
                    return datatype;
                },
                extractValues: function (value) {
                    value = value.trim();
                    if (value.toLowerCase() === 'true') {
                        return true;
                    }
                    if (value.toLowerCase() === 'false') {
                        return false;
                    }
                    if (value.toLowerCase() === 'null') {
                        return null;
                    }
                    if (!isNaN(value)) {
                        return Number(value);
                    }
                    return PDBSQLParser.commands.utils.trimString(value);
                },
                join: function (joinString) {
                    const stringSearcher = '([a-zA-Z0-9_]+|"[^"]+"|\'[^\']+\'|`[^`]+`)';
                    const formatedJoin = new RegExp(`^${stringSearcher}\\s+on\\s+${stringSearcher}.${stringSearcher}\\s*=\\s*${stringSearcher}.${stringSearcher}$`, 'i').exec(joinString.trim());
                    if (formatedJoin === null) {
                        return { error: 'Malformed join' };
                    }
                    const foreingTable = PDBSQLParser.commands.utils.trimString(formatedJoin[1]);
                    let foreingColumn;
                    let column;
                    if (foreingTable === PDBSQLParser.commands.utils.trimString(formatedJoin[2])) {
                        foreingColumn = PDBSQLParser.commands.utils.trimString(formatedJoin[3]);
                        column = PDBSQLParser.commands.utils.trimString(formatedJoin[5]);
                    } else {
                        if (foreingTable === PDBSQLParser.commands.utils.trimString(formatedJoin[4])) {
                            foreingColumn = PDBSQLParser.commands.utils.trimString(formatedJoin[5]);
                            column = PDBSQLParser.commands.utils.trimString(formatedJoin[3]);
                        } else {
                            return { error: 'Malformed join' };
                        }
                    }
                    return [{ foreingTable, foreingColumn, column }];
                },
                where: function (where, tableName, joins) {
                    const parser = new SqlWhereParser();
                    const parsed = parser.parse(tokenize(where));
                    function tokenize (string) {
                        const regexString = '[^"\'`]+|"[^"]+"|\'[^\']+\'|`[^`]`+';
                        let tokenizedString = string.match(new RegExp(regexString, 'gi'));
                        tokenizedString = tokenizedString.map((token) => {
                            if (token.startsWith('"')) {
                                return `"'${token.slice(1, -1).replace(/'/gi, "\\'")}'"`;
                            }
                            if (token.startsWith("'") || token.startsWith('`')) {
                                return `'"${token.slice(1, -1).replace(/"/gi, '\\"')}"'`;
                            }
                            return token;
                        });
                        return tokenizedString.join('');
                    }
                    function toJs (data) {
                        if (data['!']) {
                            return `!(${toJs(data['!'][0])})`;
                        } else if (data.NOT) {
                            return `!(${toJs(data.NOT[0])})`;
                        } else if (data['-']) {
                            if (data['-'][1]) {
                                const operator = '-';
                                return `(${toJs(data[operator][0])})${operator}(${toJs(data[operator][1])})`;
                            } else {
                                return `(-(${data['-'][0]}))`;
                            }
                        } else if (['^', '*', '/', '%', '+', '<', '>', '<=', '>='].find(op => data[op])) {
                            const operator = ['^', '*', '/', '%', '+', '-', '<', '>', '<=', '>='].find(op => data[op]);
                            return `(${toJs(data[operator][0])})${operator}(${toJs(data[operator][1])})`;
                        } else if (data['=']) {
                            return `(${toJs(data['='][0])})===(${toJs(data['='][1])})`;
                        } else if (data['!=']) {
                            return `(${toJs(data['!='][0])})!==(${toJs(data['!='][1])})`;
                        } else if (data.AND) {
                            return `(${toJs(data.AND[0])})&&(${toJs(data.AND[1])})`;
                        } else if (data.OR) {
                            return `(${toJs(data.OR[0])})||(${toJs(data.OR[1])})`;
                        } else if (data.BETWEEN) {
                            let column = data.BETWEEN[0];
                            let not = '';
                            if (data.BETWEEN[0].NOT) {
                                not = '!';
                                column = data.BETWEEN[0].NOT[0];
                            }
                            return `${not}((${toJs(column)}<${data.BETWEEN[1]})&&(${toJs(column)}>${data.BETWEEN[2]}))`;
                        } else if (data.LIKE) {
                            let comparator = data.LIKE[1];
                            comparator = comparator.slice(1, -1);
                            comparator = comparator.replace(/([[\\^$.|?*+()\]])/gi, '\\$1');
                            comparator = comparator.replace(/%/gi, '.*');
                            comparator = comparator.replace(/_/gi, '.');
                            comparator = '^' + comparator + '$';
                            let column = data.LIKE[0];
                            let not = '';
                            if (data.LIKE[0].NOT) {
                                not = '!';
                                column = data.LIKE[0].NOT[0];
                            }
                            return `${not}(/${comparator}/.test(${column}))`;
                        } else if (data.IN) {
                            return '';
                        } else {
                            if (typeof data === 'string') {
                                const parsedColumns = /^([^"'`\s.]+|"[^"]+"|'[^']+'|`[^`]+`)\.([^"'`\s.]+|"[^"]+"|'[^']+'|`[^`]+`)$/.exec(data);
                                if (parsedColumns !== null) {
                                    const parsedTable = PDBSQLParser.commands.utils.trimString(parsedColumns[1]);
                                    const parsedColumn = PDBSQLParser.commands.utils.trimString(parsedColumns[2]);
                                    if (parsedTable === tableName) {
                                        return `data.${parsedColumn}`;
                                    } else {
                                        const ourJoin = joins.find(join => join.foreingTable === parsedTable);
                                        if (!ourJoin) {
                                            return `data.${parsedColumn}`;
                                        } else {
                                            return `data.${ourJoin.column}.${parsedColumn}`;
                                        }
                                    }
                                } else {
                                    if (data.startsWith('"') || data.startsWith("'") || data.startsWith('`')) {
                                        return data;
                                    } else {
                                        return `data.${data}`;
                                    }
                                }
                            } else {
                                return data;
                            }
                        }
                    }
                    const js = toJs(parsed);
                    return new Function('data', `return ${js};`);
                }
            }
        }
    };
    return async function (text) {
        return await PDBSQLParser.parseText(text);
    };
};
