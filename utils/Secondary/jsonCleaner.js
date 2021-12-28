const basePath = process.cwd();
var fs = require('fs');
for (let index = 1; index < 1001; index++) {
    const fileName = index;
    let rawdata = fs.readFileSync(`${basePath}/build/json/${fileName}.json`);
    var json = JSON.parse(rawdata);
    var imagePath = json.image;
    console.log(imagePath);
}


// json.image = images.filter(() => { return "" });
// fs.writeFileSync(
//     `${basePath}/build/json/${fileName}.json`,
//     JSON.stringify(metaData, null, 2);js