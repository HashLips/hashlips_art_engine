const { METADATA } = require("../constants/metadata");
const { RARITY } = require("../constants/rarity");

const defaults = {
  startIdx: 1,
  jsonDirPrefix: "",
  mediaDirPrefix: "",
  mediaFilePrefix: "",
  metadataFileName: "_metadata.json",
  metadataType: METADATA.basic,
  rarityAlgorithm: RARITY.none,
  includeRank: false,
};

const NETWORK = {
  eth: {
    ...defaults,
    name: "eth",
    jsonDirPrefix: "json/",
    mediaDirPrefix: "media/",
    mediaFilePrefix: "$",
  },
  sol: {
    ...defaults,
    name: "sol",
    startIdx: 0,
    jsonDirPrefix: "json/",
    mediaDirPrefix: "media/",
    mediaFilePrefix: "$",
  },
  egld: {
    ...defaults,
    name: "egld",
    metadataType: METADATA.rarities,
    rarityAlgorithm: RARITY.jaccardDistances,
    includeRank: true,
  },
};

module.exports = { NETWORK };
