const basePath = process.cwd();
const { startGeneration, buildSetup } = require(`${basePath}/src/main.js`);

(() => {
  buildSetup();
  startGeneration();
})();
