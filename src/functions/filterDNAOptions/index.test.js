const filterDNAOptions = require("./index");
const { mockDataInput, mockDataOutput } = require("./inputOutputData.js");

describe("filterDNAOptions cero", () => {
  test("filterDNAOptions", () => {
    const resultInputFalse = filterDNAOptions(mockDataInput);
    expect(resultInputFalse).toStrictEqual(mockDataOutput);
  });
});
