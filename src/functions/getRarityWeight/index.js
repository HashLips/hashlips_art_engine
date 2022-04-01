const basePath = process.cwd();
const { rarityDelimiter } = require(`${basePath}/src/config.js`);

function getRarityWeight (_str) {
  const nameWithoutExtension = _str.slice(0, -4);
  let nameWithoutWeight = Number(
    nameWithoutExtension.split(rarityDelimiter).pop()
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 1;
  }
  return nameWithoutWeight;
}

module.exports = getRarityWeight;
