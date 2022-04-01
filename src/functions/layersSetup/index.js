const basePath = process.cwd();
const getElements = require("../getElements");
const layersDir = `${basePath}/layers`;

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    name:
      layerObj.options?.displayName !== undefined
        ? layerObj.options?.displayName
        : layerObj.name,
    blend:
      layerObj.options?.blend !== undefined
        ? layerObj.options?.blend
        : "source-over",
    opacity:
      layerObj.options?.opacity !== undefined ? layerObj.options?.opacity : 1,
    bypassDNA:
      layerObj.options?.bypassDNA !== undefined
        ? layerObj.options?.bypassDNA
        : false
  }));
  return layers;
};

module.exports = layersSetup;
