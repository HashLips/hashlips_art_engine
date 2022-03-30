const basePath = process.cwd();
const removeQueryStrings = require(`${basePath}/src/functions/removeQueryStrings`);

const cleanDna = (_str) => {
  const withoutOptions = removeQueryStrings(_str);
  const dna = Number(withoutOptions.split(':').shift());
  return dna;
};

module.exports = cleanDna;
