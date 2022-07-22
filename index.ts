const basePath = process.cwd();
const { startCreating, buildSetup } = require(`${basePath}/src/main.ts`);

(() => {
  buildSetup();
  startCreating();
})();
export = {};
