#!/usr/bin/env node

const fs = require('fs');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

const packageJson = require(__dirname + '/../../../package.json');
const configJs = require(__dirname + '/../../config/config.json');
const config = Object.assign(packageJson, configJs);



const getContents = path => {
  return fs.readFileSync(path, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      process.exit(2);
    }
  });
}

const writeHtml = (replacements = {}, inPath, outPath) => {
  let html = getContents(inPath);
  [...new Set(html.match(/{{[\w\.]+}}/g) || [])].forEach(entry => {
    const re = new RegExp(entry.replace(/\./g, '\\.'), 'g');
    html = html.replace(re, key => {
      key = key.replace(/^{+|}+$/g, '');
      let current = Object.create(replacements);
      key.split('.').forEach(token => {
        current = current[token];
      })
      return current;
    });
  })
  fs.writeFileSync(outPath, html);
  return `Content saved as ${outPath}`;
};


const bmCode = () => {
  let code = getContents(`${process.cwd()}/dist/spelling-bee-assistant.min.js`);
  code = `(function(){${code}})()`;
  return `javascript:${encodeURIComponent(code)}`;
};

const build = () => {
  writeHtml({
      ...config,
      ...{
        bookmarklet: bmCode()
      }
    },
    `${process.cwd()}/${config.htmlIn}`,
    `${process.cwd()}/${config.htmlOut}`
  );

  console.log('\x1b[32m%s\x1b[0m', `Compiled ${config.htmlIn} to ${config.htmlOut}`);
}

const watch = () => {
  let fsWait = false;
  fs.watchFile(`${process.cwd()}/${config.htmlIn}`, (event, filename) => {
    if (filename) {
      if (fsWait) return;
      fsWait = setTimeout(() => {
        fsWait = false;
      }, 100);
      build();
    }
  });
}

const defaultExport = (() => {
  if (args.w) {
    console.log(`Watching ${config.htmlIn} for changes`);
    watch();
  } else {
    build();
  }
})();

module.exports = defaultExport;