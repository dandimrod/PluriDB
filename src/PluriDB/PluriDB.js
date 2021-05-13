// The MIT License

// Copyright 2020 Daniel Diment Rodríguez https://dandimrod.dev

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * Class that represents a single PluriDB database
 * @constructor
 * @param  {String} dbName - The name of the database you want to open.
 * @param {userOptions} userOptions - Options for the database
 */
function PluriDB (dbName, userOptions, callback) {
    const defaultOptions = {
        worker: true,
        storage: 'indexdb', // localstorage ram
        fallback: true,
        db: {
            encrypt: false,
            backup: undefined,
            restore: undefined,
            backupChunk: false,
            backupDelay: 0,
            backupTimes: 0
        }
    };
    const options = { ...defaultOptions, ...userOptions, db: { ...defaultOptions.db, ...userOptions.db } };
    const datatype = require('./js/datatype')(PluriDB.modules.datatype);
    datatype.init();
    const db = {};
    db.server = require('./js/server');
    db.id = 0;
    db.callbacks = [];

    // Initalization of worker
    // if (typeof (Worker) !== 'undefined' && options.worker) {
    //     db.worker = new Worker(URL.createObjectURL(new Blob([`( ${db.server.toString().split("'start no worker'")[0]}
    //     onmessage = messageHandler;
    //     }})
    //     (${require('./js/storage').toString()}, ${require('./js/parser').toString()}, ${require('./js/database').toString()})
    //     ("${dbName}", ${JSON.stringify(options)}, ${JSON.stringify(PluriDB.modules, (data, val) => typeof val === 'function' ? val.toString() : val)})`], { type: 'text/javascript' })));
    // } else {
    //     db.worker = db.server(require('./js/storage'), require('./js/parser'), require('./js/database'))(dbName, options, PluriDB.modules);
    // }
    db.worker = (function createWorker () {
        function supportForWorkerNode () {
            try {
                require('worker_threads');
            } catch (error) {
                return false;
            }
            return true;
        }
        let type = '';
        if (options.worker) {
            if (typeof (Worker) !== 'undefined') {
                type = 'worker';
            } else {
                if (supportForWorkerNode()) {
                    type = 'node';
                }
            }
        }
        let worker;
        switch (type) {
            case 'worker':
                worker = new Worker(URL.createObjectURL(new Blob([`( ${db.server.toString()})
                (${require('./js/storage').toString()}, ${require('./js/parser').toString()}, ${require('./js/database').toString()}, ${require('./js/datatype').toString()})
                ("${dbName}", ${JSON.stringify(options)}, ${JSON.stringify(PluriDB.modules, (data, val) => typeof val === 'function' ? val.toString() : val)}, 'worker')`],
                { type: 'text/javascript' })));
                break;
            case 'node': {
                const { WorkerNode } = require('worker_threads');
                worker = new WorkerNode(`( ${db.server.toString()})
                (${require('./js/storage').toString()}, ${require('./js/parser').toString()}, ${require('./js/database').toString()}, ${require('./js/datatype').toString()})
                ("${dbName}", ${JSON.stringify(options)}, ${JSON.stringify(PluriDB.modules, (data, val) => typeof val === 'function' ? val.toString() : val)}, 'node')
                `, { eval: true });
                break;
            }
            default:
                worker = db.server(require('./js/storage'), require('./js/parser'), require('./js/database'), require('./js/datatype'))(
                    dbName,
                    options,
                    JSON.parse(JSON.stringify(PluriDB.modules, (data, val) => typeof val === 'function' ? val.toString() : val))
                );
                break;
        }
        return worker;
    })();
    db.worker.onmessage = function (e) {
        switch (e.data.type) {
            case 'error':
                if (options.worker) {
                    db.worker.terminate();
                }
                db.worker = { postMessage: () => { return { error: e.data.error }; } };
                if (result.onerror && typeof result.onerror === 'function') {
                    result.onerror(e.data.error);
                }
                db.callbacks[e.data.id](e.data.error, e.data.response);
                db.callbacks[e.data.id] = undefined;
                break;

            case 'backup':
                options.db.backup(e.data.backup, e.data.backupKey);
                break;

            case 'restore':
                options.db.backup(e.data.restoreKey).then(response => {
                    db.worker.postMessage({ type: 'restore', id: e.data.id, restore: response });
                }).catch(() => {
                    db.worker.postMessage({ type: 'restore', id: e.data.id, restore: {} });
                });
                break;

            case 'result':
                db.callbacks[e.data.id](e.data.error, e.data.response);
                db.callbacks[e.data.id] = undefined;
                break;

            default:
                break;
        }
    };

    const result = require('./js/api')(PluriDB.modules.api, db, datatype);
    return result;
}
// Declaration of default modules
PluriDB.modules = require('./js/default_modules/defaultModule');
/**
 * A module that can be loaded to PluriDB
 * @typedef {Object} PluriDBModule
 * @property {Object} api - List of APIS.
 * @property {Object} datatype - List of datatypes.
 * @property {Object} parser - List of Parsers.
 * @property {Object} storage - List of custom Storages.
 */
/**
 * Imports modules to PluriDB
 * @param  {...PluriDBModule} modules
 */
PluriDB.loadModule = function (...modules) {
    for (let index = 0; index < modules.length; index++) {
        const module = modules[index];
        if (module.api) {
            PluriDB.modules.api = { ...PluriDB.modules.api, ...module.api };
        }
        if (module.parser) {
            PluriDB.modules.parser = { ...PluriDB.modules.parser, ...module.parser };
        }
        if (module.datatype) {
            PluriDB.modules.datatype = { ...PluriDB.modules.datatype, ...module.datatype };
        }
        if (module.storage) {
            PluriDB.modules.storage = { ...PluriDB.modules.storage, ...module.storage };
        }
    }
};

module.exports = PluriDB;
