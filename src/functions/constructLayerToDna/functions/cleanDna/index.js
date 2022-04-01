const removeQueryStrings = require("./functions/removeQueryStrings");

function cleanDna (_str) {
  const withoutOptions = removeQueryStrings(_str);
  return Number(withoutOptions.split(":").shift());
}

module.exports = cleanDna;
