# file-includer

> Replaces `include` markers inside a file by the content of the included file

Add markers in the format `{{include(source/starting/from/project/root)}}` in your source or template file wherever you want to include another file. The included files can also have markers as well up to a depth of three levels. If the file is an image it will be returned as a dataUri.

## Install
Since this is a local module you need to specify the path to the module.

```
$ npm install path/to/file-includer
```

## Usage

```js
const fileIncluder = require('file-includer');

const updatedContent = fileIncluder('source/content-with-markers.txt');
```

## License

MIT © Dieter Raber