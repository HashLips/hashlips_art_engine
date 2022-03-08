const basePath = process.cwd();
const { writeFileSync } = require("fs");
const {
  Canvas,
  CanvasRenderingContext2d,
  Image,
  SetSource
} = require(`${basePath}/node_modules/canvas/build/Release/canvas.node`);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;
const { format, background, layerConfigurations, text, gif } = require(`${basePath}/src/config.js`);

const canvas = new Canvas(format.width, format.height);
const ctx = new CanvasRenderingContext2d(canvas);
ctx.imageSmoothingEnabled = format.smoothing;

if (gif.export) {
  const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);
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

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const drawElement = (_renderObject) => {
  ctx.drawImage(
    _renderObject,
    0,
    0,
    format.width,
    format.height
  );
};

if (background.generate) {
  drawBackground();
}

const loadedImage = new Image();
process.argv[2].replace(/\?bypassDNA=true/g, '').split("-").forEach((layer, index) => {
  SetSource.call(loadedImage, `${layersDir}/${layer}`);
  drawElement(loadedImage);

  if (gif.export) {
    hashlipsGiffer.add();
  }
});

if (gif.export) {
  hashlipsGiffer.stop();
}

canvas.toBuffer((_, buffer) => {
  writeFileSync(
    `${buildDir}/images/${process.argv[3]}.png`,
    buffer
  );
}, "image/png", { resolution: format.resolution })
