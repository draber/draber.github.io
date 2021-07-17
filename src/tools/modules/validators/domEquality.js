import * as cmp from 'dom-compare';
import _ from 'lodash';

// tmp
const compare = cmp.default.compare;
const reporter = cmp.default.GroupingReporter;

const domEquality = (ref, current) => {
    const result = reporter.getDifferences(compare(ref, current));
    return !_.isEmpty(result) ? {
        msg: result
    } : false;
}

export default domEquality;