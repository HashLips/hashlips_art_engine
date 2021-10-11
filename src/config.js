"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const { MODE } = require(path.join(basePath, "src/blendMode.js"));
const description =
  "This is the description of your NFT project, remember to replace this";
const baseUri = "ipfs://NewUriToReplace";

const layerConfigurations = [
  {
    growEditionSizeTo: 10,
    layersOrder: [
      { name: "Background" },
      { name: "Eyeball" },
      { name: "Eye color" },
      { name: "Iris" },
      { name: "Shine" },
      { name: "Bottom lid",},
      { name: "Top lid" },
    ],
  },
];

const shuffleLayerConfigurations = false;

const debugLogs = false;

const format = {
  width: 512,
  height: 512,
};

const background = {
  generate: true,
  brightness: "80%",
};


const extraMetadata = () => ([
  {
    // Optionally, if you need to overwrite one of your layers attributes.
    // You can include the same name as the layer, here, and it will overwrite
    //
    "trait_type": "Bottom lid",
    value:` Bottom lid # ${Math.random() * 100}`,
    },
  {
    display_type: "boost_number",
    trait_type: "Aqua Power",
    value: Math.random() * 100,
  },
  {
    display_type: "boost_number",
    trait_type: "Health",
    value: Math.random() * 100,
  },
  {
    display_type: "boost_number",
    trait_type: "Mana",
    value: Math.floor(Math.random() * 100),
  },
]);

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
