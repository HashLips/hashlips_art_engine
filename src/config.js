const basePath = process.cwd();
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const { NETWORK } = require(`${basePath}/constants/network.js`);

// Only use this if 100% necessary! Should regenerate whole collection together. 
// I don't think this is the right way to do this. requires testing. 
const resumeNum = 0;

/* 
-~~work in resumeNum functionality~~
-~~work in toCreateNow functionality~~
-work in variation functionality
-work in misc utils
-work in rarity calculations
-rework weight system to provide option to have either 
exact percentages based on weight (ie, weight of #30 would generate 
that trait 30% of the time), or to simply mark the weight as a 
rarity name (common, rare, etc.) and have rarity automatic 
-Create incompatible layers system. 
-option to not display none in metadata
-option to include rarity in metadata
*/

const collectionSize = 10000;
const toCreateNow = 20;

const scaleSize = (num) => {
  if (collectionSize === toCreateNow) return num;
  return Math.floor((num / collectionSize) * toCreateNow);
};

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
    growEditionSizeTo: scaleSize(2500),
    layersOrder: [
      { name: "Body" },
      { name: "Head" },
      { name: "Back" },
      { name: "Legs" },
      { name: "Arms" },
      { name: "Mouth" },
      { name: "Eyes" },
    ],
  },
  {
    growEditionSizeTo: scaleSize(10000),
    layersOrder: [
      { name: "Body" },
      { name: "Head" },
      { name: "Back" },
      { name: "Legs" },
      { name: "Arms" },
      { name: "Mouth" },
      { name: "Eyes" },
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

const namedWeights = false;

/* 
* Rarity distribution can be adjusted
* Keep range [0 - 10,000]
*
*/
const rarity_config = {
  Mythic: { ranks: [0, 100] }, //, fileName: 'Mythic.png' },
  Legendary: { ranks: [100, 600] }, //, fileName: 'Legendary.png' },
  Epic: { ranks: [600, 1500] }, //, fileName: 'Epic.png' },
  Rare: { ranks: [1500, 3100] }, //, fileName: 'Rare.png' },
  Uncommon: { ranks: [3100, 5600] }, //, fileName: 'Uncommon.png' },
  Common: { ranks: [5600, 10000] }, //, fileName: 'Common.png' },
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
  resumeNum,
  rarity_config,
  namedWeights,
  toCreateNow,
};
