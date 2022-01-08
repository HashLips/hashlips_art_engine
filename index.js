const basePath = process.cwd();
const { startCreating, buildSetup } = require(`${basePath}/src/main.js`);

(() => {
  buildSetup();
  startCreating();
})();
