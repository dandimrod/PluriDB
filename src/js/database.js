function Database (dbName, options, storage) {
    let db;
    let transaction;
    let errorOnTransaction = false;
    let baker;
    let postMessage;

    function Baker (secret) {
        // Credits to https://gist.github.com/rafaelsq/5af573af7e2d763869e2f4cce0a8357a
        const hexToBuf = hex => {
            for (let bytes = [], c = 0; c < hex.length; c += 2) { bytes.push(parseInt(hex.substr(c, 2), 16)); }
            return new Uint8Array(bytes);
        };

        const bufToHex = buf => {
            const byteArray = new Uint8Array(buf);
            let hexString = '';
            let nextHexByte;

            for (let i = 0; i < byteArray.byteLength; i++) {
                nextHexByte = byteArray[i].toString(16);
                if (nextHexByte.length < 2) {
                    nextHexByte = '0' + nextHexByte;
                }
                hexString += nextHexByte;
            }
            return hexString;
        };

        const strToBuf = str => (new TextEncoder().encode(str));
        const bufToStr = str => (new TextDecoder().decode(str));

        // Encrypt
        const encrypt = (data, key, iv, mode) =>
            crypto.subtle.importKey('raw', key, { name: mode }, true, ['encrypt', 'decrypt'])
                .then(bufKey => crypto.subtle.encrypt({ name: mode, iv }, bufKey, data));

        // Decrypt
        const decrypt = (data, key, iv, mode) =>
            crypto.subtle.importKey('raw', key, { name: mode }, true, ['encrypt', 'decrypt'])
                .then(bufKey => crypto.subtle.decrypt({ name: mode, iv }, bufKey, data));

        // PBKDF2
        const pbkdf2 = (password, salt, iterations, hash, mode) =>
            crypto.subtle.importKey('raw', password, { name: 'PBKDF2' }, false, ['deriveKey'])
                .then(baseKey => crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash }, baseKey, { name: mode, length: 256 }, true, ['encrypt', 'decrypt']))
                .then(key => crypto.subtle.exportKey('raw', key));

        const encStr = async (data, password) => {
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(16));
            const iterations = 20000;
            const hash = 'SHA-256';
            const mode = 'AES-GCM';

            const keyBuf = await pbkdf2(strToBuf(password), salt, iterations, hash, mode);
            const buf = await encrypt(strToBuf(data), keyBuf, iv, mode);
            return btoa(
                JSON.stringify({
                    hash,
                    mode,
                    iterations,
                    salt: bufToHex(salt),
                    iv: bufToHex(iv),
                    data: bufToHex(buf)
                }));
        };

        const decStr = async (raw, password) => {
            const {
                salt, iterations, hash, mode, iv, data
            } = JSON.parse(atob(raw));

            const key = await pbkdf2(strToBuf(password), hexToBuf(salt), iterations, hash, mode);
            const buf = await decrypt(hexToBuf(data), key, hexToBuf(iv), mode);
            return bufToStr(buf);
        };
        function lzwEncode (s) {
            const dict = {};
            const data = (s + '').split('');
            const out = [];
            let currChar;
            let phrase = data[0];
            let code = 256;
            for (let i = 1; i < data.length; i++) {
                currChar = data[i];
                if (dict[phrase + currChar] != null) {
                    phrase += currChar;
                } else {
                    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                    dict[phrase + currChar] = code;
                    code++;
                    phrase = currChar;
                }
            }
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            for (let i = 0; i < out.length; i++) {
                out[i] = String.fromCharCode(out[i]);
            }
            return out.join('');
        }
        // Decompress an LZW-encoded string
        function lzwDecode (s) {
            const dict = {};
            const data = (s + '').split('');
            let currChar = data[0];
            let oldPhrase = currChar;
            const out = [currChar];
            let code = 256;
            let phrase;
            for (let i = 1; i < data.length; i++) {
                const currCode = data[i].charCodeAt(0);
                if (currCode < 256) {
                    phrase = data[i];
                } else {
                    phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
                }
                out.push(phrase);
                currChar = phrase.charAt(0);
                dict[code] = oldPhrase + currChar;
                code++;
                oldPhrase = phrase;
            }
            return out.join('');
        }
        let compress;
        let decompress;
        if (secret) {
            compress = async function (data) {
                return await encStr(data, secret);
            };
            decompress = async function (data) {
                try {
                    return await decStr(data, secret);
                } catch (err) {
                    postMessage({ badPassword: true });
                    throw new Error('INDEXSQL ERROR: Bad Password');
                }
            };
        } else {
            compress = async function (data) {
                return lzwEncode(data);
            };
            decompress = async function (data) {
                return lzwDecode(data);
            };
        }

        return { compress, decompress };
    }
    function commit () {
        if (!transaction) {
            if (options.backup) {
                backup(dbName, db);
            }
            dbUtils.save();
        }
    }
    async function initDB (options) {
        async function selectDB () {
            let databaseStorage;
            try {
                databaseStorage = JSON.parse(await baker.decompress(await storage.load(dbName)));
            } catch (error) {
                console.warn('The database in storage has not loaded properly: ' + error.message);
            }
            if (!options.restore) {
                return databaseStorage;
            }
            let databaseRestore;
            try {
                databaseRestore = JSON.parse(await baker.decompress(await restore.restore(dbName)));
            } catch (error) {
                console.warn('The database in backup has not loaded properly: ' + error.message);
            }
            if (!databaseRestore && databaseStorage) {
                return databaseStorage;
            }
            if (databaseRestore && !databaseStorage) {
                return databaseStorage;
            }
            if (databaseRestore && databaseStorage) {
                let timeStorage = new Date(0);
                try {
                    timeStorage = new Date(databaseStorage.m.ts);
                } catch (error) {
                }
                let timeRestore = new Date(0);
                try {
                    timeRestore = new Date(databaseRestore.m.ts);
                } catch (error) {
                }
                if (timeStorage > timeRestore) {
                    return databaseStorage;
                }
                if (timeRestore >= timeStorage) {
                    return databaseRestore;
                }
            } else {
                return false;
            }
        }
        baker = new Baker(options.encrypt);
        const database = await selectDB();

        if (!database) {
            db = {
            // tables
                t: {},
                // metadata
                m: {
                // Timestamp
                    ts: new Date()
                }
            };
        } else {
            db = database;
        }
    }
    function transactionizeApi (returnDB) {
        const whitelist = ['init', 'updateOptions', 'restore', 'endTransaction', 'checkTransaction', 'sendError'];
        const returnApi = {};
        for (const name in returnDB) {
            if (Object.hasOwnProperty.call(returnDB, name)) {
                const api = returnDB[name];
                if (typeof api === 'function') {
                    if (whitelist.includes(name)) {
                        returnApi[name] = api;
                    } else {
                        returnApi[name] = function (...args) {
                            let response = preProccesing();
                            if (response) {
                                return response;
                            }
                            try {
                                response = api(...args);
                            } catch (error) {
                                response = errorHandler(error);
                            }
                            return response;
                        };
                    }
                } else {
                    returnApi[name] = transactionizeApi(api);
                }
            }
        }
        return returnApi;
    }
    function preProccesing () {
        return checkTransaction();
    }
    function errorHandler (error) {
        endedOnError();
        return { error: `Error executing the query: ${error.message}` };
    }
    async function backup (key, data) {
        data = await baker.compress(JSON.stringify(data));
        postMessage({ type: 'backup', backup: data, backupKey: key });
    }
    const restore = (function () {
        let id = 0;
        const calls = {};
        function restore (key) {
            return new Promise((resolve) => {
                postMessage({ type: 'restore', restoreKey: key, id });
                calls[id] = (data) => resolve(data);
                id++;
            });
        }
        function callback (data) {
            calls[data.id](data.response);
            delete calls[data.id];
        }
        return { restore, callback };
    })();

    function checkTransaction () {
        if (transaction && errorOnTransaction) {
            return { error: 'Transaction Failed' };
        }
    }
    function endedOnError () {
        if (transaction) {
            errorOnTransaction = true;
        }
    }

    function checkConstraints (columnConstraints, data) {
        for (const column in data) {
            if (Object.prototype.hasOwnProperty.call(data, column)) {
                const value = data[column];
                if (!columnConstraints[column]) {
                    return { error: 'Table ' + name + ' does not have column ' + column };
                }
                if (columnConstraints[column].c) {
                    for (let index = 0; index < columnConstraints[column].c.length; index++) {
                        const constraint = columnConstraints[column].c[index];
                        const constraintFunction = secureFunction(constraint, 'column', 'data');
                        try {
                            if (!constraintFunction(column, value)) {
                                return { error: 'The value ' + value + ' does not comply with the constraint ' + constraint + ' of the column ' + column };
                            }
                        } catch (e) {
                            return { error: 'Unespecified error checking the constraint ' + constraint + ' with the value ' + value + ' of the column ' + column };
                        }
                    }
                }
            }
        }
        return {};
    }
    function filterData (registry, filter) {
        if (!filter) {
            return registry;
        }
        try {
            const filterFunction = secureFunction(filter, 'data');
            const passed = {};
            for (const key in registry) {
                if (Object.prototype.hasOwnProperty.call(registry, key)) {
                    const data = JSON.parse(JSON.stringify(registry[key]));
                    let result = false;
                    try {
                        result = filterFunction(data);
                    } catch (error) {

                    }
                    if (result) {
                        passed[key] = registry[key];
                    }
                }
            }
            return passed;
        } catch (e) {
            return { error: 'Malformed filter' };
        }
    }
    function treefy (tableName, treeData) {
        if (!treeData || treeData.length === 0) {
            return db.t[tableName].v;
        }
    }
    function secureFunction (code, ...variables) {
        // https://stackoverflow.com/questions/47444376/sanitizing-eval-to-prevent-it-from-changing-any-values
        const globals = [...variables, 'globalThis', ...Object.keys(globalThis), `return ${code};`];
        const securized = Function.apply(null, globals);
        return function (...variables) {
            return securized.apply({}, variables);
        };
    }

    const returnDb = {
        init: function (messageRelay) {
            if (messageRelay) {
                postMessage = messageRelay;
            }
            initDB(options);
        },
        updateOptions: function (newOptions) {
            options = { options, ...newOptions };
        },
        restore: function (data) {
            restore.callback(data);
        },
        tables: {
            getTable: function (name) {
                if (!db.t[name]) {
                    endedOnError();
                    return { error: 'Table ' + name + ' does not exist' };
                }
                const table = db.t[name];
                return { columns: table.c, parents: table.p, descendants: table.d, keys: table.k, metadata: table.m };
            },
            getTables: function () {
                return { result: Object.keys(db.t) };
            },
            createTable: function (name, columns) {
                if (db.t[name]) {
                    endedOnError();
                    return { error: 'Table ' + name + ' already exists' };
                }
                const table = {
                    // values
                    v: {},
                    // columns
                    c: {},
                    // parents
                    p: [],
                    // decendants
                    d: [],
                    // key
                    k: [],
                    // index
                    i: 0
                };
                if (columns.keys.primary.length !== 0) {
                    let error = false;
                    columns.keys.primary.forEach((key) => { if (!columns.columns[key]) { error = key; } });
                    if (error) {
                        endedOnError();
                        return { error: 'The table does not contain the primary key: ' + error };
                    }
                    table.key = columns.keys.primary;
                }
                if (columns.keys.foreign.length !== 0) {
                    let error = false;
                    columns.keys.foreign.forEach((key) => { if (!columns.columns[key.col]) { error = key.col; } });
                    if (error) {
                        endedOnError();
                        return { error: 'The table does not contain the foreign key: ' + error };
                    }
                    table.key = columns.keys.primary;
                }
                table.c = columns.columns;
                db.t[name] = table;
                commit();
                return { message: 'Table ' + name + ' created' };
            },
            deleteTable: function (name) {
                if (!db.t[name]) {
                    return { warn: 'Table ' + name + ' does not exist' };
                }
                delete db.t[name];
                for (const tableName in db.t) {
                    if (Object.prototype.hasOwnProperty.call(db.t, tableName)) {
                        const table = db.t[tableName];
                        table.p = table.p.filter((element) => element.refTable !== name);
                        table.d = table.d.filter((element) => element.refTable !== name);
                    }
                }
                commit();
                return { message: 'Table ' + name + ' was dropped succesfully' };
            },
            alterTable: function () {
            }
        },
        data: {
            getData: function (table, filter, tree) {
                if (!db.t[table]) {
                    endedOnError();
                    return { error: 'Table ' + name + ' does not exist' };
                }
                const values = treefy(table, tree);
                if (values.error) {
                    endedOnError();
                    return values;
                }
                const returned = filterData(values, filter);
                if (returned.error) {
                    endedOnError();
                    return returned;
                }
                return { result: returned };
            },
            createData: function (table, data) {
                if (!db.t[table]) {
                    endedOnError();
                    return { error: 'Table ' + name + ' does not exist' };
                }
                table = db.t[table];
                // Handling of default values
                Object.keys(table.c).forEach((column) => {
                    if (data[column] === undefined && table.c.d) {
                        data[column] = table.c.d;
                    }
                });
                const checkedConstraints = checkConstraints(table.c, data);
                if (checkedConstraints.error) {
                    endedOnError();
                    return checkedConstraints;
                }
                table.v[table.i] = data;
                table.i++;
                commit();
                return { message: 'Data inserted' };
            },
            deleteData: function (table, filter, tree) {
                if (!db.t[table]) {
                    endedOnError();
                    return { error: 'Table ' + name + ' does not exist' };
                }
                table = db.t[table];
                const values = treefy(table, tree);
                if (values.error) {
                    endedOnError();
                    return values;
                }
                const toBeDeleted = filterData(values, filter);
                if (toBeDeleted.error) {
                    endedOnError();
                    return toBeDeleted;
                }
                Object.keys[toBeDeleted].forEach((key) => {
                    delete table.v[key];
                });
                commit();
                return { message: 'Deleted ' + Object.keys(toBeDeleted).length + ' rows' };
            },
            updateData: function (table, data, filter, tree) {
                if (!db.t[table]) {
                    endedOnError();
                    return { error: 'Table ' + name + ' does not exist' };
                }
                table = db.t[table];
                const values = treefy(table, tree);
                if (values.error) {
                    endedOnError();
                    return values;
                }
                const toBeUpdated = filterData(values, filter);
                if (toBeUpdated.error) {
                    endedOnError();
                    return toBeUpdated;
                }
                const checkedConstraints = checkConstraints(table.c, data);
                if (checkedConstraints.error) {
                    endedOnError();
                    return checkedConstraints;
                }
                Object.keys(toBeUpdated).forEach((key) => {
                    Object.keys(data).forEach((column) => {
                        table.v[key] = data[column];
                    });
                });
                commit();
                return { message: 'Updated ' + Object.keys(toBeUpdated).length + ' rows' };
            }
        },
        utils: {
            startTransaction: function () {
                if (transaction) {
                    return { warn: 'Already on a transaction' };
                } else {
                    transaction = JSON.parse(JSON.stringify(db));
                    return { message: 'Starting Transaction' };
                }
            },
            endTransaction: function () {
                if (!transaction) {
                    return { error: 'Not in a transaction' };
                } else {
                    if (errorOnTransaction) {
                        db = JSON.parse(JSON.stringify(transaction));
                        transaction = undefined;
                        errorOnTransaction = false;
                        return { message: 'Rolled back transaction sucessfully' };
                    } else {
                        transaction = undefined;
                        commit();
                        return { message: 'Transaction completed' };
                    }
                }
            },
            sendError: function () {
                endedOnError();
            },
            checkTransaction
        }
    };

    return transactionizeApi(returnDb);
}
module.exports = Database;
