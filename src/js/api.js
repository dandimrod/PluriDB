function Api (modules, db, JSON2) {
    function execute (callback, type, ...args) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ type: 'query', typeQuery: type, queries: args, id: db.id });
    }

    function updateDB (callback, updatedValues) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ type: 'updateDB', updateDB: updatedValues });
    }

    function drop (callback) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ type: 'drop' });
    }

    function forceBackup (callback) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ type: 'backup' });
    }

    const result = { execute, updateDB, drop, forceBackup };

    function promisifyApi (result) {
        const promise = {};

        for (const functionData in result) {
            if (Object.prototype.hasOwnProperty.call(result, functionData)) {
                const functionExecutable = result[functionData];
                promise[functionData] = function (...args) {
                    return new Promise((resolve, reject) => {
                        try {
                            args.unshift((result) => {
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
