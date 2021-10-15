"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const { MODE } = require(path.join(basePath, "src/blendMode.js"));
const description =
  "This is an extension to the frenz of Toadz - Toadz World consists of landscape images that each represent a unique (un)natural habitat for a Toad to !vibe in.";
const baseUri = "ipfs://REPLACE";

const layerConfigurations = [
  {
    growEditionSizeTo: 70,
    layersOrder: [
      { name: "Atmosphere" },
      { name: "Sky" },
      { name: "Celestial" },
      { name: "Topology" },
      { name: "Water" },
      { name: "Surface" },
      // { name: "Landscape" },
      // { name: "Homes_New" },
      // { name: "Residential" },
      // { name: "Monuments" },
      // { name: "Trees" },
      // { name: "FlyingObject" },
      { name: "Crypto" },
    ]
  }
];

const shuffleLayerConfigurations = true;

const debugLogs = false;

const format = {
  width: 900,
  height: 432,
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
