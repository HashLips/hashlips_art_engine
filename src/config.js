const basePath = process.cwd();
const { MODE } = require(`${basePath}/constants/blend_mode.js`);

// general metadata for EVMs
const namePrefix = "Your Collection";
const description = "Remember to replace this description";
const startCountFrom = 0;
// optional, change hasBaseUri to true if your  images pre-uploaded to IPFS
const hasBaseUri = false;
const baseUri = "ipfs://cid-here";
// optional, is the image filename case sensitive? 
// default: false, meaning your file name will be capitalized e.g. "Awesome" instead of "awesome"
const isLayerNameFileNameAsIs = false;

// If you have selected Solana then the collection starts from 0 automatically
const layerConfigurations = [
  {
    growEditionSizeTo: 5,
    layersOrder: [
      { name: "background", options: { displayName: "Background" } },
      { name: "eyeball", options: { displayName: "Eyeball" } },
      { name: "eyecolor", options: { displayName: "Eye Color" } },
      { name: "iris", options: { displayName: "Iris" } },
      { name: "shine", options: { displayName: "Shine" } }
    ],
  },
];

const startEditionFrom = startCountFrom;

const shuffleLayerConfigurations = false;

const debugLogs = false;

const format = {
  width: 1024,
  height: 1024,
  smoothing: false,
};

const gif = {
  export: false,
  repeat: 0,
  quality: 100,
  delay: 500,
};

const text = {
  only: false,
  color: "#ffffff",
  size: 20,
  xGap: 40,
  yGap: 40,
  align: "left",
  baseline: "top",
  weight: "regular",
  family: "Courier",
  spacer: " => ",
};

const pixelFormat = {
  ratio: 2 / 128,
};

const background = {
  generate: true,
  brightness: "80%",
  static: false,
  default: "#000000",
};

const extraMetadata = {};

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.height / format.width,
  imageName: "preview.png",
};

const preview_gif = {
  numberOfImages: 5,
  order: "ASC", // ASC, DESC, MIXED
  repeat: 0,
  quality: 100,
  delay: 500,
  imageName: "preview.gif",
};

module.exports = {
  format,
  hasBaseUri,
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
  pixelFormat,
  text,
  namePrefix,
  gif,
  startEditionFrom,
  isLayerNameFileNameAsIs,
  preview_gif,
};
