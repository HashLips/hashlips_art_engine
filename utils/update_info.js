const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");

const {
  baseUri,
  description,
  namePrefix,
  network,
  solanaMetadata,
  shuffleCollection,
  shuffleDir,
} = require(`${basePath}/src/config.js`);

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);

data.forEach((item) => {
  if (network == NETWORK.sol) {
    item.name = `${namePrefix} #${item.edition}`;
    item.description = description;
    item.creators = solanaMetadata.creators;
  } else {
    item.name = `${namePrefix} #${item.edition}`;
    item.description = description;
    item.image = `${baseUri}/${item.edition}.png`;
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

if (network == NETWORK.sol) {
  console.log(`Updated description for images to ===> ${description}`);
  console.log(`Updated name prefix for images to ===> ${namePrefix}`);
  console.log(
    `Updated creators for images to ===> ${JSON.stringify(
      solanaMetadata.creators
    )}`
  );
} else {
  console.log(`Updated baseUri for images to ===> ${baseUri}`);
  console.log(`Updated description for images to ===> ${description}`);
  console.log(`Updated name prefix for images to ===> ${namePrefix}`);
}

/// SHUFFEL COLLECTION WITH METADATA
 
const randomizeImage = (source, destimation) => {
  fs.copyFile(`${basePath}/build/images/${source}.png`,`${shuffleDir}/${destimation}.png`, (err) => {
    if (err) throw err;
    console.log('source.txt was copied to destination.txt');
  });
};

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

const shuffleArray = (array) => {
  shuffle(array)
  data.forEach((item, currentIndex) => {
    console.log(currentIndex+1, item.image);
    randomizeImage(item.edition, currentIndex+1);
  });
  fs.writeFileSync(
    `${basePath}/build/json/_metadata_shuffel.json`,
    JSON.stringify(array, null, 2)
  );

};
console.log("shuffleCollection", shuffleDir);
try {
  if(shuffleCollection){
    console.log("shuffling array");
    if (!fs.existsSync(shuffleDir)) {
      fs.mkdirSync(shuffleDir);
    }
    shuffleArray(data);
  }
}catch (err) {
  console.log("Shuffling Error", err);
}
