const layerConfigurations = [
  {
    growEditionSizeTo: 5,
    layersOrder: [
      { name: "Background" },
      { name: "Eyeball" },
      { name: "Eye color" },
      { name: "Iris" },
      { name: "Shine" },
      { name: "Bottom lid" },
      { name: "Top lid" },
    ],
    incompatibleTraits: {
      "Eye color/Cyan": [
        "Eyeball/Red",
      ],
      "Iris/Large": [
        "Bottom lid/High",
        "Top lid/High",
      ],
    }
  },
];

module.exports = {
  layerConfigurations,
};
