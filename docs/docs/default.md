# PluriDB default module

The default module is the module that comes bundled with PluriDB, it has the most common utilities needed to start the database.

## Installation

The default module comes bundled with PluriDB so it doesn't need to be installed. If you want to know how to install PluriDB you can review [this guide](README.md#installing-pluridb).

## Descoped function

The default module relays on sending functions from the main thread of javascript to the worker thread. As such, functions have to be serialized before being sent to the worker. During this process the funtion losses it's scope. We can see this with an example

```js

const year = 1950; //This variable is on the scope of the function but it will get lost by the serialization.

db.m.default.promise.data.getData('person',
    person => person.yearBorn === year
)

```
This will generate an error on the query, 'year is not defined', cause the function has lost the scope of the variable year. 
This is the main reason why the api/parser of the default module should only be used for testing.
To circunvent this limitation, default modules offers the following utility function:

### db.m.default.scopedFunction(executable, scope)
* `executable` [\<Function\>][function] The function you want to scope.
* `scope` [\<Object\>][object] A serializable (It can be JSON.strigified) object with the variables you want to scope.
* Returns: [\<Function\>][function] The scoped function.

This method allows us to scope some variables and introduce it into a function.


```js

const year = 1950; //This variable is on the scope of the function but it will get lost by the serialization.

db.m.default.promise.data.getData('person',
    db.m.default.scopedFunction(
        person => person.yearBorn === year,
        { year } // We introduce this variable into the scope
    )
);

// If the variable year is changed afterwards, it won't affect the default variable

```

## Datatypes

The default module comes bundled with the following datatypes:

* \<any\> It can match any other datatype, making it useful for wildcards additon to the database
* \<object\> A javascript object.
* \<array\> A javascript array.
* \<reference\> A reference to another entry on another table of the database.
* \<string\> A javascript string.
* \<number\> A javascript number.
* \<boolean\> A javascript boolean.
* \<function\> A descoped function.

## Storage

The default module gives access to the following storage apis.

* `indexeddb` *tier 2* Api to store data in the browser. It might have a maximum memory limitation in some browsers. [More info](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
* `localstorage` *tier 1* Api to store data in the browser. It has a maximum memory limitation. [More info](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
* `ram` *tier 0* Does not store it anywhere, it justs keeps it in the ram. All the content is lost withing refresh.

## Api/Parser

This is the specifiactions of the default module:

## db.m.default.tables.getTable(callback, name)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result with the metadata of the table you are accessing.
* `name` [\<string\>][string] The name of the table you want to access.

This method gives the metadata of the table you want to access. Follows the same conventions as the [paramether structure](default.md#dbmdefaulttablescreatetablecallback-name-structure)

```js

    db.m.default.tables.getTable(
        (error, result) => {
            if(error){
                console.error(error);
            }
            console.log(result);
        },
        'people'
    );

```

## db.m.default.tables.getTables(callback)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result with the list of the tables in the system.

This method gives you a list of all the tables in the database.

```js
    db.m.default.tables.getTables(
        (error, result) => {
            if(error){
                console.error(error);
            }
            console.log(result);
        }
    );
```

## db.m.default.tables.createTable(callback, name, structure)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result when the table has been created.
* `name` [\<string\>][string] The name of the table you want to create.
* `structure` [\<Object\>][object] The structure of the table.
    * `columns` [\<Object\>][object] The columns you want your database to have.
        * `[any]` [\<Object\>][object] Any is the name of the column, if the name of the column is * the specification will apply to any value that has no column assigned.
            * `type` [\<string\>][string] The datatype you want to store here. you can learn more [here](modules.md#datatype-modules).
            * `constraint` [\<Function\[\]\>][function] A list of functions that the value has to pass to be accepted into the database.
            * `unique` [\<boolean\>][boolean] If the value cannot be repeated in the database
            * `default` [\<any\>][default.md#dbmdefaulttablescreatetablecallback-name-structure] A default value if no value is specified. It has to follow the constraints and type declared before.
            * `meta` [\<Object\>][object] Metadata to store in the column (Useful for parsers).
            * `to` [\<string\>][string] Add only to the columns with the type `reference`. The name of the table the values of this column refers to.
    * `meta` [\<Object\>][object] Metadata to store in the table (Useful for parsers).


This method allows you to create a new table on the database.

```js
    db.m.default.promise.tables.createTable(
        (error, result) => {
            if(error){
                console.error(error);
            }
            console.log(result);
        },
        'people',
        {
            columns:{
                name: {
                    type: 'string', // Type, it can be 'string' 'boolean' 'number' 'array' 'object' or 'any'
                    constraints: [], // List of rules that has to be true to be inserted on the table
                    unique: false, // Is unique in the table
                    default: undefined, //Default value if non specified
                    meta: {  //Any metadata that is needed on the column 

                    }
                },
                age: {
                    type: 'number',
                    constraints: [
                        (value)=>{
                            return value>=18;   //The introduction of data will fail if the user is less than 18
                        }
                    ]
                },
            }
        }
    );
```


## db.m.default.tables.deleteTable(callback, name)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result when the table is deleted.
* `name` [\<string\>][string] The name of the table you want to deñete.

This method deletes a table and all its data.

```js

    db.m.default.tables.deleteTable(
        (error, result) => {
            if(error){
                console.error(error);
            }
            console.log(result);
        },
        'people'
    );
```

## db.m.default.tables.updateTable(callback, name, structure)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result when the table has been updated.
* `name` [\<string\>][string] The name of the table you want to update.
* `structure` [\<Object\>][object] The structure of the table.
    * `columns` [\<Object\>][object] The columns you want your database to have.
        * `[any]` [\<Object\>][object] Any is the name of the column, if the name of the column is * the specification will apply to any value that has no column assigned.
            * `type` [\<string\>][string] The datatype you want to store here. you can learn more [here](modules.md#datatype-modules).
            * `constraint` [\<Function\[\]\>][function] A list of functions that the value has to pass to be accepted into the database.
            * `unique` [\<boolean\>][boolean] If the value cannot be repeated in the database
            * `default` [\<any\>][default.md#dbmdefaulttablescreatetablecallback-name-structure] A default value if no value is specified. It has to follow the constraints and type declared before.
            * `meta` [\<Object\>][object] Metadata to store in the column (Useful for parsers).
            * `to` [\<string\>][string] Add only to the columns with the type `reference`. The name of the table the values of this column refers to.
    * `meta` [\<Object\>][object] Metadata to store in the table (Useful for parsers).


This method allows you to update a table on the database.

```js
    db.m.default.promise.tables.updateTable(
        (error, result) => {
            if(error){
                console.error(error);
            }
            console.log(result);
        },
        'people',
        {
            columns:{
                name: {
                    type: 'string', // Type, it can be 'string' 'boolean' 'number' 'array' 'object' or 'any'
                    constraints: [], // List of rules that has to be true to be inserted on the table
                    unique: false, // Is unique in the table
                    default: undefined, //Default value if non specified
                    meta: {  //Any metadata that is needed on the column 

                    }
                },
                age: {
                    type: 'number',
                    constraints: [
                        (value)=>{
                            return value>=18;   //The introduction of data will fail if the user is less than 18
                        }
                    ]
                },
            }
        }
    );
```

## db.m.default.data.getData(callback, tableName, filter, tree, trasform)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result with the data of the table you are accessing.
* `tableName` [\<string\>][string] The name of the table you want to access.
* `filter` [\<Function\>][function] A function to filter the results of the table.
* `tree` [\<string\[\]\>][string] An array of strings that have slashes, it joins reference values with the values of other tables integrating them into the tree.
* `trasform` [\<Object\[\]\>][object] An array of object that makes transformations in the data before sending it back.
    * `type` [\<string\>][string] The type of function that you want to execute, it can be `filter`, `map`, `sort`, `reduce`, `reduceRight`.
    * `executable` [\<Function\>][function] The function to be executed. The parameters and return depends on the type.

This method gives you an object with the data that you are requesting on the database.

```js
    db.m.default.data.getData(
        (error, result) => {
            if(error){
                console.error(error);
            }
            console.log(result);
        },
        'pet',
        (value)=>{
            return value.name === 'coco';
        }, // filter function
        ['owner'] // The paramether here will exchange references with the object inserted in the database (Like SQL JOIN)
    );

```
The types of functions in trasform are:

### filter(value[, key [, registry[, index]]])
* value [\<Object\>][object] The value of the column.
* key [\<string\>][string] The id of the value in the database.
* registry [\<Object\>][object] All the values of the database.
* index [\<number\>][number] The order of the value in the database.
* Returns: [\<boolean\>][boolean] If the value passes the filter or not.

### map(value[, key [, registry[, index]]])
* value [\<Object\>][object] The value of the column.
* key [\<string\>][string] The id of the value in the database.
* registry [\<Object\>][object] All the values of the database.
* index [\<number\>][number] The order of the value in the database.
* Returns: [\<any\>][any] The new value that will be in place.

### sort(valueA, valueB, keyA, keyB)
* valueA [\<Object\>][object] The value of the column A.
* valueB [\<Object\>][object] The value of the column B.
* keyA [\<string\>][string] The id of the value A in the database.
* keyB [\<string\>][string] The id of the value B in the database.
* Returns: [\<number\>][number] 1 if A is bigger, -1 if B is bigger, 0 if they are equal.

### reduce(currentValue, value[, key [, registry[, index]]])
* currentValue [\<any\>][any] The current value of the reduction.
* value [\<Object\>][object] The value of the column.
* key [\<string\>][string] The id of the value in the database.
* registry [\<Object\>][object] All the values of the database.
* index [\<number\>][number] The order of the value in the database.
* Returns: [\<any\>][any] The next value of the reduction.

### reduceRight(currentValue, value[, key [, registry[, index]]])
* currentValue [\<any\>][any] The current value of the reduction.
* value [\<Object\>][object] The value of the column.
* key [\<string\>][string] The id of the value in the database.
* registry [\<Object\>][object] All the values of the database.
* index [\<number\>][number] The order of the value in the database.
* Returns: [\<any\>][any] The next value of the reduction.


## db.m.default.data.createData(callback, tableName, data)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result when the data is created.
* `tableName` [\<string\>][string] The name of the table you want to access.
* `data` [\<Object\>][object] The data to introduce in the database.
This method introduces a new entry into the database.

```js
    db.m.default.data.createData(
        (error, result) => {
            if(error){
                console.error(error);
            }
            console.log(result);
        },
        'people',
        { 
            name: 'john doe',   // We introduce the values to the database
            age: 26 
        }
    );

```

## db.m.default.data.deleteData(callback, tableName, filter, tree)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result when the data is deleted.
* `tableName` [\<string\>][string] The name of the table you want to access.
* `filter` [\<Function\>][function] A function to filter the entries you want to delete.
* `tree` [\<string\[\]\>][string] An array of strings that have slashes, it joins reference values with the values of other tables integrating them into the tree.
This method deletes entries from the database that matches the filter
```js
    db.m.default.data.deleteData(
        (error, result) => {
            if(error){
                console.error(error);
            }
            console.log(result);
        },
        'people', 
        (value)=>{
            return value.name ===  'john smith'; //This is our filter function
        }
    );

```

## db.m.default.data.updateData(callback, tableName, data, filter, tree)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result when the data is created.
* `tableName` [\<string\>][string] The name of the table you want to access.
* `data` [\<Object\>][object] The data to introduce in the database.
* `filter` [\<Function\>][function] A function to filter the entries you want to update.
* `tree` [\<string\[\]\>][string] An array of strings that have slashes, it joins reference values with the values of other tables integrating them into the tree.
This method deletes entries from the database that matches the filter
```js
    db.m.default.data.deleteData(
        (error, result) => {
            if(error){
                console.error(error);
            }
            console.log(result);
        },
        'people', { 
            name: 'john smith',   // We introduce the values to the database
            age: 55
        },
        (value)=>{
            return value.name ===  'john smith'; //This is our filter function
        }
    );

```
## db.m.default.utils.startTransaction(callback)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result when the transaction starts.
This method starts a transaction in the database.
```js
    db.m.default.util.startTransaction(
        (error, result) => {
            if(error){
                console.error(error);
            }
            console.log(result);
        }
    );

```

## db.m.default.utils.endTransaction(callback)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result when the transaction ends.
This method ends a transaction in the database.
```js
    db.m.default.util.endTransaction(
        (error, result) => {
            if(error){
                console.error(error);
            }
            console.log(result);
        }
    );

```
## db.m.default.promise.tables.getTable(name)
* `name` [\<string\>][string] The name of the table you want to access.
* Returns: [\<Promise\>][promise]

This method gives the metadata of the table you want to access. Follows the same conventions as the [paramether structure](default.md#dbmdefaulttablescreatetablecallback-name-structure)

```js

    db.m.default.tables.getTable(
        'people'
    ).then(console.log).catch(console.error);

```

## db.m.default.promise.tables.getTables()
* Returns: [\<Promise\>][promise]

This method gives you a list of all the tables in the database.

```js
    db.m.default.tables.getTables().then(console.log).catch(console.error);
```

## db.m.default.promise.tables.createTable(name, structure)
* `name` [\<string\>][string] The name of the table you want to create.
* `structure` [\<Object\>][object] The structure of the table.
    * `columns` [\<Object\>][object] The columns you want your database to have.
        * `[any]` [\<Object\>][object] Any is the name of the column, if the name of the column is * the specification will apply to any value that has no column assigned.
            * `type` [\<string\>][string] The datatype you want to store here. you can learn more [here](modules.md#datatype-modules).
            * `constraint` [\<Function\[\]\>][function] A list of functions that the value has to pass to be accepted into the database.
            * `unique` [\<boolean\>][boolean] If the value cannot be repeated in the database
            * `default` [\<any\>][default.md#dbmdefaulttablescreatetablecallback-name-structure] A default value if no value is specified. It has to follow the constraints and type declared before.
            * `meta` [\<Object\>][object] Metadata to store in the column (Useful for parsers).
            * `to` [\<string\>][string] Add only to the columns with the type `reference`. The name of the table the values of this column refers to.
    * `meta` [\<Object\>][object] Metadata to store in the table (Useful for parsers).
* Returns: [\<Promise\>][promise]


This method allows you to create a new table on the database.

```js
    db.m.default.promise.tables.createTable(
        'people',
        {
            columns:{
                name: {
                    type: 'string', // Type, it can be 'string' 'boolean' 'number' 'array' 'object' or 'any'
                    constraints: [], // List of rules that has to be true to be inserted on the table
                    unique: false, // Is unique in the table
                    default: undefined, //Default value if non specified
                    meta: {  //Any metadata that is needed on the column 

                    }
                },
                age: {
                    type: 'number',
                    constraints: [
                        (value)=>{
                            return value>=18;   //The introduction of data will fail if the user is less than 18
                        }
                    ]
                },
            }
        }
    ).then(console.log).catch(console.error);
```


## db.m.default.promise.tables.deleteTable(name)
* `name` [\<string\>][string] The name of the table you want to deñete.
* Returns: [\<Promise\>][promise]

This method deletes a table and all its data.

```js

    db.m.default.tables.deleteTable(
        'people'
    ).then(console.log).catch(console.error);
```

## db.m.default.promise.tables.updateTable(name, structure)
* `name` [\<string\>][string] The name of the table you want to update.
* `structure` [\<Object\>][object] The structure of the table.
    * `columns` [\<Object\>][object] The columns you want your database to have.
        * `[any]` [\<Object\>][object] Any is the name of the column, if the name of the column is * the specification will apply to any value that has no column assigned.
            * `type` [\<string\>][string] The datatype you want to store here. you can learn more [here](modules.md#datatype-modules).
            * `constraint` [\<Function\[\]\>][function] A list of functions that the value has to pass to be accepted into the database.
            * `unique` [\<boolean\>][boolean] If the value cannot be repeated in the database
            * `default` [\<any\>][default.md#dbmdefaulttablescreatetablecallback-name-structure] A default value if no value is specified. It has to follow the constraints and type declared before.
            * `meta` [\<Object\>][object] Metadata to store in the column (Useful for parsers).
            * `to` [\<string\>][string] Add only to the columns with the type `reference`. The name of the table the values of this column refers to.
    * `meta` [\<Object\>][object] Metadata to store in the table (Useful for parsers).
* Returns: [\<Promise\>][promise]



This method allows you to update a table on the database.

```js
    db.m.default.promise.tables.updateTable(
        'people',
        {
            columns:{
                name: {
                    type: 'string', // Type, it can be 'string' 'boolean' 'number' 'array' 'object' or 'any'
                    constraints: [], // List of rules that has to be true to be inserted on the table
                    unique: false, // Is unique in the table
                    default: undefined, //Default value if non specified
                    meta: {  //Any metadata that is needed on the column 

                    }
                },
                age: {
                    type: 'number',
                    constraints: [
                        (value)=>{
                            return value>=18;   //The introduction of data will fail if the user is less than 18
                        }
                    ]
                },
            }
        }
    ).then(console.log).catch(console.error);
```

## db.m.default.promise.data.getData(tableName, filter, tree, trasform)
* `tableName` [\<string\>][string] The name of the table you want to access.
* `filter` [\<Function\>][function] A function to filter the results of the table.
* `tree` [\<string\[\]\>][string] An array of strings that have slashes, it joins reference values with the values of other tables integrating them into the tree.
* `trasform` [\<Object\[\]\>][object] An array of object that makes transformations in the data before sending it back.
    * `type` [\<string\>][string] The type of function that you want to execute, it can be `filter`, `map`, `sort`, `reduce`, `reduceRight`.
    * `executable` [\<Function\>][function] The function to be executed. The parameters and return depends on the type.
* Returns: [\<Promise\>][promise]

This method gives you an object with the data that you are requesting on the database.

```js
    db.m.default.data.getData(
        'pet',
        (value)=>{
            return value.name === 'coco';
        }, // filter function
        ['owner'] // The paramether here will exchange references with the object inserted in the database (Like SQL JOIN)
    ).then(console.log).catch(console.error);

```
The types of functions in trasform are:

### filter(value[, key [, registry[, index]]])
* value [\<Object\>][object] The value of the column.
* key [\<string\>][string] The id of the value in the database.
* registry [\<Object\>][object] All the values of the database.
* index [\<number\>][number] The order of the value in the database.
* Returns: [\<boolean\>][boolean] If the value passes the filter or not.

### map(value[, key [, registry[, index]]])
* value [\<Object\>][object] The value of the column.
* key [\<string\>][string] The id of the value in the database.
* registry [\<Object\>][object] All the values of the database.
* index [\<number\>][number] The order of the value in the database.
* Returns: [\<any\>][any] The new value that will be in place.

### sort(valueA, valueB, keyA, keyB)
* valueA [\<Object\>][object] The value of the column A.
* valueB [\<Object\>][object] The value of the column B.
* keyA [\<string\>][string] The id of the value A in the database.
* keyB [\<string\>][string] The id of the value B in the database.
* Returns: [\<number\>][number] 1 if A is bigger, -1 if B is bigger, 0 if they are equal.

### reduce(currentValue, value[, key [, registry[, index]]])
* currentValue [\<any\>][any] The current value of the reduction.
* value [\<Object\>][object] The value of the column.
* key [\<string\>][string] The id of the value in the database.
* registry [\<Object\>][object] All the values of the database.
* index [\<number\>][number] The order of the value in the database.
* Returns: [\<any\>][any] The next value of the reduction.

### reduceRight(currentValue, value[, key [, registry[, index]]])
* currentValue [\<any\>][any] The current value of the reduction.
* value [\<Object\>][object] The value of the column.
* key [\<string\>][string] The id of the value in the database.
* registry [\<Object\>][object] All the values of the database.
* index [\<number\>][number] The order of the value in the database.
* Returns: [\<any\>][any] The next value of the reduction.


## db.m.default.promise.data.createData(tableName, data)
* `tableName` [\<string\>][string] The name of the table you want to access.
* `data` [\<Object\>][object] The data to introduce in the database.
* Returns: [\<Promise\>][promise]

This method introduces a new entry into the database.

```js
    db.m.default.data.createData(
        'people',
        { 
            name: 'john doe',   // We introduce the values to the database
            age: 26 
        }
    ).then(console.log).catch(console.error);

```

## db.m.default.promise.data.deleteData(tableName, filter, tree)
* `tableName` [\<string\>][string] The name of the table you want to access.
* `filter` [\<Function\>][function] A function to filter the entries you want to delete.
* `tree` [\<string\[\]\>][string] An array of strings that have slashes, it joins reference values with the values of other tables integrating them into the tree.
* Returns: [\<Promise\>][promise]

This method deletes entries from the database that matches the filter
```js
    db.m.default.data.deleteData(
        'people', 
        (value)=>{
            return value.name ===  'john smith'; //This is our filter function
        }
    ).then(console.log).catch(console.error);

```

## db.m.default.promise.data.updateData(tableName, data, filter, tree)
* `tableName` [\<string\>][string] The name of the table you want to access.
* `data` [\<Object\>][object] The data to introduce in the database.
* `filter` [\<Function\>][function] A function to filter the entries you want to update.
* `tree` [\<string\[\]\>][string] An array of strings that have slashes, it joins reference values with the values of other tables integrating them into the tree.
* Returns: [\<Promise\>][promise]

This method deletes entries from the database that matches the filter
```js
    db.m.default.data.deleteData(
        'people', { 
            name: 'john smith',   // We introduce the values to the database
            age: 55
        },
        (value)=>{
            return value.name ===  'john smith'; //This is our filter function
        }
    ).then(console.log).catch(console.error);

```
## db.m.default.promise.utils.startTransaction()
* Returns: [\<Promise\>][promise]
This method starts a transaction in the database.
```js
    db.m.default.util.startTransaction().then(console.log).catch(console.error);

```

## db.m.default.promise.utils.endTransaction()
* Returns: [\<Promise\>][promise]
This method ends a transaction in the database.
```js
    db.m.default.util.endTransaction().then(console.log).catch(console.error);

```
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[any]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects