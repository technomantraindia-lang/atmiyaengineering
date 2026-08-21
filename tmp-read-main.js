const fs = require('fs');
const lines = fs.readFileSync('assets/js/main.js', 'utf8').split(/\r?\n/);
function dump(a, b) {
  console.log('===== ' + a + '-' + b + ' =====');
  for (let i = a - 1; i < b && i < lines.length; i++) {
    console.log((i + 1) + '| ' + lines[i]);
  }
}
dump(1000, 1100);