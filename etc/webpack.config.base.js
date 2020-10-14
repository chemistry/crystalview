const path = require('path');

module.exports = {

    entry: {
        'mol3dview': path.resolve(__dirname, '../src/mol3dview')
    },

    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: "[name].js",
        libraryTarget: 'umd',
        library: 'mol3dview',
        umdNamedDefine: true
    },

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /(bower_components|node_modules)/,
            loader: 'babel-loader',
        }, {
            test: /\.ts$/,
            exclude: /(bower_components|node_modules)/,
            loader: 'awesome-typescript-loader'
        }, {
            test: /\.less$/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader"
            }, {
                loader: "postcss-loader"
            }, {
                loader: "less-loader"
            }]
        }],
    },

    resolve: {
        extensions: ['.less', '.ts', '.js']
    }
};
