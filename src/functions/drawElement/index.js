const basePath = process.cwd();
const { format } = require(`${basePath}/src/config.js`);
const addText = require("./function/addText");
const addAttributes = require("./function/addAttributes");

const drawElement = (
  _renderObject,
  _index,
  _layersLen,
  attributesList,
  ctx,
  text
) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blend;
  text.only
    ? addText(
        `${_renderObject.layer.name}${text.spacer}${_renderObject.layer.selectedElement.name}`,
        ctx,
        text.xGap,
        text.yGap * (_index + 1),
        text.size,
        text
    )
    : ctx.drawImage(
      _renderObject.loadedImage,
      0,
      0,
      format.width,
      format.height
    );

  const newAttributesList = addAttributes(_renderObject, attributesList);
  return { newCtx: ctx, newAttributesList };
};

module.exports = drawElement;
