const basePath = process.cwd();
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const { NETWORK } = require(`${basePath}/constants/network.js`);

const network = NETWORK.sol;
const baseUri = "ipfs://NewUriToReplace";

///// ↓修正必要箇所↓ /////
const namePrefix = "Your Collection";
const description = "Remember to replace this description";

const solanaMetadata = {
  symbol: "YC",
  seller_fee_basis_points: 1000, // Define how much % you want from secondary market sales 1000 = 10%
  external_url: "https://www.coinfra.io",
  compiler: "Coinfra Labs",
  collection: {
    name: "Your Collection",
    family: "Your Collection",
  },
};

const layerConfigurations = [
  {
    growEditionSizeTo: 10,
    layersOrder: [
      {
        layersDir: `${basePath}/layers-hogehoge`,
        layers: [
          { name: "Background" },
          { name: "Eyeball", options: { pairLayer: "Iris" } }, // ペアとなるtraitがある場合、pairLayerに該当layer名を指定する。そして、同名のファイル名をそのlayerフォルダに格納する。 },
          { name: "Eye color" },
          { name: "Iris" },
          { name: "Shine" },
          { name: "Bottom lid" },
          { name: "Top lid" },
        ],
      },
      {
        layersDir: `${basePath}/layers-hugahuga`,
        layers: [
          { name: "Background" },
          { name: "Eyeball" },
          { name: "Eye color" },
          { name: "Iris" },
          { name: "Shine" },
          { name: "Bottom lid" },
          { name: "Top lid" },
        ],
      },
    ],
  },
];

const format = {
  // 元画像の大きさに合わせて修正
  width: 512,
  height: 512,
  smoothing: false, // ピクセルアートの場合に利用する <参考>https://developer.mozilla.org/ja/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
};
///// ↑修正必要箇所↑ /////

const shuffleLayerConfigurations = false;

const debugLogs = false;

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
