const basePath = process.cwd();
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const { NETWORK } = require(`${basePath}/constants/network.js`);

const network = NETWORK.eth;

// General metadata for Ethereum
const namePrefix = "Your Collection";
const description = "Remember to replace this description";
const baseUri = "ipfs://NewUriToReplace";

const solanaMetadata = {
  symbol: "YC",
  seller_fee_basis_points: 1000, // Define how much % you want from secondary market sales 1000 = 10%
  external_url: "https://www.youtube.com/c/hashlipsnft",
  creators: [
    {
      address: "7fXNuer5sbZtaTEPhtJ5g5gNtuyRoKkvxdjEjEnPN4mC",
      share: 100,
    },
  ],
};

// If you have selected Solana then the collection starts from 0 automatically
const layerConfigurations = [
  {
    growEditionSizeTo: 3000,
    layersOrder: [
      {
        name: "13_Background",
        options: {
          displayName: "Background",
        },
      },
      {
        name: "12_Behind",
        options: {
          displayName: "12_Behind",
        },
      },
      {
        name: "11_BodyColors",
        options: {
          displayName: "Body Colors",
        },
      },
      {
        name: "10_Outline",
        options: {
          displayName: "Outline",
        },
      },
      {
        name: "9_BodySkins",
        options: {
          displayName: "Skin",
        },
      },
      {
        name: "8_Clothing",
        options: {
          displayName: "Clothing",
        },
      },
      {
        name: "7_Weapon",
        options: {
          displayName: "Weapon",
        },
      },
      {
        name: "6_Adornment",
        options: {
          displayName: "Adornment",
        },
      },
      {
        name: "5_Mouth",
        options: {
          displayName: "Mouth",
        },
      },
      {
        name: "4_Eyes",
        options: {
          displayName: "Eyes",
        },
      },
      {
        name: "3_MasksHelmetsFace",
        options: {
          displayName: "MasksHelmetsFace",
        },
      },
      {
        name: "2_MouthAccessory",
        options: {
          displayName: "Mouth Accessory",
        },
      },
      {
        name: "1_AboveHead",
        options: {
          displayName: "Above Head",
        },
      },
    ],
  },
];

const shuffleLayerConfigurations = false;

const debugLogs = false;

const format = {
  width: 3000,
  height: 4000,
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
  ratio: 5 / 128,
};

const background = {
  generate: false,
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
