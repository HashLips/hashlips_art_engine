"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const { format,background, text  } = require(path.join(basePath, "/src/config.js"));
var JSSoup = require('jssoup').default;

var svg_buffer = '';
const svg_header = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="none" x="0px" y="0px" width="${format.width}px" height="${format.height}px" viewBox="0 0 ${format.width} ${format.height}">`
const svg_footer = '</svg>';

const ImageEngine = { 

    getImageBuffer : () => {        
        var svg_image = svg_header + svg_buffer + svg_footer;
        return svg_image;
     },
     
     drawBackground : () => {
      
    },

    drawElement : (_renderObject, _index, _layersLen) => {

        var svg_layer = _renderObject.loadedImage;
        // remove svg headers
        var soup = new JSSoup(svg_layer, false);

        var svg_data = soup.find('svg');        
        
       svg_buffer +=svg_data;           
    },

    clearRect : () => {
        svg_buffer = '';      
    },

    loadImage :  (_layer) => {        
        return new Promise( (resolve) => {
            fs.readFile(`${_layer.selectedElement.path}`,'utf8', function (err, buffer) { 
            resolve(buffer);
            });
        });
    }   

};


module.exports = { ImageEngine };
