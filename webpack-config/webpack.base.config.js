const path = require('path');
const webpack = require('webpack');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const FaviconsPlugin = require('favicons-webpack-plugin');
const postcssMediaMinmax = require('postcss-media-minmax');
const postcssAutoprefixer = require('autoprefixer');
const postcssCssnano = require('cssnano');
const regexEscape = require('regex-escape');
const HashedChunkIdsPlugin = require('./config-parts/hashed-chunk-ids-webpack-plugin');
const { html  } = require('../project.config');
const htmlPluginOptions = require('./config-parts/html-webpack-plugin-options');
const { add: addToFileLoaderStore } = require('./config-parts/file-loader-store');

const {
  baseDir,
  outDir,
  pathAliases,
  publicPath,
  appEntry,
  appGlobals,
  runtimeChunkName,
  fontFaceChunkName,
  cssExtRegexString,
  faviconPrefix,
  env,
  hotCss
} = require('../project.config.js');

const bootstrapEntry = path.resolve(__dirname, './config-parts/bootstrap.js');
const escapedAtStylesPath = regexEscape(pathAliases['@styles']);
const fontFaceRegex = new RegExp(`${escapedAtStylesPath}\\/fonts${cssExtRegexString}`);

module.exports = {
  mode: 'none',
  context: baseDir,
  entry: {
    main: [bootstrapEntry, appEntry]
  },
  output: {
    path: outDir,
    publicPath: publicPath,
    filename: '[name].js',
    chunkFilename: '[name].js',
    crossOriginLoading: 'anonymous'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.scss', '.css'],
    alias: pathAliases
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: new RegExp(cssExtRegexString, 'i'),
        use: [
          {
            loader: ExtractCssChunksPlugin.loader,
            options: {
              hmr: hotCss,
              // use reloadAll option if hmr doesn't work properly
            },
          },
          {
            loader: 'css-loader',
            options: {
              // For component based approach use modules:
              //
              // modules: {
              //   mode: resourcePath => {
              //     if (/\.pure.s?css$/i.test(resourcePath)) {
              //       return 'pure';
              //     }
              //     if (/\.global.s?css$/i.test(resourcePath)) {
              //       return 'global';
              //     }
              //     return 'local';
              //   },
              //   exportGlobals: true,
              //   localIdentName: env.prod
              //     ? '[hash:base64:8]'
              //     : '[path][name]__[local]'
              // },
              sourceMap: env.dev
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                postcssMediaMinmax(),
                ...(env.prod
                  ? [
                      postcssAutoprefixer({
                        remove: false
                      }),
                      postcssCssnano()
                    ]
                  : []
                )
              ]
            }
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: env.dev
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                // source maps are necessary for resolve-url-loader to work
                sourceMap: true,
                // speed up dart-sass compilation using fibers according to the docs
                fiber: require('fibers')
              }
            }
          }
        ],
      },
      {
        test: /\.(woff2|woff|ttf|otf|eot)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: env.dev ? '[name].[ext]' : '[name].[contenthash:6].[ext]',
              outputPath: 'fonts',
              afterEach: env.prod ? addToFileLoaderStore : () => {}
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|webp|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: env.dev ? '[name].[ext]' : '[name].[contenthash:6].[ext]',
              outputPath: 'images',
              limit: 8 * 1024, // 8kb
              afterEach: env.prod ? addToFileLoaderStore : () => {}
            }
          }
        ]
      }
    ]
  },
  optimization: {
    noEmitOnErrors: env.dev,
    moduleIds: 'hashed',
    chunkIds: env.dev ? 'named': false, // enable for dev mode; use HashedChunkIds plugin for other environments
    runtimeChunk: {
      name: () => runtimeChunkName
    },
    splitChunks: {
      chunks: 'all',
      minSize: 1024 * 30, // 30kb
      maxSize: 1024 * 200, // 100kb
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        vendors: false,
        default: false,
        [fontFaceChunkName]: {
          // TODO: find a way to exclude font-face chunk from js chunks
          test: env.prod ? fontFaceRegex : () => false,
          name: () => fontFaceChunkName,
          priority: 20,
          enforce: true // ignore minSize, maxInitialRequests, and maxAsyncRequests
        },
        styles: {
          test: new RegExp(cssExtRegexString),
          priority: 10
        },
        vendor: {
          test: /\/node_modules\//,
          priority: -10
        },
        common: {
          reuseExistingChunk: true,
          priority: -20
        }
      }
    }
  },
  plugins: [
    new FriendlyErrorsPlugin(),
    new CleanPlugin(),
    new webpack.DefinePlugin({
      __DEV__: env.dev,
      __PROD__: env.prod,
      ...appGlobals,
    }),
    new HashedChunkIdsPlugin(),
    new ExtractCssChunksPlugin({
      // To allow font-face declaration embedding via style-ext-html-webpack-plugin
      // we should specify [name] cause the plugin uses file name to match against.

      // moduleFilename: (chunkData) => (
      //   chunkData.chunk.name === fontFaceChunkName
      //     ? '[name].[id].[contenthash:8].css'
      //     : '[id].[contenthash:8].css'
      // )

      // At the time moduleFilename doesn't work, so we use chunkFilename string
      // (cause this option doesn't allow function value) with [id] placeholder.
      // The id for the font-face chunk will be set as fontFaceChunkName (by
      // hashed-chunk-ids-webpack-plugin).
      chunkFilename: env.dev ? '[name].css' : '[id].[contenthash:8].css',
    }),
    new HtmlPlugin(htmlPluginOptions),
    new FaviconsPlugin({
      logo: html.favicon,
      prefix: faviconPrefix,
      favicons: {
        appName: html.title,
        icons: {
          android: false,
          appleIcon: false,
          appleStartup: false,
          coast: false,
          favicons: true,
          firefox: true,
          windows: true,
          yandex: false
        }
      }
    })
  ]
};
