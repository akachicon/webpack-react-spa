const path = require('path');
const webpack = require('webpack');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const FaviconsPlugin = require('favicons-webpack-plugin');
const ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');
const HtmlInjectionPlugin = require('./config-parts/html-injection-webpack-plugin');
const HashedChunkIdsPlugin = require('./config-parts/hashed-chunk-ids-webpack-plugin');
const genPreloadTags = require('./config-parts/gen-preload-tags');
const { html  } = require('../project.config');
const htmlPluginOptions = require('./config-parts/html-webpack-plugin-options');

const fileLoaderStore = new Set();
const addToFileLoaderStore = (loaderCtx, computedPath) => {
  // See preload-notes.md for the explanation.
  fileLoaderStore.add(computedPath);
};

const preloadRegex = /\.png$/; // TODO: write regex

const {
  baseDir,
  outDir,
  publicPath,
  appEntry,
  appGlobals,
  runtimeChunkName,
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
    extensions: ['.ts', '.js', '.json', '.scss', '.css']
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 0,
              // afterEach: env.prod ? addToFileLoaderStore : undefined
              afterEach: addToFileLoaderStore // TODO:
            },
          },
        ],
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
          {
            loader: 'css-loader',
            options: {
              // For component based approach use modules:
              // TODO: consider postcss-modules for module approach
              //
              // modules: {
              //   mode: resourcePath => {
              //     if (/\.pure.css$/i.test(resourcePath)) {
              //       return 'pure';
              //     }
              //     if (/\.global.css$/i.test(resourcePath)) {
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
          // TODO: postcss loader with optimizations
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true, // needs to be true for sass to work as expected
              sourceMapContents: env.dev
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
    ]
  },
  optimization: {
    // noEmitOnErrors: env.dev,
    // runtimeChunk: 'single',
    // splitChunks: {
    //   chunks: 'all',
    //   maxAsyncRequests: 6,
    //   maxInitialRequests: 6,
    //   minChunks: 1,
    //   minSize: 1024 * 64,
    //   maxSize: 1024 * 512,
    //   name: true,
    //   cacheGroups: {
    //     vendors: false,
    //     default: false,
    //     vendor: {
    //       test: /\/node_modules\//,
    //       priority: -10
    //     }
    //   }
    // }
    moduleIds: 'hashed',
    runtimeChunk: {
      name: () => runtimeChunkName
    },
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      cacheGroups: {
        indexGroup: {
          test: /index|custom/
        },
        testGroup: {
          test: /test-group/
        },
        vendor: {
          test: /node_modules/
        }
        // customGroup: {
        //   test: /custom/
        // }
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
      filename: env.prod ? '[id].[contenthash:8].css' : '[name].css',
      chunkFilename: env.prod ? '[id].[contenthash:8].css' : '[name].css'
    }),
    new HtmlPlugin(htmlPluginOptions),
    new FaviconsPlugin({
      logo: html.favicon,
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
    }),
    new ScriptExtHtmlPlugin({
      inline: new RegExp(runtimeChunkName, 'g')
    }),
    new HtmlInjectionPlugin({
      // Tags generated by html-webpack-plugin to insert in head.
      head: [/\.(css|png|jpe?g|svg)$/],

      // Tags generated by html-webpack-plugin to exclude from html.
      exclude: [],

      // Additional tags to include with html-webpack-plugin,
      // these won't be affected with previous options.
      // Use function to get the data after compilation.
      getAdditionalTags: () => ({
        head: genPreloadTags(Array.from(fileLoaderStore), [preloadRegex]),
        body: []
      })
    })
  ]
};
