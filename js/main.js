$(function () {
    $('body').addClass(getDefaultBackgroundClass());
    $('h4 a').hide(); // hide elimination icons until randomize is clicked

    $('#ghost').on('change', function () {
        let evidences = {
            'banshee': ['emf', 'uv', 'thermo'],
            'demon': ['book', 'box', 'thermo'],
            'jinn': ['emf', 'box', 'video'],
            'mare': ['box', 'video', 'thermo'],
            'oni': ['emf', 'book', 'box'],
            'phantom': ['emf', 'video', 'thermo'],
            'poltergeist': ['box', 'uv', 'video'],
            'revenant': ['emf', 'uv', 'book'],
            'shade': ['emf', 'video', 'book'],
            'spirit': ['box', 'uv', 'book'],
            'wraith': ['box', 'uv', 'thermo'],
            'yurei': ['video', 'book', 'thermo']
        };

        let toggle_evidences = evidences[$(this).val()] || [];

        resetRandomizer();

        if (toggle_evidences.length > 0) {
            for (evidence of toggle_evidences) {
                $('#' + evidence).addClass('active');
            }

            setSecondaryItems();
            setLightSources();
            setMaps();
        }
    });

    $('#randomize_button').on('click', function () {
        resetRandomizer();

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

    $('a.reroll-primary, a.reroll-secondary, a.reroll-light, a.reroll-map').on('click', function () {
        if ($(this).hasClass('reroll-primary')) rerollItems('primary');
        if ($(this).hasClass('reroll-secondary')) rerollItems('secondary');
        if ($(this).hasClass('reroll-light')) rerollItems('light');
        if ($(this).hasClass('reroll-map')) rerollItems('map');
    });

    $('#view_toggle .btn').click(function () {
        let toggle_value = 'all';

        if ($(this).hasClass('view-usable')) {
            toggle_value = 'usable';
        }

        if ($(this).hasClass('view-not-usable')) {
            toggle_value = 'not-usable';
        }

        $('#view_toggle .btn').removeClass('enabled');
        $(this).addClass('enabled');

        toggleItemView(toggle_value);
    });

    $('a.hide-tip-icons').on('click', function () {
        Settings.commitSingle('tip_icons', false);
        Settings.store();

        $('p.tip-icons').hide();
    });

    $('a.hide-tip-builtin').on('click', function () {
        Settings.commitSingle('tip_builtin', false);
        Settings.store();

        $('p.tip-builtin').hide();
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
            $('body')
                .removeClass(['default', 'default2', 'default3', 'tanglewood', 'edgefield', 'ridgeview', 'grafton', 'bleasdale', 'highschool', 'asylum', 'prison'])
                .addClass('chroma');
        }
        else {
            $('body').addClass(getDefaultBackgroundClass()).removeClass('chroma');
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

    if (Settings.tip_builtin === true) {
        $('p.tip-builtin').show().find('a.glyphicon-remove').css({ 'float': 'right' });
    }
}

function clearItems() {
    $('div.item').removeClass('active').removeClass('disabled');

    $('#tripod').removeClass('col-md-4').addClass('col-md-3').html(
        $('#tripod').html().replace('Emotional Support Tripod', 'Tripod')
    );

    $('#irlight, #motion, #sound').each(function () {
        $(this).html($(this).html().replace(/Sensor[\!]*/, 'Sensor'));
    });
}

function activateItems(elems) {
    const formatted_elems = elems.map(function (id) {
        return '#' + id;
    }).join(',');

    $(formatted_elems).addClass('active').removeClass('disabled');

    if (!$('#video').hasClass('active') && $('#tripod').hasClass('active')) {
        $('#tripod').removeClass('col-md-3').addClass('col-md-4').html(
            $('#tripod').html().replace(/^Tripod/, 'Emotional Support Tripod')
        );
    }

    $('#irlight, #motion, #sound').each(function () {
        if ($(this).hasClass('active')) {
            $(this).html($(this).html().replace(/Sensor[\!]*/, 'Sensor!!'));
        }
    });
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

function rerollItems(category) {
    switch (category) {
        case 'primary':
            $('#primary_items div.item.active').removeClass('active');
            setPrimaryItems();
            
            break;

        case 'secondary':
            $('#secondary_items div.item.active').removeClass('active');
            setSecondaryItems();
                        
            break;

        case 'light':
            $('#light_sources div.item.active').removeClass('active');
            setLightSources();
                        
            break;

        case 'map':
            $('#maps div.item.active').removeClass('active');
            setMaps();
                        
            break;
    }
}

function setPrimaryItems() {
    let items = _getItemsFromDOM('#primary_items');
    let quantity = Quantity[Settings.difficulty].primary;

    if (Settings.difficulty == 'insane') {
        items = items.filter(function (a) {
            return a !== 'thermo';
        }); 
    }

    if (Settings.difficulty == 'custom') {
        quantity = Settings.count_primary || 0;
    }

    items = _randomSliceArray(items, quantity);

    activateItems(items);
}

function setSecondaryItems() {
    let items = _getItemsFromDOM('#secondary_items');
    let quantity = Quantity[Settings.difficulty].secondary;

    items = items.filter(function (a) {
        return a !== 'lighter' && a !== 'headcam';
    });
    
    if ($('#uv').hasClass('active')) {
        items = items.filter(function (a) {
            return a !== 'glowstick';
        }); 
    }

    if (Settings.random_secondary === true) {
        if (Settings.difficulty == 'custom') {
            quantity = Settings.count_secondary || 0;
        }

        items = _randomSliceArray(items, quantity);
    }

    if (Settings.difficulty == 'easy' || Settings.difficulty == 'insane') {
        items = items.filter(function (a) {
            return a !== 'sanity';
        });

        if (Settings.difficulty == 'insane') {
            $('#sanity').addClass('active');
        }
    }

    activateItems(items);

    if ($('#smudge').hasClass('active') || $('#candle').hasClass('active')) {
        $('#lighter').addClass('active');
    }

    if ($('#video').hasClass('active')) {
        $('#headcam').addClass('active');
    }
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

    if ($('#smudge').hasClass('active') || $('#candle').hasClass('active')) {
        $('#lighter').removeClass('active').addClass('active'); // lazy
    }
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

    if (Settings.layout_chroma !== true) {
        let active_map = $('#maps').find('div.item.active');

        if (active_map.length > 0) {
            $('body')
                .removeClass(['default', 'tanglewood', 'edgefield', 'ridgeview', 'grafton', 'bleasdale', 'highschool', 'asylum', 'prison'])
                .addClass(active_map.attr('id'));
        }
    }
}

function getDefaultBackgroundClass() {
    let background_classes = ['default', 'default2', 'default3'];

    let shuffled = background_classes.sort(function () {
        return 0.5 - Math.random();
    });

    let reverse_shuffled = (Math.floor(Math.random() * 100)) % 2 == 0;

    if (reverse_shuffled) {
        shuffled = shuffled.reverse();
    }

    return shuffled[0];
}

function toggleItemView(toggle_value) {   
    if (toggle_value == 'usable' || toggle_value == 'not-usable') {
        $('h4').hide();
        $('#view_heading').show().html((toggle_value == 'usable' ? 'Use:' : 'Don\'t Use:'));

        $('div.item-collection').removeClass('row');
        $('div.item').addClass('no-float').removeClass('col-md-3');
    }
    else {
        $('h4').show();
        $('#view_heading').hide();

        $('div.item-collection').addClass('row');
        $('div.item').removeClass('no-float').addClass('col-md-3');
    }
    
    if ($('div.item.active').length === 0) {
        $('h4').show();
    }

    switch (toggle_value) {
        case 'all':
            $('div.item').show();

            break;

        case 'usable':            
            if ($('div.item.active').length === 0) {
                return false;
            }

            $('div.item.active').show();
            $('div.item:not(.active)').hide();

            break;

        case 'not-usable':            
            if ($('div.item.active').length === 0) {
                return false;
            }

            $('div.item.active').hide();
            $('div.item:not(.active)').show();

            break;
    }
}

function resetRandomizer() {
    clearItems();
    toggleItemView('all');
    $('#view_heading').hide();

    $('#view_toggle .btn').removeClass('enabled');
    $('#view_toggle .btn.view-all').addClass('enabled');

    $('span.eliminate-count').html('');
    $('h4 a').show();
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