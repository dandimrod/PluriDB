module.exports = {
    api: {
        sql: (execute, JSON2) => {
            return {
                query: (callback, text) => {
                    execute(callback, 'sql', text);
                },
                queryPromise: (text) => {
                    return new Promise((resolve, reject) => {
                        execute((error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }, 'sql', text);
                    });
                }
            };
        }
    },
    parser: {
        sql: require('./parser')
    }
};
