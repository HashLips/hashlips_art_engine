"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const { MODE } = require(path.join(basePath, "src/blendMode.js"));
const baseUri = "ipfs://LinkIsRepleacedWhenUploadingWithTurtleMoonTools";

// If you have selected Solana then the collection starts from 0 automatically
const layerConfigurations = [
  {
    growEditionSizeTo: 5,
    layersOrder: [
      { name: "Background" },
      { name: "Eyeball" },
      { name: "Eye color" },
      { name: "Iris" },
      { name: "Shine" },
      { name: "Bottom lid" },
      { name: "Top lid" },
    ],
  },
];

// UPDATE THIS TO: The maximum number of mints of this collection
const creator = "Turtle Moon";

// UPDATE THIS TO: A category that makes sense for your art. Digital Art, Collectible, etc
const category = "Digital Art";

// UPDATE THIS TO: The maximum number of mints of this collection
const maxSupply = '8,192'

// UPDATE THIS DESCRIPTION. Your own description would be best :)
const description = `${creator} are a collection of ${maxSupply} randomly generated NFTs that exist on the Hedera network.`;

const shuffleLayerConfigurations = false;

const useAdditionalData = false;

const debugLogs = true;

const format = {
  width: 1080,
  height: 1080,
};

const background = {
  generate: true,
  brightness: "100%",
};

const extraMetadata = {};

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.width / format.height,
  imageName: "preview.png",
};

module.exports = {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  preview,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  category,
  creator,
  maxSupply,
  useAdditionalData,
};
