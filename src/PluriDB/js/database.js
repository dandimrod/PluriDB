function Database (dbName, options, storage, JSON2) {
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
        if (typeof secret === 'string') {
            return {
                compress: async function (data) {
                    return await encStr(data, secret);
                },
                decompress: async function (data) {
                    try {
                        return await decStr(data, secret);
                    } catch (err) {
                        throw new Error('Bad Password');
                    }
                }
            };
        } else {
            return {
                compress: async function (data) {
                    return lzwEncode(data);
                },
                decompress: async function (data) {
                    return lzwDecode(data);
                }
            };
        }
    }
    async function commit () {
        if (!transaction) {
            if (options.backup) {
                backup(dbName, db);
            }
            const data = await baker.compress(JSON2.stringify(db));
            storage.save(data, dbName);
        }
    }
    async function initDB (options) {
        async function selectDB () {
            let databaseStorage;
            try {
                databaseStorage = JSON2.parse(await baker.decompress(await storage.load(dbName)));
            } catch (error) {
                console.warn('The database in storage has not loaded properly: ' + error.message);
            }
            if (!options.restore) {
                return databaseStorage;
            }
            let databaseRestore;
            try {
                databaseRestore = JSON2.parse(await baker.decompress(await restore.restore(dbName)));
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
        data = await baker.compress(JSON2.stringify(data));
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

    function checkConstraints (columnConstraints, data, table) {
        for (const column in data) {
            if (Object.prototype.hasOwnProperty.call(data, column)) {
                const value = data[column];
                const myColumn = columnConstraints[column] || columnConstraints['*'];
                if (!myColumn) {
                    return { error: 'The table does not have column ' + column };
                }
                if (myColumn.type) {
                    const type = JSON2.datatypes[myColumn.type];
                    if (!type) {
                        return { error: 'The datatype ' + myColumn.type + ' does not exist' };
                    }
                    if (!type.isDatatype(value)) {
                        return { error: 'The value ' + value + ' introduced in the column ' + column + ' does not match the datatype ' + myColumn.type };
                    }
                }
                if (myColumn.unique) {
                    const tableEntries = Object.keys(table);
                    for (let index = 0; index < tableEntries.length; index++) {
                        const values = table[tableEntries[index]];
                        if (values[column] === value) {
                            return { error: 'The value ' + value + ' is not unique' };
                        }
                    }
                }
                if (myColumn.constraints) {
                    for (let index = 0; index < columnConstraints[column].constraints.length; index++) {
                        const constraint = columnConstraints[column].constraints[index];
                        try {
                            if (!constraint(value, column, JSON2.parse(JSON2.stringify(table)))) {
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
    function transformData (registry, transformation) {
        if (!transformation || !Array.isArray(transformation)) {
            return registry;
        }
        try {
            const registryClone = JSON2.parse(JSON2.stringify(registry));
            let registryArray = Object.entries(registryClone);
            let isReduced = false;
            for (let index = 0; index < transformation.length; index++) {
                const operation = transformation[index];
                if (!Array.isArray(registryArray)) {
                    break;
                }
                switch (operation.type.toLowerCase()) {
                    case 'filter': {
                        registryArray = registryArray.filter(
                            ([key, value], index) => {
                                return operation.executable(value, key, registryClone, index);
                            }
                        );
                        break;
                    }
                    case 'map':
                        registryArray = registryArray.map(
                            ([key, value], index) => {
                                return [key, operation.executable(value, key, registryClone, index)];
                            }
                        );
                        break;
                    case 'sort':
                        registryArray = registryArray.sort(
                            ([keyA, valueA], [keyB, valueB]) => {
                                return operation.executable(valueA, valueB, keyA, keyB);
                            }
                        );
                        break;
                    case 'reduce':
                    case 'reduceRight':
                        registryArray = registryArray[operation.type](
                            (currentValue, [key, value], index) => {
                                return operation.executable(currentValue, value, key, registryClone, index);
                            }, operation.initialValue
                        );
                        isReduced = true;
                        break;
                    default:
                        break;
                }
            }
            if (Array.isArray(registryArray) && !isReduced) {
                return Object.fromEntries(registryArray);
            } else {
                return registryArray;
            }
        } catch (e) {
            return { error: 'Malformed transformation: ' + e };
        }
    }
    function filterData (registry, filter) {
        if (!filter) {
            return registry;
        }
        try {
            const passed = {};
            const registryClone = JSON2.parse(JSON2.stringify(registry));
            for (const key in registry) {
                if (Object.prototype.hasOwnProperty.call(registry, key)) {
                    const data = JSON2.parse(JSON2.stringify(registry[key]));
                    let result = false;
                    try {
                        result = filter(data, key, registryClone);
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
        const table = db.t[tableName];
        const values = JSON.parse(JSON.stringify(db.t[tableName].v));
        for (const key in values) {
            if (Object.hasOwnProperty.call(values, key)) {
                const value = values[key];
                for (let index = 0; index < treeData.length; index++) {
                    const treeBranch = treeData[index].split('/');
                    let currentTable = table;
                    let currentValue = value;
                    for (let index = 0; index < treeBranch.length; index++) {
                        const treeElement = treeBranch[index];
                        const columnData = currentTable.c[treeElement];
                        if (!currentValue) {
                            break;
                        }
                        if (columnData && columnData.type === 'reference' && db.t[columnData.to]) {
                            const type = typeof currentValue[treeElement];
                            if (type === 'undefined') {
                                break;
                            }
                            if (type === 'string' || type === 'object') {
                                if (type === 'string') {
                                    const index = currentValue[treeElement];
                                    currentValue[treeElement] = JSON2.parse(JSON2.stringify(db.t[columnData.to].v[index]));
                                }
                                currentValue = currentValue[treeElement];
                                currentTable = db.t[columnData.at];
                                continue;
                            }
                            return { error: 'Value ' + currentValue[treeElement] + ' is not a real reference' };
                        } else {
                            return { error: 'Column ' + treeElement + ' not found' };
                        }
                    }
                }
            }
        }
        return values;
    }

    const returnDb = {
        init: async function (messageRelay) {
            if (messageRelay) {
                postMessage = messageRelay;
            }
            await initDB(options);
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
                return { result: { columns: table.c, metadata: table.m } };
            },
            getTables: function () {
                return { result: Object.keys(db.t) };
            },
            createTable: function (name, columns) {
                if (db.t[name]) {
                    endedOnError();
                    return { error: 'Table ' + name + ' already exists' };
                }
                if (name.includes('/')) {
                    return { error: 'Table names cannot contain /' };
                }
                const table = {
                    // values
                    v: {},
                    // columns
                    c: {},
                    // metadata
                    m: {},
                    // index
                    i: 0
                };
                table.c = columns.columns;
                table.m = columns.metadata;
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
                return { message: 'Table ' + name + ' was deleted succesfully' };
            },
            updateTable: function (name, columns) {
                if (!db.t[name]) {
                    endedOnError();
                    return { error: 'Table ' + name + ' does not exist' };
                }
                const table = db.t[name];
                table.c = columns.columns;
                db.t[name] = table;
                commit();
                return { message: 'Table ' + name + ' was updated succesfully' };
            }
        },
        data: {
            getData: function (tableName, filter, tree, transform) {
                if (!db.t[tableName]) {
                    endedOnError();
                    return { error: 'Table ' + tableName + ' does not exist' };
                }
                const values = treefy(tableName, tree);
                if (values.error) {
                    endedOnError();
                    return values;
                }
                const returned = filterData(values, filter);
                if (returned.error) {
                    endedOnError();
                    return returned;
                }
                const transformed = transformData(returned, transform);
                if (transformed.error) {
                    endedOnError();
                    return transformed;
                }
                return { result: transformed };
            },
            createData: function (tableName, data) {
                if (!db.t[tableName]) {
                    endedOnError();
                    return { error: 'Table ' + tableName + ' does not exist' };
                }
                table = db.t[tableName];
                // Handling of default values
                Object.keys(table.c).forEach((column) => {
                    if (data[column] === undefined && table.c.d) {
                        data[column] = table.c.d;
                    }
                });
                const checkedConstraints = checkConstraints(table.c, data, table.v);
                if (checkedConstraints.error) {
                    endedOnError();
                    return checkedConstraints;
                }
                const id = table.i;
                table.v[id] = data;
                table.i++;
                commit();
                return { message: 'Data inserted', result: id.toString() };
            },
            deleteData: function (tableName, filter, tree) {
                if (!db.t[tableName]) {
                    endedOnError();
                    return { error: 'Table ' + tableName + ' does not exist' };
                }
                table = db.t[tableName];
                const values = treefy(tableName, tree);
                if (values.error) {
                    endedOnError();
                    return values;
                }
                const toBeDeleted = filterData(values, filter);
                if (toBeDeleted.error) {
                    endedOnError();
                    return toBeDeleted;
                }
                Object.keys(toBeDeleted).forEach((key) => {
                    delete table.v[key];
                });
                commit();
                return { message: 'Deleted ' + Object.keys(toBeDeleted).length + ' rows' };
            },
            updateData: function (tableName, data, filter, tree) {
                if (!db.t[tableName]) {
                    endedOnError();
                    return { error: 'Table ' + tableName + ' does not exist' };
                }
                table = db.t[tableName];
                const values = treefy(tableName, tree);
                if (values.error) {
                    endedOnError();
                    return values;
                }
                const toBeUpdated = filterData(values, filter);
                if (toBeUpdated.error) {
                    endedOnError();
                    return toBeUpdated;
                }
                const checkedConstraints = checkConstraints(table.c, data, table.v);
                if (checkedConstraints.error) {
                    endedOnError();
                    return checkedConstraints;
                }
                Object.keys(toBeUpdated).forEach((key) => {
                    table.v[key] = data;
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
                    transaction = JSON2.parse(JSON2.stringify(db));
                    return { message: 'Starting Transaction' };
                }
            },
            endTransaction: function () {
                if (!transaction) {
                    return { error: 'Not in a transaction' };
                } else {
                    if (errorOnTransaction) {
                        db = JSON2.parse(JSON2.stringify(transaction));
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
        },
        forceBackup: function () {
            commit();
            return { message: 'Backup started' };
        },
        drop: async function () {
            await storage.drop(dbName);
            Object.keys(returnDb).forEach(value => delete returnDb[value]);
            return { type: 'error', message: 'Database was dropped' };
        }
    };

    return transactionizeApi(returnDb);
}
module.exports = Database;
