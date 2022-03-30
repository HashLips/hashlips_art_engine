const basePath = process.cwd();

const mockDataInput = {
  path: basePath + '/layers/Background/',
};

const mockDataOutput = {
  id: 0,
  name: 'Black',
  filename: 'Black#1.png',
  path: basePath + `/layers/Background/Black#1.png`,
  weight: 1,
};

module.exports.mockDataInput = mockDataInput;
module.exports.mockDataOutput = mockDataOutput;
