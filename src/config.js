const basePath = process.cwd();
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const description = "Pawpular NFT Collection – Powered by pets and tech!";
const baseUri = "ipfs://YourCIDHere"; // <-- Replace with your actual IPFS CID after upload

const layerConfigurations = [
  {
    growEditionSizeTo: 100, // TEMP: test 100 NFTs
    layersOrder: [
      { name: "1_background" },
      { name: "2_fur" },
      { name: "2_fur_cat", options: { bypassDNA: true } }, // fallback if applicable
      { name: "3_eyes_dog", options: { bypassDNA: true } },
      { name: "3_eyes_cat", options: { bypassDNA: true } },
      { name: "4_outfit" },
      { name: "5_accessory" }
    ],
  },
];

const shuffleLayerConfigurations = true;
const format = {
  width: 1024,
  height: 1024,
};
const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;
const preview = {
  thumbPerRow: 5,
  thumbWidth: 100,
  imageRatio: format.height / format.width,
  imageName: "preview.png",
};

module.exports = {
  format,
  baseUri,
  description,
  layerConfigurations,
  shuffleLayerConfigurations,
  rarityDelimiter,
  uniqueDnaTorrance,
  preview,
};
