# Creating custom modules for PluriDB

Creating a custom module that can be added to PluriDB is as simple as creating an object following the specifications:

## module
* `datatype` [\<Object\>][object] Datatype modules to add.
    * `[any]()` [\<Function\>][function] `[any]` would be the name of the module to add.
        * Returns: [\<Object\>][object] The module to return
            * `isDatatype(value)` [\<Function\>][function] Function that returns true when value is of the datatype `[any]`.
                * `value` [\<any\>] Value to check.
                * Returns: [\<boolean\>][boolean] Returns `true` if the value is of the correct type.
            * `serialize(value)` [\<Function\>][function] This function serializes value into a string.
                * `value` [\<any\>][any] Value to serialize.
                * Returns: [\<string\>][string] The serialized value.
            * `deserialize(value)` [\<Function\>][function] This function deserializes a string to a value of the datatype.
                * `value` [\<string\>][string] Serialized value.
                * Returns: [\<any\>][any] The object deserialized.
            * `ignoreSerialization` [\<boolean\>][boolean] **Default:**`false` If this datatype is not serializable or if it's serialized by iself.
* `storage` [\<Object\>][object] Storage modules to add.
    * `[any](dbName)` [\<Function\>][function] `[any]` would be the name of the module to add.
        * `dbName` [\<string\>][string] The name of the database we are creating.
        * Returns: [\<Object\>][object] The module to return
            * `tier` [\<number\>][number] The tier this storage api has, the bigger the tier, the more fallback options this storage have, the less supported by browsers is. Example: indexeddb is tier 2, localstorage is tier 1 and ram is tier 0.
            * `isSupported()` [\<Function\>][function] If the storage api is supported.
                * Returns: [\<boolean\>][boolean] Returns `true` if the storage solution is supported.
            * `init()` [\<Function\>][function] Function to initialize the storage once it has been selected.
                * Returns: [\<Promise\>][promise] Promise that triggers when the storage is initialized.
            * `save(data, key)` [\<Function\>][function] Function to save data in the storage.
                * `data` [\<string\>][string] Data to save.
                * `key` [\<string\>][string] String where the data will be stored.
                * Returns: [\<Promise\>][promise] Promise that triggers when the data is saved.
            * `load(key)` [\<Function\>][function] Function to retrieve data from the storage.
                * `key` [\<string\>][string] Key where the data was stored.
                * Returns: [\<Promise][promise][\<string\>][string][\>][promise] Promise with the data that was stored.
            * `drop()` [\<Function\>][function] Function to drop the database.
                * Returns: [\<Promise\>][promise] Promise that triggers when the database is dropped.
* `api` [\<Object\>][object] Api module that presents an api that can be accessed from db.m.[\<module-name\>]
    * `[any](execute, JSON2)` [\<Function\>][function] `[any]` would be the name of the module to add.
        * `execute` [\<execute\>][execute] This function should be triggered to access the database.
        * `JSON2` [\<Object\>][object] This object is similar to [Javascript's JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) but it serializes all the data with the installed datatype modules.
        * Returns: [\<Object\>][object] The api that can be accesed from db.m.[\<module-name\>]
* `parser` [\<Object\>][object] Api module that transforms the data from the query of the user to the database own language.
    * `[any](db, JSON2)` [\<Function\>][function] `[any]` would be the name of the module to add.
        * `db` [\<Object\>][object] This object has the same methods as [default][default.md#apiparser] but they are all asycronous and don't accept any callbacks
        * `JSON2` [\<Object\>][object] This object is similar to [Javascript's JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) but it serializes all the data with the installed datatype modules.
        * Returns: [\<Function\>][function] A function that accepts the arguments from the api.
            * Returns[\<Promise\>][promise] This promise should return the data the user queries for.

Here we can see an example of a module:

```js
    {
        datatype: {
            date:()=>{
                return {
                    isDatatype:(value)=>value instanceof Date,
                    serialize:(value)=>value.toISOString(),
                    deserialize:(value)=>new Date(value)
                }
            }
        },
        storage: {
            cloud:(dbName)=>{
                return {
                    tier: 3,
                    isSupported: ()=>!!globalThis.fetch,
                    init: async ()=>await fetch('/authenticate', {method: 'POST'}),
                    save: async (data, key)=>await fetch('/save', {method: 'POST', body: JSON.strigify({data, key})}),
                    load: async (key)=>await fetch('/load?id='+key).then(body=>body.text()),
                    drop: async ()=>await fetch('/drop?id='+dbName, {method: 'DELETE'})
                }
            }
        },
        api: {
            json: (execute, JSON2) => {
                return {
                    save: (key, value) => {
                        return new Promise(resolve, reject){
                            execute((err, result)=>{
                                if(err){
                                    reject(err);
                                }else{
                                    resolve(result);
                                }
                            },
                            'json',
                            'save',
                            key,
                            JSON2.strigify(value)
                            )
                        }
                    },
                    get: (key) => {
                        return new Promise(resolve, reject){
                            execute((err, result)=>{
                                if(err){
                                    reject(err);
                                }else{
                                    resolve(result);
                                }
                            },
                            'json',
                            'get',
                            key
                            )
                        }
                    }
                }
            }
        },
        parser: {
            json: (db, JSON2) => {
                async function save(key, value){
                    const tables = await db.tables.getTables();
                    if (!tables.includes(key)){
                        await db.tables.createTable(key, {columns:{*:{type:'any'}}});
                    }
                    return await db.data.createData(key, JSON2.parse(data))
                }
                async function get(key){
                    return await db.data.getData(key);
                }
                return async (type, key, value)=>{
                    if(type==='get'){
                        return await get(key);
                    }
                    if(type==='save'){
                        return await save(key, value)
                    }
                }
            }
        }
    }
```

[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[any]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
[execute]: databaseApi.md#dbexecutecallback-type-args