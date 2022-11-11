"use strict";

const fs = require("fs");
const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const chalk = require("chalk");

const {
  creators,
  description,
  external_url,
  NFTName,
  royaltyFee,
  symbol,
} = require(path.join(basePath, "/Solana/solana_config.js"));
const { startIndex, outputJPEG } = require(path.join(
  basePath,
  "/src/config.js"
));
const imagesDir = `${basePath}/build/images`;
const jsonDir = `${basePath}/build/json`;

const metaplexFilePath = `${basePath}/build/solana`;
const metaplexDir = `${basePath}/build/solana`;

const setup = () => {
  if (fs.existsSync(metaplexFilePath)) {
    fs.rmSync(metaplexFilePath, {
      recursive: true,
    });
  }
  fs.mkdirSync(metaplexFilePath);
  fs.mkdirSync(path.join(metaplexFilePath, "/json"));
  if (startIndex != 0) {
    fs.mkdirSync(path.join(metaplexFilePath, "/images"));
  }
};

const getIndividualImageFiles = () => {
  return fs.readdirSync(imagesDir);
};

const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item) => /^[0-9]{1,6}.json/g.test(item));
};

setup();
console.log(chalk.bgGreenBright.black("Beginning Solana/Metaplex conversion"));
console.log(
  chalk.green(
    `\nExtracting metaplex-ready files.\nWriting to folder: ${metaplexFilePath}`
  )
);

const outputFormat = outputJPEG ? "jpg" : "png";
// copy & rename images IF needed
// Rename all image files to n-1.png (to be zero indexed "start at zero") and store in solana/images
if (startIndex != 0) {
  const imageFiles = getIndividualImageFiles();
  imageFiles.forEach((file) => {
    let nameWithoutExtension = file.slice(0, -4);
    let editionCountFromFileName = Number(nameWithoutExtension);
    let newEditionCount = editionCountFromFileName - startIndex;
    fs.copyFile(
      `${imagesDir}/${file}`,
      path.join(
        `${metaplexDir}`,
        "images",
        `${newEditionCount}.${outputFormat}`
      ),
      () => {}
    );
  });
  console.log(`\nFinished converting images to being metaplex-ready.\n`);
}

// Identify json files
const jsonFiles = getIndividualJsonFiles();
console.log(
  chalk.green(`Found ${jsonFiles.length} json files in "${jsonDir}" to process`)
);

// Iterate, open and put in metadata list
jsonFiles.forEach((file) => {
  let nameWithoutExtension = file.slice(0, -4);
  let editionCountFromFileName = Number(nameWithoutExtension);
  let newEditionCount = editionCountFromFileName - startIndex;

  const rawData = fs.readFileSync(`${jsonDir}/${file}`);
  const jsonData = JSON.parse(rawData);

  let tempMetadata = {
    name: NFTName + " " + jsonData.name,
    symbol: symbol,
    description: description,
    seller_fee_basis_points: royaltyFee,
    image: `${newEditionCount}.${outputFormat}`,
    ...(external_url !== "" && { external_url }),
    attributes: jsonData.attributes,
    properties: {
      edition: jsonData.edition,
      files: [
        {
          uri: `${newEditionCount}.${outputFormat}`,
          type: `image/${outputFormat}`,
        },
      ],
      category: "image",
      creators: creators,
      compiler: "HashLips Art Engine - NFTChef fork | qualifieddevs.io",
    },
  };
  fs.writeFileSync(
    path.join(`${metaplexDir}`, "json", `${newEditionCount}.json`),
    JSON.stringify(tempMetadata, null, 2)
  );
});
console.log(
  `\nFinished converting json metadata files to being metaplex-ready.`
);
console.log(chalk.green(`\nConversion was finished successfully!\n`));
