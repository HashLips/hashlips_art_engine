const { MODE } = require("./blendMode.js");
const description =
  "This is the description of your NFT project, remember to replace this";
const baseUri = "ipfs://QmNfPMWLPTEbFpBtPFy4wkYEHRVWcz8dzjziTcPbebzF53";

const layerConfigurations = [
  {
    growEditionSizeTo: 20,
    layersOrder: [
      { name: "Background" },
      { name: "Eyeball" },
      { name: "Eye color" },
      { name: "Iris" },
      { name: "Shine" },
      { name: "Bottom lid", layerVariations: "Skin" },
      { name: "Top lid", layerVariations: "Skin" },
    ],
  },
];

const format = {
  width: 512,
  height: 512,
};

const background = {
  generate: true,
  brightness: "80%",
};

const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.width / format.height,
  imageName: "preview.png",
};

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

const layerVariations = [
  {
    name: "Skin",
    variations: ["green", "purple", "red"],
    Weight: [10,40,50]
  },
];

module.exports = {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  preview,
  layerVariations,
};