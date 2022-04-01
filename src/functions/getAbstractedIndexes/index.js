function getAbstractedIndexes (growEditionSizeTo, startI) {
  const abstractedIndexes = [];
  for (
    let i = startI;
    i <= growEditionSizeTo;
    i++
  ) {
    abstractedIndexes.push(i);
  }
  return abstractedIndexes;
}

module.exports = getAbstractedIndexes;
