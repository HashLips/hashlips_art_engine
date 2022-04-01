const basePath = process.cwd();
const buildDir = `${basePath}/build`;
const fs = require('fs');

const { mockDataInput, mockDataOutput } = require('./inputOutputData.js');

const removeQueryString = require('./index');

describe('removeQueryString cero', () => {
  test('removeQueryString', () => {
    const resultFileNameWithoutOptions = removeQueryString(mockDataInput);
    expect(resultFileNameWithoutOptions).toStrictEqual(mockDataOutput);
  });
});
