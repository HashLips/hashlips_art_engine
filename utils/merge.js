const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");
const path = require("path");
const { program } = require("commander");

const { baseUri, namePrefix, network } = require(`${basePath}/src/config.js`);

const mergeSetup = (output_folder) => {
  if (fs.existsSync(output_folder)) {
    fs.rmSync(output_folder, { recursive: true });
  }
  fs.mkdirSync(output_folder);
  fs.mkdirSync(`${output_folder}/json`);
  fs.mkdirSync(`${output_folder}/images`);
};

const parse_argv = () => {
  program
    .name("merge")
    .description("Merge metadata and images in the folders.")
    .version("0.0.1")
    .requiredOption("-o, --output <s>", "output folder")
    .option("-s, --shuffle", "after merging, shuffle the images")
    .argument(
      "<input folders>",
      "input folders, like ./build1 ./build2 ./build3"
    );
  program.parse(process.argv);
  const options = program.opts();
  const output_folder = path.resolve(options.output);
  const input_folders = program.args.map((arg) => path.resolve(arg));

  return { output_folder, input_folders, shuffle: !!options.shuffle };
};

const file_sort_by_number = (a, b) => {
  const num_a = parseInt(a, 10);
  const num_b = parseInt(b, 10);

  if (!isNaN(num_a) && !isNaN(num_b)) {
    return num_a - num_b;
  } else if (!isNaN(num_a)) {
    return -1;
  } else if (!isNaN(num_b)) {
    return 1;
  } else {
    return a.localeCompare(b);
  }
};

const create_input_list = (input_folders) => {
  let metadata = [];
  let images = [];
  let missings = [];
  let dnas = [];

  input_folders.forEach((folder) => {
    const metadata_folder = `${folder}/json`;
    const image_folder = `${folder}/images`;

    const files = fs.readdirSync(metadata_folder);
    files.sort(file_sort_by_number);
    files.forEach((file) => {
      if (path.extname(file).toLowerCase() !== ".json") return;
      if (path.basename(file).toLowerCase() === "_metadata.json") return;

      const metadata_file = `${metadata_folder}/${file}`;
      const f = fs.readFileSync(metadata_file);
      const json = JSON.parse(f);
      const dna = json.dna;
      if (dnas.indexOf(dna) !== -1) {
        console.log("Duplicated data: ", metadata_file);
        return;
      }
      dnas.push(dna);
      metadata.push(metadata_file);

      const { name } = path.parse(file);
      const image_file = `${image_folder}/${name}.png`;
      if (fs.existsSync(image_file)) {
        images.push(image_file);
      } else {
        missings.push(image_file);
      }
    });
  });

  return { metadata, images, missings };
};

const copy_to_output_folder = (output_folder, images, metadata, shuffle) => {
  const metadata_folder = `${output_folder}/json`;
  const image_folder = `${output_folder}/images`;
  const origin = network == NETWORK.sol ? 0 : 1;

  const num_list = [...Array(images.length).keys()].map((k) => k + origin);
  if (shuffle) {
    num_list.sort(() => Math.random() - 0.5);
  }

  images.forEach((_, i) => {
    fs.copyFileSync(images[i], `${image_folder}/${num_list[i]}.png`);
    fs.copyFileSync(metadata[i], `${metadata_folder}/${num_list[i]}.json`);
  });
};

const update_metadata = (output_folder, metadata) => {
  let new_metadata = [];
  metadata.forEach((meta) => {
    const f = fs.readFileSync(meta);
    let item = JSON.parse(f);

    const { name } = path.parse(meta);
    item.edition = parseInt(name);
    item.name = `${namePrefix} #${item.edition}`;
    item.image = `${baseUri}/${item.edition}.png`;

    fs.writeFileSync(
      `${output_folder}/json/${item.edition}.json`,
      JSON.stringify(item, null, 2)
    );
    new_metadata.push(item);
  });

  fs.writeFileSync(
    `${output_folder}/json/_metadata.json`,
    JSON.stringify(new_metadata, null, 2)
  );
};

/* Main process */
const { output_folder, input_folders, shuffle } = parse_argv();
mergeSetup(output_folder);

const { metadata, images, missings } = create_input_list(input_folders);
if (missings.length > 0) {
  console.error("ERROR: There is no images corresponding to the metadata.");
  console.error(missings);
  return;
}

copy_to_output_folder(output_folder, images, metadata, shuffle);
const { metadata: out_metadata, images: out_images } = create_input_list([
  output_folder,
]);
update_metadata(output_folder, out_metadata);

console.log("Merge done.");
