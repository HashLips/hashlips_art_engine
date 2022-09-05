const basePath = process.cwd();
const project = process.argv[2]; // projectを指定
const remainingLayer = process.argv[3]; // 統合先のlayer名を指定
const deletingLayer = process.argv[4]; // 統合したいlayer名をしてい
const newLayer = process.argv[5]; // 統合後の新しいlayer名を指定
const fs = require("fs");
const buildDir = `${basePath}/build-${project}`;

// read json data
let rawdata = fs.readFileSync(
  `${buildDir}/_metadata.json`
);
let data = JSON.parse(rawdata);

data.forEach((item) => {
  item.attributes = item.attributes
    .filter((attribute) => attribute.trait_type !== deletingLayer) // deleteLayerを削除
    .map((attribute) => {
      if (attribute.trait_type === remainingLayer) { // remainLayerをnewLayerにrename
        attribute.trait_type = newLayer;
      }
      return attribute;
    });
  fs.writeFileSync(
    `${buildDir}/assets-${project}/${item.edition}.json`,
    JSON.stringify(item, null, 2)
  );
});

fs.writeFileSync(
  `${buildDir}/_metadata.json`,
  JSON.stringify(data, null, 2)
);

console.log(`Deleted ${deletingLayer}`);
console.log(`Updated ${remainingLayer} to ===> ${newLayer}`);
