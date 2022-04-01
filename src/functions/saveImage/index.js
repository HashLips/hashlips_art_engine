const basePath = process.cwd();
const buildDir = `${basePath}/build`;
const fs = require("fs");

const saveImage = (_editionCount, canvas) => {
  fs.writeFileSync(
    `${buildDir}/images/${_editionCount}.png`,
    canvas.toBuffer("image/png")
  );
};

module.exports = saveImage;
