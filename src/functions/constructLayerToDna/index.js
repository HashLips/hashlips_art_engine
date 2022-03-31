const cleanDna = require("./functions/cleanDna");

function constructLayerToDna (_dna = "", _layers = []) {
  const DNA_DELIMITER = "-";

  return _layers.map((layer, index) => {
    const selectedElement = layer.elements.find(
      (e) => e.id === cleanDna(_dna.split(DNA_DELIMITER)[index])
    );
    return {
      name: layer.name,
      blend: layer.blend,
      opacity: layer.opacity,
      selectedElement: selectedElement
    };
  });
};

module.exports = constructLayerToDna;
