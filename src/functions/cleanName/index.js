const basePath = process.cwd();
const { rarityDelimiter } = require(`${basePath}/src/config.js`);

const cleanName = (_str) => {
  const nameWithoutExtension = _str.slice(0, -4);
  const nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

module.exports = cleanName;
