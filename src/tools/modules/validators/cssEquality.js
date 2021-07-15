const cssEquality = (ref, current) => {

    ref = ref.map(entry => entry.trim());
    current = current.map(entry => entry.trim());

    const comp = {
        ref: ref.filter(rule => !current.includes(rule)),
        current: current.filter(rule => !ref.includes(rule))
    }
    return comp.ref.length || comp.current.length ? { msg: comp } : false;
}

export default cssEquality;