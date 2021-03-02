function Server (Storage, Parser, Database) {
    return function (dbName, options, modules) {
        let database;
        let parser;
        async function main () {
            const storage = Storage(dbName, options.storage, options.fallback, modules.storage);
            database = Database(dbName, options.db, storage);
            parser = Parser(database, modules.parser);
            await database.init();
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
                        result = await database.updateOptions(e.data.updateOptions);
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
                postMessage(result);
            } catch (error) {
                postMessage({ error: error.message, id: e.data.id });
            }
        }
        // This only works if we are on no worker mode;
        // eslint-disable-next-line no-unused-expressions
        'start no worker';
        const returnData = {
            onmessage,
            postMessage: function (e, ...args) {
                messageHandler({ data: e }, ...args);
            }
        };
        function postMessage (e, ...args) {
            returnData.onmessage({ data: e }, ...args);
        }
        return returnData;
    };
}

module.exports = Server;
