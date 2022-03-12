/**
 * This script helps to resize your images in the
 * `build/images` folder for the `displayUri` and
 * `thumbnailUri` in Tezos metadata.
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const imagesDir = `${basePath}/build/images`;
const tezosConfig = require(`${basePath}/Tezos/tezos_config.js`);

const resizeImagePath = {
  displayUri: path.join(basePath, "build/displayUri/"),
  thumbnailUri: path.join(basePath, "build/thumbnailUri/"),
};

function getAllImages(dir) {
  if (!fs.existsSync(imagesDir)) {
    console.log(`Images folder doesn't exist.`);
    return;
  }

  const images = fs
    .readdirSync(imagesDir)
    .filter((item) => {
      let extension = path.extname(`${dir}${item}`);
      if (extension == ".png" || extension == ".jpg") {
        return item;
      }
    })
    .map((i) => ({
      filename: i,
      path: `${dir}/${i}`,
    }));

  return images;
}

function renderResizedImages(images, path, sizeW, sizeH) {
  /**
   * images: A list of images.
   * path: Path to render the resized images.
   * sizeH: Height of resized images.
   * sizeW: Width of resized images.
   */
  if (!fs.existsSync(path)) {
    console.log(`Images folder doesn't exist.`);
    return;
  }
  if (!path.endsWith("/")) {
    path += `/`;
  }

  images.forEach((image) => {
    const newPath = `${path}${image.filename}`;
    console.log(`Converting ${image.path}`);
    sharp(image.path)
      .resize(sizeW, sizeH)
      .toFile(newPath, (err, info) => {
        if (!err) {
          console.log(`✅ Rendered ${newPath}.`);
        } else {
          console.error(`Got error ${err}`);
        }
      });
  });
}

const createPath = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
    return path;
  } else {
    console.log(`${path} already exists.`);
  }
};
console.log(tezosConfig.size);

function transformForTez(images) {
  // Converting for the `displayUri`.
  createPath(resizeImagePath.displayUri);
  console.log("------------> Display", resizeImagePath.displayUri);
  renderResizedImages(
    images,
    resizeImagePath.displayUri,
    tezosConfig.size.displayUri.width,
    tezosConfig.size.displayUri.height
  );

  createPath(resizeImagePath.thumbnailUri);

  console.log("------------> Thumbnail", resizeImagePath.thumbnailUri);
  renderResizedImages(
    images,
    resizeImagePath.thumbnailUri,
    tezosConfig.size.thumbnailUri.width,
    tezosConfig.size.thumbnailUri.height
  );
  console.log(`Done!`);
}

const images = getAllImages(imagesDir);
console.log(`Images list`);
console.table(images);
transformForTez(images);
