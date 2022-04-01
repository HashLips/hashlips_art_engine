const { mockDataInput, mockDataOutput } = require("./inputOutputData.js");

const removeQueryString = require("./index");

describe("removeQueryString cero", () => {
  test("removeQueryString", () => {
    const resultFileNameWithoutOptions = removeQueryString(mockDataInput);
    expect(resultFileNameWithoutOptions).toStrictEqual(mockDataOutput);
  });
});
