const basePath = process.cwd();

const mockDataInput = [
  { name: 'Background' },
  { name: 'Eyeball' },
  { name: 'Eye color' },
  { name: 'Iris' },
  { name: 'Shine' },
  { name: 'Bottom lid' },
  { name: 'Top lid' },
];

const mockDataOutput = [
  {
    id: 0,
    elements: [
      {
        id: 0,
        name: 'Black',
        filename: 'Black#1.png',
        path: `${basePath}/layers/Background/Black#1.png`,
        weight: 1,
      },
    ],
    name: 'Background',
    blend: 'source-over',
    opacity: 1,
    bypassDNA: false,
  },
  {
    id: 1,
    elements: [
      {
        id: 0,
        name: 'Red',
        filename: 'Red#50.png',
        path: `${basePath}/layers/Eyeball/Red#50.png`,
        weight: 50,
      },
      {
        id: 1,
        name: 'White',
        filename: 'White#50.png',
        path: `${basePath}/layers/Eyeball/White#50.png`,
        weight: 50,
      },
    ],
    name: 'Eyeball',
    blend: 'source-over',
    opacity: 1,
    bypassDNA: false,
  },
  {
    id: 2,
    elements: [
      {
        id: 0,
        name: 'Cyan',
        filename: 'Cyan#1.png',
        path: `${basePath}/layers/Eye color/Cyan#1.png`,
        weight: 1,
      },
      {
        id: 1,
        name: 'Green',
        filename: 'Green#1.png',
        path: `${basePath}/layers/Eye color/Green#1.png`,
        weight: 1,
      },
      {
        id: 2,
        name: 'Pink',
        filename: 'Pink#1.png',
        path: `${basePath}/layers/Eye color/Pink#1.png`,
        weight: 1,
      },
      {
        id: 3,
        name: 'Purple',
        filename: 'Purple#1.png',
        path: `${basePath}/layers/Eye color/Purple#1.png`,
        weight: 1,
      },
      {
        id: 4,
        name: 'Red',
        filename: 'Red#1.png',
        path: `${basePath}/layers/Eye color/Red#1.png`,
        weight: 1,
      },
      {
        id: 5,
        name: 'Yellow',
        filename: 'Yellow#10.png',
        path: `${basePath}/layers/Eye color/Yellow#10.png`,
        weight: 10,
      },
    ],
    name: 'Eye color',
    blend: 'source-over',
    opacity: 1,
    bypassDNA: false,
  },
  {
    id: 3,
    elements: [
      {
        id: 0,
        name: 'Large',
        filename: 'Large#20.png',
        path: `${basePath}/layers/Iris/Large#20.png`,
        weight: 20,
      },
      {
        id: 1,
        name: 'Medium',
        filename: 'Medium#20.png',
        path: `${basePath}/layers/Iris/Medium#20.png`,
        weight: 20,
      },
      {
        id: 2,
        name: 'Small',
        filename: 'Small#60.png',
        path: `${basePath}/layers/Iris/Small#60.png`,
        weight: 60,
      },
    ],
    name: 'Iris',
    blend: 'source-over',
    opacity: 1,
    bypassDNA: false,
  },
  {
    id: 4,
    elements: [
      {
        id: 0,
        name: 'Shapes',
        filename: 'Shapes#100.png',
        path: `${basePath}/layers/Shine/Shapes#100.png`,
        weight: 100,
      },
    ],
    name: 'Shine',
    blend: 'source-over',
    opacity: 1,
    bypassDNA: false,
  },
  {
    id: 5,
    elements: [
      {
        id: 0,
        name: 'High',
        filename: 'High#20.png',
        path: `${basePath}/layers/Bottom lid/High#20.png`,
        weight: 20,
      },
      {
        id: 1,
        name: 'Low',
        filename: 'Low#40.png',
        path: `${basePath}/layers/Bottom lid/Low#40.png`,
        weight: 40,
      },
      {
        id: 2,
        name: 'Middle',
        filename: 'Middle#40.png',
        path: `${basePath}/layers/Bottom lid/Middle#40.png`,
        weight: 40,
      },
    ],
    name: 'Bottom lid',
    blend: 'source-over',
    opacity: 1,
    bypassDNA: false,
  },
  {
    id: 6,
    elements: [
      {
        id: 0,
        name: 'High',
        filename: 'High#30.png',
        path: `${basePath}/layers/Top lid/High#30.png`,
        weight: 30,
      },
      {
        id: 1,
        name: 'Low',
        filename: 'Low#20.png',
        path: `${basePath}/layers/Top lid/Low#20.png`,
        weight: 20,
      },
      {
        id: 2,
        name: 'Middle',
        filename: 'Middle#50.png',
        path: `${basePath}/layers/Top lid/Middle#50.png`,
        weight: 50,
      },
    ],
    name: 'Top lid',
    blend: 'source-over',
    opacity: 1,
    bypassDNA: false,
  },
];

module.exports.mockDataInput = mockDataInput;
module.exports.mockDataOutput = mockDataOutput;
