const inquirer = require("inquirer");

const token = process.env.NFT_STORAGE_KEY;

if (!token) {
  console.error("NFT_STORAGE_KEY needs to be set");
  process.exit(1);
}

console.log("Hello!\n");

async function main() {
  const library = require("./lib");
  await library({
    basePath: `${process.cwd()}/build`,
    token,
  });
}

inquirer
  .prompt([
    {
      type: "confirm",
      message:
        "This action would upload your generated assets and their metadata on ipfs. Make sure you own the IP rights for the assets. HashLips is not liable for content that is uploaded using this tool. Do you acknowledge that this is irreversible? Press enter to confirm",
      name: "confirm",
    },
  ])
  .then(({ confirm }) => {
    if (!confirm) {
      console.log("The upload has canceled.");
      process.exit();
    }

    main();
  })
  .catch(console.error);
