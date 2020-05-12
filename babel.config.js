// See babel-notes.md for explanation.

const { env, devServer } = require('./project.config');

module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV);

  const pluginTransformRuntime = [
    '@babel/plugin-transform-runtime',
    {
      regenerator: false,
      useESModules: true,
      version: '^7.8.4'
    }
  ];

  const presetEnv = [
    '@babel/preset-env',
    {
      modules: false,
      debug: env.dev,
      useBuiltIns: 'entry',
      corejs: {
        version: '3.6'
      }
    }
  ];

  const plugins = [
    '@babel/plugin-syntax-dynamic-import',
    pluginTransformRuntime,
  ];

  const presets = [
    presetEnv,
    '@babel/preset-react'
  ];

  if (env.dev && devServer.hot) {
    plugins.push('react-refresh/babel');
  }

  return { plugins, presets };
};
