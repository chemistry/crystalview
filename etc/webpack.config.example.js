const webpack = require('webpack');
const baseConfig = require('./webpack.config.base.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = Object.assign({}, baseConfig, {

    entry: {
        'molview': path.resolve(__dirname, '../example/app.ts')
    },

    devtool: 'source-map',

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../example/index.html'),
            favicon: path.resolve(__dirname, '../example/favicon.ico')
        }),
        new webpack.ProvidePlugin({
            $: "jquery"
        })
    ]
});
