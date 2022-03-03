/**
 * This script helps to resize your images in the
 * `build/images` folder for the `displayUri` and
 * `thumbnailUri` in Tezos metadata.
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const basePath = process.cwd();
const imagesDir = `${basePath}/build/images`;
const { tezosConfig } = require(`${basePath}/src/config.js`);

const config = {
  thumbnailUri: {
    ...tezosConfig.size.thumbnailUri,
    path: `${basePath}/build/thumbnailUri/`,
  },
  displayUri: {
    ...tezosConfig.size.displayUri,
    path: `${basePath}/build/displayUri/`,
  },
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

function transformForTez(images) {
  // Converting for the `displayUri`.
  createPath(config.displayUri.path);
  console.log(
    "------------> Display",
    config.displayUri.path,
    config.displayUri.w,
    config.displayUri.h
  );
  renderResizedImages(
    images,
    config.displayUri.path,
    config.displayUri.w,
    config.displayUri.h
  );

  createPath(config.thumbnailUri.path);

  console.log(
    "------------> Thumbnail",
    config.thumbnailUri.path,
    config.thumbnailUri.w,
    config.thumbnailUri.h
  );
  renderResizedImages(
    images,
    config.thumbnailUri.path,
    config.thumbnailUri.w,
    config.thumbnailUri.h
  );
  console.log(`Done!`);
}

const images = getAllImages(imagesDir);
console.log(`Images list`);
console.table(images);
transformForTez(images);
