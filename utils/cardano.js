"use strict";
/**
 * Cardono util is build to conform to the specifications and workflow
 * for NFTMaker Pro.
 *
 * The policy_id, image location, and other values are left in the
 * placeholder form, e.g., <policy_id>
 * The actual values are replaced dynamically by NFTmakerPro.
 *
 *
 */
const fs = require("fs");
const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const chalk = require("chalk");

// const imagesDir = `${basePath}/build/images`;
const jsonDir = `${basePath}/build/json`;

const metadataBuildPath = `${basePath}/build/cardano`;
const metadataConfigPath = `${basePath}/build/cardano`;

const setup = () => {
  if (fs.existsSync(metadataBuildPath)) {
    fs.rmSync(metadataBuildPath, {
      recursive: true,
    });
  }
  fs.mkdirSync(metadataBuildPath);
  fs.mkdirSync(path.join(metadataBuildPath, "/metadata"));
};

const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item) => /^[0-9]{1,6}.json/g.test(item));
};

setup();
console.log(chalk.cyan.black("Beginning Cardano conversion"));
console.log(
  chalk.cyan(`\nExtracting files.\nWriting to folder: ${metadataBuildPath}`)
);

// Identify json files
const jsonFiles = getIndividualJsonFiles();
console.log(
  chalk.cyan(`Found ${jsonFiles.length} json files in "${jsonDir}" to process`)
);

// Iterate, open and put in metadata list
jsonFiles.forEach((file) => {
  let nameWithoutExtension = file.slice(0, -4);
  let editionCountFromFileName = Number(nameWithoutExtension);

  const rawData = fs.readFileSync(`${jsonDir}/${file}`);
  const jsonData = JSON.parse(rawData);

  // convert the array of attributes into a flat object
  // this object is spread into the metadata template
  const restructuredAttributes = {};
  jsonData.attributes.map((attr) => {
    restructuredAttributes[attr.trait_type] = attr.value;
  }, []);

  let metadataTemplate = {
    721: {
      "<policy_id>": {
        "<asset_name>": {
          name: jsonData.name,
          image: "<ipfs_link>",
          mediaType: "<mime_type>",
          description: jsonData.description,
          files: [
            {
              name: "<display_name>",
              mediaType: "<mime_type>",
              src: "<ipfs_link>",
            },
          ],
          ...restructuredAttributes,
        },
      },
      version: "1.0",
    },
  };
  fs.writeFileSync(
    path.join(
      `${metadataConfigPath}`,
      "metadata",
      `${editionCountFromFileName}.metadata`
    ),
    JSON.stringify(metadataTemplate, null, 2)
  );
});
console.log(`\nFinished converting json metadata files to Cardano Format.`);
console.log(chalk.green(`\nConversion was finished successfully!\n`));
