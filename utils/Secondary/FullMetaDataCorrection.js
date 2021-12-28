const basePath = process.cwd();
var fs = require('fs');


for (let index = 0; index < 3333; index++) {
    let primaryData = fs.readFileSync(`${basePath}/build/json/_metadata.json`)

    adjustedIndex = index + 1;
    const fileName = adjustedIndex;
    let rawdata = fs.readFileSync(`${basePath}/build/json/${fileName}.json`);
    var primaryMetaData = JSON.parse(primaryData);
    var metaData = JSON.parse(rawdata);

    //primaryMetaData[index].image = metaData.file_url;
    primaryMetaData[index].file_url = metaData.file_url;

    fs.writeFileSync(
        `${basePath}/build/json/_metadata.json`,
        JSON.stringify(primaryMetaData, null, 2))
        console.log(`_metadata.json updated! File: ${adjustedIndex}`);
}