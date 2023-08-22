const basePath = process.cwd();
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const { NETWORK } = require(`${basePath}/constants/network.js`);

const network = NETWORK.eth;

// General metadata for Ethereum
const namePrefix = "Polkadot Punks";
const description = "Polkadot Punks are the first ever nft collection to be Minted on Polkadot Network over 10,000 items will be minted in the collection";
const baseUri = "ipfs://NewUriToReplace";

const solanaMetadata = {
  symbol: "PDP",
  seller_fee_basis_points: 1000, // Define how much % you want from secondary market sales 1000 = 10%
  external_url: "https://twitter.com/polkadot_punks",
  creators: [
    {
      address: "5CMhnzVJR8oDBypYgDxBwbFu3WiH5RdxPr4A1HaFPPA34EKa",
      share: 100,
    },
  ],
};

// If you have selected Solana then the collection starts from 0 automatically
const layerConfigurations = [
  {
    growEditionSizeTo: 2000,
    layersOrder: [
      { name: "Background" },
      { name: "Males" },
      { name: "Mouth" },
      { name: "Cap" },
      { name: "Glasses" },
    ],
  },
  {
    // Creates an additional 100 artworks
    growEditionSizeTo: 4000,
    layersOrder: [
      { name: "Background" },
      { name: "Males" },
      { name: "Hair" },
      { name: "Glasses" },
      { name: "Mouth" },
      { name: "Mouth wearable" },
      { name: "Ear" },
      { name: "Chain" },
    ],
  },
  {
    // Creates an additional 100 artworks
    growEditionSizeTo: 6000,
    layersOrder: [
      { name: "Background" },
      { name: "Males" },
      { name: "Mouth" },
      { name: "Mouth wearable" },
      { name: "Beard" },
      { name: "Face" },
      { name: "Mask" },
      { name: "Chain" },

    ],
  },
  {
    // Creates an additional 100 artworks
    growEditionSizeTo: 7000,
    layersOrder: [
      { name: "Background" },
      { name: "Females" },
      { name: "lipstick" },
      { name: "Female Mouth wearable" },
      { name: "Female Glasses" },
      { name: "Female Chain" },
    ],
  },
  {
    // Creates an additional 100 artworks
    growEditionSizeTo: 7500,
    layersOrder: [
      { name: "Background" },
      { name: "Females" },
      { name: "Female Hair" },
      { name: "Female Mouth wearable" },
      { name: "Female Ear" },
      { name: "Female spots" },
      
    ],
  },
  {
    // Creates an additional 100 artworks
    growEditionSizeTo: 8500,
    layersOrder: [
      { name: "Background" },
      {name: "Females"},
      { name: "Female Cap" },
      { name: "Female Chain" },
      { name: "Female Glasses" },
    ],
  },
  {
    growEditionSizeTo: 9300,
    layersOrder: [
{name: "Background"},
{name: "Cloth"},
{name: "Males"},
{name: "Glasses"},
{name: "Ear"},
{name: "Chain"},
{name: "Beard"},
{name: "Mouth"},
    ],
  },
  {
    growEditionSizeTo: 9400,
    layersOrder:[
      {name: "Background"},
      {name: "Alien"},
      {name: "Cap"},
      {name: "Chain"},
      {name: "Ear"},
      {name: "Glasses"},
      {name: "Beard"},
      {name: "Mouth"},
    ],
  },
  {
    growEditionSizeTo: 9500,
    layersOrder:[
      {name: "Background"},
      {name: "Alien"},
      {name: "Hair"},
      {name: "Chain"},
      {name: "Ear"},
      {name: "Mouth wearable"},
      {name: "Glasses"},
    ],
  },
  {
    growEditionSizeTo: 9600,
    layersOrder:[
      {name: "Background"},
      {name: "Ape"},
      {name: "Cap"},
      {name: "Chain"},
      {name: "Ear"},
      {name: "Mouth"},
      {name: "Glasses"},
      {name: "Beard"},
    ],
  },
  {
    growEditionSizeTo: 9700,
    layersOrder:[
      {name: "Background"},
      {name: "Ape"},
      {name: "Cap"},
      {name: "Chain"},
      {name: "Ear"},
      {name: "Mouth wearable"},
      {name: "Glasses"},
    ],
  },
  {
    growEditionSizeTo: 9800,
    layersOrder:[
      {name: "Background"},
      {name: "Zombie"},
      {name: "Cap"},
      {name: "Chain"},
      {name: "Ear"},
      {name: "Mouth"},
      {name: "Glasses"},
      {name: "Beard"},
    ],
  },
  {
    growEditionSizeTo: 10000,
    layersOrder:[
      {name: "Background"},
      {name: "Zombie"},
      {name: "Hair"},
      {name: "Chain"},
      {name: "Ear"},
      {name: "Mouth wearable"},
      {name: "Glasses"},
    ],
  },
  
];

const shuffleLayerConfigurations = false;

const debugLogs = false;

const format = {
  width: 512,
  height: 512,
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
  network,
  solanaMetadata,
  gif,
  preview_gif,
};