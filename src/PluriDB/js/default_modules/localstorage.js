module.exports = function (dbname) {
    return {
        tier: 1,
        isSupported: function () {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        },
        init: function () {
        },
        load: function (key) {
            return new Promise((resolve, reject) => {
                const db = localStorage.getItem(key);
                if (db !== null) {
                    resolve(db);
                } else {
                    reject(new Error('No response'));
                }
            });
        },
        save: function (data, key) {
            localStorage.setItem(key, data);
        },
        drop: function (dbName) {
            return new Promise((resolve) => {
                for (let index = 0; index < localStorage.length; index++) {
                    if (localStorage.key(index).startsWith(dbname)) {
                        localStorage.removeItem(dbName);
                    }
                }
                resolve();
            });
        }
    };
};
