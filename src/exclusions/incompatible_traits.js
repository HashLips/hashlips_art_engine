const simplifyTraits = (traits) => {
  const simpleTraits = {};
  traits.forEach((trait) => {
    simpleTraits[trait.layer] = trait.name;
  });
  return simpleTraits;
};

const traitHasDefinedIncompatibilities = (newTrait, incompatibleTraits) => {
  const traitKey = `${newTrait.layer}/${newTrait.name}`;
  return incompatibleTraits[traitKey];
};

const incompatibleTraitsUsed = (newTraits, incompatibleTraits) => {
  if (!incompatibleTraits) {
    return false;
  }

  const simpleNewTraits = simplifyTraits(newTraits);

  for (let i = 0; (i < newTraits.length); i++) {
    const definedIncompatibilities = traitHasDefinedIncompatibilities(newTraits[i], incompatibleTraits);
    if (definedIncompatibilities !== undefined) {
      for (let n = 0; (n < definedIncompatibilities.length); n++) {
        const [layer, trait] = definedIncompatibilities[n].split('/');
        if (simpleNewTraits[layer] === trait) {
          return true;
        }
      }
    }
  }
  return false;
};

module.exports = {
  incompatibleTraitsUsed,
};
