const basePath = process.cwd();
const { createDnas } = require(`${basePath}/src/main.js`);

(() => {
  const args = process.argv.slice(2);
  const data = require('fs').readFileSync(process.stdin.fd, 'utf-8');

  const createList = JSON.parse(data);
  createDnas(createList);
})();
