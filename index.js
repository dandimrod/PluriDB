const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(3));
var static = require('node-static');
const chokidar = require('chokidar');
const path = require("path");
const version = "0.0.x";
const runner = (config) => {
    return new Promise((res, rej) => {
        webpack(config).run((err, stats) => {
            if (err) {
                rej(err);
            } else {
                res(stats);
            }
        });
    });
};
const deleteFolderRecursive = function (pathFol) {
    if (fs.existsSync(pathFol)) {
        fs.readdirSync(pathFol).forEach((file) => {
            const curPath = path.join(pathFol, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(pathFol);
    }
};
const copyFolderRecursiveSync = function (src, dest, cb) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function (childItemName) {
            copyFolderRecursiveSync(path.join(src, childItemName),
                path.join(dest, childItemName), cb);
        });
    } else {
        fs.copyFileSync(src, dest);
        if (cb) {
            cb(dest);
        }
    }
};
const serve = async () => {
    async function serveGenerate() {
        console.log("Building site...");
        if (fs.existsSync("./build")) {
            deleteFolderRecursive("./build");
        }
        copyFolderRecursiveSync("./docs", "./build", (path)=>{
            fs.writeFileSync(path,fs.readFileSync(path,"utf-8").replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/.*?@.*?\/dist\/(.*?[ "'`])/gi,'./$1'));
        });
        await runner(webpackConfig);
    }
    await serveGenerate();
    chokidar.watch('./src').on('all', serveGenerate);
    chokidar.watch('./docs').on('all', serveGenerate);
    let fileServer = new static.Server('./build');
    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            fileServer.serve(request, response);
        }).resume();
    }).listen(argv.port ? argv.port : 3007);
    console.log("Serving dev server on port " + 3007);
};

const build = async () => {
    console.log("Building library...");
    if (fs.existsSync("./build")) {
        deleteFolderRecursive("./build");
    }
    await runner(webpackConfig);
};

const main = async () => {
    console.log("Welcome to PluriDB development util");
    switch (process.argv[2]) {
        case "serve":
            await serve();
            break;

        case "build":
            await build();
            break;
        case "publish":

            break;
        default:
            break;
    }
};

main();