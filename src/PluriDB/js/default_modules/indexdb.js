module.exports = function (dbname) {
    return {
        tier: 2,
        isSupported: function () {
            return window.indexedDB;
        },
        init: function () {
            const requestDB = indexedDB.open('PluriDB', 1);
            requestDB.onerror = function (event) {
                log.warn('Database error: ' + event.target.errorCode);
            };
            requestDB.onupgradeneeded = function (event) {
                db = event.target.result;
                db.createObjectStore('databases', { keypath: 'name' });
            };
        },
        save: function (data, key) {
            const requestDB = indexedDB.open('PluriDB', 1);
            requestDB.onerror = function (event) {
                log.warn('Database error: ' + event.target.errorCode);
            };
            requestDB.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(['databases'], 'readwrite');
                transaction.onerror = function (event) {
                    console.warn('Database error: ' + event.target.errorCode);
                };
                const objectStore = transaction.objectStore('databases');
                objectStore.put({ data }, key);
            };
        },
        load: function (key) {
            return new Promise((resolve, reject) => {
                const requestDB = indexedDB.open('PluriDB', 1);
                requestDB.onerror = function (event) {
                    log.warn('Database error: ' + event.target.errorCode);
                };
                requestDB.onsuccess = function (event) {
                    const db = event.target.result;
                    const transaction = db.transaction(['databases'], 'readonly');
                    transaction.onerror = function (event) {
                        console.warn('Database error: ' + event.target.errorCode);
                    };
                    transaction.oncomplete = function (event) {
                        if (request.result) {
                            resolve(request.result.data);
                        } else {
                            reject(new Error('No response'));
                        }
                    };
                    const objectStore = transaction.objectStore('databases');
                    const request = objectStore.get(key);
                };
            });
        },
        drop: function (dbName) {
            return new Promise((resolve) => {
                const requestDB = indexedDB.open('PluriDB', 1);
                requestDB.onerror = function (event) {
                    log.warn('Database error: ' + event.target.errorCode);
                };
                requestDB.onsuccess = function (event) {
                    const db = event.target.result;
                    const transaction = db.transaction(['databases'], 'readwrite');
                    transaction.onerror = function (event) {
                        console.warn('Database error: ' + event.target.errorCode);
                    };
                    transaction.oncomplete = function (event) {
                        resolve();
                    };
                    const objectStore = transaction.objectStore('databases');
                    objectStore.delete(dbName);
                };
            });
        }
    };
};
