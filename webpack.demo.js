const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {

    mode: process.env.WEBPACK_SERVE ? 'development' : 'production',

    devtool:  'source-map',

    entry: {
        'app': path.resolve(__dirname, './demo/index.tsx')
    },

    output: {
        path: __dirname + '/dist/',
        publicPath: '/',
        filename: '[hash].js'
    },

    plugins: [
        new webpack.DefinePlugin({
            BROWSER: JSON.stringify(true),
            NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        new ExtractTextPlugin("[hash].css"),
        new HtmlWebpackPlugin({
            template: __dirname + '/demo/index.html'
        })
    ],

    module: {
          rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader']
                })
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
};
