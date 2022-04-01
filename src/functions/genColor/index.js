const basePath = process.cwd();
const { background } = require(`${basePath}/src/config.js`);

const genColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

module.exports = genColor;
