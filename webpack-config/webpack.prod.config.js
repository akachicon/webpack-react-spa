const merge = require('webpack-merge');
const ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');
const StyleExtHtmlPlugin = require('style-ext-html-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const regexEscape = require('regex-escape');
const baseConfig = require('./webpack.base.config.js');
const HashedChunkIdsPlugin = require('./config-parts/hashed-chunk-ids-webpack-plugin');
const HtmlInjectionPlugin = require('./config-parts/html-injection-webpack-plugin');
const fileLoaderStore = require('./config-parts/file-loader-store');
const genPreloadTags = require('./config-parts/gen-preload-tags');
const imageminPluginOptions = require('./config-parts/imagemin-webpack-options');
const {
  runtimeChunkName,
  fontFaceChunkName,
  fontPreloadRegex,
  cssExtRegexString,
} = require('../project.config');

module.exports = merge(baseConfig, {
  mode: 'production',
  output: {
    filename: (chunkData) =>
      // This is used to allow runtime embedding via script-ext-html-webpack-plugin
      // cause it uses file name to match against.
      chunkData.chunk.name === runtimeChunkName
        ? '[name].[id].[contenthash:8].js'
        : '[id].[contenthash:8].js',
    chunkFilename: '[id].[contenthash:8].js',
  },
  plugins: [
    new HashedChunkIdsPlugin(),
    new ScriptExtHtmlPlugin({
      inline: new RegExp(regexEscape(runtimeChunkName)),
    }),
    new StyleExtHtmlPlugin({
      cssRegExp: new RegExp(
        `${regexEscape(fontFaceChunkName)}.*${cssExtRegexString}`
      ),
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
        head: genPreloadTags(fileLoaderStore.getEntries(), [fontPreloadRegex]),
        body: [],
      }),

      // A callback that will be called for each tag after
      // adding/removing tags and tag rearrangement.
      postProcessTag: (tag) => {
        if (tag.tagName === 'script') {
          tag.attributes = { ...tag.attributes, async: true };
        }
        return tag;
      },
    }),
    new ImageminPlugin(imageminPluginOptions),
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
    }),
  ],
});
