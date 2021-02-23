module.exports = {
    api: function (execute) {
        function promisify (api) {
            const promise = {};
            for (const apiName in api) {
                if (Object.hasOwnProperty.call(api, apiName)) {
                    const apiModule = api[apiName];
                    promise[apiName] = {};
                    for (const apiFunName in apiModule) {
                        if (Object.hasOwnProperty.call(apiModule, apiFunName)) {
                            const apiFun = apiModule[apiFunName];
                            promise[apiName][apiFunName] = function (...args) {
                                return new Promise((resolve, reject) => {
                                    try {
                                        args.unshift((result) => {
                                            resolve(result);
                                        });
                                        apiFun(...args);
                                    } catch (err) {
                                        reject(err);
                                    }
                                });
                            };
                        }
                    }
                }
            }
            api.promise = promise;
            return api;
        }
        const returnedApi = {
            tables: {
                getTable: (callback, name) => {
                    execute(callback, 'default', 'tables', 'getTable', name);
                },
                getTables: (callback) => {
                    execute(callback, 'default', 'tables', 'getTables');
                },
                createTable: (callback, name, columns) => {
                    execute(callback, 'default', 'tables', 'createTable', name, columns);
                },
                deleteTable: (callback, name) => {
                    execute(callback, 'default', 'tables', 'deleteTable', name);
                },
                updateTable: (callback) => {
                    execute(callback, 'default', 'tables', 'updateTable');
                }
            },
            data: {
                getData: (callback, table, filter, tree) => {
                    execute(callback, 'default', 'data', 'getData', table, filter, tree);
                },
                createData: (callback, table, data) => {
                    execute(callback, 'default', 'data', 'createData', table, data);
                },
                deleteData: (callback, table, filter, tree) => {
                    execute(callback, 'default', 'data', 'deleteData', table, filter, tree);
                },
                updateData: (callback, table, data, filter, tree) => {
                    execute(callback, 'default', 'data', 'updateData', table, data, filter, tree);
                }
            },
            utils: {
                startTransaction: (callback) => {
                    execute(callback, 'default', 'utils', 'startTransaction');
                },
                endTransaction: (callback) => {
                    execute(callback, 'default', 'utils', 'endTransaction');
                }
            }
        };
        return promisify(returnedApi);
    },
    parser: function (db) {
        return async function (target, method, ...args) {
            if (!(target === 'tables' || target === 'data' || target === 'utils')) {
                return { error: 'Operation not supported' };
            }
            if (!db[target][method]) {
                return { error: 'Operation not supported' };
            }
            return await db[target][method](...args);
        };
    }
};
