"use strict";

const fs = require("fs");
const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);

const { metaplexCollectionName, metaplexCollectionFamily, description, metaplexRoyaltyFee, metaplexCreators } = require(path.join(basePath, "/src/config.js"));
const imagesDir = `${basePath}/build/images`;
const jsonDir = `${basePath}/build/json`;

const metaplexFilePath = `${basePath}/build/metaplex`;
const metaplexDir = `${basePath}/build/metaplex`;

const setup = () => {
    if (fs.existsSync(metaplexFilePath)) {
      fs.rmdirSync(metaplexFilePath, { recursive: true });
    }
    fs.mkdirSync(metaplexFilePath);
};

const getIndividualImageFiles = () => {
    return fs
      .readdirSync(imagesDir)
      .filter((item) => /^[0-9]{1,6}.png/g.test(item));
  };

const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item) => /^[0-9]{1,6}.json/g.test(item));
};

setup();
console.log(`Extracting metaplex-ready files. Writing to folder: ${metaplexFilePath}`);

// Rename all image files to n-1.png and store in metaplex/images
const imageFiles = getIndividualImageFiles();
imageFiles.forEach((file) => {
    let nameWithoutExtension = file.slice(0, -4);
    let editionCountFromFileName = Number(nameWithoutExtension);
    let newEditionCount = editionCountFromFileName - 1;
    fs.copyFile(`${imagesDir}/${file}`, `${metaplexDir}/${newEditionCount}.png`, () => {});
})
console.log(`Finished converting images to being metaplex-ready.`);

// Identify json files
const jsonFiles = getIndividualJsonFiles();
console.log(`Found ${jsonFiles.length} json files in "${jsonDir}" to process`);

// Iterate, open and put in metadata list
jsonFiles.forEach((file) => {
    let nameWithoutExtension = file.slice(0, -4);
    let editionCountFromFileName = Number(nameWithoutExtension);
    let newEditionCount = editionCountFromFileName - 1;

    const rawData = fs.readFileSync(`${jsonDir}/${file}`);
    const jsonData = JSON.parse(rawData);

    let tempMetadata = {
        name: jsonData.name,
        symbol: '',
        description: description,
        seller_fee_basis_points: metaplexRoyaltyFee,
        image: `${newEditionCount}.png`,
        edition: jsonData.edition,
        date: jsonData.date,
        attributes: jsonData.attributes,
        collection: {
            name: metaplexCollectionName,
            family: metaplexCollectionFamily
        },
        properties: {
            files: [
                {
                    uri: `${newEditionCount}.png`,
                    type: "image/png"
                }
            ],
            category: "image",
            creators: metaplexCreators
        }
    };
    fs.writeFileSync(
        `${metaplexDir}/${newEditionCount}.json`,
        JSON.stringify(
            tempMetadata,
            null,
            2
        )
    );
});
console.log(`Finished converting json metadata files to being metaplex-ready.`);
console.log(`Conversion was finished successfully!`);