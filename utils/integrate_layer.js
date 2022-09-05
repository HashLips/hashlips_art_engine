const basePath = process.cwd();
const project = process.argv[2]; // projectを指定
const remainingLayer = process.argv[3]; // 統合先のlayer名を指定
const deletingLayer = process.argv[4]; // 統合したいlayer名を指定
const newLayer = process.argv[5]; // 統合後の新しいlayer名を指定
const fs = require("fs");
const buildDir = `${basePath}/build-${project}`;
const { layerConfigurations } = require(`${basePath}/src/config-${project}.js`);

// read json data
let rawdata = fs.readFileSync(`${buildDir}/_metadata.json`);
let data = JSON.parse(rawdata);
let dataPerLayerOrder = []; // LayerOrderごとのmetadata。rarity.jsで利用する。
for (let i = 0; i < layerConfigurations[0].layersOrder.length; i++) {
  let rawdata = fs.readFileSync(`${buildDir}/_metadata-${i}.json`);
  dataPerLayerOrder.push(JSON.parse(rawdata));
}

data.forEach((item) => {
  const newAttributes = item.attributes
    .filter((attribute) => attribute.trait_type !== deletingLayer) // deleteLayerを削除
    .map((attribute) => {
      if (attribute.trait_type === remainingLayer) {
        // remainLayerをnewLayerにrename
        attribute.trait_type = newLayer;
      }
      return attribute;
    });
  item.attributes = newAttributes;

  // dataPerLayerOrder内のデータを更新
  for (let i = 0; i < dataPerLayerOrder.length; i++) {
    dataPerLayerOrder[i].forEach((itemPerLayerOrder) => {
      if (itemPerLayerOrder.edition === item.edition) {
        itemPerLayerOrder.attributes = newAttributes;
      }
    });
  }

  fs.writeFileSync(
    `${buildDir}/assets-${project}/${item.edition}.json`,
    JSON.stringify(item, null, 2)
  );
});

fs.writeFileSync(`${buildDir}/_metadata.json`, JSON.stringify(data, null, 2));

dataPerLayerOrder.forEach((metadataList, index) => {
  fs.writeFileSync(
    `${buildDir}/_metadata-${index}.json`,
    JSON.stringify(metadataList, null, 2)
  );
});

console.log(`Deleted ${deletingLayer}`);
console.log(`Updated ${remainingLayer} to ===> ${newLayer}`);
