const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: "development",
    entry: {
        'PluriDB': "./src",
        'PluriDB.mongodb.module': "./src/modules/mongodb"
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
        library: '[name]',
        libraryTarget: 'var',
        umdNamedDefine: true,
        globalObject: "typeof self !== 'undefined' ? self : this"
    },
    devtool: 'source-map',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                        extractComments: true

                    }
                }
            })
        ]
    },
};