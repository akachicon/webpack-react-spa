// To maintain single source of truth for options like webpack aliases and have
// an ability to config project wide options from a single top level file we
// should pass our options from that config file to tsconfig. Since tsconfig
// does only supports .json extension, we resort to writing tsconfig.json
// generator.

const fs = require('fs');
const path = require('path');
const {
  baseDir,
  clientDir,
  cacheDir,
  pathAliases,
} = require('./project.config');

// TODO: check win
const srcDir = clientDir.replace(/\\/g, '/');
const appTsconfigPath = path.join(clientDir, 'app.tsconfig.json');
const testTsconfigPath = path.join(clientDir, 'test.tsconfig.json');
const tsBuildInfoDir = path.join(cacheDir, 'ts-build-info');

const join = (...args) => path.join(...args);

const solutionConfig = {
  include: [`${srcDir}/**/*.ts`, `${srcDir}/**/*.tsx`],
  references: [{ path: appTsconfigPath }, { path: testTsconfigPath }],
  tsBuildInfoFile: join(tsBuildInfoDir, 'solution'),
};

const normalizedPaths = {};

Object.entries(pathAliases).forEach(([alias, aliasPath]) => {
  const normalizedAlias = path.normalize(alias + '/');
  const normalizedAliasPath = path.normalize(aliasPath + '/');

  normalizedPaths[normalizedAlias + '*'] = normalizedAliasPath + '*';
});

const baseConfig = {
  compilerOptions: {
    allowJs: true,
    emitDeclarationOnly: true,
    declarationMap: true,
    isolatedModules: true,

    // babel@7.8 default
    lib: 'ES2020',

    // moduleResolution option is deprecated.
    // Using ES2020 will result in nodejs module resolution logic.
    module: 'ES2020',
    noEmit: true,
    strict: true,

    // webpack adhere to this behaviour by default
    allowSyntheticDefaultImports: true,
    baseUrl: baseDir,
    paths: normalizedPaths,
    typeRoots: [path.join(baseDir, 'node_modules', '@types')],
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true,
  },
};

const appConfig = {
  ...baseConfig,
  include: [`${srcDir}/**/*.ts`, `${srcDir}/**/*.tsx`],
  exclude: ['**/*.spec.ts', '**/*.spec.tsx'],
  tsBuildInfoFile: join(tsBuildInfoDir, 'app'),
};

const testConfig = {
  ...baseConfig,
  include: [`${srcDir}/**/*.spec.ts`, `${srcDir}/**/*.spec.tsx`],
  references: [{ path: appTsconfigPath }],
  tsBuildInfoFile: join(tsBuildInfoDir, 'test'),
};

const getConfigString = (conf) => JSON.stringify(conf, undefined, 2) + '\n';

fs.writeFileSync('tsconfig.json', getConfigString(solutionConfig));
fs.writeFileSync(appTsconfigPath, getConfigString(appConfig));
fs.writeFileSync(testTsconfigPath, getConfigString(testConfig));

// TODO: write typeAcquisition (jsconfig.json) for the app project - exclude test
//  packages.

// TODO: project post-install script building app with --build option to generate
//  declarations for ts referenced (composite) projects. Make a note in the readme.
