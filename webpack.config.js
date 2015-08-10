var autoprefixer = require('autoprefixer-core');
var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    'webpack/hot/dev-server',
    './app/app'
  ],
  output: {
    filename: 'app.js',
    path: path.join(__dirname, 'build'),
    publicPath: '/build'
  },
  devServer: {
    port: 8888,
    hot: true,
    inline: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  postcss: [autoprefixer],
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.join(__dirname, 'app')
        ],
        loaders: ['babel?stage=0&loose=true']
      },
      {
        test: /\.scss$/,
        include: [
          path.join(__dirname, 'app')
        ],
        loaders: ['style', 'css', 'postcss', 'sass']
      }
    ]
  }
};
