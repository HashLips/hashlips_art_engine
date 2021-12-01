const basePath = process.cwd();
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const { NETWORK } = require(`${basePath}/constants/network.js`);

const network = NETWORK.hbar;

// General metadata for Ethereum
const namePrefix = "HGraph Punk";
const description = "HGraph Punks are a collection of 8,192 punk NFTs that exist on the Hedera network. HGraph Punk holders get access to “The H” bar, exclusive community events, and voting for the charities HGraph Punks donates 1% of income. For more information, visit www.hgraphpunks.com";
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

const hederaMetadata = {
  symbol: "HGP",
  creator: "HGraph Punks",
  category: "Collectable",
  properties: {
    type: "object",
    description: {
      edition: {
        set: 0,
        drop: 1,
        pack: 5
      },
      extras: [""],
      catalog: ["classic punks"]
    }
  },
}

// If you have selected Solana then the collection starts from 0 automatically
const layerConfigurations = [
  {
    growEditionSizeTo: 300,
    layersOrder: [
      { name: "background" },
      { name: "skin" },
      { name: "tattoos"},
      { name: "forehead-h" },
      { name: "earrings" },
      { name: "necklace" },
      { name: "eyes" },
      { name: "nose" },
      { name: "mouth" },
      { name: "hair" },
    ],
  },
];

const shuffleLayerConfigurations = false;

const debugLogs = false;

const format = {
  width: 1080,
  height: 1080,
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
  brightness: "100%",
};

const extraMetadata = {};

const rarityDelimiter = "__#";

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
  hederaMetadata,
  gif,
  preview_gif,
};
