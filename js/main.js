$(function () {
    $('#randomize_button').on('click', function () {
        clearItems();
        $('span.eliminate-count').html('');

        setPrimaryItems();
        setSecondaryItems();
        setLightSources();
        setMaps();
    });

    $('a.eliminate-primary, a.eliminate-secondary, a.eliminate-light, a.eliminate-map').on('click', function () {
        if ($(this).hasClass('eliminate-primary')) disableAndRerollItems('primary');
        if ($(this).hasClass('eliminate-secondary')) disableAndRerollItems('secondary');
        if ($(this).hasClass('eliminate-light')) disableAndRerollItems('light');
        if ($(this).hasClass('eliminate-map')) disableAndRerollItems('map');
    });

    $('a.hide-tip-icons').on('click', function () {
        Settings.commitSingle('tip_icons', false);
        Settings.store();

        $('p.tip-icons').hide();
    });

    $('#settings_button').on('click', function () {
        $('#settings_modal').modal('show');

        // set difficulty from settings
        $("button.difficulty").removeClass('active');
        $("button[name='difficulty_" + Settings.difficulty + "']").addClass('active');

        if (Settings.difficulty == 'custom') {
            $('input.count-primary').val(Settings.count_primary);
            $('input.count-secondary').val(Settings.count_secondary);
            $('input.count-light').val(Settings.count_light);
            $('input.count-map').val(Settings.count_map);

            $('#custom_counts').show();
        }
        else {
            $('#custom_counts').hide();
        }

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

        if ($(this).attr('name') == 'difficulty_custom') {
            $('#custom_counts').show();
        }
        else {
            $('#custom_counts').hide();
        }
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
            'layout_chroma': $('input.layout-chroma').prop('checked') ? true : false,
            'count_primary': $('input.count-primary').val() || '',
            'count_secondary': $('input.count-secondary').val() || '',
            'count_light': $('input.count-light').val() || '',
            'count_map': $('input.count-map').val() || ''
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

    if (Settings.random_secondary === false) {
        $('#secondary_items_heading, #secondary_items').hide();
    }

    if (Settings.random_light === false) {
        $('#light_sources_heading, #light_sources').hide();
    }

    if (Settings.random_map === false) {
        $('#maps_heading, #maps').hide();
    }

    if (Settings.tip_icons === true) {
        $('p.tip-icons').show().find('a.glyphicon-remove').css({ 'float': 'right' });
    }
}

function clearItems() {
    $('div.item').removeClass('active').removeClass('disabled');
}

function activateItems(elems) {
    const formatted_elems = elems.map(function (id) {
        return '#' + id;
    }).join(',');

    $(formatted_elems).addClass('active').removeClass('disabled');
}

function disableAndRerollItems(category) {
    switch (category) {
        case 'primary':
            $('#primary_items div.item.active').removeClass('active').addClass('disabled');
            setPrimaryItems();
            $('span.eliminate-primary-count').html(parseInt($('span.eliminate-primary-count').html() || 0, 10) + 1);

            break;

        case 'secondary':
            $('#secondary_items div.item.active').removeClass('active').addClass('disabled');
            setSecondaryItems();
            $('span.eliminate-secondary-count').html(parseInt($('span.eliminate-secondary-count').html() || 0, 10) + 1);
            
            break;

        case 'light':
            $('#light_sources div.item.active').removeClass('active').addClass('disabled');
            setLightSources();
            $('span.eliminate-light-count').html(parseInt($('span.eliminate-light-count').html() || 0, 10) + 1);
            
            break;

        case 'map':
            $('#maps div.item.active').removeClass('active').addClass('disabled');
            setMaps();
            $('span.eliminate-map-count').html(parseInt($('span.eliminate-map-count').html() || 0, 10) + 1);
            
            break;
    }
}

function setPrimaryItems() {
    let items = _getItemsFromDOM('#primary_items');
    let quantity = Quantity[Settings.difficulty].primary;

    if (Settings.difficulty == 'custom') {
        quantity = Settings.count_primary || 0;
    }

    items = _randomSliceArray(items, quantity);

    activateItems(items);
}

function setSecondaryItems() {
    let items = _getItemsFromDOM('#secondary_items');
    let quantity = Quantity[Settings.difficulty].secondary;

    if (Settings.random_secondary === true) {
        if (Settings.difficulty == 'custom') {
            quantity = Settings.count_secondary || 0;
        }

        items = _randomSliceArray(items, quantity);
    }

    activateItems(items);
}

function setLightSources() {
    let items = _getItemsFromDOM('#light_sources');
    let quantity = 1;

    if (Settings.random_light === true) {
        // leave out candle for easy/normal
        if (['easy'].indexOf(Settings.difficulty) > -1) {
            items = ['flash', 'strongflash'];
        }

        if (['normal'].indexOf(Settings.difficulty) > -1) {
            items = ['flash', 'strongflash', 'candle'];
        }

        if (Settings.difficulty == 'custom') {
            quantity = Settings.count_light || 0;
        }

        items = _randomSliceArray(items, quantity);

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
    let quantity = 1;

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

        if (Settings.difficulty == 'custom') {
            quantity = Settings.count_map || 0;
        }

        items = _randomSliceArray(items, quantity);
    }

    activateItems(items);
}

function _getItemsFromDOM(div_id) {
    let items = [];

    $(div_id).find('div.item').each(function () {
        if (!$(this).hasClass('disabled')) {
            items.push($(this).attr('id'));
        }
    });

    return items;
}

function _randomSliceArray(arr, len) {
    if (!len) {
        len = 1;
    }

    // lazy sort to be more random sort, because lazy
    let shuffled = arr.sort(function () { 
        return 0.5 - Math.random(); 
    }).sort(function () { 
        return 0.5 - Math.random(); 
    }).sort(function () { 
        return 0.5 - Math.random(); 
    });

    let reverse_shuffled = (Math.floor(Math.random() * 100)) % 2 == 0;

    if (reverse_shuffled) {
        shuffled = shuffled.reverse();
    }

    // shuffle again for more random
    // more lazy sort, don't judge me
    shuffled = arr.sort(function () { 
        return 0.5 - Math.random(); 
    }).sort(function () { 
        return 0.5 - Math.random(); 
    }).sort(function () { 
        return 0.5 - Math.random(); 
    });

    return shuffled.slice(0, len);
}