import * as cmp from 'dom-compare';
import _ from 'lodash';
import {
    DOMParser
} from 'xmldom';

// tmp
const compare = cmp.default.compare;
const reporter = cmp.default.GroupingReporter;

const domParse = string => {
    return new DOMParser({
        locator: {},
        errorHandler: {
            warning: w => {},
            error: e => {},
            fatalError: e => {
                logger.error(e)
            }
        }
    }).parseFromString(string);
}

const domEquality = (reference, current) => {
    reference = domParse(reference);
    current = domParse(current);
    const result = reporter.getDifferences(compare(reference, current));
    return !_.isEmpty(result) ? {
        msg: result
    } : false;
}

export default domEquality;