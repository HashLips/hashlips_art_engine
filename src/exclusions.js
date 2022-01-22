const { combinationOfTraitsAlreadyExists } = require('./exclusions/combination_traits');
const { incompatibleTraitsUsed } = require('./exclusions/incompatible_traits');

const needsExclusion = (selectedTraitsList, newTraits, maxRepeatedTraits, incompatibleTraits) => {
  return combinationOfTraitsAlreadyExists(selectedTraitsList, newTraits, maxRepeatedTraits) || incompatibleTraitsUsed(newTraits, incompatibleTraits);
};

module.exports = {
  needsExclusion,
};
