"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const { MODE } = require(path.join(basePath, "src/blendMode.js"));
const description =
  "This is the description of your NFT project, remember to replace this";
const baseUri = "ipfs://QmZLTevyYJ9SjAFcaqaSzKsdJGkUHudna6SdW6fhy1QvcW";

const layerConfigurations = [
  {
    growEditionSizeTo: 20,
    layersOrder: [
      { name: "Background" },
      { name: "Border" },
      { name: "Mark" },
      { name: "Mouth" },
      { name: "Nose" },
      { name: "Eyes" },
      { name: "Blood" }
    ]
  }
];

const shuffleLayerConfigurations = true;

const debugLogs = false;

const format = {
  width: 200,
  height: 200,
};

const background = {
  generate: false,
  brightness: "80%",
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
};
