const basePath = process.cwd();
const buildDir = `${basePath}/build`;
const fs = require('fs');
const { format } = require(`${basePath}/src/config.js`);
const { createCanvas } = require(`${basePath}/node_modules/canvas`);
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext('2d');

const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/images/${_editionCount}.png`,
    canvas.toBuffer('image/png')
  );
};

module.exports = { saveImage, canvas };
