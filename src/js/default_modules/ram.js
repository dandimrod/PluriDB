module.exports = function (dbname) {
    const db = {};
    return {
        tier: 0,
        isSupported: function () {
            return true;
        },
        init: function () {
        },
        load: function (key) {
            return new Promise((resolve, reject) => {
                if (this.db !== '') {
                    resolve(db, key);
                } else {
                    reject(new Error('Empty db'));
                }
            });
        },
        save: function (data, key) {
            db[key] = data;
        },
        drop: function () {
            return new Promise((resolve) => {
                this.db = {};
                resolve();
            });
        }
    };
};
