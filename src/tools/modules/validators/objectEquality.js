import assert from 'assert';

const objectEquality = (expected, actual) => {
    let result = {};
    try {
        assert.deepStrictEqual(actual, expected);
    } catch (e) {
        result = {
            comment: 'The two objects aren’t equal',
            msg: {
                actual,
                expected
            }
        };
    }
    return result
}

export default objectEquality;