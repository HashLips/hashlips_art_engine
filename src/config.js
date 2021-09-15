const description = 'DINO DINO DINO';
const baseUri = 'https://dinodinguos.io/';

const layersOrder = [
  { name: 'Accessory' },
  { name: 'Background' },
  { name: 'Body' },
  { name: 'Eye' },
  { name: 'Head' }
];

const format = {
  width: 512,
  height: 512
};

const background = {
  generate: true,
  brightness: '80%'
};

const uniqueDnaTorrance = 10000;

const editionSize = 5;

module.exports = {
  layersOrder,
  format,
  editionSize,
  baseUri,
  description,
  background,
  uniqueDnaTorrance
};
