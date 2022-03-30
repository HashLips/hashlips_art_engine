const basePath = process.cwd();
const { background, format } = require(`${basePath}/src/config.js`);
const { canvas } = require('../saveImage');
const genColor = require('../genColor');
const ctx = canvas.getContext('2d');

const drawBackground = () => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

module.exports = drawBackground;
