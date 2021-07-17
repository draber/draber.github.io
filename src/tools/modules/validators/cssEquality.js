import _ from 'lodash';

const result = {}

/**
 *
 * @param unordered
 * @returns {{}}
 */
const sortObjByKey = unordered => {
    return Object.keys(unordered).sort().reduce(
        (ordered, key) => {
            ordered[key] = unordered[key];
            return ordered;
        }, {}
    );
}

/**
 * Ensure all rules are inside a scope (@media, @keyframes etc., defaults to @unscoped}
 * @param {String} rules
 * @returns {string|*}
 */
const normalizeRules = rules => {
    return !rules.startsWith('@') ? `@unscoped { ${rules} }` : rules;
}

/**
 *
 * @param rule
 * @param type
 * @returns {{}}
 */
const parse = (rule, type) => {
    const contextData = normalizeRules(rule).match(/^(?<context>@[^{]+){(?<rules>.*)}$/);
    const context = contextData.groups.context.trim();
    result[context] = result[context] || {};
    const rules = contextData.groups.rules.trim();
    const ruleMatches = rules.matchAll(/(?<selector>[^{]+){(?<values>[^}]+)}/g);
    for (let match of ruleMatches) {
        const selector = match.groups.selector.trim();
        const values = match.groups.values.trim().split(';').map(entry => entry.trim()).filter(entry => !!entry);
        result[context][selector] = result[context][selector] || {};
        values.forEach(value => {
            value = value.split(':').map(entry => entry.trim());
            const key = _.camelCase(value[0]);
            result[context][selector][key] = result[context][selector][key] || {
                ref: '_none_',
                cur: '_none_'
            };
            result[context][selector][key][type] = value[1].replace(/;$/, '').trim();
            if (type === 'cur') {
                if (result[context][selector][key].ref === result[context][selector][key].cur) {
                    delete result[context][selector][key];
                }
            }
        })
        if (_.isEmpty(result[context][selector])) {
            delete result[context][selector];
        } else {

            result[context][selector] = sortObjByKey(result[context][selector]);
        }
    }

    return result;
}

/**
 *
 * @param ref
 * @param cur
 * @returns {Map<string, undefined>}
 */
const diff = (ref, cur) => {
    return new Map([
        ['ref', ref.map(entry => entry.trim()).filter(rule => !cur.includes(rule))],
        ['cur', cur.map(entry => entry.trim()).filter(rule => !ref.includes(rule))],
    ]);
}

/**
 * Test two stylesheets for equality
 * @param {Array} ref (CSS)
 * @param {Array} cur
 * @returns {{msg: {}}|boolean}
 */
const cssEquality = (ref, cur) => {

    diff(ref, cur).forEach((rules, type) => {
        rules.map(entry => parse(entry, type));
    });

    return !_.isEmpty(result) ? {
        msg: result
    } : false;
}

export default cssEquality;