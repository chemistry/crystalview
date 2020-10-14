var path = require('path');

module.exports = function (config) {

  config.set({

    browsers: ['PhantomJS'],

    files: [
      'tests.webpack.js'
    ],

    frameworks: [
        'jasmine'
    ],

    preprocessors: {
        'tests.webpack.js': ['webpack']
    },

    colors: true,

    reporters: ['progress', 'mocha'],

    webpack: {
        cache: true,
        module: {
        preLoaders: [
            {
                test: /spec\.js$/,
                include: /src/,
                exclude: /(bower_components|node_modules)/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                }
            }
        ],
        loaders: [{
            test: /\.js$/,
            include: path.resolve(__dirname, '../src'),
            exclude: /(bower_components|node_modules|\.spec\.js)/,
            loader: 'babel',
            query: {
                cacheDirectory: true,
            }
        }]
      }
    }
  });
};
