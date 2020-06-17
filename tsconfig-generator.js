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
  appTsconfigFile,
  testTsconfigFile,
} = require('./project.config');

// TODO: check win
const srcDir = clientDir.replace(/\\/g, '/');
const tsBuildInfoDir = path.join(cacheDir, 'ts-build-info');

const join = (...args) => path.join(...args);

const solutionConfig = {
  include: [],
  files: [],
  references: [{ path: appTsconfigFile }, { path: testTsconfigFile }],
  compilerOptions: {
    tsBuildInfoFile: join(tsBuildInfoDir, 'solution'),
  },
};

const normalizedPaths = {};

Object.entries(pathAliases).forEach(([alias, aliasPath]) => {
  const normalizedAlias = path.normalize(alias + '/');
  const normalizedAliasPath = path.normalize(aliasPath + '/');

  normalizedPaths[normalizedAlias + '*'] = [normalizedAliasPath + '*'];
});

const baseConfig = {
  include: [],
  references: [],
  compilerOptions: {
    composite: true,
    allowJs: true,
    emitDeclarationOnly: true,
    declarationMap: true,
    isolatedModules: true,
    jsx: 'preserve',

    // babel@7.8 default
    lib: ['ES2020', 'dom'],

    // Though it is deprecated it solves the 'csstype' issue after installing it:
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/24788
    moduleResolution: 'node',

    strict: true,

    // webpack adhere to this behaviour by default
    allowSyntheticDefaultImports: true,
    baseUrl: baseDir,
    paths: normalizedPaths,
    typeRoots: [join(baseDir, 'node_modules', '@types')],
    forceConsistentCasingInFileNames: true,
  },
};

const appConfig = {
  ...baseConfig,
  include: [`${srcDir}/**/*.ts`, `${srcDir}/**/*.tsx`],
  exclude: ['**/*.spec.ts', '**/*.spec.tsx'],
  compilerOptions: {
    ...baseConfig.compilerOptions,
    tsBuildInfoFile: join(tsBuildInfoDir, 'app'),
  },
};

const testConfig = {
  ...baseConfig,
  include: [`${srcDir}/**/*.spec.ts`, `${srcDir}/**/*.spec.tsx`],
  references: [{ path: appTsconfigFile }],
  compilerOptions: {
    ...baseConfig.compilerOptions,
    tsBuildInfoFile: join(tsBuildInfoDir, 'test'),
  },
};

const getConfigString = (conf) => JSON.stringify(conf, undefined, 2) + '\n';

fs.writeFileSync('tsconfig.json', getConfigString(solutionConfig));
fs.writeFileSync(appTsconfigFile, getConfigString(appConfig));
fs.writeFileSync(testTsconfigFile, getConfigString(testConfig));
