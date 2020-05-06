// TODO: consider top level option for using css-modules

// This file is intended to
//
// - declare the relationships between name pieces which will persist through the app config.
//
// - contain general app data. The file is considered as a convenient place to manage
// general app settings.

const path = require('path');

const defineGetters = mappings => Object.keys(mappings)
  .reduce((acc, propName) => (
    Object.defineProperty(acc, propName, {
      configurable: false,
      enumerable: true,
      get: mappings[propName]
    })
  ), {});

const baseDir = __dirname;
const srcDir = path.join(baseDir, 'src');
const outDir = path.join(baseDir, 'dist');
const assetDir = path.join(srcDir, 'assets');

const assetDirJoin = (...files) => path.join(assetDir, ...files);

const pathAliases = {
  '@': srcDir,
  '@styles': assetDirJoin('styles'),
  '@fonts': assetDirJoin('fonts'),
  '@images': assetDirJoin('images')
};
const publicPath = '/';
const appEntry = path.join(srcDir, 'index.js');
const appGlobals = {};
const runtimeChunkName = 'runtime';

// It is expected that @styles contains 'fonts' file
// for webpack to inline it. The file is imported
// in bootstrap.js. To be able to distinguish the
// file for inlining we place it in its own chunk
// with the name of fontFaceChunkName.
const fontFaceChunkName = 'font-face';
const fontPreloadRegex = new RegExp('(OpenSans-Bold-latin|OpenSans-Regular-latin).*\\.woff2$');

// Use favicon output prefix path to avoid path rewriting
// with image optimization plugin.
const faviconPrefix = 'favicon/';

const htmlFilename = 'index.html'; // output html filename
const html = {
  title: 'THE APP',
  favicon: path.join(assetDir, 'images', 'favicon.svg'),
  template: path.join(srcDir, 'index.html'),
  templateParameters: {}
};
const env = defineGetters({
  dev: () => process.env.NODE_ENV === 'development',
  prod: () => process.env.NODE_ENV === 'production'
});
const devServer = {
  port: 3030,
  clientLogLevel: 'info',
  // watchContentBase will be forced to be true in hmr mode,
  // this way we can reload html automatically.
  watchContentBase: true,
  hot: true
};
// To be able to run dev-server with css hmr and build dev
// without 'hot' code used by css loaders/plugins we use
// CSS_MODE env variable. The only expected value is 'hot'.
// To avoid several sources of truth we do not define it
// in the env.
const hotCss = process.env.CSS_MODE === 'hot';

module.exports = {
  baseDir,
  srcDir,
  outDir,
  pathAliases,
  publicPath,
  appEntry,
  appGlobals,
  runtimeChunkName,
  fontFaceChunkName,
  fontPreloadRegex,
  faviconPrefix,
  htmlFilename,
  html,
  env,
  devServer,
  hotCss
};
