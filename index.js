const { startCreating } = require(`./src/main.js`);

const gen = ({
  layersDir,
  len,
}) => new Promise((resolve, reject) => {
  const images = []
  startCreating({
    layersDir,
    onImage: (data) => {
      images.push(data);
      if (images.length === len) {
        resolve(images);
      }
    }
  });
});

module.exports = gen;
