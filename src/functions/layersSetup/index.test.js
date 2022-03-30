const layerSetup = require('./index');
const { mockDataInput, mockDataOutput } = require('./inputOutputData.js');

describe('layerSetup cero', () => {
  test('layerSetup', () => {
    const resultObjectFile = layerSetup(mockDataInput);
    expect(resultObjectFile).toEqual(mockDataOutput);
  });
});
