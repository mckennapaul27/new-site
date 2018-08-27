const webpack = require('webpack');
const merge = require('webpack-merge');

const commonConfig = require('./webpack.common');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = merge(commonConfig, {
  devtool: 'eval-source-map',

  mode: 'development',

  entry: {
    'app': [
      'webpack-hot-middleware/client?reload=true'
    ]
  },

  output: {
    filename: 'js/[name].js',
    chunkFilename: '[id].chunk.js'
  },

  devServer: {
    contentBase: './client/public',
    historyApiFallback: true,
    stats: 'minimal' // none (or false), errors-only, minimal, normal (or true) and verbose
  }
});

// module.exports = merge(commonConfig, {
//   mode: 'production',
//   entry: {
//     'app': [
//       'webpack-hot-middleware/client?reload=true'
//     ]
//   },
//    mode: 'production',
//   output: {
//     filename: 'js/[name].[hash].js',
//     chunkFilename: '[id].[hash].chunk.js'
//   },
//   optimization: {
//     minimizer: [
//       // we specify a custom UglifyJsPlugin here to get source maps in production
//       new UglifyJsPlugin({
//         cache: true,
//         parallel: true,
//         uglifyOptions: {
//           compress: false,
//           ecma: 6,
//           mangle: true
//         },
//         sourceMap: true
//       })
//     ]
//   }
// });