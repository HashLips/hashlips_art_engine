const basePath = process.cwd();
const buildDir = `${basePath}/build`;
const fs = require("fs");

const { gif } = require(`${basePath}/src/config.js`);

function buildSetup () {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(`${buildDir}/json`);
  fs.mkdirSync(`${buildDir}/images`);
  if (gif.export) {
    fs.mkdirSync(`${buildDir}/gifs`);
  }
};

module.exports = buildSetup;
