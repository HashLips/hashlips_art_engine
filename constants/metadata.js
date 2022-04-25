const METADATA = {
  // metadata file will contain all individual metadata files (common for eth$, sol$)
  // no rarities at all
  basic: 0,
  // metadata file will contain only rarity data for traits & attributes (common for egld$)
  // if rarityAlgorithm provided, individual metadata files will also contain rarity data
  rarities: 1,
};

module.exports = { METADATA };
