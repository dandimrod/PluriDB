function Server (Storage, Parser, Database) {
    return function (dbName, options, modules, context) {
        let storage;
        let database;
        let parser;
        let messageRelay;
        function main () {
            storage = Storage(dbName, options.storage, options.fallback, modules.storage);
            database = Database(dbName, options.db, storage, messageRelay);
            parser = Parser(database, modules.parser, messageRelay);
        }
        main();
        async function messageHandler (e) {
            try {
                const id = e.data.id;
                let result = {};
                switch (e.data.type) {
                    case 'query':
                        result = await parser(e.data);
                        break;

                    case 'updateDB':
                        result = await updateOptions(e.data.updateOptions);
                        break;

                    case 'drop':
                        await database.drop();
                        break;

                    case 'backup':
                        await database.forceBackup();
                        break;

                    case 'restore':
                        await database.restore(e.data);
                        break;
                }
                result.id = id;
                messageRelay(result);
            } catch (error) {
                messageRelay({ error: error.message, id: e.data.id });
            }
        }
        async function updateOptions (newOptions) {
            try {
                parser.loaded = false;
                database.updateOptions(newOptions);
                await database.init();
                parser.loaded = true;
                messageRelay({ type: 'load' });
                return { message: 'Database updated succesfully' };
            } catch (error) {
                messageRelay({
                    type: 'error',
                    error: 'There was an error during the update of the database: ' + error.message
                });
            }
        }
        async function initServices () {
            try {
                await storage.init();
                await database.init();
                parser.init();
                parser.loaded = true;
                messageRelay({ type: 'load' });
            } catch (error) {
                messageRelay({
                    type: 'error',
                    error: 'There was an error during the initialization of the database: ' + error.message
                });
            }
        }
        const init = (context) => {
            let returnData;
            switch (context) {
                case 'worker': {
                    globalThis.onmessage = messageHandler;
                    messageRelay = postMessage;
                    break;
                }
                case 'node': {
                    const { parentPort } = require('worker_threads');
                    parentPort.once('message', messageHandler);
                    messageRelay = parentPort.postMessage;
                    break;
                }
                default: {
                    returnData = {
                        onmessage,
                        postMessage: function (e, ...args) {
                            messageHandler({ data: e }, ...args);
                        }
                    };
                    messageRelay = function (e, ...args) {
                        returnData.onmessage({ data: e }, ...args);
                    };
                }
            }
            initServices();
            return returnData;
        };
        return init(context);
    };
}

module.exports = Server;
