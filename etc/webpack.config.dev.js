var webpack = require('webpack');
var baseConfig = require('./webpack.config.base.js');

var config = Object.create(baseConfig);
config.devtool = 'source-map';
config.externals = {
    "jquery": "jquery"
};
config.plugins = [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
    })
];

module.exports = config;
