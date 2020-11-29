#!/usr/bin/env node

const bookmarklet = require('bookmarklet');
const fs = require('fs');
const md = require('markdown-it')({
  html: true
});

const packageJson = require(__dirname + '/../../../package.json');
const configJs = require(__dirname + '/../../config/config.json');
const config = Object.assign(packageJson, configJs);

const writeHtml = (replacements = {}, inPath, outPath) => {

  let tpl = fs.readFileSync(inPath, 'utf8');

  for (const [key, value] of Object.entries(replacements)) {
    const re = new RegExp('{{' + key + '}}', 'g');
    tpl = tpl.replace(re, value);
  }
  const html = tpl;/*beautify(
    tpl, {
      format: 'html'
    });*/
    fs.writeFileSync(outPath, html);
    return `Content saved as ${outPath}`;
};

const pluginCode = (() => {
  const path = `${process.cwd()}/src/js/plugins`;
  let html = '';
  config.plugins.forEach(plugin => {
    let data = fs.readFileSync(`${path}/${plugin}/readme.md`, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        process.exit(2);
      }
    });
    data = data.replace(/^#/g, '##');
    html += md.render(data);
  });
  return html;
});

const bookmarkletCode = (() => {
  const path = `${process.cwd()}/dist/spelling-bee-assistant.js`;
  let data = fs.readFileSync(path, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      process.exit(2);
    }
  });
  return `<a class="bookmarklet" onclick="return false" href="${bookmarklet.convert(data, { style: false, script: false})}">${config.title}</a>`;
});


const bmCompile = writeHtml({
    ...config,
    ...{
      bookmarklet: 'bookmarkletCode()',
      plugins: pluginCode(),
      javascript: 'javascript',
    }
  },
  `${process.cwd()}/${config.htmlIn}`,
  `${process.cwd()}/${config.htmlOut}`);

module.exports = bmCompile;