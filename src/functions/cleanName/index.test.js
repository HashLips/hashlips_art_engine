const cleanName = require('./index');
const { mockDataInput, mockDataOutput } = require('./inputOutputData.js');

describe('cleanName cero', () => {
  test('cleanName', () => {
    const resultNameWithoutExtension = cleanName(mockDataInput);
    expect(resultNameWithoutExtension).toStrictEqual(mockDataOutput);
  });
});
