#!/usr/bin/env node

const fs = require('fs');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

const packageJson = require(__dirname + '/../../../package.json');
const configJs = require(__dirname + '/../../config/config.json');
const config = Object.assign(packageJson, configJs);

/**
 * fs.readFileSync with errors, just shorter
 * @param path
 * @returns {Buffer | string}
 */
const getContents = path => {
  return fs.readFileSync(path, 'utf8', (err) => {
    if (err) {
      console.log(err);
      process.exit(2);
    }
  });
}

/**
 * Build index.html
 * @param replacements
 * @param inPath
 * @param outPath
 * @returns {string}
 */
const writeHtml = (replacements = {}, inPath, outPath) => {
  let html = getContents(inPath);
  [...new Set(html.match(/{{[\w.]+}}/g) || [])].forEach(entry => {
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

/**
 * Bookmarklet code
 * @returns {string}
 */
const bmCode = () => {
  let code = getContents(`${process.cwd()}/dist/spelling-bee-assistant.min.js`);
  code = `(function(){${code}})()`;
  return `javascript:${encodeURIComponent(code)}`;
};

/**
 * Build site
 */
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

/**
 * Watch for file changes
 */
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

/**
 * Watch (-w) or build (default)
 */
const defaultExport = (() => {
  if (args.w) {
    console.log(`Watching ${config.htmlIn} for changes`);
    watch();
  } else {
    build();
  }
})();

module.exports = defaultExport;