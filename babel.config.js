// See babel-notes.md for explanation.

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
      debug: process.env.NODE_ENV === 'production',
      useBuiltIns: 'entry',
      corejs: {
        version: '3.6'
      }
    }
  ];

  return {
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      pluginTransformRuntime
    ],
    presets: [
      presetEnv
    ]
  };
};
