import {
    DOMParser
} from 'xmldom';
import * as cmp from 'dom-compare';
import log from '../../modules/logger.js';
import { format } from '../format.js';

// tmp
const compare = cmp.default.compare;
const reporter = cmp.default.GroupingReporter;

const parserConfig = {
    locator: {},
    errorHandler: {
        warning: w => {},
        error: e => {},
        fatalError: e => {
            log(e, 'error')
        }
    }
}

const htmlValidator = (ref, current) => {
    const result = compare(
        new DOMParser(parserConfig).parseFromString(ref),
        new DOMParser(parserConfig).parseFromString(current)
    );
    return format('Dom Comparison', JSON.stringify(reporter.getDifferences(result)));
}

export {
    htmlValidator
}