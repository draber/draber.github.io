let observers = [];

export default {
    add: (observer, target, options) => {
        observer.observe(target, options);
        observers.push(observer);
        return true;
    },

    remove: observer => {
        observer.disconnect();
        observers = observers.filter(function (_observer) {
            return _observer !== observer;
        });
    },

    removeAll: function() {
        observers.forEach(observer => {
            this.remove(observer);
        })
    }
}