const basePath = process.cwd();
const { background, format } = require(`${basePath}/src/config.js`);
const genColor = require('../genColor');

const drawBackground = (ctx) => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
  return ctx;
};

module.exports = drawBackground;
