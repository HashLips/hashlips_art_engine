const compress_images = require("compress-images");

const INPUT_path_to_your_images = `build/images/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}`;
const OUTPUT_path = `output/images/`;

const compress = async () => {
  await compress_images(
    INPUT_path_to_your_images,
    OUTPUT_path,
    { compress_force: false, statistic: true, autoupdate: true },
    false,
    { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
    { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
    { svg: { engine: "svgo", command: "--multipass" } },
    {
      gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] },
    },
    function () {}
  );
};

compress();

console.log(INPUT_path_to_your_images);
