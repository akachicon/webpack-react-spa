const path = require('path');

const defineGetters = mappings => Object.keys(mappings)
  .reduce((acc, propName) => (
    Object.defineProperty(acc, propName, {
      configurable: false,
      enumerable: true,
      get: mappings[propName]
    })
  ), {});

// This file is intended to
//
// - declare the relationships between name pieces which will persist through the app config.
//
// - contain general app data. The file is considered as a convenient place to manage
// general app settings.

const baseDir = __dirname;
const srcDir = path.resolve(baseDir, 'src');
const outDir = path.resolve(baseDir, 'dist');
const assetDir = path.resolve(srcDir, 'assets');
const publicPath = '/';
const appEntry = path.resolve(srcDir, 'index.js');
const appGlobals = {};
const runtimeChunkName = 'runtime';
const htmlFilename = 'index.html'; // output html filename
const html = {
  title: 'THE APP',
  favicon: path.join(assetDir, 'favicon.svg'),
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
  publicPath,
  appEntry,
  appGlobals,
  runtimeChunkName,
  htmlFilename,
  html,
  env,
  devServer,
  hotCss
};
