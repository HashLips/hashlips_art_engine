const { spawnSync } = require("child_process");
const path = require("path");

const scriptArg = process.argv[2];
if (!scriptArg) {
  console.error("Usage: node utils/run_python3_script.js <python_script_path>");
  process.exit(1);
}

const scriptPath = path.resolve(process.cwd(), scriptArg);
const candidates = [
  { cmd: "python3", args: [scriptPath] },
  { cmd: "py", args: ["-3", scriptPath] },
  { cmd: "python", args: [scriptPath] },
];

for (const candidate of candidates) {
  const probe = spawnSync(candidate.cmd, [...candidate.args.slice(0, -1), "-c", "import PIL"], {
    stdio: "ignore",
    shell: false,
  });
  if (probe.error && probe.error.code === "ENOENT") {
    continue;
  }
  if (probe.status !== 0) {
    continue;
  }

  const result = spawnSync(candidate.cmd, candidate.args, {
    stdio: "inherit",
    shell: false,
  });

  if (typeof result.status === "number") {
    process.exit(result.status);
  }
}

console.error("No Python 3 + Pillow interpreter found. Install dependencies with pip install -r requirements.txt.");
process.exit(1);
