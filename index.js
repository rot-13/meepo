const arpscanner = require('arpscan')
const interface = null
arpscanner(onResult, { sudo: true, interface });

function onResult(err, data) {
  if (err) throw err;
  console.log(data);
}
