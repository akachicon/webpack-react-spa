const merge = require('webpack-merge');
// const webpack = require('webpack');
// const CompressionPlugin = require('compression-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const baseConfig = require('./webpack.base.config.js');
const imageminPlugin = require('./config-parts/imagemin-webpack-options');
const { runtimeChunkName } = require('../project.config');

module.exports = merge(baseConfig, {
  mode: 'production',
  output: {
    filename: (chunkData) => (
      // This is used to allow runtime embedding via script-ext-html-webpack-plugin
      // cause it uses file name to match against.
      chunkData.chunk.name === runtimeChunkName
        ? '[name].[id].[contenthash:8].js'
        : '[id].[contenthash:8].js'
    ),
    chunkFilename: '[id].[contenthash:8].js'
  },
  plugins: [
    imageminPlugin,
    // new CompressionPlugin({
    //     // TODO: try brotli
    //     algorithm: 'gzip',
    //     test: /\.(js|css|html|eot|ttf|woff|woff2|svg)$/,
    //     threshold: 10240,
    //     cache: true
    // }),
    // new BundleAnalyzerPlugin({
    //     analyzerMode: cliOptions['disable-analyzer'] ? 'disabled' : 'server',
    //     defaultSizes: 'gzip'
    // })
  ]
});
