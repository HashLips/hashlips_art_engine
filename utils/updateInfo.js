"use strict";

/**
 * Regenerate all the metadata from a build using the generated json files
 * for attribute and edition numbers, while using the _updated_ genrealo
 * metadata config from config.js to update the general fields.
 *
 * Options:
 * -r, --removeTrait <trait>,    remove all instances of an attribute
 * -s, --skip <field>,    Remove/skip adding a general metadata filed, e.g, dna
 *
 */

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");

console.log(path.join(basePath, "/src/config.js"));
const { baseUri, description } = require(path.join(basePath, "/src/config.js"));

const { Command } = require("commander");
const program = new Command();
const chalk = require("chalk");

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);

program
  .option(
    "-s, --skip <field>",
    " Remove/skip adding a general metadata filed, e.g, dna"
  )
  .option(
    "-r, --removeTrait <trait>",
    "remove all instances of a trait from attributes"
  )
  .option("-n, --name <name>", "Rename the Name prefix for ALL tokens files.")
  .action((options) => {
    if (options) {
      console.log("Running with options", { options });
    }
    if (options.skip == "edition") {
      const error = new Error(
        "\nRemoving the edition field it not allowed in this script\n"
      );
      console.error(chalk.red(error));
      return false;
    }
    /**
     * loop over each loaded item, modify the data, and overwrite
     * the existing files.
     *
     * uses item.edition to ensure the proper number is used
     * insead of the loop index as images may have a different order.
     */
    data.forEach((item) => {
      item.image = `${baseUri}/${item.edition}.png`;
      item.description = description;

      if (options.name) {
        console.log(chalk.yellow(`Renaming token to ${options.name}`));
        item.name = `${options.name} #${item.edition}`;
      }

      if (options.skip) {
        console.log(
          chalk.yellow(`Skipping ${options.skip}: ${item[options.skip]}`)
        );
        delete item[options.skip];
      }

      if (options.removeTrait) {
        console.log(chalk.redBright(`Removing ${options.removeTrait}`));
        console.log({ item: item.attributes });
        item.attributes = item.attributes.filter(
          (trait) => trait.trait_type !== options.removeTrait
        );
      }

      fs.writeFileSync(
        `${basePath}/build/json/${item.edition}.json`,
        JSON.stringify(item, null, 2)
      );
    });

    fs.writeFileSync(
      `${basePath}/build/json/_metadata.json`,
      JSON.stringify(data, null, 2)
    );
    console.log(`\nUpdated baseUri for images to ===> ${baseUri}\n`);
    console.log(`Updated Description for all to ===> ${description}\n`);
  });

program.parse();
