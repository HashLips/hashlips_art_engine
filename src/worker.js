const basePath = process.cwd();
const fs = require("fs");
const { createCanvas, loadImage } = require(`${basePath}/node_modules/canvas`);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;
const { format, background, layerConfigurations, text, gif } = require(`${basePath}/src/config.js`);

const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = format.smoothing;
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);

const saveImage = (_editionCount) => {
  fs.writeFileSync(
   `${buildDir}/images/${_editionCount}.png`,
   canvas.toBuffer("image/png")
 );
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const loadLayerImg = async (_layer) => {
  return new Promise(async (resolve) => {
    try {
      const image = await loadImage(`${layersDir}/${_layer.selectedElement.path}`);
      resolve({ layer: _layer, loadedImage: image });
    } catch (error) {
      console.error("Error loading image:", error, _layer.selectedElement.path);
      process.exit();
    }
  })
};

const drawElement = (_renderObject) => {
  ctx.drawImage(
    _renderObject.loadedImage,
    0,
    0,
    format.width,
    format.height
  );
};

if (gif.export) {
  let hashlipsGiffer = new HashlipsGiffer(
    canvas,
    ctx,
    `${buildDir}/gifs/${abstractedIndex}.gif`,
    gif.repeat,
    gif.quality,
    gif.delay
  );
  hashlipsGiffer.start();
}
if (background.generate) {
  drawBackground();
}
process.argv[2].replace(/\?bypassDNA=true/g, '').split("-").forEach(async (layer, index) => {
  const loadedImage = await loadLayerImg({selectedElement: { path: layer }});
  drawElement(loadedImage);
  if (gif.export) {
    hashlipsGiffer.add();
  }
});

if (gif.export) {
  hashlipsGiffer.stop();
}
setTimeout(() => saveImage(process.argv[3]));
