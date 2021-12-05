const basePath = process.cwd();
const { fs, renameSync } = require("fs");
const { basename, dirname, join } = require("path");
const glob = require("glob");
const rarityDelimiter = "#";
const rarity = process.argv[process.argv.length - 1];

let files = process.argv.slice(2, process.argv.length - 1);

if (
  (files.length == 1 && process.argv.length == 4) ||
  process.argv[2].toString().startsWith('"')
) {
  console.log("Parsing glob...");
  files = glob.sync(process.argv[2]);
  console.log(`Found ${files.length} files`);
}

for (let index = 0; index < files.length; index++) {
  const file = files[index];
  try {
    let filename = basename(file);
    filename = filename.split(rarityDelimiter)[0];

    let newFilename = join(
      dirname(file),
      `${filename}${rarityDelimiter}${rarity}.png`
    );
    renameSync(file, newFilename);

    console.log(`Renamed ${file} to ${newFilename}`);
  } catch (error) {
    console.log(error);
  }
}
