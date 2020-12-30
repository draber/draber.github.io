import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import json from '@rollup/plugin-json';
import {
	string
} from 'rollup-plugin-string';
import config from '../src/config/config.json';

const plugins = [
	resolve(),
	string({
		include: '**/*.css'
	}),
	json(),
	commonjs(),
	cleanup()
];

export default [{
	input: config.js.input,
	output: {
		file: config.js.plain,
		format: config.js.format
	},
	plugins: plugins
}];