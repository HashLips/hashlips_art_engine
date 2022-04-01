const basePath = process.cwd();

const mockDataInput = {
  _element: {
    layer: {
      name: "Top lid",
      blend: "source-over",
      opacity: 1,
      selectedElement: {
        id: 1,
        name: "Low",
        filename: "Low#20.png",
        path: `${basePath}/layers/Top lid/Low#20.png`,
        weight: 20
      }
    },
    loadedImage: {
      onload: null,
      onerror: null
    }
  },
  attributesList: [
    { trait_type: "Eyeball", value: "White" },
    { trait_type: "Eye color", value: "Yellow" },
    { trait_type: "Iris", value: "Large" },
    { trait_type: "Shine", value: "Shapes" },
    { trait_type: "Bottom lid", value: "Low" }
  ]
};

const mockDataOutput = { trait_type: "Top lid", value: "Low" };

module.exports.mockDataInput = mockDataInput;
module.exports.mockDataOutput = mockDataOutput;
