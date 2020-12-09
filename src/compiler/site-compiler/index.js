#!/usr/bin/env node

const bookmarklet = require('bookmarklet');
const fs = require('fs');
const Terser = require('terser');
const md = require('markdown-it')({
  html: true
});

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

const pluginCode = () => {
  const path = `${process.cwd()}/src/js/plugins`;
  let html = '';
  config.plugins.forEach(plugin => {
    html += `<li>` 
         + md.render(getContents(`${path}/${plugin}/readme.md`).replace(/^#/g, '###'))
         + `</li>`;
  });
  return html;
};

const bmCode = () => {
  const code = getContents(`${process.cwd()}/dist/spelling-bee-assistant.js`);
  return `<a class="bookmarklet" onclick="return false" href="${bookmarklet.convert(code, { style: false, script: false})}">${config.label}</a>`;
};

const siteJsCode = () => {
  const code = getContents(`${process.cwd()}/src/js/site.js`);
  return code;
}

const cssCode = () => {
  const path = `${process.cwd()}/src/css`;
  let code = '';
  ['site', 'widget'].forEach(type => {
    code += getContents(`${path}/${type}.css`).trim().replace(/(\uFEFF|\\n)/gu, '');
  })
  return code;
}

// const copyPictures = () => {
//   config.plugins.forEach(plugin => {
//     html += `<li>` 
//          + md.render(getContents(`${path}/${plugin}/readme.md`).replace(/^#/g, '###'))
//          + `</li>`;
//   });
// }


const compile = writeHtml({
    ...config,
    ...{
      css: cssCode(),
      bookmarklet: bmCode(),
      plugins: pluginCode()
    }
  },
  `${process.cwd()}/${config.htmlIn}`,
  `${process.cwd()}/${config.htmlOut}`
);

module.exports = compile;