function Datatype (modules) {
    const datatypes = {};
    function loadModules () {
        for (const moduleName in modules) {
            if (Object.prototype.hasOwnProperty.call(modules, moduleName)) {
                try {
                    let module = modules[moduleName];
                    if (typeof module === 'string') {
                        module = Function('return ' + module)();
                    }
                    datatypes[moduleName] = module();
                } catch (error) {
                    throw new Error(`Error loading module ${moduleName}. Please revise your module configuration: ${error.message}`);
                }
            }
        }
    }
    function init () {
        loadModules();
    }
    function stringify (value, replacer, space) {
        return JSON.stringify(value, (key, value) => {
            if (key === '_type_') {
                return undefined;
            }
            let result;
            for (const datatypeName in datatypes) {
                if (Object.prototype.hasOwnProperty.call(datatypes, datatypeName)) {
                    const datatype = datatypes[datatypeName];
                    if (datatype.isDatatype(value)) {
                        result = `${datatypeName};${datatype.serialize(value)}`;
                        break;
                    }
                }
            }
            if (replacer) {
                return replacer(key, typeof result !== 'undefined' ? result : value);
            } else {
                return typeof result !== 'undefined' ? result : value;
            }
        }, space);
    }

    function parse (text, reviver) {
        return JSON.parse(text, (key, value) => {
            let result;
            if (typeof value === 'string') {
                const datatype = value.split(';')[0];
                if (datatypes[datatype]) {
                    const serializedValue = value.split(';').slice(1).join(';');
                    result = datatypes[datatype].deserialize(serializedValue);
                }
            }
            if (reviver) {
                return reviver(key, typeof result !== 'undefined' ? result : value);
            } else {
                return typeof result !== 'undefined' ? result : value;
            }
        });
    }
    return { datatypes, stringify, parse, init };
}

module.exports = Datatype;
