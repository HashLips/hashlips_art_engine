"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const { MODE } = require(path.join(basePath, "src/blendMode.js"));
const description =
  "This is a TEST collection. Fun FUN FUNNNNNN!!!";
const baseUri = "ipfs://QmXcW9V4LZfpdmX63z1WnRk9yNzAUeYeKhAXnDE6q8xmHd";

const layerConfigurations = [
  {
    growEditionSizeTo: 25,
    layersOrder: [
      { name: "Sky" },
      { name: "Clouds" },
      { name: "Sun" },
      { name: "Ground" },
      { name: "Objects" }
    ],
  },
];

const shuffleLayerConfigurations = true;

const debugLogs = false;

const format = {
  width: 1000,
  height: 320,
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
