// See babel-notes.md for explanation.

const { env, devServer } = require('./project.config');

module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV);

  const pluginTransformRuntime = [
    '@babel/plugin-transform-runtime',
    {
      regenerator: false,
      useESModules: true,
      version: '^7.8.4',
    },
  ];

  const presetEnv = [
    '@babel/preset-env',
    {
      bugfixes: true,
      modules: false,
      debug: env.dev,
      useBuiltIns: 'entry',
      corejs: {
        version: '3.6',
      },
    },
  ];

  const presetReact = [
    '@babel/preset-react',
    {
      runtime: 'classic',
      development: env.dev,
    },
  ];

  const plugins = [pluginTransformRuntime];

  const presets = [presetEnv, presetReact];

  if (env.dev && devServer.hot) {
    plugins.push('react-refresh/babel');
  }

  return { plugins, presets };
};
