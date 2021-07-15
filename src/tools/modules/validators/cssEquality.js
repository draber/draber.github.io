import Diff from 'text-diff';

const cssEquality = (ref, current) => {

    const diff = new Diff();
    return diff.main(ref, current);
}

export default cssEquality;