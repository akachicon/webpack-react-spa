const {
  clientDir,
  serverDir,
  outDir,
  appGlobals
} = require('./project.config');

const clientGlobals = Object.keys(appGlobals).reduce(
  (acc, global) => {
    acc[global] = 'readonly';
    return acc;
  },
  {}
)

module.exports = {
  root: true,
  ignorePatterns: [`${outDir}/**`],
  extends: [
    'eslint:recommended',
    'prettier', // disable general eslint rules that can conflict with prettier
  ],
  formatters: 'table',
  overrides: [
    {
      files: [`${clientDir}/**/*.m?jsx?`],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        // TODO: investigate eslint-plugin-jsx-a11y

        // Disable eslint-plugin-react rules that can conflict with prettier.
        'prettier/react'
      ],
      env: {
        browser: true,
        es2020: true
      },
      globals: clientGlobals,
      sourceType: 'module',
      settings: {
        react: {
          // TODO: write sensible configs
          // Regex for Component Factory to use, default to 'createReactClass'.
          createClass: 'createReactClass',
          pragma: 'React',
          version: 'detect'
        },
        propWrapperFunctions: [
          // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`.
          // If this isn't set, any propTypes wrapped in a function will be skipped.
          'forbidExtraProps',
          { property: 'freeze', object: 'Object' },
          { property: 'myFavoriteWrapper' }
        ],
        linkComponents: [
          // Components used as alternatives to <a> for linking, eg. <Link to={ url } />.
          'Hyperlink',
          { name: 'Link', linkAttribute: 'to' }
        ]
      },
    },
    {
      files: [`${serverDir}/**/*.m?js`],
      env: {
        node: true,
        es2017: true
      }
    }
  ]
};
