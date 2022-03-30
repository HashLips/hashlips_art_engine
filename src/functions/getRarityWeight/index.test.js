const basePath = process.cwd();
const buildDir = `${basePath}/build`;
const fs = require('fs');

const { mockDataInput, mockDataOutput } = require('./inputOutputData.js');

const getRarityWeight = require('./index');

describe('getRarityWeight cero', () => {
  test('getRarityWeight', () => {
    const resultNameWithoutWeightAndExtension = getRarityWeight(mockDataInput);
    expect(resultNameWithoutWeightAndExtension).toStrictEqual(mockDataOutput);
  });
});
