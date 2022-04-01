const addAttributes = require("./index");
const { mockDataInput, mockDataOutput } = require("./inputOutputData.js");

describe("addAttributes cero", () => {
  test("addAttributes", () => {
    const resultNewDataAttribute = addAttributes(
      mockDataInput._element,
      mockDataInput.attributesList
    );
    expect(resultNewDataAttribute).toEqual(
      expect.arrayContaining([expect.objectContaining(mockDataOutput)])
    );
  });
});
