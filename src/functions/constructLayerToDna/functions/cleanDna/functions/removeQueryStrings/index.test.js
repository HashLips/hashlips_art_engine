const removeQueryStrings = require("./index");
const { mockDataInput, mockDataOutput } = require("./inputOutputData.js");

describe("removeQueryStrings cero", () => {
  test("removeQueryStrings", () => {
    const resultInputFalse = removeQueryStrings(mockDataInput);
    expect(resultInputFalse).toStrictEqual(mockDataOutput);
  });
});
