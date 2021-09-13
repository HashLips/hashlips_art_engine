const description =
  "This is the description of your NFT project, remember to replace this";
const baseUri = "https://hashlips/nft";

const layersOrder = [
  { name: "Background" },
  { name: "Eyeball" },
  { name: "Eye color" },
  { name: "Iris" },
  { name: "Shine" },
  { name: "Bottom lid" },
  { name: "Top lid" },
];

const format = {
  width: 512,
  height: 512,
};

const background = {
  generate: true,
  brightness: "80%",
};

const uniqueDnaTorrance = 10000;

const editionSize = 3;

module.exports = {
  layersOrder,
  format,
  editionSize,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
};
