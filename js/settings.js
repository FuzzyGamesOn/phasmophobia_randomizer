const Settings = {
    difficulty: null,
    random_light: null,
    random_secondary: null,
    random_map: null,
    layout_chroma: null,
    tip_icons: null,
    count_primary: '',
    count_secondary: '',
    count_light: '',
    count_map: '',

    commit(params) {
        if (['easy', 'normal', 'hard', 'insane', 'custom'].indexOf(params.difficulty) == -1) {
            params.difficulty = 'easy';
        }

        if (params.random_light !== true && params.random_light !== false) {
            params.random_light = true;
        }

        if (params.random_secondary !== true && params.random_secondary !== false) {
            params.random_secondary = true;
        }

        if (params.random_map !== true && params.random_map !== false) {
            params.random_map = true;
        }

        if (params.layout_chroma !== true && params.layout_chroma !== false) {
            params.layout_chroma = false;
        }

        if (params.tip_icons !== true && params.tip_icons !== false) {
            params.tip_icons = false;
        }

        this.difficulty = params.difficulty;
        this.random_light = params.random_light;
        this.random_secondary = params.random_secondary;
        this.random_map = params.random_map;
        this.layout_chroma = params.layout_chroma;
        this.tip_icons = params.tip_icons;

        this.count_primary = params.count_primary || '';
        this.count_secondary = params.count_secondary || '';
        this.count_light = params.count_light || '';
        this.count_map = params.count_map || '';
    },

    commitSingle(name, value) {
        // TODO: add check for a valid setting name before arbitrarily setting properties
        
        this[name] = value;
    },

    retrieve() {
        this.difficulty = Storage.get('difficulty');
        this.random_light = Storage.get('random_light');
        this.random_secondary = Storage.get('random_secondary');
        this.random_map = Storage.get('random_map');
        this.layout_chroma = Storage.get('layout_chroma');
        this.tip_icons = Storage.get('tip_icons');
        
        this.count_primary = Storage.get('count_primary') || '';
        this.count_secondary = Storage.get('count_secondary') || '';
        this.count_light = Storage.get('count_light') || '';
        this.count_map = Storage.get('count_map') || '';

        if (['easy', 'normal', 'hard', 'insane', 'custom'].indexOf(this.difficulty) == -1) {
            this.difficulty = 'easy';
        }

        if (this.random_light == null) {
            this.random_light = true;
        }

        if (this.random_secondary == null) {
            this.random_secondary = true;
        }

        if (this.random_map == null) {
            this.random_map = true;
        }

        if (this.layout_chroma == null) {
            this.layout_chroma = false;
        }

        if (this.tip_icons == null) {
            this.tip_icons = true;
        }
    },

    store() {
        Storage.set('difficulty', this.difficulty);
        Storage.set('random_light', this.random_light);
        Storage.set('random_secondary', this.random_secondary);
        Storage.set('random_map', this.random_map);
        Storage.set('layout_chroma', this.layout_chroma);

        Storage.set('count_primary', this.count_primary);
        Storage.set('count_secondary', this.count_secondary);
        Storage.set('count_light', this.count_light);
        Storage.set('count_map', this.count_map);

        Storage.set('tip_icons', this.tip_icons);

        Storage.commit();
    }
};