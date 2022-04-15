const metadataTypes = {
  // metadata file will contain all individual metadata files (common for eth$, sol$)
  basic: 0,
  // metadata file will contain only rarities (common egld$)
  rarities: 1,
};

const NETWORK = {
  egld: {
    name: "egld",
    startIdx: 1,
    metadataFileName: "_metadata.json",
    metadataType: metadataTypes.rarities,
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
