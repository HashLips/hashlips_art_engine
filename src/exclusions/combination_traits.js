const combinationOfTraitsAlreadyExists  = (selectedTraitsList, newTraits, maxRepeatedTraits) => {
  if (!maxRepeatedTraits) {
    return false;
  }

  for (let existingTraits of selectedTraitsList) {
    let commonTraits = 0;
    for (let i = 0; (i < newTraits.length) && (commonTraits <= maxRepeatedTraits); i++) {
      if (newTraits[i].id === existingTraits[i].id) {
        commonTraits++;
      }
    }
    if (commonTraits > maxRepeatedTraits) {
      return true;
    }

  }
  return false;
};

module.exports = {
  combinationOfTraitsAlreadyExists,
};
