/**
 * @typedef {Function} Storage_drop Drops data from the storage
 * @async
 */
/**
 * @typedef {Function} Storage_load Loads data from the storage
 * @param {String} key Key to retrieve the data
 * @returns {String} Data storaged
 * @async
 */
/**
 * @typedef {Function} Storage_save Saves data into the storage
 * @param {String} data Data to store
 * @param {String} key Key to store it
 * @async
 */
/**
 * @typedef {Object} Storage_pdb Api to interact with the storage
 * @property {Storage_save} save Saves data into the storage
 * @property {Storage_load} load Loads data from the storage
 * @property {Storage_drop} drop Drops data from the storage
 */
/**
 * This class will select the desired storage tecnology and
 * expose and api for interacting with it.
 * @param {String} selectedStorage Storage selected by the user
 * @param {Boolean} hasFallback If the selected storage is not available, whether or not to fallback to a different storage solution
 * @param {Object.<string, Storage_module>} modules List of storage modules to be loaded
 * @returns {Storage_pdb} Api for interaction with the storage
 * @throws
 */
// options.storage, options.fallback, modules.storage
function Storage (dbName, selectedStorage, hasFallback, modules) {
    function loadModules () {
        for (const moduleName in modules) {
            if (Object.prototype.hasOwnProperty.call(modules, moduleName)) {
                try {
                    let module = modules[moduleName];
                    if (typeof module === 'string') {
                        module = Function('return ' + module)();
                    }
                    module = module(dbName);
                    modules[moduleName] = module;
                } catch (error) {
                    throw new Error(`Error loading module ${moduleName}. Please revise your module configuration: ${error.message}`);
                }
            }
        }
    }
    function selectStorage () {
        if (modules[selectedStorage]) {
            if (modules[selectedStorage].isSupported()) {
                return modules[selectedStorage];
            } else {
                if (hasFallback) {
                    const selectedTier = modules[selectedStorage].tier;
                    for (let tier = selectedTier; tier > 0; tier--) {
                        const selectedModule = modules.values().filter(module => module.tier === tier).find(module => module.isSupported());
                        if (selectedModule) {
                            return selectedModule;
                        }
                    }
                    throw new Error('No storage is supported in this medium');
                } else {
                    throw new Error(`The selected storage (${selectedStorage}) is not supported`);
                }
            }
        } else {
            throw new Error(`The storage type ${selectedStorage} is not loaded onto PluriDB. Revise your module installation.`);
        }
    }

    const resultStorage = {};

    resultStorage.init = async () => {
        try {
            loadModules();
            const databaseStorage = selectStorage();
            await databaseStorage.init();
            resultStorage.save = databaseStorage.save;
            resultStorage.load = databaseStorage.load;
            resultStorage.drop = databaseStorage.drop;
        } catch (error) {
            throw new Error('There was an error on the initialization of the storage medium: ' + error.message);
        }
    };

    return resultStorage;
}

module.exports = Storage;
