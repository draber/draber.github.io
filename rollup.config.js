import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import json from '@rollup/plugin-json';
import { string } from 'rollup-plugin-string';
//import { terser } from "rollup-plugin-terser";

const plugins = [
	resolve(),
	string({
		include: "**/*.css"
	}),
	json(),
	commonjs(),
	cleanup()
];

let output = 'dist/spelling-bee-assistant.js';

// if(!process.argv.includes('-w')) {
// 	plugins.push(terser());
// 	output = 'dist/spelling-bee-assistant.min.js';
// }

export default [
	{
		input: 'src/js/main.js',
		output: {
			file: output,
			format: 'iife'
		},
		plugins: plugins
	}
];
