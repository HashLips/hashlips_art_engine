const basePath = process.cwd();
var fs = require('fs');


for (let index = 0; index < 1001; index++) {
    let primaryData = fs.readFileSync(`${basePath}/build/json/_metadata.json`)
    const fileName = index+1;
    let rawdata = fs.readFileSync(`${basePath}/build/json/${fileName}.json`);
    var primaryMetaData = JSON.parse(primaryData);
    var metaData = JSON.parse(rawdata);

    primaryMetaData[index].image = metaData.file_url;
    primaryMetaData[index].file_url = metaData.file_url;

    adjustedIndex = index + 1;
    fs.writeFileSync(
        `${basePath}/build/json/_metadata.json`,
        JSON.stringify(primaryMetaData, null, 2))
        console.log(`_metadata.json updated! File: ${adjustedIndex}`);
}