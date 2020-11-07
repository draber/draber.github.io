# Overview of all file watches

| Watch                         | Command                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| src/scss/site.scss            | `pugsass src/scss/site.scss src/pug/site-css.pug`                                                  |
| src/scss/widget.scss          | `bookmarklet-styler src/js/source.js src/js/bookmarklet-styled.js -c src/css/widget.scss`          |
| src/js/source.js              | `bookmarklet-styler src/js/source.js src/js/bookmarklet-styled.js -c src/css/widget.scss`          |
| src/js/bookmarklet-styled.js  | `bookmarklet-pug src/js/bookmarklet-styler.js src/pug/bookmarklet.pug -l "Spelling Bee Assistant"` |
| src/pg/*.pug                  | `pug src/pug/index.pug index.html`                                                                 |
