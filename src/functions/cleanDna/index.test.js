const getAbstractedIndexes = require('./index');
const { mockDataInput, mockDataOutput } = require('./inputOutputData.js');

describe('cleanDna cero', () => {
  test('cleanDna', () => {
    const resultInputFalse = getAbstractedIndexes(mockDataInput);
    expect(resultInputFalse).toStrictEqual(mockDataOutput);
  });
});
