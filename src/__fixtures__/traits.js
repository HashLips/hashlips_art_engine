const BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall = [
  {
    "layer": "Background",
    "id": 0,
    "name": "Black",
    "filename": "Black#1.png",
    "bypassDNA": false
  },
  {
    "layer": "Eyeball",
    "id": 1,
    "name": "White",
    "filename": "White#50.png",
    "bypassDNA": false
  },
  {
    "layer": "Eye color",
    "id": 2,
    "name": "Pink",
    "filename": "Pink#1.png",
    "bypassDNA": false
  },
  {
    "layer": "Iris",
    "id": 2,
    "name": "Small",
    "filename": "Small#60.png",
    "bypassDNA": false
  },
];

const BackgroundBlack_EyeballWhite_EyecolorPink_IrisMedium = [
  {
    "layer": "Background",
    "id": 0,
    "name": "Black",
    "filename": "Black#1.png",
    "bypassDNA": false
  },
  {
    "layer": "Eyeball",
    "id": 1,
    "name": "White",
    "filename": "White#50.png",
    "bypassDNA": false
  },
  {
    "layer": "Eye color",
    "id": 2,
    "name": "Pink",
    "filename": "Pink#1.png",
    "bypassDNA": false
  },
  {
    "layer": "Iris",
    "id": 1,
    "name": "Medium",
    "filename": "Medium#20.png",
    "bypassDNA": false
  },
];

const BackgroundBlack_EyeballWhite_EyecolorPink_IrisLarge = [
  {
    "layer": "Background",
    "id": 0,
    "name": "Black",
    "filename": "Black#1.png",
    "bypassDNA": false
  },
  {
    "layer": "Eyeball",
    "id": 1,
    "name": "White",
    "filename": "White#50.png",
    "bypassDNA": false
  },
  {
    "layer": "Eye color",
    "id": 2,
    "name": "Pink",
    "filename": "Pink#1.png",
    "bypassDNA": false
  },
  {
    "layer": "Iris",
    "id": 0,
    "name": "Large",
    "filename": "Large#20.png",
    "bypassDNA": false
  },
];

const BackgroundBlack_EyeballRed_EyecolorRed_IrisLarge = [
  {
    "layer": "Background",
    "id": 0,
    "name": "Black",
    "filename": "Black#1.png",
    "bypassDNA": false
  },
  {
    "layer": "Eyeball",
    "id": 0,
    "name": "Red",
    "filename": "Red#50.png",
    "bypassDNA": false
  },
  {
    "layer": "Eye color",
    "id": 4,
    "name": "Red",
    "filename": "Red#1.png",
    "bypassDNA": false
  },
  {
    "layer": "Iris",
    "id": 0,
    "name": "Large",
    "filename": "Large#20.png",
    "bypassDNA": false
  },
];

const BackgroundBlack_EyeballRed_EyecolorGreen_IrisLarge = [
  {
    "layer": "Background",
    "id": 0,
    "name": "Black",
    "filename": "Black#1.png",
    "bypassDNA": false
  },
  {
    "layer": "Eyeball",
    "id": 0,
    "name": "Red",
    "filename": "Red#50.png",
    "bypassDNA": false
  },
  {
    "layer": "Eye color",
    "id": 1,
    "name": "Green",
    "filename": "Green#1.png",
    "bypassDNA": false
  },
  {
    "layer": "Iris",
    "id": 0,
    "name": "Large",
    "filename": "Large#20.png",
    "bypassDNA": false
  },
];

const IncompatibleTraitsSimple = {
  "Eye color/Cyan": [
    "Eyeball/Red",
  ],
  "Iris/Large": [
    "Bottom lid/High",
    "Top lid/High",
  ],
};

const IncompatibleTraitsComplex = {
  "Background/Black": [
    "Eyeball/White",
    "Eye color/Pink",
    "Eye color/Green",
  ],
  "Eyeball/Red": [
    "Top lid/High",
    "Top lid/Low",
    "Top lid/Middle",
  ],
};

const IncompatibleTraitsInvalidMain = {
  "Background/Bl4ck": [
    "Eyeball/White",
  ],
};

const IncompatibleTraitsInvalidChild = {
  "Background/Black": [
    "Eyeball/Whit3",
  ],
};

module.exports = {
  BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall,
  BackgroundBlack_EyeballWhite_EyecolorPink_IrisMedium,
  BackgroundBlack_EyeballWhite_EyecolorPink_IrisLarge,
  BackgroundBlack_EyeballRed_EyecolorRed_IrisLarge,
  BackgroundBlack_EyeballRed_EyecolorGreen_IrisLarge,
  IncompatibleTraitsSimple,
  IncompatibleTraitsComplex,
  IncompatibleTraitsInvalidMain,
  IncompatibleTraitsInvalidChild,
}
