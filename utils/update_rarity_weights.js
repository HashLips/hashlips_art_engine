const { renameSync } = require("fs");
const { basename, dirname, join, extname } = require("path");
const glob = require("glob");
const rarityDelimiter = "#";
const rarity = process.argv[process.argv.length - 1];

let files = process.argv.slice(2, process.argv.length - 1);

if (
  (files.length == 1 && process.argv.length == 4) ||
  process.argv[2].toString().startsWith('"')
) {
  files = glob.sync(process.argv[2]);
}

if (!files.every((f) => f.indexOf(rarityDelimiter) > -1)) {
  const readline = require("readline");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.warn(
    `No delimiter found on some files. Please make sure you have set the rarityDelimiter correctly. The current value is set to: ${rarityDelimiter}`
  );
  console.info(
    "If you have not previously set weights on these files it should be safe to proceed. " +
      "However, it is recommended you ensure you can restore your files if needed."
  );
  rl.question(`Are you sure you want to continue? (y/N)`, (answer) => {
    if (answer.toLowerCase() == "y" || answer.toLowerCase() == "yes") {
      renameFiles();
    }
    rl.close();
  });
} else renameFiles();

function renameFiles() {
  let fileCount = 0;
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    try {
      let filename = basename(file);
      let ext = extname(filename);
      if (filename.indexOf(rarityDelimiter) > -1)
        filename = filename.split(rarityDelimiter)[0];
      else {
        filename = filename.replace(`${ext}`, "");
      }

      let newFilename = join(
        dirname(file),
        `${filename}${rarityDelimiter}${rarity}${ext}`
      );
      renameSync(file, newFilename);

      console.log(`Renamed ${file} to ${newFilename}`);
      fileCount++;
    } catch (error) {
      console.log(`Failed to rename ${file} to ${newFilename}`, error);
    }
  }

  console.log(`Renamed ${fileCount} of ${files.length} files found`);
}
