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

## SQL Module language

(The symbols &lt; and &gt; means the parameter is optional)

### CREATE TABLE

Syntax:
```sql
    CREATE TABLE table_name (

        column1 datatype <constraints>,

        column2 datatype <constraints>,

        ....

        PRIMARY KEY (columnName),

        < FOREIGN KEY (columnName) REFERENCES
        foreignTableName(foreignTableColumn)>

    );

```

It creates the table table_name . It will contain the columns, with the
datatypes and constraints specified, the constraints are optional, and they
are:

*   NOT_NULL The column value won’t be null
*   UNIQUE The column value won’t be repeated
*   DEFAULT If the column value is not specified, it will be the default
*   AUTO_INCREMENT If the column value is not specified, it will be the the next one, only available with datatype number.

The possible datatypes are:

*   NUMBER
*   STRING
*   BOOLEAN

IndexSQL will accept other SQL datatypes like VARCHAR but it will assign
them one of the primitive datatypes and it won’t check the length of the
columns data.

The primary key is a column that will act as the key to the whole column.
It will be NOT_NULL and UNIQUE by default.

The foreign keys will be a series of keys that are related to another
column in another table. It means that during the insertion, it will check
if the value of the column exists on the foreign table.

### DROP TABLE

Syntax: 
```sql
    DROP TABLE table_name;
```

It will delete the table_name table and all their values. This action
cannot be reverted.

### TRUNCATE TABLE

Syntax: 

```sql
    DROP TRUNCATE table_name;”
```

It will delete all the values of the table_name table and leave it clean.
This action cannot be reverted.

### TABLES

Syntax: 
```sql
TABLES;
```

It will return a list with all the tables of the system.

### INSERT INTO

Syntax: 
```sql
    INSERT INTO table_name <(column1, column2, column3, ...)>
        VALUES (value1, value2, value3, ...);
```

It will insert the values into the table_name. The columns are optional, if
they are not specified, it will take the values in the order the table was
originally created.

If the columns contain the primary key, and the primary key matches any
other primary key of the table. It will rewrite the contents.

### SELECT

Syntax: 
```sql
    SELECT <DISTINCT> column1, column2, ... FROM table_name <
    WHERE condition> <ORDER BY column1 ASC|DESC, column2 ASC|DESC, ... ;>
```

It will return the values selected. To select all columns, you can write an
asterisk (*) instead.

The DISTINCT parameter will make any rows that are the same to collapse into one.

The WHERE and ORDER BY statements are optional.

To see more about the WHERE statement, check [here](#the-where-statement).

The ORDER BY will order the columns by the list provided, ASC means
ascendant and DESC is descendant. If it’s not specified it will be ASC. If
the columns are the same, it will check the next column in the list.

### UPDATE

Syntax: 
```sql
    UPDATE table_name SET column1 = value1, column2 = value2, ...
        <WHERE condition;>
```

It will update the columns with the new values provided.

The WHERE statement is optional, if it is not specified, it will update all
the rows of the table.

To see more about the WHERE statement, check [here](#the-where-statement).


### DELETE

Syntax: 
```sql
    DELETE FROM table_name <WHERE condition>;
```

It will delete the columns.

The WHERE statement is optional, if it is not specified, it will delete all
the rows of the table.

To see more about the WHERE statement, check [here](#the-where-statement).

### START TRANSACTION

Syntax: 
```sql
    START TRANSACTION;
```

It starts a transaction, any operation performed during the transaction
won’t be recorded into the database. Any errors encountered during a
transaction will halt the execution of all the queries, including the ones
outside the transaction.

### END TRANSACTION

Syntax: 
```sql
    END TRANSACTION;
```

It ends a transaction, committing all the changes made during the
transaction to the database.

### The WHERE statement

Syntax: 
```sql
    WHERE condition
```

It will match the columns that check the conditions. It supports a series
of operations:

| Operator | Description                         |
|----------|-------------------------------------|
| =        | Equal                               |
| >        | Greater than                        |
| <        | Less than                           |
| >=       | Greater than or equal               |
| <=       | Less than or equal                  |
| <>       | Not equal.                          |
| AND      | Logic and                           |
| OR       | Logic or                            |
| NOT      | Logic not                           |
| TRUE     | Logic true                          |
| FALSE    | Logic false                         |
| IS       | Similar to =                        |
| NULL     | Matches empty values                |
| ()       | Used to separate between conditions |

The following are some examples of WHERE statements:

```sql
    WHERE Age = 1
    WHERE Name = “Pipo”
    WHERE IsMale = TRUE
    WHERE Age > 5
    WHERE NOT (Age > 5 AND IsMale = TRUE)
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