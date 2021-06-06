const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'pdbm_sql.js'),
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'pdbm_sql.js',
        library: 'pdbm_sql',
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
