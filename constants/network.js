const metadataTypes = {
  // metadata file will contain all individual metadata files (common for eth$, sol$)
  // no rarities
  basic: 0,

  /// metadata file will contain only rarity data for traits & attributes
  /// individual metadata file will also contain rarity data
  // rarities calculated using JaccardDistances (most accurate/recommended)
  rarities_JD: 1,
  // rarities calculated using Trait Rarity (not recommended)
  rarities_TR: 2,
};

const NETWORK = {
  egld: {
    name: "egld",
    startIdx: 1,
    metadataFileName: "_metadata.json",
    metadataType: metadataTypes.rarities_JD,
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
};
