const path = require('path');

module.exports = {

    mode: process.env.WEBPACK_SERVE ? 'development' : 'production',

    devtool:  'source-map',

    entry: {
        'crystal-view': path.resolve(__dirname, './src/index.tsx')
    },

    output: {
        globalObject: 'typeof self !== \'undefined\' ? self : this',
        path: path.resolve(__dirname, './dist'),
        libraryTarget: 'umd',
        library: 'crystal-view',
        umdNamedDefine: true
    },

    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            exclude: /node_modules/,
            loader: 'awesome-typescript-loader'
        }]
    },

    resolve: {
        extensions: ['.ts', '.tsx', ".js", ".jsx"]
    }
}
