import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import json from '@rollup/plugin-json';
import {
	string
} from 'rollup-plugin-string';

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
    input: 'src/js/main.js',
    treeshake: true,
	output: {
		file: 'dist/spelling-bee-assistant.esm.js',
		format: 'esm'
	},
	plugins: plugins
}];