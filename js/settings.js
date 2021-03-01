const Settings = {
    difficulty: null,
    random_light: null,
    random_secondary: null,
    layout_chroma: null,

    commit(params) {
        if (['easy', 'normal', 'hard', 'insane'].indexOf(params.difficulty) == -1) {
            params.difficulty = 'easy';
        }

        if (params.random_light !== true && params.random_light !== false) {
            params.random_light = true;
        }

        if (params.random_secondary !== true && params.random_secondary !== false) {
            params.random_secondary = true;
        }

        if (params.layout_chroma !== true && params.layout_chroma !== false) {
            params.layout_chroma = false;
        }

        this.difficulty = params.difficulty;
        this.random_light = params.random_light;
        this.random_secondary = params.random_secondary;
        this.layout_chroma = params.layout_chroma;
    },

    retrieve() {
        this.difficulty = Storage.get('difficulty');
        this.random_light = Storage.get('random_light');
        this.random_secondary = Storage.get('random_secondary');
        this.layout_chroma = Storage.get('layout_chroma');

        if (['easy', 'normal', 'hard', 'insane'].indexOf(this.difficulty) == -1) {
            this.difficulty = 'easy';
        }

        if (this.random_light == null) {
            this.random_light = true;
        }

        if (this.random_secondary == null) {
            this.random_secondary = true;
        }

        if (this.layout_chroma == null) {
            this.layout_chroma = false;
        }
    },

    store() {
        Storage.set('difficulty', this.difficulty);
        Storage.set('random_light', this.random_light);
        Storage.set('random_secondary', this.random_secondary);
        Storage.set('layout_chroma', this.layout_chroma);

        Storage.commit();
    }
};