import * as cmp from 'dom-compare';

// tmp
const compare = cmp.default.compare;
const reporter = cmp.default.GroupingReporter;

const isEmpty = obj => {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

const domEquality = (ref, current) => {
    const result = reporter.getDifferences(compare(ref, current));
    return {
        msg: isEmpty(result) ? false : result
    };
}

export default domEquality;