# Welcome to PluriDB

A flexible database for the frontend.

## What is PluriDB?

PluriDB is a database capable to adapt to a lot of storage apis used in the frontend, including indexedDB and localstorage. It also uses fallbacks to check what the perfect storage will be for every user.

To access the database, you can use modules to use the language you are more confortable with, from SQL to MongoDB.

### Main features

## Demo

You can check an [online demo](https://dandimrod.dev/PluriDB/demo/) of how the database works and what different operations you can use on it!

## Installing PluriDB

You have two different methods to install PluriDB:

### NPM

Installing PluriDB using NPM is as easy as using the command:

    npm i --save pluridb

You can also install additional modules by checking the [list](https://dandimrod.dev/PluriDB/docs/#modules).

### CDN

You can use [https://cdn.jsdelivr.net/npm/pluridb@latest/](https://cdn.jsdelivr.net/npm/pluridb@latest/PluriDB.js) to access the latests builds of PluriDB.

To use it directly from your page, use:

```html
    <script src="https://cdn.jsdelivr.net/npm/pluridb@latest/PluriDB.js"></script>
```
You can also add additional modules by checking the [list](https://dandimrod.dev/PluriDB/docs/#modules).

## Quick start guide

### Loading the modules

Before the instatiation of the database, you should load any of the modules you want to use to the database, since if you instatiate the database before, it won't be able to recognize any new modules.

To load a module, you can use:
```js
    const PluriDB = require('pluridb');
    const PluriDBModule = require('pluridb-module');

    PluriDB.loadModule(PluriDBModule);
```
    

Learn more about modules [here](https://dandimrod.dev/PluriDB/docs/#modules).

### Instatiation of the database

During the creation of the instance you will set up the majority of the configuration paramethers the database is going to accept.

You can set it up like:
```js
    db = new PluriDB('demo',{
        worker: true, // Will it use a webworker or not?
        api: 'indexdb', // What technology to use
        fallback: true, // Allows fallback?
        db:{
            backup: undefined, // function for backup
            restore: undefined, // function for restore
            encrypt: false, // password for encryption
        }
    });
```
You can learn more about the options you can set on the database [here](https://dandimrod.dev/PluriDB/docs/#/databaseApi?id=new-pluridbdbname-options).

### Initiate the database

After the instatiation of the database, you need to initiate it. This step ensures that all the modules are loading correctly and that the password to the database is correct.

Here we can see how to initiate the database:
```js
    db.init((error, result)=>{
        if(error){
            console.error(error);
        }
        console.log(result);
    })
```
Or as a promise:
```js
    db.promise.init().then(console.log).catch(console.error)
```
You can check more information on init and other high level operations of the database [here](https://dandimrod.dev/PluriDB/docs/#/databaseApi?id=dbinitcallback).

### Accessing and modifying the data.

Finally, for interacting with the database you can use a module as the api to interact with the data. You can access the list [here](https://dandimrod.dev/PluriDB/docs/#/modules?id=storage-modules).