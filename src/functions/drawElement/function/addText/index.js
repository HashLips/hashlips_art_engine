const addText = (_sig, ctx, x, y, size, text) => {
  //console.log({ _sig, ctx, x, y, size, text });
  ctx.fillStyle = text.color;
  ctx.font = `${text.weight} ${size}pt ${text.family}`;
  ctx.textBaseline = text.baseline;
  ctx.textAlign = text.align;
  ctx.fillText(_sig, x, y);
  //console.log({ ctx });
  return ctx;
};

module.exports = addText;
