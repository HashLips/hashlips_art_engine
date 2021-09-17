const description =
  "This is the description of your NFT project, remember to replace this";
const baseUri = "https://hashlips/nft";

const layerConfigurations = [
  {
    growEditionSizeTo: 1,
    layersOrder: [
      //{ name: "Background" },
      { name: "Body" },
      { name: "Eyes" },
      { name: "Mouth" },
      { name: "Earrings" },
      { name: "Shirts" },
      { name: "Necklaces" },
      { name: "Hair" },
    ],
  },
];

const format = {
  width: 512,
  height: 512,
};

const background = {
  generate: true,
  brightness: "40%",
};

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

module.exports = {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
};
