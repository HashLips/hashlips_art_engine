const mockDataInputOne = "0:Black#1.png-0:Red#50.png-2:Small#60.png-0:Shapes#100.png-0:High#20.png-2:Middle#50.png";

const mockDataInputTwo = [
  {
    id: 0,
    elements: [
      {
        id: 0,
        name: "Black",
        filename: "Black#1.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Background/Black#1.png",
        weight: 1
      }
    ],
    name: "Background",
    blend: "source-over",
    opacity: 1,
    bypassDNA: false
  },
  {
    id: 1,
    elements: [
      {
        id: 0,
        name: "Red",
        filename: "Red#50.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Eyeball/Red#50.png",
        weight: 50
      },
      {
        id: 1,
        name: "White",
        filename: "White#50.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Eyeball/White#50.png",
        weight: 50
      }
    ],
    name: "Eyeball",
    blend: "source-over",
    opacity: 1,
    bypassDNA: false
  },
  {
    id: 2,
    elements: [
      {
        id: 0,
        name: "Large",
        filename: "Large#20.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Iris/Large#20.png",
        weight: 20
      },
      {
        id: 1,
        name: "Medium",
        filename: "Medium#20.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Iris/Medium#20.png",
        weight: 20
      },
      {
        id: 2,
        name: "Small",
        filename: "Small#60.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Iris/Small#60.png",
        weight: 60
      }
    ],
    name: "Iris",
    blend: "source-over",
    opacity: 1,
    bypassDNA: false
  },
  {
    id: 3,
    elements: [
      {
        id: 0,
        name: "Shapes",
        filename: "Shapes#100.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Shine/Shapes#100.png",
        weight: 100
      }
    ],
    name: "Shine",
    blend: "source-over",
    opacity: 1,
    bypassDNA: false
  },
  {
    id: 4,
    elements: [
      {
        id: 0,
        name: "High",
        filename: "High#20.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Bottom lid/High#20.png",
        weight: 20
      },
      {
        id: 1,
        name: "Low",
        filename: "Low#40.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Bottom lid/Low#40.png",
        weight: 40
      },
      {
        id: 2,
        name: "Middle",
        filename: "Middle#40.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Bottom lid/Middle#40.png",
        weight: 40
      }
    ],
    name: "Bottom lid",
    blend: "source-over",
    opacity: 1,
    bypassDNA: false
  },
  {
    id: 5,
    elements: [
      {
        id: 0,
        name: "High",
        filename: "High#30.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Top lid/High#30.png",
        weight: 30
      },
      {
        id: 1,
        name: "Low",
        filename: "Low#20.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Top lid/Low#20.png",
        weight: 20
      },
      {
        id: 2,
        name: "Middle",
        filename: "Middle#50.png",
        path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Top lid/Middle#50.png",
        weight: 50
      }
    ],
    name: "Top lid",
    blend: "source-over",
    opacity: 1,
    bypassDNA: false
  }
];

const mockDataOutput = [
  {
    name: "Background",
    blend: "source-over",
    opacity: 1,
    selectedElement: {
      id: 0,
      name: "Black",
      filename: "Black#1.png",
      path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Background/Black#1.png",
      weight: 1
    }
  },
  {
    name: "Eyeball",
    blend: "source-over",
    opacity: 1,
    selectedElement: {
      id: 0,
      name: "Red",
      filename: "Red#50.png",
      path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Eyeball/Red#50.png",
      weight: 50
    }
  },
  {
    name: "Iris",
    blend: "source-over",
    opacity: 1,
    selectedElement: {
      id: 2,
      name: "Small",
      filename: "Small#60.png",
      path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Iris/Small#60.png",
      weight: 60
    }
  },
  {
    name: "Shine",
    blend: "source-over",
    opacity: 1,
    selectedElement: {
      id: 0,
      name: "Shapes",
      filename: "Shapes#100.png",
      path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Shine/Shapes#100.png",
      weight: 100
    }
  },
  {
    name: "Bottom lid",
    blend: "source-over",
    opacity: 1,
    selectedElement: {
      id: 0,
      name: "High",
      filename: "High#20.png",
      path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Bottom lid/High#20.png",
      weight: 20
    }
  },
  {
    name: "Top lid",
    blend: "source-over",
    opacity: 1,
    selectedElement: {
      id: 2,
      name: "Middle",
      filename: "Middle#50.png",
      path: "/home/arty/Documents/Platzi/multiple_art/hashlips_art_engine/layers/Top lid/Middle#50.png",
      weight: 50
    }
  }
];

module.exports.mockDataInputOne = mockDataInputOne;
module.exports.mockDataInputTwo = mockDataInputTwo;
module.exports.mockDataOutput = mockDataOutput;
