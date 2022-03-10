const basePath = process.cwd();
const GifEncoder = require(`${basePath}/node_modules/gif-encoder-2/src/GIFEncoder.js`);
const { writeFile } = require("fs");

class HashLipsGiffer {
  constructor(_canvas, _ctx, _fileName, _repeat, _quality, _delay) {
    this.canvas = _canvas;
    this.ctx = _ctx;
    this.fileName = _fileName;
    this.repeat = _repeat;
    this.quality = _quality;
    this.delay = _delay;
    this.initGifEncoder();
  }

  initGifEncoder() {
    this.gifEncoder = new GifEncoder(this.canvas.width, this.canvas.height);
    this.gifEncoder.setQuality(this.quality);
    this.gifEncoder.setRepeat(this.repeat);
    this.gifEncoder.setDelay(this.delay);
  }

  start() {
    this.gifEncoder.start();

    this.gifEncoder.indexedPixels = new Uint8Array();
    this.gifEncoder.writeLSD();
    this.gifEncoder.writeImageDesc();
    this.gifEncoder.writePixels();

    this.gifEncoder.firstFrame = false;
  };

  add() {
    this.gifEncoder.image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    this.gifEncoder.analyzePixels();

    this.gifEncoder.writeGraphicCtrlExt();
    this.gifEncoder.writeImageDesc();
    this.gifEncoder.writePalette();
    this.gifEncoder.writePixels();
  }

  stop() {
    this.gifEncoder.finish();
    const buffer = this.gifEncoder.out.getData();
    writeFile(this.fileName, buffer, (error) => {});
    console.log(`Created gif at ${this.fileName}`);
  }
}

module.exports = HashLipsGiffer;
