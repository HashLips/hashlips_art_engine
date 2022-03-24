const shuffle = require("./index");
const { mockDataInput, mockDataOutput } = require("./inputOutputData.js");

describe("shuffle cero", () => {
  test("shuffle", () => {
    const resultInputFalse = shuffle(mockDataInput);
    expect(resultInputFalse).toStrictEqual(mockDataOutput);
  });
});
