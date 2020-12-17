const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(3));
var static = require('node-static');
const chokidar = require('chokidar');
const path = require("path");
const ghRelease = require('gh-release')
const {
    Octokit
} = require("@octokit/rest");

const version = "0.0.x";
const name = "PluriDB"
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
        copyFolderRecursiveSync("./docs", "./build", (path) => {
            fs.writeFileSync(path, fs.readFileSync(path, "utf-8").replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/.*?@.*?\/dist\/(.*?[ "'`])/gi, './$1'));
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
    let files = fs.readdirSync('./build');
    files=files.map(file=>'./build/'+file);
    return files;
};

const uploadGithub = (thisVersion, pass, files) => {
    let body = `## [${thisVersion}] - ${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    return new Promise((accept, reject) => {
        ghRelease({
                auth: {
                    token: pass
                },
                tag_name: thisVersion,
                name: thisVersion,
                body: body,
                assets: files
            },
            (err, result) => {
                if (!err) {
                    accept(result)
                } else {
                    reject(err)
                }
            })
    })
}

const getVersion = async (user, pass) => {
    const octokit = new Octokit({
        auth: pass,
    });
    const {data:{tag_name}} = await octokit.repos.getLatestRelease({owner:user,repo:name});
    let versionPrefix = version.split('.').slice(0,-1).join(".")+".";
    let latestVersionPrefix = tag_name.split('.').slice(0,-1).join(".")+".";
    if(latestVersionPrefix!==versionPrefix){
        return versionPrefix+0;
    }else{
        let latestVersionSufix = Number(tag_name.split('.').pop());
        return versionPrefix+(latestVersionSufix+1);
    }

}

const publish = async () => {
    console.log("Starting publishing procedure...");
    let user = argv.user;
    let pass = argv.pass;
    let files = await build();
    let thisVersion = await getVersion(user, pass);
    await uploadGithub(thisVersion, pass, files);
}

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
            await publish();
            break;
        default:
            break;
    }
};

main();