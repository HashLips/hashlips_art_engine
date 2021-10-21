'use strict';

/*************************************************************************************************************************
// App: File Renamer Util
// Description: This application will read all files in the rename folder and will check the file names 
// for any values in the replace input with the replace output characters into the same folder.
//
// NOTE: Since this tool could be abusive, this will not do anything with files in subfolders.
//       It is highly recommened to test this on your system with a few files before running it against many real files.
// DISCLAIMER: Not responsible for any accidents.  

// Install: npm install regex
// USAGE: node .\utils\fileRenamer.js
 *************************************************************************************************************************/

// start of config 
// change these as needed for your specific use case
const RENAME_FOLDER = '/rename';
const REPLACE_INPUT = '-'; // this will replace this char with the one in REPLACE_OUTPUT
const REPLACE_OUTPUT = '_';
const REPLACE_SCOPE = 'all'; // handles multiple occurrences
const DEBUG_LOGS = true; // default set to true so you can see what it is doing (or not doing), but can be set to false if you do not want to see the output.
// end of config

//***********************************************************************************************************************************************************/

const XRegExp = require('xregexp');
const fs = require('fs');
const path = require('path');
const isLocal = typeof process.pkg === 'undefined';
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const renameDir = path.join(basePath, RENAME_FOLDER);

try {
    // if folder does not exist create it
    if (!fs.existsSync(renameDir)) {
        DEBUG_LOGS ? console.log('creating...' + renameDir) : null;
        fs.mkdirSync(renameDir);
    }
} catch (err) {
    console.error(err)
}
  
// read the files in the RENAME_FOLDER 
fs.readdir(renameDir, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 

    console.log('renaming file names with \'' + REPLACE_INPUT + '\' to \'' + REPLACE_OUTPUT + '\'');
    //listing all files using forEach
    files.forEach(file => {
        // make sure the file has an extension to know it is a file not a folder
        if (path.extname(file) != '') {
            processFile(file);
        }
    });
    console.log('file renamer complete');
});
  
const processFile = (_file) => {
    DEBUG_LOGS ? console.log('processing input file... ' + _file) : null;
    const replaced = XRegExp.replace(_file, REPLACE_INPUT, REPLACE_OUTPUT, REPLACE_SCOPE);
    DEBUG_LOGS ? console.log('processing output file... ' + replaced) : null;
    try {
        // rename the files
        fs.renameSync(renameDir + '/' + _file, renameDir + '/' + replaced);
    } catch (err) {
        console.error(err)
    }
}
