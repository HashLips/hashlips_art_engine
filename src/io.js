const fs = require('fs');

const saveImage = (_editionCount, canvas, buildDir) => {
  fs.writeFileSync(
    `${buildDir}/images/${_editionCount}.png`,
    canvas.toBuffer('image/png')
  );
};

module.exports = {
  saveImage,
};
