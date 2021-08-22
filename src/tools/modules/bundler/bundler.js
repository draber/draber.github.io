import * as rollup from 'rollup';
import settings from '../settings/settings.js';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import json from '@rollup/plugin-json';
import svg from 'rollup-plugin-svg';
import {
    string
} from 'rollup-plugin-string';

const build = async () => {

    const inputOptions = {
        input: settings.get('js.input'),
        plugins: [
            resolve(),
            string({
                include: '**/*.css'
            }),
            json(),
            svg(),
            commonjs(),
            cleanup()
        ]
    };

    const outputOptions = {
        format: settings.get('js.format')

    }

    const bundle = await rollup.rollup(inputOptions);
    const {
        output
    } = await bundle.generate(outputOptions);

    let code = '';


    for (const chunkOrAsset of output) {
        if (chunkOrAsset.type !== 'asset') {
            code += chunkOrAsset.code
        }
    }

    await bundle.close();

    return code;
}

export default {
    build
}