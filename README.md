# Spelling Bee Assistant

__Spelling Bee Assistant__ is a JavaScript bookmarklet for [Spelling Bee](https://www.nytimes.com/puzzles/spelling-bee), the New York Times’ popular word puzzle. Visit the [project’s homepage](https://draber.github.io/) to learn more.


## How did you do this?

You can study the JavaScript source code which is [right here](src/js/source.js). I used the Chrome console for development, then [compressed](code/compressed.js) the code with [terser](https://www.npmjs.com/package/terser) and eventually created the [bookmarklet](code/bookmarklet.js) from this compressed version with [bookmarklet](https://www.npmjs.com/package/bookmarklet).

The CSS code is written using SASS, you can [find it here](code/styles/scss/styles.scss). The CSS has been manually copied to `appendStyles()` in the JavaScript source file. Not the most elegant way, but it does what it should.


## I discovered a bug / I would like to ask for a new feature

You can report bugs or request features [here](https://github.com/draber/draber.github.io/issues). Keep in mind that this is as a fun weekend project and I don't want it to be a burden. I might work on issues from time to time but I won't make any promises. The code is available under the [MIT license](LICENSE.md) and you can fork, modify and republish it as long as you respect the terms of the license.
