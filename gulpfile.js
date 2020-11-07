const pugsass = require('pugmarklet');

function defaultTask(cb) {
  console.log('works')
  cb();
}

exports.default = defaultTask
