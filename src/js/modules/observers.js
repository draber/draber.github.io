/**
 * Observer registry
 * @type {Array}
 */
let observers = [];

export default {
    /**
     * Register an observer
     * @param observer
     * @param target
     * @param options
     * @returns {number}
     */
    add: (observer, target, options) => {
        observer.observe(target, options);
        return observers.push(observer);
    },
    /**
     * Remove an observer
     * @param observer
     * @returns {number}
     */
    remove: observer => {
        observer.disconnect();
        observers = observers.filter(function (_observer) {
            return _observer !== observer;
        });
        return observers.length;
    },
    /**
     * Remove all observers
     * @returns {number}
     */
    removeAll: function() {
        observers.forEach(observer => {
            this.remove(observer);
        });
        return observers.length;
    },
    get: () => observers
}