"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");

const { createCanvas, loadImage } = require(path.join(
    basePath, "/node_modules/canvas"
  ));
 
const { format,background, text  } = require(path.join(basePath, "/src/config.js"));
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");


const genColor = () => {
    let hue = Math.floor(Math.random() * 360);
    let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
    return pastel;
  };
  
  const addText = (_sig, x, y, size) => {
    ctx.fillStyle = text.color;
    ctx.font = `${text.weight} ${size}pt ${text.family}`;
    ctx.textBaseline = text.baseline;
    ctx.textAlign = text.align;
    ctx.fillText(_sig, x, y);
  };
  

const ImageEngine = {   
    
    getImageBuffer : () => {
        return canvas.toBuffer("image/png");
     },

    drawBackground : () => {
    ctx.fillStyle = background.static ? background.default : genColor();
    ctx.fillRect(0, 0, format.width, format.height);
    },

    drawElement : (_renderObject, _index, _layersLen) => {
        ctx.globalAlpha = _renderObject.layer.opacity;
        ctx.globalCompositeOperation = _renderObject.layer.blend;
        text.only
          ? addText(
              `${_renderObject.layer.name}${text.spacer}${_renderObject.layer.selectedElement.name}`,
              text.xGap,
              text.yGap * (_index + 1),
              text.size
            )
          : ctx.drawImage(
              _renderObject.loadedImage,
              0,
              0,
              format.width,
              format.height
            );     

    },

    clearRect : () => {
        ctx.clearRect(0, 0, format.width, format.height);
    },

    loadImage : async (_layer) => {        
        return await loadImage(`${_layer.selectedElement.path}`);
    }

};


module.exports = { ImageEngine };
