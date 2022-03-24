const getAbstractedIndexes = require("./index");
const { mockDataInput, mockDataOutput } = require("./inputOutputData.js");

describe("getAbstractedIndexes cero", () => {
  test("getAbstractedIndexes", () => {
    const resultInputFalse = getAbstractedIndexes(mockDataInput);
    expect(resultInputFalse).toStrictEqual(mockDataOutput);
  });
});
