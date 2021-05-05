function Datatype (modules) {
    const datatypes = {};
    let datatypeList;
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
        datatypeList = Object.keys(datatypes).reverse().filter(datatypeName => !datatypes[datatypeName].ignoreSerialization);
    }
    function stringify (value, replacer, space) {
        return JSON.stringify(value, (key, value) => {
            let result;
            if (datatypeList[typeof value]) {
                const datatypeName = datatypeList[typeof value];
                const datatype = datatypes[datatypeName];
                if (datatype.isDatatype(value) && !datatype.ignoreSerialization) {
                    result = `${datatypeName};${datatype.serialize(value)}`;
                }
            }
            if (!result) {
                for (let index = 0; index < datatypeList.length; index++) {
                    const datatypeName = datatypeList[index];
                    const datatype = datatypes[datatypeName];
                    if (datatype.isDatatype(value) && !datatype.ignoreSerialization) {
                        result = `${datatypeName};${datatype.serialize(value)}`;
                        break;
                    }
                }
            }

            if (!replacer) {
                return typeof result !== 'undefined' ? result : value;
            } else {
                return replacer(key, typeof result !== 'undefined' ? result : value);
            }
        }, space);
    }

    function parse (text, reviver) {
        if (typeof text === 'undefined') {
            return text;
        }
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
