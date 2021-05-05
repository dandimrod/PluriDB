module.exports = {
    api: function (execute, JSON2) {
        function promisify (api) {
            const promise = {};
            for (const apiName in api) {
                if (Object.hasOwnProperty.call(api, apiName) && apiName !== 'scopedFunction') {
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
        function ourCallback (callback) {
            return function (error, result) {
                const newResult = JSON2.parse(result);
                callback(error, newResult);
            };
        }
        const returnedApi = {
            tables: {
                getTable: (callback, name) => {
                    execute(ourCallback(callback), 'default', 'tables', 'getTable', name);
                },
                getTables: (callback) => {
                    execute(ourCallback(callback), 'default', 'tables', 'getTables');
                },
                createTable: (callback, name, columns) => {
                    execute(ourCallback(callback), 'default', 'tables', 'createTable', name, JSON2.stringify(columns));
                },
                deleteTable: (callback, name) => {
                    execute(ourCallback(callback), 'default', 'tables', 'deleteTable', name);
                },
                updateTable: (callback, name, columns) => {
                    execute(ourCallback(callback), 'default', 'tables', 'updateTable', name, JSON2.stringify(columns));
                }
            },
            data: {
                getData: (callback, table, filter, tree) => {
                    execute(ourCallback(callback), 'default', 'data', 'getData', table, JSON2.stringify(filter), JSON2.stringify(tree));
                },
                createData: (callback, table, data) => {
                    execute(ourCallback(callback), 'default', 'data', 'createData', table, JSON2.stringify(data));
                },
                deleteData: (callback, table, filter, tree) => {
                    execute(ourCallback(callback), 'default', 'data', 'deleteData', table, JSON2.stringify(filter), JSON2.stringify(tree));
                },
                updateData: (callback, table, data, filter, tree) => {
                    execute(ourCallback(callback), 'default', 'data', 'updateData', table, JSON2.stringify(data), JSON2.stringify(filter), JSON2.stringify(tree));
                }
            },
            utils: {
                startTransaction: (callback) => {
                    execute(ourCallback(callback), 'default', 'utils', 'startTransaction');
                },
                endTransaction: (callback) => {
                    execute(ourCallback(callback), 'default', 'utils', 'endTransaction');
                }
            },
            scopedFunction: function (executable, scope) {
                const newFunctionString = `function(...args){
                    let {${Object.keys(scope)}} = JSON.parse('${JSON.stringify(scope)}');
                    return (${executable.toString()})(...args);
                }`;
                return new Function('return ' + newFunctionString)();
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
            return JSON2.stringify(await db[target][method](...parsedArgs));
        };
    }
};
