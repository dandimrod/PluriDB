function Parser (database, modules, postMessage) {
    async function parse (data) {
        if (this.loaded) {
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
    parse.init = () => {
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
    };
    parse.loaded = false;
    return parse;
}

module.exports = Parser;
