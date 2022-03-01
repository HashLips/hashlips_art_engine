const basePath = process.cwd();
const { numWorkers, batchSize } = require(`${basePath}/src/config.js`);
const { chooseDnas, createDnas, buildSetup } = require(`${basePath}/src/main.js`);

function chunks(array, size) {
  return Array.apply(
    0,
    new Array(Math.ceil(array.length / size)),
  ).map((_, index) => array.slice(index * size, (index + 1) * size));
}

(async () => {
  const nodeExec = process.argv[0];
  buildSetup();
  const createList = await chooseDnas();
  if (numWorkers === 1) {
    await createDnas(createList);
  } else {
    const { spawn } = require('child_process');
    const stream = require('stream');

    const batches = chunks(createList, batchSize);
    let currentBatch = numWorkers; // first `numWorkers` are kicked manually
    const runBatch = async (b) => {
      const child = spawn(nodeExec, [`${basePath}/src/child.js`]);

      child.stdout.pipe(process.stdout);
      child.stdin.write(JSON.stringify(b));
      child.stdin.end();

      await new Promise((resolve) => {
        child.on('close', (code) => {
          if (code !== 0) {
            throw new Error(`Child process ended with error code ${code} for batch ${JSON.stringify(b)}`);
          }
          resolve();
        });
      });
      // stack depth?
      if (currentBatch < batches.length) {
        let idx = currentBatch;
        currentBatch += 1;
        await runBatch(batches[idx]);
      }
    };

    let workers = [];
    for (let w = 0; w < numWorkers; ++w) {
      workers.push(runBatch(batches[w]));
    }

    await Promise.all(workers);
  }
})();
