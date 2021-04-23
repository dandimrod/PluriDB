const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(3));
const staticNode = require('node-static');
const chokidar = require('chokidar');
const path = require('path');
const grizzly = require('grizzly');
const putasset = require('putasset');
const { Octokit } = require('@octokit/rest');

const version = '0.3.0';
const name = 'PluriDB';
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
    async function serveGenerate () {
        console.log('Building site...');
        if (fs.existsSync('./build')) {
            deleteFolderRecursive('./build');
        }
        copyFolderRecursiveSync('./docs', './build', (path) => {
            if (path.endsWith('static/js/demo.js')) {
                fs.writeFileSync(path, fs.readFileSync(path, 'utf-8').replace('const isProduction = true;', 'const isProduction = false;'));
            }
        });
        await runner(webpackConfig);
    }
    await serveGenerate();
    chokidar.watch('./src').on('all', serveGenerate);
    chokidar.watch('./docs').on('all', serveGenerate);
    const fileServer = new staticNode.Server('./build');
    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            fileServer.serve(request, response);
        }).resume();
    }).listen(argv.port ? argv.port : 3007);
    console.log('Serving dev server on port ' + 3007);
};

const build = async () => {
    console.log('Building library...');
    if (fs.existsSync('./build')) {
        deleteFolderRecursive('./build');
    }
    await runner(webpackConfig);
    let files = fs.readdirSync('./build');
    files = files.map(file => './build/' + file);
    return files;
};

const githubRelease = async (thisVersion, user, pass, files) => {
    console.log('Creating a new tagged release...');
    await grizzly(pass, {
        user: user,
        repo: name,
        tag: thisVersion.version,
        name: thisVersion.version,
        body: `## [${thisVersion.version}] - ${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}\n### Added\n### Changed\n### Deleted\n`,
        prerelease: thisVersion.preRelase
    });
    console.log('Uploading new tag files...');
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        await putasset(pass, {
            owner: user,
            repo: name,
            tag: thisVersion.version,
            filename: file
        });
    }
};

const getVersion = async (user, pass) => {
    console.log('Creating new version...');
    let newVersion;
    let isPrerelease;
    const octokit = new Octokit({
        auth: pass
    });
    if (version.split('-')[1]) {
        isPrerelease = true;
        const { data } = await octokit.repos.listReleases({
            owner: user,
            repo: name
        });
        const tagName = data[0].tag_name;
        if (tagName.split('-')[1] && version.split('-')[0] === tagName.split('-')[0]) {
            newVersion = version.split('-')[0] + '-' + (Number(tagName.split('-')[1]) + 1);
        } else {
            newVersion = version.split('-')[0] + '-0';
        }
    } else {
        isPrerelease = false;
        const {
            data: {
                tag_name: tagName
            }
        } = await octokit.repos.getLatestRelease({
            owner: user,
            repo: name
        });
        const versionPrefix = version.split('.').slice(0, -1).join('.') + '.';
        const latestVersionPrefix = tagName.split('.').slice(0, -1).join('.') + '.';
        if (latestVersionPrefix !== versionPrefix) {
            newVersion = (versionPrefix + 0);
        } else {
            const latestVersionSufix = Number(tagName.split('.').pop());
            newVersion = (versionPrefix + (latestVersionSufix + 1));
        }
    }
    return { version: newVersion, preRelase: isPrerelease };
};

const publish = async () => {
    console.log('Starting publishing procedure...');
    const user = argv.user;
    const pass = argv.pass;
    const files = await build();
    const thisVersion = await getVersion(user, pass);
    await githubRelease(thisVersion, user, pass, files);
};

const main = async () => {
    console.log('Welcome to PluriDB development util');
    switch (process.argv[2]) {
        case 'serve':
            await serve();
            break;

        case 'build':
            await build();
            break;
        case 'publish':
            await publish();
            break;
        default:
            break;
    }
};

main();
