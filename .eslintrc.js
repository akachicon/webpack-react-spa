const path = require('path');
const webpackConfig = require('./webpack-config/webpack.base.config');
const {
  baseDir,
  clientDir,
  serverDir,
  outDir,
  appGlobals,
} = require('./project.config');

const clientGlobals = Object.keys(appGlobals).reduce((acc, global) => {
  acc[global] = 'readonly';
  return acc;
}, {});

const relativeToBase = (argPath) => {
  const isBaseDirAbsolute = path.isAbsolute(baseDir);
  const isArgPathAbsolute = path.isAbsolute(argPath);

  if (!isBaseDirAbsolute) {
    throw new Error('base directory has to be absolute');
  }
  if (!isArgPathAbsolute) {
    throw new Error('argument path has to be absolute');
  }
  return path.relative(baseDir, argPath);
};

const relativeServerDir = relativeToBase(serverDir);
const relativeClientDir = relativeToBase(clientDir);
const relativeOutDir = relativeToBase(outDir);

module.exports = {
  root: true,
  ignorePatterns: ['node_modules/**/*', `${relativeOutDir}/**/*`],
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    es2017: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'prettier', // disable general eslint rules that can conflict with prettier
  ],
  overrides: [
    {
      files: [`${relativeClientDir}/**/*.@(js|mjs|jsx)`],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      env: {
        es2020: true,
        browser: true,
        node: false,
      },
      globals: clientGlobals,
      extends: [
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        // TODO: eslint-plugin-jsx-a11y

        // Disable eslint-plugin-react rules that can conflict with prettier.
        'prettier/react',
      ],
      plugins: ['import'],
      rules: {
        quotes: [
          'error',
          'single',
          {
            avoidEscape: true,
            allowTemplateLiterals: false,
          },
        ],
        'lines-around-comment': [
          'error',
          {
            beforeBlockComment: true,
            beforeLineComment: true,
            allowBlockStart: true,
            allowBlockEnd: true,
            allowObjectStart: true,
            allowObjectEnd: true,
            allowArrayStart: true,
            allowArrayEnd: true,
            allowClassStart: true,
            allowClassEnd: true,
          },
        ],
      },
      settings: {
        'import/resolver': {
          webpack: {
            config: webpackConfig,
          },
        },
        react: {
          // TODO: write sensible configs
          // Regex for Component Factory to use, default to 'createReactClass'.
          createClass: 'createReactClass',
          pragma: 'React',
          version: 'detect',
        },
        propWrapperFunctions: [
          // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`.
          // If this isn't set, any propTypes wrapped in a function will be skipped.
          'forbidExtraProps',
          { property: 'freeze', object: 'Object' },
          { property: 'myFavoriteWrapper' },
        ],
        linkComponents: [
          // Components used as alternatives to <a> for linking, eg. <Link to={ url } />.
          'Hyperlink',
          { name: 'Link', linkAttribute: 'to' },
        ],
      },
    },
    {
      files: [`${relativeServerDir}/**/*.@(js|mjs)`],
    },
  ],
};
