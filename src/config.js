"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const { MODE } = require(path.join(basePath, "src/blendMode.js"));
const description =
  "This is the description of your NFT project, remember to replace this";
const baseUri = "ipfs://NewUriToReplace";
// Input the range of your random number to be the value of the trait
let range = 101;
// This is just the date for the birthday YAY!! 
let dateTime = Date.now();


const layerConfigurations = [
  {
    growEditionSizeTo: 10,
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

// This is where the awesomeness begins bwahahhahaha
const addStats = [
{
      "trait_type": "Level", // This is the Level of your nft
      "value": Math.floor(Math.random() * range) // This generates a random number based on your specific range
    }, 
    {
      "trait_type": "Stamina", // You can add stats like Stamina, Dexterity, Luck, etc.
      "value": Math.floor(Math.random() * range) // This generates a random number based on your specific range
    }, 
    {
// OpenSea currently supports three different options, number, boost_percentage (shows percentage), and boost_number (similar to boost_percentage but doesn't show a percent sign). If you pass in a value that's a number and you don't set a display_type, the trait will appear in the Rankings section
      "display_type": "boost_number", // According to the Metadata standard this is a field indicating how you would like it to be displayed
      "trait_type": "Damage", // This will show like "Damage +<random number>"
      "value": Math.floor(Math.random() * range) // This generates a random number based on your specific range
    }, 
    {
      "display_type": "boost_percentage", 
      "trait_type": "Stamina Increase", 
      "value": Math.floor(Math.random() * range)
    }, 
// OpenSea also supports a date display_type. Traits of this type will appear in the right column near "Rankings" and "Stats." Pass in a unix timestamp as the value.
        {
      "display_type": "date", 
      "trait_type": "birthday", 
      "value": dateTime
    },
// If you don't want to have a trait_type for a particular trait, you can include just a value in the trait and it will be set as a generic property.
  {
    "value": "Happy"
  }
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
  addStats, // Export the module
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  preview,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
};
