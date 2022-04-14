const metadataTypes = {
  // metadata file will contain all individual metadata files (e.g. eth$, sol$)
  basic: 0,
  // metadata file will contain only rarities (e.g. egld$)
  rarities: 1,
};

const NETWORK = {
  egld: {
    name: "egld",
    startIdx: 1,
    jsonDirPrefix: "",
    mediaDirPrefix: "",
    metadataFileName: "_metadata.json",
    metadataType: metadataTypes.rarities,
  },
  eth: {
    name: "eth",
    startIdx: 1,
    jsonDirPrefix: "json/",
    mediaDirPrefix: "media/",
    metadataFileName: "_metadata.json",
    metadataType: metadataTypes.basic,
  },
  sol: {
    name: "sol",
    startIdx: 0,
    jsonDirPrefix: "json/",
    mediaDirPrefix: "media/",
    metadataFileName: "_metadata.json",
    metadataType: metadataTypes.basic,
  },
};

module.exports = {
  NETWORK,
  metadataTypes,
};
