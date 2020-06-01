// To maintain single source of truth for options like webpack aliases and have
// an ability to config project wide options from a single top level file we
// should pass our options from that config file to tsconfig. Since tsconfig
// does only supports .json extension, we resort to writing tsconfig.json
// generator.

const fs = require('fs');
const { clientDir } = require('./project.config');

const config = {
  include: [clientDir],
  allowJs: true,
  compilerOptions: {},
};

fs.writeFileSync('tsconfig.json', JSON.stringify(config, undefined, 2) + '\n');
