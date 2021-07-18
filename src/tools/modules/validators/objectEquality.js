import assert from 'assert';

const objectEquality = (ref, cur) => {
    let result = false;
    try {
        assert.deepStrictEqual(cur, ref);
    } catch (e) {
        result = {
            comment: 'The two objects aren’t equal',
            msg: {
                ref,
                current: cur
            }
        };
    }
    return result
}

export default objectEquality;