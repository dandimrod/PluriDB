const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const argv = require('minimist')(process.argv.slice(3));

const version = "0.0.x";
const files = [];

const serve = async () => {

};

const main = async () => {
    console.log("Welcome to PluriDB development util");
    switch (process.argv[2]) {
        case "serve":
            await serve();
            break;

        case "build":

            break;
        case "publish":

            break;
        default:
            break;
    }
};

main();