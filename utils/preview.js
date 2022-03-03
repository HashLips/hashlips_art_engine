const basePath = process.cwd();
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const buildDir = `${basePath}/build`;

const { preview } = require(`${basePath}/src/config.js`);

// read json data
const rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
const metadataList = JSON.parse(rawdata);

const saveProjectPreviewImage = async (_data) => {
  // Extract from preview config
  const { thumbWidth, thumbPerRow, imageRatio, imageName, numberOfImages, order } = preview;
  // Calculate height on the fly
  const thumbHeight = thumbWidth * imageRatio;
  // Prepare canvas
  const previewCanvasWidth = thumbWidth * thumbPerRow;
  const previewCanvasHeight =
    thumbHeight * Math.ceil(numberOfImages / thumbPerRow);
  // Shout from the mountain tops
  console.log(
    `Preparing a ${previewCanvasWidth}x${previewCanvasHeight} project preview with ${numberOfImages} thumbnails.`
  );

  // Initiate the canvas now that we have calculated everything
  const previewPath = `${buildDir}/${imageName}`;
  const previewCanvas = createCanvas(previewCanvasWidth, previewCanvasHeight);
  const previewCtx = previewCanvas.getContext("2d");

  // Iterate all NFTs and insert thumbnail into preview image
  // Don't want to rely on "edition" for assuming index
  let start = order == 'ASC' ? 0 : _data.length;
  if(order == 'ASC'){
    for (let index = 1; index < numberOfImages; index++) {
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
  }else if(order =='DESC'){
    for (let index = _data.length; index >= _data.length - numberOfImages; index--) {
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
  }else if(order == 'MIXED'){
    let pickedIndex = [];
    for (let index = 0; index < numberOfImages; index++) {
      curIndex = getUniqueIndex(pickedIndex, _data.length);
      const nft = _data[curIndex];
      console.log(`curIndex ${curIndex}`)
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
  }
  

  // Write Project Preview to file
  fs.writeFileSync(previewPath, previewCanvas.toBuffer("image/png"));
  console.log(`Project preview image located at: ${previewPath}`);
};

function getUniqueIndex(pickedIndex, max){
  let index = 0;

  while(index == 0){
    temp = Math.floor(Math.random() * max);
    if(!pickedIndex.includes(temp)){
      index = temp;
    }
  }

  pickedIndex.push(index);

  return index;
}

saveProjectPreviewImage(metadataList);