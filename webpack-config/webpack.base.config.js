const path = require('path');
const webpack = require('webpack');
const { loader: imageminLoader } = require('imagemin-webpack');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const FaviconsPlugin = require('favicons-webpack-plugin');
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
  faviconPrefix,
  env,
  hotCss
} = require('../project.config.js');

const bootstrapEntry = path.resolve(__dirname, './config-parts/bootstrap.js');

module.exports = {
  mode: 'none',
  context: baseDir,
  entry: {
    main: [bootstrapEntry, appEntry]
  },
  output: {
    path: outDir,
    publicPath: publicPath,
    filename: '[name].js', // [name] should be specified for script inliner to work
    chunkFilename: '[name].js',
    crossOriginLoading: 'anonymous'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.scss', '.css'],
    alias: pathAliases
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.s?css$/i,
        use: [
          {
            loader: ExtractCssChunksPlugin.loader,
            options: {
              hmr: hotCss,
              // use reloadAll option if hmr doesn't work properly
            },
          },
          // TODO: postcss loader with optimizations
          {
            loader: 'css-loader',
            options: {
              // For component based approach use modules:
              // TODO: consider postcss-modules for module approach
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
              afterEach: env.prod ? addToFileLoaderStore : undefined
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
              afterEach: env.prod ? addToFileLoaderStore : undefined
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: false,
    noEmitOnErrors: env.dev,
    moduleIds: 'hashed',
    runtimeChunk: {
      name: () => runtimeChunkName
    },
    splitChunks: {
      chunks: 'all',
      minChunks: 1,
      minSize: 0,
      //   minSize: 1024 * 64,
      //   maxSize: 1024 * 512,
      //   maxAsyncRequests: 6,
      //   maxInitialRequests: 6,
      cacheGroups: {
        vendors: false,
        default: false,
        vendor: {
          test: /\/node_modules\//,
          priority: -10
        },
        [fontFaceChunkName]: {
          test: new RegExp(`${pathAliases['@styles']}/fonts`),
          priority: 10
        },
        indexGroup: {
          test: /index|custom/
        },
        testGroup: {
          test: /test-group/
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
      moduleFilename: (chunkData) => (
        // This is used to allow font-face declaration embedding via style-ext-html-webpack-plugin
        // cause it uses file name to match against.
        chunkData.chunk.name === fontFaceChunkName
          ? '[name].[id].[contenthash:8].js'
          : '[id].[contenthash:8].js'
      ),
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
