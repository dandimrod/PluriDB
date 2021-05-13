# PluriDB operations API

PluriDB offers some operations to manage your database.

## new PluriDB(dbName[, options])

* `dbName` [\<string\>][string] The name of the database, used to identify the database if many are created in the same domain.
* `options` [\<Object\>][object] Options to create the database.
    * `worker` [\<boolean\>][boolean] **Default:**`true` If the database should be created using a WebWorker or not. This will allow the database to perform better during heavy data processing since it will be executed on a different core, so the main core won't be stopped.
    * `api` [\<string\>][string] **Default:**`'indexeddb'` What storage api to use. The default storage options are 'indexeddb', 'localstorage' and 'ram'. You can use more with [modules](modules.md).
    * `fallback` [\<boolean\>][boolean] **Default:**`true` If the database is going to be strict with the storage and worker options. PluriDB will try to match the database with the options provided by the developer, but if the user doesn't have any of them available, PluriDB will try to find a fallback. Setting this to false will generate an error if the user browser doesn't support the options.
    * `db` [\<dbConfig\>][dbConfig] The configuration of the database that can be updated later.

```js
    db = new PluriDB('demo',{
        worker: true, // Will it use a webworker or not?
        api: 'indexeddb', // What technology to use
        fallback: true, // Allows fallback?
        db:{
            backup: undefined, // function for backup
            restore: undefined, // function for restore
            encrypt: false, // password for encryption
        }
    });
```

## db.init(callback)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result if it has loaded well.

This method initiates the database. Handling errors here is important for errors in some module loads, encryption problems or restoration errors.

```js
    db.init((error, result) => {
        if(error){
            console.error(error);
        }
        console.log(result);
    });
```

## db.updateDB(callback, dbConfig)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result if it has updated the `dbConfig` well.
* `dbConfig` [\<dbConfig\>][dbConfig] The new configuration of the database.

This method updates the `dbConfig`.

```js
    db.updateDB((error, result) => {
        if(error){
            console.error(error);
        }
        console.log(result);
    },
    {
        backup: undefined,
        restore: undefined,
        encrypt: false,
    });
```

## db.drop(callback)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result if it has dropped the database well.

This method drops the database. After the execution of this method. The instance of the database won't be able to continue. If you want to access the same database again, you will have to instantiate it again.

```js
    db.drop((error, result) => {
        if(error){
            console.error(error);
        }
        console.log(result);
    });
```

## db.forceBackup(callback)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result if it has backup the database well.

This method saves all the current data in the database and makes a backup. Usefull when the user is about to close the application.

```js
    db.forceBackup((error, result) => {
        if(error){
            console.error(error);
        }
        console.log(result);
    });
```
## db.execute(callback, type[, ...args])
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result if it has executed the query well.
* `type` [\<string\>][string] The parser module that is going to execute the query.

This method bypasses the modules api and can call directly to a parser module in the server. Useful for creating and testing new modules.

**This method should not be used directly**

```js
    db.execute((error, result) => {
        if(error){
            console.error(error);
        }
        console.log(result);
    },
    'default', 'tables', 'getTables'
    );
```

## db.promise.init()
* Returns: [\<Promise\>][promise]
This method initiates the database. Handling errors here is important for errors in some module loads, encryption problems or restoration errors.

```js
    db.promise.init().then(console.log).catch(console.error);
```

## db.promise.updateDB(dbConfig)
* `dbConfig` [\<dbConfig\>][dbConfig] The new configuration of the database.
* Returns: [\<Promise\>][promise]

This method updates the `dbConfig`.

```js
    db.promise.updateDB({
        backup: undefined,
        restore: undefined,
        encrypt: false,
    }).then(console.log).catch(console.error);
```

## db.promise.drop()
* Returns: [\<Promise\>][promise]

This method drops the database. After the execution of this method. The instance of the database won't be able to continue. If you want to access the same database again, you will have to instantiate it again.

```js
    db.promise.drop().then(console.log).catch(console.error);
```
## db.promise.forceBackup()
* Returns: [\<Promise\>][promise]

This method saves all the current data in the database and makes a backup. Usefull when the user is about to close the application.

```js
    db.promise.forceBackup().then(console.log).catch(console.error);
```

## db.promise.execute(type[, ...args])
* `type` [\<string\>][string] The parser module that is going to execute the query.
* Returns: [\<Promise\>][promise]

This method bypasses the modules api and can call directly to a parser module in the server. Useful for creating and testing new modules.

**This method should not be used directly**

```js
    db.promise.execute('default', 'tables', 'getTables').then(console.log).catch(console.error);
```

## PluriDB.loadModule(...modules)
* `module` [\<PluriDBModule\>][pluridbmodule] A module for loading into PluriDB

This method loads a new module into PluriDB

```js
    const PluriDB = require('pluridb');
    const PluriDBModule = require('pluridb-module');

    PluriDB.loadModule(PluriDBModule);
```

## dbConfig

* `encrypt` [\<string\>][string] | [\<boolean\>][boolean] **Default:**`false` The password to encrypt the database, set it to false for no encryption.
* `backup` [\<Function\>][function] **Default:**`undefined` Function that has two parameters key and data, both string. It should save the data paired with a key for later restoration.
* `restore` [\<Function\>][function] **Default:**`undefined` Function that has one parameter key string and should return a [\<Promise][promise][\<string\>][string][\>][promise] with the data previously saved by backup
```js
    {
        backup: async (key, data) => { // function for backup
            fetch('/saveData', {
                method: 'POST',
                body:JSON.stringify({ key, data })
            })
        }, 
        restore: async (key) => { // function for restore
            const data = await fetch('/retrieveData?key=' + key).then(res=>res.text());
            return data;
        },
        encrypt: 'totalsecret123', // password for encryption
    }
```
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[dbConfig]: databaseApi.md#dbconfig
[pluridbmodule]: creatingModules.md#module