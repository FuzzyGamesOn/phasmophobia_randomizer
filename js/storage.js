const Storage = {
    data: {},

    load() {
        let retrieved = null;

        try {
            retrieved = JSON.parse(window.name);
        }
        catch (e) {}

        this.data = retrieved || {};
    },

    get(key) {
        if (Object.keys(this.data).length == 0) {
            this.load();
        }

        return this.data[key];
    },

    set(key, val) {
        if (Object.keys(this.data).length == 0) {
            this.load();
        }

        this.data[key] = val;
    },

    commit() {
        if (Object.keys(this.data).length == 0) {
            throw 'Can not commit an empty object';
        }

        window.name = JSON.stringify(this.data);
    }
};