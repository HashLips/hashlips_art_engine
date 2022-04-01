const getAbstractedIndexes = require("./index");
const { mockDataInputOne, mockDataInputTwoOne, mockDataInputTwoTwo, mockDataOutputOne, mockDataOutputTwo } = require("./inputOutputData.js");

describe("getAbstractedIndexes cero", () => {
  test("getAbstractedIndexes", () => {
    const resultInputFalse = getAbstractedIndexes(mockDataInputOne, mockDataInputTwoOne);
    expect(resultInputFalse).toStrictEqual(mockDataOutputTwo);
  });
  test("getAbstractedIndexes One", () => {
    const resultInputFalse = getAbstractedIndexes(mockDataInputOne, mockDataInputTwoTwo);
    expect(resultInputFalse).toStrictEqual(mockDataOutputOne);
  });
});
