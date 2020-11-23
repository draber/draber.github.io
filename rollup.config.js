import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';
import cleanup from 'rollup-plugin-cleanup';
import json from '@rollup/plugin-json';
import { string } from "rollup-plugin-string";


export default [
	{
		input: 'src/js/main.js',
		output: {
			file: pkg.console,
			format: 'iife'
		},
		plugins: [
			resolve(),
			string({
				include: "**/*.css"
			}),
			json(),
			commonjs(),
			cleanup()
		]
	}
];
