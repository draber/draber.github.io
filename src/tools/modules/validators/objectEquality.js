import assert from 'assert';

const objectEquality = (ref, cur) => {
    let result = false;
    try {
        assert.deepStrictEqual(cur, ref);
    } catch (e) {
        result = {
            msg: {
                ref,
                cur
            }
        };
    }
    return result
}

export default objectEquality;