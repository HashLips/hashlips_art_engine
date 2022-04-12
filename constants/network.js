const metadataTypes = {
  // metadata file will contain all individual metadata files (e.g. eth$, sol$)
  basic: 0,
  // metadata file will contain only rarities (e.g. egld$)
  rarities: 1,
};

const NETWORK = {
  eth: {
    name: "eth",
    jsonDirPrefix: "json/",
    mediaDirPrefix: "media/",
    metadataFileName: "_metadata.json",
    metadataType: metadataTypes.basic,
  },
  sol: {
    name: "sol",
    jsonDirPrefix: "json/",
    mediaDirPrefix: "media/",
    metadataFileName: "_metadata.json",
    metadataType: metadataTypes.basic,
  },
  egld: {
    name: "egld",
    jsonDirPrefix: "",
    mediaDirPrefix: "",
    metadataFileName: "_metadata.json",
    metadataType: metadataTypes.rarities,
  },
};

module.exports = {
  NETWORK,
  metadataTypes,
};
