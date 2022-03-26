function removeQueryStrings (_dna) {
  const query = /(\?.*$)/;
  return _dna.replace(query, "");
}

module.exports = removeQueryStrings;
