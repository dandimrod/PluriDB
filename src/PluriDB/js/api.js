function Api (modules, db, JSON2) {
    function execute (callback, type, ...args) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ type: 'query', typeQuery: type, queries: args, id: db.id });
    }

    function updateDB (callback, updatedValues) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ type: 'updateDB', updateDB: updatedValues, id: db.id });
    }

    function drop (callback) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ type: 'drop', id: db.id });
    }

    function forceBackup (callback) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ type: 'backup', id: db.id });
    }
    // TODO: ADD THIS FUNCTIONALITY
    // function forceRestore (callback) {
    //     db.id++;
    //     db.callbacks[db.id] = callback;
    //     db.worker.postMessage({ type: 'restore' });
    // }
    // function manualBackup (callback) {
    //     db.id++;
    //     db.callbacks[db.id] = callback;
    //     db.worker.postMessage({ type: 'manualBackup' });
    // }
    // function manualRestore (callback, db) {
    //     db.id++;
    //     db.callbacks[db.id] = callback;
    //     db.worker.postMessage({ type: 'manualRestore', db });
    // }
    function initDatabase (callback) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ type: 'init', id: db.id });
    }
    const result = { execute, updateDB, drop, forceBackup, init: initDatabase };

    function promisifyApi (result) {
        const promise = {};

        for (const functionData in result) {
            if (Object.prototype.hasOwnProperty.call(result, functionData)) {
                const functionExecutable = result[functionData];
                promise[functionData] = function (...args) {
                    return new Promise((resolve, reject) => {
                        try {
                            args.unshift((error, result) => {
                                if (error) {
                                    reject(error);
                                }
                                resolve(result);
                            });
                            functionExecutable(...args);
                        } catch (err) {
                            reject(err);
                        }
                    });
                };
            }
        }

        return promise;
    }

    result.promise = promisifyApi(result);

    function loadApiModules () {
        const apiModules = {};
        for (const moduleName in modules) {
            if (Object.prototype.hasOwnProperty.call(modules, moduleName)) {
                const apiModule = modules[moduleName];
                apiModules[moduleName] = apiModule(execute, JSON2);
            }
        }
        return apiModules;
    }

    result.module = loadApiModules();
    result.m = result.module;
    return result;
}

module.exports = Api;
