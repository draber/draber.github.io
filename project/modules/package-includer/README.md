# package-includer

> Replaces `package` markers inside by the respective value from the main `package.json` file.

Add markers in the format `{{package(path.to.desired.key)}}` in your source or template file wherever you want to read information from `package.json`.

## Install
Since this is a local module you need to specify the path to the module.

```
$ npm install path/to/package-includer
```

## Usage

```js
const fileIncluder = require('package-includer');

const updatedContent = packageIncluder('source/content-with-markers.txt');
```

## License

MIT © Dieter Raber