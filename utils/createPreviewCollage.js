"use strict";

const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const buildDir = `${basePath}/build`;

console.log(path.join(basePath, "/src/config.js"));
const { preview } = require(path.join(basePath, "/src/config.js"));

// read json data
const rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
const metadataList = JSON.parse(rawdata);

const saveProjectPreviewImage = async (_data) => {
  // Extract from preview config
  const { thumbWidth, thumbPerRow, imageRatio, imageName, previewMaxHeight } = preview;
  // Calculate height on the fly
  const thumbHeight = thumbWidth / imageRatio;
  // Prepare canvas
  const previewCanvasWidth = thumbWidth * thumbPerRow;
  const previewCanvasRows = Math.floor(previewMaxHeight / thumbHeight);
  var totalImages = _data.length;
  var previewCanvasHeight = thumbHeight * Math.trunc(totalImages / thumbPerRow);
  // Adjust canvas height if previewMaxHeight is set in config
  if (previewMaxHeight != 0) {
    previewCanvasHeight = thumbHeight * previewCanvasRows;
    totalImages = thumbPerRow * previewCanvasRows;
  }
  // Shout from the mountain tops
  console.log(
    `Preparing a ${previewCanvasWidth}x${previewCanvasHeight} project preview with ${totalImages} thumbnails.`
  );

  // Initiate the canvas now that we have calculated everything
  const previewPath = `${buildDir}/${imageName}`;
  const previewCanvas = createCanvas(previewCanvasWidth, previewCanvasHeight);
  const previewCtx = previewCanvas.getContext("2d");

  // Iterate all NFTs and insert thumbnail into preview image
  // Don't want to rely on "edition" for assuming index
  for (let index = 0; index < totalImages; index++) {
    const nft = _data[index];
    await loadImage(`${buildDir}/images/${nft.edition}.png`).then((image) => {
      previewCtx.drawImage(
        image,
        thumbWidth * (index % thumbPerRow),
        thumbHeight * Math.trunc(index / thumbPerRow),
        thumbWidth,
        thumbHeight
      );
    });
  }

  // Write Project Preview to file
  fs.writeFileSync(previewPath, previewCanvas.toBuffer("image/png"));
  console.log(`Project preview image located at: ${previewPath}`);
};

saveProjectPreviewImage(metadataList);
