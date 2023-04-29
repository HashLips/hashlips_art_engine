const { NFTStorage } = require("nft.storage");
const { filesFromPath } = require("files-from-path");
const path = require("path");
const get = require("lodash.get");
const fs = require("fs");
const { promisify } = require("util");

const writeFile = promisify(fs.writeFile);

function humanFileSize(size) {
  var i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

module.exports = async function library({ basePath, token }) {
  if (!basePath) {
    console.error("base path is not defined");
    process.exit(1);
  }

  const imagesPath = path.resolve(basePath, `images`);

  const files = filesFromPath(imagesPath, {
    pathPrefix: path.resolve(imagesPath), 
    hidden: true, 
  });

  const uploadFiles = filesFromPath(imagesPath, {
    pathPrefix: path.resolve(imagesPath), 
    hidden: true, 
  });

  const fileSizes = [];

  for await (const { size } of uploadFiles) {
    fileSizes.push(size);
  }

  const totalUpload = fileSizes.reduce((a, b) => a + b);
  const averageUpload = totalUpload / fileSizes.length;

  const storage = new NFTStorage({ token });

  console.table([
    {
      totalUpload: humanFileSize(totalUpload),
      averageUpload: humanFileSize(averageUpload),
    },
  ]);

  console.log(
    `storing file(s) from ${imagesPath}, please leave the process running. This action could take a while depending on the upload size...\n`
  );

  console.log("\n");
  const cid = await storage.storeDirectory(files);

  console.log(`Images uploaded with cid: ${cid}`);

  const metadataPath = path.resolve(basePath, `json`);
  const masterPath = path.resolve(metadataPath, "_metadata.json");
  const masterMetaDataFile = fs.readFileSync(masterPath);

  const masterMetadata = JSON.parse(masterMetaDataFile);

  const updatedMetadata = masterMetadata.map((file) => {
    file.image = `ipfs://${cid.trim()}/${file.edition}.png`;
    return file;
  });

  fs.writeFileSync(masterPath, JSON.stringify(updatedMetadata, null, 2));

  const metadataFiles = updatedMetadata.map((file) =>
    writeFile(
      path.resolve(metadataPath, `${file.edition}.json`),
      JSON.stringify(file, null, 2)
    )
  );

  console.log("Updating the metadata with new URI...");

  Promise.all(metadataFiles);

  console.log("Uploading the metadata...");

  const jsonPath = path.resolve(basePath, `json`);
  const metadataStreams = filesFromPath(jsonPath, {
    ignore: ["_metadata.json"],
    pathPrefix: path.resolve(jsonPath), 
    hidden: true,
  });

  const metadataCid = await storage.storeDirectory(metadataStreams);

  console.log("Congratulations! The upload process was successful.");
  console.log(
    "To check your uploaded files, checkout https://nft.storage/files. Safely store the following information to use in your contract."
  );
  console.log("-----------------------");
  console.log(`Metadata CID: ${metadataCid}`);
  console.log("-----------------------");
};
