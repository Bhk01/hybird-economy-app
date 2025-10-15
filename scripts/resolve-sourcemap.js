const fs = require('fs');
const path = require('path');
const { SourceMapConsumer } = require('source-map');

(async function main(){
  try {
    const mapPath = path.resolve(__dirname, '../build/assets/vendor-Cgdd8BZB.js.map');
    if (!fs.existsSync(mapPath)) {
      console.error('sourcemap not found at', mapPath);
      process.exit(2);
    }

    const raw = fs.readFileSync(mapPath, 'utf8');
    const map = JSON.parse(raw);

    const consumer = await new SourceMapConsumer(map);

    // The failing generated location from the preview run
    const genLine = 9;
    const genColumn = 4440;

    const orig = consumer.originalPositionFor({ line: genLine, column: genColumn });
    console.log('Mapped generated', `${genLine}:${genColumn}`, 'to original:');
    console.log(JSON.stringify(orig, null, 2));

    consumer.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
