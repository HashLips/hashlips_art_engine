const fs = require('fs-extra');

const buildFolder = 'build';
const buildTWFolder = buildFolder+'/thirdweb';
const buildImagesFolder = buildFolder+'/images';
const buildJSONFolder = buildFolder+'/json';

const thirdwebBuild = () => {
    fs.mkdir(buildTWFolder, err => {
        (err) ? console.log(err) : console.log('Created a thirdweb folder...');
    });
    fs.copy(buildImagesFolder+'/', buildTWFolder+'/', err => {
        (err) ? console.log(err) : console.log('Copied images to thirdweb folder...');
    });
    fs.copy(buildJSONFolder+'/_metadata.json', buildTWFolder+'/_metadata.json', err => {
        (err) ? console.log(err) : console.log('Copied metadata to thirdweb folder...');
    });
}

thirdwebBuild();
