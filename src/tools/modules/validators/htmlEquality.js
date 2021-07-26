import _ from 'lodash';
import {
    HtmlDiffer
} from '@markedjs/html-differ';
import htmlDiffLogger from '@markedjs/html-differ/lib/logger.js';

const htmlEquality = async (ref, cur) => {
    const htmlDiffer = new HtmlDiffer();

    const diff = await htmlDiffer.diffHtml(ref, cur);
    let result = htmlDiffLogger.getDiffText(diff);
    result = result.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    result = result.split('...').map(entry => entry.trim()).filter(entry => entry);

    return !_.isEmpty(result) ? {
        msg: result
    } : false;
}

export default htmlEquality;