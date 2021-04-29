const isProduction = true;
const modules = [
    // { moduleName: 'pdbm_mongodb', pro: '', dev: '../pdbm_mongodb.js' },
    { pro: 'https://cdn.jsdelivr.net/npm/pluridb@latest/PluriDB.js', dev: '../PluriDB.js' }
];

const examples = {
    'Main uses': {
        'Initialize database': "db = new PluriDB('demo',{\r\n    worker: true, // Will it use a webworker or not?\r\n    api: 'indexdb', // What technology to use\r\n    fallback: true, // Allows fallback?\r\n    db:{\r\n        backup: undefined, // function for backup\r\n        restore: undefined, // function for restore\r\n        encrypt: false, // password for encryption\r\n    }\r\n});",
        'Clear Database': 'db.promise.drop().then(output).catch(output);',
        'Force a backup': 'db.promise.forceBackup().then(output).catch(output); // This won\'t work in the middle of a transaction'
    },
    'Examples of the default module': {
        'Create a table': "db.m.default.promise.tables.createTable('people', {\r\n    columns:{\r\n        name: {\r\n            type: 'string', // Type, it can be 'string' 'boolean' 'number' 'array' 'object' or 'any'\r\n            constraints: [], // List of rules that has to be true to be inserted on the table\r\n            unique: false, // Is unique in the table\r\n            default: undefined, //Default value if non specified\r\n            meta: {  //Any metadata that is needed on the column \r\n\r\n            }\r\n        },\r\n        age: {\r\n            type: 'number',\r\n            constraints: [\r\n                (value)=>{\r\n                    return value>=18;   //The introduction of data will fail if the user is less than 18\r\n                }\r\n            ]\r\n        },\r\n    }\r\n}).then(output).catch(output);\r\n\r\ndb.m.default.promise.tables.createTable('pet', {\r\n    columns:{\r\n        name: {\r\n            type: 'string',\r\n            constraints: [], \r\n            unique: false, \r\n            default: undefined,\r\n            meta: {  \r\n\r\n            }\r\n        },\r\n        owner: {\r\n            type: 'reference', // A reference to another table\r\n            to: 'people'\r\n        },\r\n    }\r\n}).then(output).catch(output);\r\n\r\ndb.m.default.promise.tables.createTable('mock',{columns:{}}).then(output).catch(output);",
        'Edit a table': "db.m.default.promise.tables.updateTable('people', {\r\n    columns:{\r\n        name: {\r\n            type: 'string', // Type, it can be 'string' 'boolean' 'number' 'array' 'object' or 'any'\r\n            constraints: [], // List of rules that has to be true to be inserted on the table\r\n            unique: false, // Is unique in the table\r\n            default: undefined, //Default value if non specified\r\n            meta: {  //Any metadata that is needed on the column \r\n\r\n            }\r\n        },\r\n        age: {\r\n            type: 'number',\r\n            constraints: [\r\n                (value)=>{\r\n                    return value>=18;   //The introduction of data will fail if the user is less than 18\r\n                }\r\n            ]\r\n        },\r\n    }\r\n}).then(output).catch(output);",
        'Delete a table': "db.m.default.promise.tables.deleteTable('mock').then(output).catch(output);",
        'List all tables': 'db.m.default.promise.tables.getTables().then(output).catch(output);',
        'Show a table': "db.m.default.promise.tables.getTable('people').then(output).catch(output);",
        'Add data to a table': "db.m.default.promise.data.createData('people', { \n    name: 'john doe',   // We introduce the values to the database\n    age: 26 \n}).then(output).catch(output);\n\ndb.m.default.promise.data.createData('pet', { \n    name: 'coco',   // We introduce the values to the database\n    owner: '0' // The reference is a string that contains the id of the owner\n}).then(output).catch(output);",
        'Edit data from a table': "db.m.default.promise.data.createData('people', { \n    name: 'john smith',   // We introduce the values to the database\n    age: 50\n}).then(output).catch(output);\n\ndb.m.default.promise.data.updateData('people', { \n    name: 'john smith',   // We introduce the values to the database\n    age: 55\n},\n(value)=>{\n    return value.name ===  'john smith'; //This is our filter function\n}\n).then(output).catch(output);",
        'Delete data': "db.m.default.promise.data.deleteData('people', (value)=>{\n    return value.name ===  'john smith'; //This is our filter function\n}\n).then(output).catch(output);",
        'Show data': "db.m.default.promise.data.getData(\n    'pet',\n    (value)=>{\n        return value.name === 'coco';\n    }, // filter function\n    ['owner'] // The paramether here will exchange references with the object inserted in the database (Like SQL JOIN)\n).then(output).catch(output);",
        'Management of transactions': "db.m.default.promise.utils.startTransaction();\ndb.m.default.promise.data.createData('people', { \n    name: 'john doe',   \n    age: 3 // This registry will fail due to the constraint of age\n}).then(output).catch(output);\n\ndb.m.default.promise.data.createData('pet', { \n    name: 'coco', // This registry will fail because the previous one did too\n    owner: '0'\n}).then(output).catch(output);\ndb.m.default.promise.utils.endTransaction();\n"
    }
};

async function initializeEditor () {
    await new Promise((accept) => {
        require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.19.3/min/vs' } });
        window.MonacoEnvironment = {
            getWorkerUrl: function (workerId, label) {
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                      self.MonacoEnvironment = {
                        baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.19.3/min/'
                      };
                      importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.19.3/min/vs/base/worker/workerMain.js');`
                    )}`;
            }
        };
        require(['vs/editor/editor.main'], function () {
            const editor = monaco.editor.create(document.getElementById('code'), {
                value: '',
                language: 'javascript',
                theme: 'vs-dark'
            });
            window.editor = editor;
            accept();
        });
    });
    window.onresize = function () {
        editor.layout();
    };
}

function initializeOutput () {
    window.jsonEditor = new JSONEditor(document.getElementById('output'), { modes: ['tree', 'code'] });
    jsonEditor.set();
}

function loadExamples () {
    function loadExamplesRecursive (element, examples, previous) {
        for (const name in examples) {
            if (Object.prototype.hasOwnProperty.call(examples, name)) {
                const code = examples[name];
                if (typeof code === 'string') {
                    const option = document.createElement('option');
                    option.value = (previous !== '' ? previous + '/' : '') + name;
                    option.innerText = name;
                    element.appendChild(option);
                } else {
                    const optionGroup = document.createElement('optgroup');
                    optionGroup.label = name;
                    loadExamplesRecursive(optionGroup, code, (previous !== '' ? previous + '/' : '') + name);
                    element.appendChild(optionGroup);
                }
            }
        }
    }
    function searchExamples (search) {
        try {
            const searchArray = search.split('/');
            let currentExample = examples;
            for (let index = 0; index < searchArray.length; index++) {
                const name = searchArray[index];
                currentExample = currentExample[name];
            }
            return currentExample;
        } catch (error) {
            return '';
        }
    }
    const select = document.getElementById('code-select');
    loadExamplesRecursive(select, examples, '');
    select.onchange = () => {
        const value = select.value;
        const code = searchExamples(value);
        editor.setValue(code);
    };
    select.onchange();
    select.disabled = false;
}

function loadGUI () {
    const buttonSubmit = document.getElementById('submit-code');
    buttonSubmit.onclick = () => {
        executeCode(editor.getValue());
    };
    buttonSubmit.disabled = false;

    const buttonClear = document.getElementById('clear-output');
    buttonClear.onclick = () => {
        output.clear();
    };
    buttonClear.disabled = false;
}

async function loadScripts () {
    for (let index = 0; index < modules.length; index++) {
        const module = modules[index];
        const scriptElement = document.createElement('script');
        scriptElement.src = isProduction ? module.pro : module.dev;
        document.head.appendChild(scriptElement);
        await new Promise(resolve => { scriptElement.onload = () => resolve(); });
    }
}

function loadModules () {
    for (let index = 0; index < modules.length; index++) {
        const module = modules[index];
        if (module.moduleName) {
            PluriDB.loadModule(window[module.moduleName]);
        }
    }
}

function setupDatabase () {
    return new PluriDB('demo', {
        worker: false
    });
}

async function main () {
    await initializeEditor();
    initializeOutput();
    loadExamples();
    loadGUI();
    await loadScripts();
    loadModules();
    window.db = setupDatabase();
    reloadTables();
}

main();

// HELPER TRIGGERS
const output = (() => {
    let data = [];
    function returnedOutput (output) {
        data.push(output);
        jsonEditor.set(data);
        reloadTables();
    };
    returnedOutput.clear = () => {
        data = [];
        jsonEditor.set(data);
        reloadTables();
    };
    return returnedOutput;
})();

async function executeCode (codeToExecute) {
    function secureFunction (code, ...variables) {
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
        // https://stackoverflow.com/questions/47444376/sanitizing-eval-to-prevent-it-from-changing-any-values
        const globals = [...variables, 'globalThis', ...Object.keys(globalThis).filter(key => !variables.includes(key)), `${code}`];
        const securized = AsyncFunction.apply(null, globals);
        return function (...variables) {
            reloadTables();
            return securized.apply({}, variables);
        };
    }
    secureFunction(codeToExecute, 'db', 'output', 'PluriDB')(window.db, output, window.PluriDB);
}

async function openTable (tableName) {
    const tableInspector = document.getElementById('table-inspector');
    const tableData = await db.m.default.promise.tables.getTable(tableName);
    const tableValues = await db.m.default.promise.data.getData(tableName);
    tableInspector.innerHTML = '';
    const table = document.createElement('table');
    const trh = document.createElement('tr');
    table.appendChild(trh);
    const th = document.createElement('th');
    th.innerHTML = 'database_id';
    trh.appendChild(th);
    Object.keys(tableData.result.columns).forEach(columnName => {
        const th = document.createElement('th');
        trh.appendChild(th);
        const details = document.createElement('details');
        th.appendChild(details);
        const summary = document.createElement('summary');
        summary.innerHTML = columnName;
        details.appendChild(summary);
        const p = document.createElement('p');
        p.innerHTML = JSON.stringify(tableData.result.columns[columnName]);
        details.appendChild(p);
    });

    Object.keys(tableValues.result).forEach(key => {
        const tr = document.createElement('tr');
        table.appendChild(tr);
        const th = document.createElement('th');
        th.innerHTML = key;
        tr.appendChild(th);
        Object.keys(tableValues.result[key]).forEach(columnName => {
            const td = document.createElement('td');
            td.innerHTML = JSON.stringify(tableValues.result[key][columnName]);
            tr.appendChild(td);
        });
    });
    tableInspector.appendChild(table);
}
async function reloadTables () {
    const tableList = document.getElementById('table-list');
    const tables = await db.m.default.promise.tables.getTables();
    tableList.innerHTML = '';
    tables.result.forEach(table => {
        const button = document.createElement('button');
        button.innerText = table;
        button.onclick = () => {
            openTable(table);
        };
        tableList.appendChild(button);
    });
}
