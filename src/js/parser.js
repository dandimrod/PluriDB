function Parser (database, modules) {
    try {
        function loadModules () {
            for (const moduleName in modules) {
                if (Object.prototype.hasOwnProperty.call(modules, moduleName)) {
                    try {
                        let module = modules[moduleName];
                        if (typeof module === 'string') {
                            module = Function('return ' + module)();
                        }
                        module = module(database);
                        modules[moduleName] = module;
                    } catch (error) {
                        throw new Error(`Error loading module ${moduleName}. Please revise your module configuration: ${error.message}`);
                    }
                }
            }
        }
        loadModules();
    } catch (error) {
        throw new Error('There was an error on the initialization of the parser: ' + error.message);
    }
    async function parse (data) {
        if (database.loaded) {
            if (modules[data.typeQuery]) {
                postMessage({ type: 'result', response: await modules[data.typeQuery](...data.queries) });
            } else {
                postMessage({ type: 'result', error: 'Module ' + data.typeQuery + ' is not imported' });
            }
        } else {
            setTimeout(() => {
                parse(data);
            }, 500);
        }
    }
    return parse;
}

// const parserModules = (function (modules) {
//     const result = {
//         loaded: false
//     };
//     const parserModules = {
//         default: function (target, method, ...args) {
//             if (target !== 'tables' || target !== 'data' || target !== 'utils') {
//                 return { error: 'Operation not supported' };
//             }
//             if (!db[target][method]) {
//                 return { error: 'Operation not supported' };
//             }
//             return db[target][method](...args);
//         }
//     };
//     result.modules = parserModules;
//     return result;
// }(options.modules));

// function masterParser (data) {
//     if (dbUtils.loaded && parserModules.loaded) {
//         if (parserModules.modules[data.typeQuery]) {
//             postMessage({ id: data.id, response: parserModules.modules[data.typeQuery](...data.querys) });
//         } else {
//             postMessage({ id: data.id, error: 'Module ' + data.typeQuery + ' is not imported' });
//         }
//     } else {
//         setTimeout(() => {
//             masterParser(data);
//         }, 500);
//     }
// }

module.exports = Parser;
