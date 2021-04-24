const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: __dirname,
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'PluriDB.js',
        library: 'PluriDB',
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
                        drop_console: true
                    }
                }
            })
        ]
    },
    externals: [
        'worker_threads'
    ]
};
