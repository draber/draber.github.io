# Spelling Bee Assistant

__Spelling Bee Assistant__ is a JavaScript bookmarklet for [Spelling Bee](https://www.nytimes.com/puzzles/spelling-bee), the New York Times’ popular word puzzle. Visit the [project’s homepage](https://draber.github.io/) to learn more.


## How did you do this?

You can study the JavaScript source code which is [right here](code/source.js). I used the Chrome console for development, then [compressed](code/source-compressed.js) the code with [Terser](https://www.npmjs.com/package/terser) and eventually created the [bookmarklet](code/source-bookmarklet.js) from this compressed version [Bookmarklet](https://www.npmjs.com/package/bookmarklet).

The CSS code is written using SASS, you can [find it here](code/styles/scss/styles.scss). The CSS has been manually copied to `appendStyles()` in the JavaScript source file. Not the most elegant way, but it does what it should.


## I discovered a bug / I would like to ask for a new feature

Sorry to disappoint you, this was a fun weekend project and chances that it's ever going to be picked up again are rather slim. The code is available under the [MIT license](LICENSE.md) and you can fork, modify and republish it as long as you respect the terms of the license. You can make a PR and I will probably look at it, but I don't want this to be a duty.
