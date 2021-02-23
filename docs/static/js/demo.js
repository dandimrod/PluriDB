const isProduction = true;
const modules = [
    { moduleName: 'pdbm_mongodb', pro: '', dev: '../pdbm_mongodb.js' },
    { pro: '', dev: '../PluriDB.js' }
];

const examples = {
    'Main uses': {
        'Initialize database': "db = new PluriDB('demo',{\r\n    worker: true, // Will it use a webworker or not?\r\n    api: 'indexdb', // What technology to use\r\n    fallback: true, // Allows fallback?\r\n    db:{\r\n        backup: undefined, // function for backup\r\n        restore: undefined, // function for restore\r\n        encrypt: false, // password for encryption\r\n    }\r\n});",
        'Change settings': 'Change settings db',
        'Clear Database': 'Clear db'
    },
    'Examples of MongoDB': {
        'Create collections': 'Create collections'
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
    const output = document.getElementById('output');
    buttonClear.onclick = () => {
        output.innerHTML = '';
    };
    buttonClear.disabled = false;
    reloadTables();
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
    loadExamples();
    loadGUI();
    await loadScripts();
    loadModules();
    window.db = setupDatabase();
}

main();

// HELPER TRIGGERS
function output () {

};
async function executeCode (codeToExecute) {
    function secureFunction (code, ...variables) {
        // https://stackoverflow.com/questions/47444376/sanitizing-eval-to-prevent-it-from-changing-any-values
        const globals = [...variables, 'globalThis', ...Object.keys(globalThis), `return ${code};`];
        const securized = Function.apply(null, globals);
        return function (...variables) {
            return securized.apply({}, variables);
        };
    }
    secureFunction(codeToExecute, db, output);
}

async function openTable (tableName) {

}
async function reloadTables () {
    const tableList = document.getElementById('table-list');
    const tables = ['a', 'b', 'c', 'd', 'e', 'f', 'g']; // await db.m.default.getTables();
    tables.forEach(table => {
        const button = document.createElement('button');
        button.innerText = table;
        button.onclick = () => {
            openTable(table);
        };
        tableList.appendChild(button);
    });
}
