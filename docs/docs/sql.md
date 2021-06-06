# PluriDB SQL module

The SQL module of PluriDB can read SQL text and directly parse it into the database.
You need PluriDB to use this module. For more information [PluriDB](https://dandimrod.dev/PluriDB)

## Installation

To install the sql module, first you have to install it by npm:

    npm i --save pdbm-sql

Or by CDN [https://cdn.jsdelivr.net/npm/pdbm-sql@latest/](https://cdn.jsdelivr.net/npm/pdbm-sql@latest/):

```html
    <script src="https://cdn.jsdelivr.net/npm/pdbm-sql@latest/pdbm_sql.js"></script>
```

Afterwards you need to load the module by:

```js
    const PluriDB = require('pluridb');
    const PluriDBSQL = require('pdbm-sql');

    PluriDB.loadModule(PluriDBSQL);
```

## Api/Parser

This is the specifiactions of the sql module:

## db.m.sql.query(callback, query)
* `callback` [\<Function\>][function] Callback with two paramethers, an error and a result with the metadata of the table you are accessing.
* `query` [\<string\>][string] The SQL query you want to execute.

This method executes an SQL query into the database.

```js

        db.m.sql.query(
            (error, result) => {
                if(error){
                    console.error(error);
                }
                console.log(result);
            },
        `
            START TRANSACTION;
            DROP TABLE Persons;
            DROP TABLE Orders;
            CREATE TABLE Persons (
                PersonID number NOT_NULL AUTO_INCREMENT,
                Name string NOT_NULL,
                IsMale boolean NOT_NULL,
                PRIMARY KEY (PersonID)
            );
            CREATE TABLE Orders (
                OrderID number NOT_NULL AUTO_INCREMENT,
                OrderNumber number NOT_NULL,
                PersonID number,
                PRIMARY KEY (OrderID),
                FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)
            );
            INSERT INTO Persons (Name, IsMale)
                VALUES ("pipo", true);
            INSERT INTO Persons (Name, IsMale)
                VALUES ("pepa", false);
            INSERT INTO Orders (OrderNumber, PersonID) 
                VALUES (1,0);
            SELECT Name FROM Persons;
            SELECT Name,IsMale FROM Persons ORDER BY Name, IsMale DESC;
            SELECT * FROM Persons ORDER BY PersonID DESC;
            SELECT * FROM Persons WHERE Name="pipo";
            SELECT * FROM Persons WHERE IsMale=false;
            SELECT * FROM Persons WHERE PersonID=0;
            SELECT * FROM Persons WHERE Name="pipo" OR IsMale=false;
            SELECT * FROM Persons WHERE Name="pipo" AND IsMale=false;
            SELECT * FROM Persons WHERE NOT( Name="pipo" AND IsMale=false);
            UPDATE Persons SET IsMale=false;
            SELECT * FROM Persons;
            UPDATE Persons SET IsMale=true WHERE Name="pipo";
            SELECT * FROM Persons;
            DELETE FROM Orders;
            SELECT * FROM Orders;
            DELETE FROM Persons WHERE IsMale=false;
            SELECT * FROM Persons;
            END TRANSACTION;
    `);

```

## db.m.sql.queryPromise(query)
* `query` [\<string\>][string] The SQL query you want to execute.
* Returns: [\<Promise\>][promise]

This method executes an SQL query into the database.

```js

    db.m.sql.queryPromise(`
        START TRANSACTION;
        DROP TABLE Persons;
        DROP TABLE Orders;
        CREATE TABLE Persons (
            PersonID number NOT_NULL AUTO_INCREMENT,
            Name string NOT_NULL,
            IsMale boolean NOT_NULL,
            PRIMARY KEY (PersonID)
        );
        CREATE TABLE Orders (
            OrderID number NOT_NULL AUTO_INCREMENT,
            OrderNumber number NOT_NULL,
            PersonID number,
            PRIMARY KEY (OrderID),
            FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)
        );
        INSERT INTO Persons (Name, IsMale)
            VALUES ("pipo", true);
        INSERT INTO Persons (Name, IsMale)
            VALUES ("pepa", false);
        INSERT INTO Orders (OrderNumber, PersonID) 
            VALUES (1,0);
        SELECT Name FROM Persons;
        SELECT Name,IsMale FROM Persons ORDER BY Name, IsMale DESC;
        SELECT * FROM Persons ORDER BY PersonID DESC;
        SELECT * FROM Persons WHERE Name="pipo";
        SELECT * FROM Persons WHERE IsMale=false;
        SELECT * FROM Persons WHERE PersonID=0;
        SELECT * FROM Persons WHERE Name="pipo" OR IsMale=false;
        SELECT * FROM Persons WHERE Name="pipo" AND IsMale=false;
        SELECT * FROM Persons WHERE NOT( Name="pipo" AND IsMale=false);
        UPDATE Persons SET IsMale=false;
        SELECT * FROM Persons;
        UPDATE Persons SET IsMale=true WHERE Name="pipo";
        SELECT * FROM Persons;
        DELETE FROM Orders;
        SELECT * FROM Orders;
        DELETE FROM Persons WHERE IsMale=false;
        SELECT * FROM Persons;
        END TRANSACTION;
    `).then(console.log).catch(console.error);

```

[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[any]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects