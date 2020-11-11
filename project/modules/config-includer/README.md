# config-includer

> Replaces `config` markers inside by the respective value from the main `package.json` file and `project/config/config.json`. Values from `config` overwrite those from `package`;

Add markers in the format `{{config(path.to.desired.key)}}` in your source or template file wherever you want to read information from `config.json`.

## Install
Since this is a local module you need to specify the path to the module.

```
$ npm install path/to/config-includer
```

## Usage

```js
const configIncluder = require('config-includer');
const oldContents = fs.readFileSync('source/content-with-markers.txt', 'utf8');

// you can optionally add key-value pairs prior 
// to calling the default function:
configIncluder.set('foo', 'bar');

const newContents = configIncluder(oldContents);
```

## License

MIT © Dieter Raber