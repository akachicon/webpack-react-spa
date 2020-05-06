const merge = require('webpack-merge');
const ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');
const StyleExtHtmlPlugin = require('style-ext-html-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack');
// const CompressionPlugin = require('compression-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const baseConfig = require('./webpack.base.config.js');
const HtmlInjectionPlugin = require('./config-parts/html-injection-webpack-plugin');
const fileLoaderStore = require('./config-parts/file-loader-store');
const genPreloadTags = require('./config-parts/gen-preload-tags');
const imageminPluginOptions = require('./config-parts/imagemin-webpack-options');
const {
  runtimeChunkName,
  fontFaceChunkName,
  fontPreloadRegex
} = require('../project.config');

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
    new ScriptExtHtmlPlugin({
      inline: new RegExp(runtimeChunkName)
    }),
    new StyleExtHtmlPlugin({
      cssRegExp: new RegExp(`${fontFaceChunkName}.*\\.css$`)
    }),
    new HtmlInjectionPlugin({
      // Tags generated by html-webpack-plugin to insert in head.
      head: [/\.(css|png|jpe?g|svg|ico)$/],

      // Tags generated by html-webpack-plugin to exclude from html.
      exclude: [],

      // Additional tags to include with html-webpack-plugin,
      // these won't be affected with previous options.
      // Use function to get the data after compilation.
      getAdditionalTags: () => ({
        head: genPreloadTags(
          fileLoaderStore.getEntries(),
          [fontPreloadRegex]
        ),
        body: []
      }),

      // A callback that will be called for each tag after
      // adding/removing tags and tag rearrangement.
      postProcessTag: tag => {
        if (tag.tagName === 'script') {
          tag.attributes = { ...tag.attributes, async: true };
        }
        return tag;
      }
    }),
    new ImageminPlugin(imageminPluginOptions),
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
