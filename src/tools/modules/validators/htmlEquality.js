import _ from 'lodash';
import {
    HtmlDiffer
} from '@markedjs/html-differ';
import format from '../formatters/format.js';

const was = (part = '') => {
    return ' __WAS:[' + part + '] ';
}
const is = (part = '') => {
    return ' __IS:[' + part + '] ';
}

const toFilteredArray = html => {
    return format('html', html, 'compact').split('\n').filter(line => line && /__[A-Z]+\:/.test(line));
}


const buildResult = diff => {
    let ref = '';
    let cur = '';

    for (let i = 0; i < diff.length; i++) {
        const actual = diff[i];
        const next = diff[i + 1] || {};
        if (actual.used) {
            continue;
        }
        if (actual.removed && next.added) {
            ref += was(actual.value);
            cur += is(next.value);
            next.used = true;
        } else if (actual.added) {
            ref += was();
            cur += is(actual.value);
        } else if (actual.removed) {
            ref += was(actual.value);
            cur += is();
        } else {
            ref += actual.value;
            cur += actual.value;
        }
    }

    ref = toFilteredArray(ref);
    cur = toFilteredArray(cur);

    const result = [];

    ref.forEach((line, i) => {
        result.push({
            ref: line,
            cur: cur[i]
        })
    })

    return result;
}

const htmlEquality = async (ref, cur) => {
    const htmlDiffer = new HtmlDiffer();

    const diff = await htmlDiffer.diffHtml(ref, cur);

    const result = buildResult(diff);

    return !_.isEmpty(result) ? {
        msg: result
    } : false;
}

export default htmlEquality;