const pugsass = require('bookmarklet-styler');

function defaultTask(cb) {
  console.log('works')
  cb();
}

exports.default = defaultTask
