const metadataTypes = {
  // metadata file will contain all individual metadata files (common for eth$, sol$)
  // no rarities at all
  basic: 0,
  // metadata file will contain only rarity data for traits & attributes (common for egld$)
  // if rarityAlgorithm provided, individual metadata file will also contain rarity data
  rarities: 1,
};

const rarityAlgorithms = {
  none: 0,
  JaccardDistances: 1, // most accurate / recommended
  TraitRarity: 2,
  StatisticalRarity: 3,
  TraitAndStatisticalRarity: 4, // TraitRarity & StatisticalRarity combined
};

const NETWORK = {
  egld: {
    name: "egld",
    startIdx: 1,
    metadataFileName: "_metadata.json",
    metadataType: metadataTypes.rarities,
    rarityAlgorithm: rarityAlgorithms.JaccardDistances,
    includeRank: true
  },
  eth: {
    name: "eth",
    startIdx: 1,
    jsonDirPrefix: "json/",
    mediaDirPrefix: "media/",
    mediaFilePrefix: "$",
    metadataFileName: "_metadata.json",
    metadataType: metadataTypes.basic,
  },
  sol: {
    name: "sol",
    startIdx: 0,
    jsonDirPrefix: "json/",
    mediaDirPrefix: "media/",
    mediaFilePrefix: "$",
    metadataFileName: "_metadata.json",
    metadataType: metadataTypes.basic,
  },
};

module.exports = {
  NETWORK,
  metadataTypes,
  rarityAlgorithms,
};
