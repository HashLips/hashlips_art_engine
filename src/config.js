"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const { MODE } = require(path.join(basePath, "constants/blend_mode.js"));
const { NETWORK } = require(path.join(basePath, "constants/network.js"));
// Input the range of your random number to be the value of the trait
let range = 5;
// This generates a random number based on your specific range
let random = Math.floor(Math.random() * range); 

// Select your network
const network = NETWORK.ethl;

// Global Configuration appear on both Ethereum and Solana
const description =
  "This is the description of your NFT project, remember to replace this";
const baseUri = "ipfs://NewUriToReplace";
const nftName = ""; // This is optional, if you want a name in your NFT ex. NFT - #1. The input should be like "NFT - "

// Solana Configuration
  const solBase = {
    symbol: "NOC",
    seller_fee_basis_points: 1000, // Define how much % you want from secondary market sales 1000 = 10%
    external_url: "https://www.youtube.com/c/hashlipsnft",
    collection: {
       name: "<name>",
     family: "<family>" 
    },
  };
  const solProperties = {
    files: [
      {
        uri: "https://www.arweave.net/abcd5678?ext=png",
        type: "image/png"
      }
    ],
    category: "image",
    creators: [
      {
        address: "<owner_address>",
        share: 100
      }
    ]
  };

const layerConfigurations = [
  {
    growEditionSizeTo: 5,
    layersOrder: [
      { name: "Background" },
      { name: "Eyeball" },
      { name: "Eye color" },
      { name: "Iris" },
      { name: "Shine" },
      { name: "Bottom lid" },
      { name: "Top lid" },
    ],
  },
];

// Rich Metadata standard for Ethereum
const addStats = [
    {
      "trait_type": "Level", // This is the Level of your nft
      "max_value": range, // the maximum value of your range
      "value": random
    }, 
    {
      "trait_type": "Stamina", // You can add stats like Stamina, Dexterity, Luck, etc.
      "max_value": range, // the maximum value of your range
      "value": random
    }
];

const addBoosts = [
    {
// OpenSea currently supports three different options, number, boost_percentage (shows percentage), and boost_number (similar to boost_percentage but doesn't show a percent sign). If you pass in a value that's a number and you don't set a display_type, the trait will appear in the Rankings section
      "display_type": "boost_number", // According to the Metadata standard this is a field indicating how you would like it to be displayed
      "trait_type": "Damage", // This will show like "Damage +<random number>"
      "value": random
    }
];

const addPercentage = [
    {
      "display_type": "boost_percentage", 
      "trait_type": "Stamina Increase", 
      "value": random
    }
];

const addProperty = [
// If you don't want to have a trait_type for a particular trait, you can include just a value in the trait and it will be set as a generic property.
  {
    "value": "Happy"
  }
];

// Just enable his this if you want rich metadata standard on Ethereum
const extraAttributes ={
  stats:false,
  boosts:false,
  percentage:false,
  property:false
};

const shuffleLayerConfigurations = false;

const debugLogs = false;

const format = {
  width: 512,
  height: 512,
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
  imageRatio: format.width / format.height,
  imageName: "preview.png",
};

module.exports = {
  format,
  baseUri,
  description,
  background,
  addStats, // Export the module
  addBoosts, // Export the module
  addPercentage, // Export the module
  addProperty, // Export the module
  extraAttributes, //Export the module
  nftName, // Export the module
  network, // Export the module
  solBase, // Export the module
  solProperties, // Export the module
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  preview,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  pixelFormat,
  text,
};
