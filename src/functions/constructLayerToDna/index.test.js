const constructLayerToDna = require("./index");
const { mockDataInputOne, mockDataInputTwo, mockDataOutput } = require("./inputOutputData.js");

describe("constructLayerToDna cero", () => {
  test("constructLayerToDna", () => {
    const resultInputFalse = constructLayerToDna(mockDataInputOne, mockDataInputTwo);
    expect(resultInputFalse).toStrictEqual(mockDataOutput);
  });
});
