function createDna (_layers) {
  const randNum = [];
  const DNA_DELIMITER = "-";

  _layers.forEach((layer) => {
    let totalWeight = 0;

    layer.elements.forEach((element) => {
      totalWeight += element.weight;
    });

    // number between 0 - totalWeight
    let random = Math.floor(Math.random() * totalWeight);

    // Use for test
    // let random = Math.floor(0.5 * totalWeight);

    layer.elements.some((element) => {
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= element.weight;
      if (random < 0) {
        randNum.push(
          `${element.id}:${element.filename}${
            layer.bypassDNA ? "?bypassDNA=true" : ""
          }`
        );
      }
      return random < 0;
    });
  });
  return randNum.join(DNA_DELIMITER);
};

module.exports = createDna;
