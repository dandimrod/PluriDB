module.exports = {
    api: function (execute, JSON2) {
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
                                        args.unshift((error, result) => {
                                            if (error) {
                                                reject(error);
                                            } else {
                                                resolve(result);
                                            }
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
                    execute(callback, 'default', 'tables', 'createTable', name, JSON2.stringify(columns));
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
                    execute(callback, 'default', 'data', 'getData', table, JSON2.stringify(filter), JSON2.stringify(tree));
                },
                createData: (callback, table, data) => {
                    execute(callback, 'default', 'data', 'createData', table, JSON2.stringify(data));
                },
                deleteData: (callback, table, filter, tree) => {
                    execute(callback, 'default', 'data', 'deleteData', table, JSON2.stringify(filter), JSON2.stringify(tree));
                },
                updateData: (callback, table, data, filter, tree) => {
                    execute(callback, 'default', 'data', 'updateData', table, JSON2.stringify(data), JSON2.stringify(filter), JSON2.stringify(tree));
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
    parser: function (db, JSON2) {
        return async function (target, method, ...args) {
            if (!(target === 'tables' || target === 'data' || target === 'utils')) {
                return { error: 'Operation not supported' };
            }
            if (!db[target][method]) {
                return { error: 'Operation not supported' };
            }
            const parsedArgs = args.map((value, index) => {
                if (index !== 0) {
                    return JSON2.parse(value);
                } else {
                    return value;
                }
            });
            return await db[target][method](...parsedArgs);
        };
    }
};
