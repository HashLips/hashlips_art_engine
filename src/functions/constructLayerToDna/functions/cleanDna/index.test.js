const cleanDna = require("./index");
const { mockDataInput, mockDataOutput } = require("./inputOutputData.js");

describe("cleanDna cero", () => {
  test("cleanDna", () => {
    const resultInputFalse = cleanDna(mockDataInput);
    expect(resultInputFalse).toStrictEqual(mockDataOutput);
  });
});
