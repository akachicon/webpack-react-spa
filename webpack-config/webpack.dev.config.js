const merge = require('webpack-merge');
const { HotModuleReplacementPlugin } = require('webpack');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const HashedChunkIdsPlugin = require('./config-parts/hashed-chunk-ids-webpack-plugin');
const baseConfig = require('./webpack.base.config.js');
const {
  outDir,
  publicPath,
  htmlFilename,
  devServer
} = require('../project.config');

const config = merge(baseConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    publicPath,
    contentBase: outDir,
    index: htmlFilename,
    historyApiFallback: true,
    compress: false,
    port: devServer.port || 3030,
    // To reload html automatically in hmr mode we
    // write it to the disk and set watchContentBase to be true.
    watchContentBase: false, // devServer.watchContentBase || devServer.hot, // TODO:
    hot: devServer.hot
  },
  plugins: [
    new HotModuleReplacementPlugin({
      multistep: true
    })
  ]
});

const pluginsToExclude = [];

if (config.devServer.watchContentBase) {
  // Remove CleanPlugin to allow prebuilt assets to be served from outDir.
  pluginsToExclude.push(CleanPlugin);
}
if (devServer.hot) {
  // Remove HashedChunkIdsPlugin as it throws when compiling html in hmr mode
  pluginsToExclude.push(HashedChunkIdsPlugin);
}

config.plugins = config.plugins.filter(
  plugin => {
    const exclude = pluginsToExclude.some(
      excludedPlugin => plugin instanceof excludedPlugin
    );
    return !exclude;
  }
);

if (config.devServer.hot) {
  config.devServer.writeToDisk =
    file => new RegExp(`/${htmlFilename}`, 'g').test(file);
}

module.exports = config;
