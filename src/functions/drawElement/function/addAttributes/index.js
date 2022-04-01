const addAttributes = (_element, attributesList) => {
  const selectedElement = _element.layer.selectedElement;
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
  return attributesList;
};

module.exports = addAttributes;
