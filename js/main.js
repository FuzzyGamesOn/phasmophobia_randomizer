$(function () {
    $('#randomize_button').on('click', function () {
        clearItems();

        setPrimaryItems();
        setSecondaryItems();
        setLightSources();
        setMaps();
    });

    $('#settings_button').on('click', function () {
        $('#settings_modal').modal('show');

        // set difficulty from settings
        $("button.difficulty").removeClass('active');
        $("button[name='difficulty_" + Settings.difficulty + "']").addClass('active');

        // set secondary random from settings
        if (Settings.random_secondary) {
            $("input[name='random_secondary']").attr('checked', 'checked');
        }
        else {
            $("input[name='random_secondary']").removeAttr('checked');
        }

        // set light random from settings
        if (Settings.random_light) {
            $("input[name='random_light']").attr('checked', 'checked');
        }
        else {
            $("input[name='random_light']").removeAttr('checked');
        }

        // set map random from settings
        if (Settings.random_map) {
            $("input[name='random_map']").attr('checked', 'checked');
        }
        else {
            $("input[name='random_map']").removeAttr('checked');
        }

        // set layout chroma from settings
        if (Settings.layout_chroma) {
            $("input[name='layout_chroma']").attr('checked', 'checked');
        }
        else {
            $("input[name='layout_chroma']").removeAttr('checked');
        }
    });

    $('button.difficulty').on('click', function () {
        $('button.difficulty').removeClass('active');
        $(this).addClass('active');
    });

    $('input.random-secondary').on('change', function () {
        if ($(this).prop('checked')) {
            $('#secondary_items_heading, #secondary_items').show();
        }
        else {
            $('#secondary_items_heading, #secondary_items').hide();
        }
    });

    $('input.random-light').on('change', function () {
        if ($(this).prop('checked')) {
            $('#light_sources_heading, #light_sources').show();
        }
        else {
            $('#light_sources_heading, #light_sources').hide();
        }
    });

    $('input.random-map').on('change', function () {
        if ($(this).prop('checked')) {
            $('#maps_heading, #maps').show();
        }
        else {
            $('#maps_heading, #maps').hide();
        }
    });

    $('input.layout-chroma').on('change', function () {
        if ($(this).prop('checked')) {
            $('body').addClass('chroma');
        }
        else {
            $('body').removeClass('chroma');
        }
    });

    $('#save_settings_button').on('click', function () {
        Settings.commit({
            'difficulty': $('button.difficulty.active').attr('name').replace('difficulty_', ''),
            'random_secondary': $('input.random-secondary').prop('checked') ? true : false,
            'random_light': $('input.random-light').prop('checked') ? true : false,
            'random_map': $('input.random-map').prop('checked') ? true : false,
            'layout_chroma': $('input.layout-chroma').prop('checked') ? true : false
        });

        Settings.store();

        $('#settings_modal').modal('hide');
    });

    Settings.retrieve();

    applySettings();
});

function applySettings() {
    if (Settings.layout_chroma === true) {
        $('body').addClass('chroma');
    }
}

function clearItems() {
    $('div.item').removeClass('active');
}

function activateItems(elems) {
    const formatted_elems = elems.map(function (id) {
        return '#' + id;
    }).join(',');

    $(formatted_elems).addClass('active');
}

function setPrimaryItems() {
    let items = _getItemsFromDOM('#primary_items');

    items = _randomSliceArray(items, Quantity[Settings.difficulty].primary);

    activateItems(items);
}

function setSecondaryItems() {
    let items = _getItemsFromDOM('#secondary_items');

    if (Settings.random_secondary === true) {
        items = _randomSliceArray(items, Quantity[Settings.difficulty].secondary);
    }

    activateItems(items);
}

function setLightSources() {
    let items = _getItemsFromDOM('#light_sources');

    if (Settings.random_light === true) {
        // leave out candle for easy/normal
        if (['easy', 'normal'].indexOf(Settings.difficulty) > -1) {
            items = ['flash', 'strongflash'];
        }

        items = _randomSliceArray(items, 1);

        // only candle for hard
        if (Settings.difficulty == 'hard') {
            items = ['candle'];
        }
    
        // no light items for insane
        if (Settings.difficulty == 'insane') {
            items = [];
        }
    }

    activateItems(items);
}

function setMaps() {
    let items = _getItemsFromDOM('#maps');

    if (Settings.random_map == true) {
        if (Settings.difficulty == 'easy') {
            items = items.filter(function (map) {
                // return any maps that aren't medium or higher
                return ['highschool', 'prison', 'asylum'].indexOf(map) === -1;
            });
        }

        if (Settings.difficulty == 'normal') {
            items = items.filter(function (map) {
                // return any maps that aren't asylum
                return map != 'asylum';
            });
        }

        if (['hard', 'insane'].indexOf(Settings.difficulty) > -1) {
            // only use medium or higher maps, plus the deadliest map in the game
            items = ['highschool', 'prison', 'asylum', 'grafton'];
        }

        items = _randomSliceArray(items, 1);
    }

    activateItems(items);
}

function _getItemsFromDOM(div_id) {
    let items = [];

    $(div_id).find('div.item').each(function () {
        items.push($(this).attr('id'));
    });

    return items;
}

function _randomSliceArray(arr, len) {
    if (!len) {
        len = 1;
    }

    let shuffled = arr.sort(function () { 
        return 0.5 - Math.random(); 
    });

    let reverse_shuffled = (Math.floor(Math.random() * 100)) % 2 == 0;

    if (reverse_shuffled) {
        shuffled = shuffled.reverse();
    }

    // shuffle again for more random
    shuffled = arr.sort(function () { 
        return 0.5 - Math.random(); 
    });

    return shuffled.slice(0, len);
}