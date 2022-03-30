const getElements = require('./index');
const { mockDataInput, mockDataOutput } = require('./inputOutputData.js');

describe('getElements cero', () => {
  test('getElements', () => {
    const resultObjectFile = getElements(mockDataInput.path);
    expect(resultObjectFile).toEqual([expect.objectContaining(mockDataOutput)]);
  });
});
