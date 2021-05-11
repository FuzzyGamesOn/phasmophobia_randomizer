var PHOTO_RANDO = false;
var LOCAL = (window.location.host === ''); // not fuzzygameson.github.io

$(function () {
    $('body').addClass(getDefaultBackgroundClass());
    $('h4 a').hide(); // hide elimination icons until randomize is clicked

    checkRecentChanges();
    checkDevStream();

    var devStreamTimer = setInterval(checkDevStream, 30000);

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
            
        $('#ghost').val('none');
    });

    $('#randomize_photo_button').on('click', function () {
        resetRandomizer();

        $('#photo').addClass('active');
        $('.actions-secondary-photo').show();

        setLightSources();
        setMaps();

        PHOTO_RANDO = true;
    });

    $('#randomize_photo_next').on('click', function () {
        let available_categories = ['primary', 'secondary'];
        let primary_item_count = $('#primary_items').find('div.item:not(.active)').length;
        let secondary_item_count = $('#secondary_items').find('div.item:not(.active)').length;

        let shuffled = available_categories.sort(function () {
            return 0.5 - Math.random();
        });

        let chosen_category = available_categories[0];

        if (chosen_category == 'primary' && primary_item_count == 0) {
            chosen_category = 'secondary';
        }

        if (chosen_category == 'secondary' && secondary_item_count == 0) {
            chosen_category = 'primary';
        }

        if (primary_item_count == 0 && secondary_item_count == 0) {
            return; // if no items available in both spots, do nothing
        }

        switch (chosen_category) {
            case 'primary':
                setPrimaryItems(/* is_photo */ true);

                break;

            case 'secondary':
                setSecondaryItems(/* is_photo */ true);

                break;
        }
    });

    $('a.eliminate-primary, a.eliminate-secondary, a.eliminate-light, a.eliminate-map').on('click', function () {
        if ($(this).hasClass('eliminate-primary')) disableAndRerollItems('primary');
        if ($(this).hasClass('eliminate-secondary')) disableAndRerollItems('secondary');
        if ($(this).hasClass('eliminate-light')) disableAndRerollItems('light');
        if ($(this).hasClass('eliminate-map')) disableAndRerollItems('map');
    });

    $('a.reroll-primary, a.reroll-secondary, a.reroll-light, a.reroll-map').on('click', function () {
        if ($(this).hasClass('reroll-primary')) {
            rerollItems('primary');

            $('#ghost').val('none');
        }

        if ($(this).hasClass('reroll-secondary')) rerollItems('secondary');
        if ($(this).hasClass('reroll-light')) rerollItems('light');
        if ($(this).hasClass('reroll-map')) rerollItems('map');
    });

    $('a.loss-primary, a.loss-secondary, a.loss-light, a.loss-map').on('click', function () {
        if ($(this).hasClass('loss-primary')) untoggleItem('primary');
        if ($(this).hasClass('loss-secondary')) untoggleItem('secondary');
        if ($(this).hasClass('loss-light')) untoggleItem('light');
        if ($(this).hasClass('loss-map')) untoggleItem('map');
    });

    $('button.count-all').on('click', function () {
        if ($(this).hasClass('count-all-primary')) {
            let category = 'primary';
            let total_items = $('#' + category + '_items').find('div.item').length;

            $('input.count-' + category).val(total_items);
        }

        if ($(this).hasClass('count-all-secondary')) {
            let category = 'secondary';
            let total_items = $('#' + category + '_items').find('div.item').length;

            $('input.count-' + category).val(total_items);
        }

        if ($(this).hasClass('count-all-light')) {
            let total_items = $('#light_sources').find('div.item').length;

            $('input.count-light').val(total_items);
        }

        if ($(this).hasClass('count-all-map')) {
            let total_items = $('#maps').find('div.item').length;

            $('input.count-map').val(total_items);
        }
    });

    $('#view_toggle .btn').click(function () {
        let toggle_value = 'all';

        if ($(this).hasClass('view-usable')) {
            toggle_value = 'usable';
        }

        if ($(this).hasClass('view-not-usable')) {
            toggle_value = 'not-usable';
        }

        $('#view_toggle .btn').removeClass('active');
        $(this).addClass('active');

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

    $('#stream_button').on('click', function () {
        window.open('https://twitch.tv/fuzzygames_', '_blank');
    });

    $('#changelog_button').on('click', function () {
        $('#changelog_modal').modal('show');
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

        // set preference for always including tripod from settings
        if (Settings.include_tripod) {
            $("input[name='include_tripod']").attr('checked', 'checked');
        }
        else {
            $("input[name='include_tripod']").removeAttr('checked');
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
            'include_tripod': $('input.include-tripod').prop('checked') ? true : false,
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
    $('div.item').removeClass('active').removeClass('disabled').removeClass('optional');

    $('#tripod').removeClass('col-md-5').addClass('col-md-3').html(
        $('#tripod').html().replace('Emotional Support Tripod', 'Tripod')
    );

    $('#irlight, #motion, #sound').each(function () {
        $(this).html($(this).html().replace(/Sensor[\!]*/, 'Sensor'));
    });
}

function activateItems(elems, is_photo = false) {
    $('div.item').removeClass('new');

    const formatted_elems = elems.map(function (id) {
        return '#' + id;
    }).join(',');

    $(formatted_elems).addClass('active').removeClass('disabled');

    if (is_photo) {
        $(formatted_elems).addClass('new');
    }

    if (!$('#video').hasClass('active') && $('#tripod').hasClass('active')) {
        $('#tripod').removeClass('col-md-3').addClass('col-md-5').html(
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

function untoggleItem(category) {
    let list = '';

    switch (category) {
        case 'primary':
            list = '#primary_items';
            
            break;

        case 'secondary':
            list = '#secondary_items';
                        
            break;

        case 'light':
            list = '#light_sources';
                        
            break;

        case 'map':
            list = '#maps';
                        
            break;
    }

    let active_items = $(list).find('div.item.active');

    if (active_items.length > 0) {
        let item_to_disable = Math.ceil(Math.random() * (active_items.length - 1));

        $(list).find('div.item.active:eq(' + item_to_disable + ')').removeClass('active');
    }
}

function setPrimaryItems(is_photo = false) {
    let items = _getItemsFromDOM('#primary_items');
    let quantity = Quantity[Settings.difficulty].primary;

    if (Settings.difficulty == 'insane') {
        items = items.filter(function (a) {
            return a !== 'thermo';
        }); 
    }

    if (!is_photo && Settings.difficulty == 'custom') {
        quantity = Settings.count_primary || 0;
    }

    if (is_photo) {
        quantity = 1;
    }

    items = _randomSliceArray(items, quantity, 'primary');

    activateItems(items, is_photo);
}

function setSecondaryItems(is_photo = false) {
    let items = _getItemsFromDOM('#secondary_items');
    let quantity = Quantity[Settings.difficulty].secondary;

    items = items.filter(function (a) {
        return a !== 'lighter' && a !== 'headcam';
    });
    
    /* prevented glowstick from being in pool, but not completely random
    if ($('#uv').hasClass('active')) {
        items = items.filter(function (a) {
            return a !== 'glowstick';
        }); 
    }
    */
    
    if (Settings.difficulty == 'easy' || Settings.difficulty == 'insane') {
        items = items.filter(function (a) {
            return a !== 'sanity';
        });

        if (Settings.difficulty == 'insane') {
            $('#sanity').addClass('active');
        }
    }

    if (Settings.random_secondary === true) {
        if (!is_photo && Settings.difficulty == 'custom') {
            quantity = Settings.count_secondary || 0;
        }

        if (is_photo) {
            quantity = 1;
        }

        items = _randomSliceArray(items, quantity, 'secondary');
    }

    activateItems(items, is_photo);

    if ($('#smudge').hasClass('active') || $('#candle').hasClass('active')) {
        if (is_photo && !$('#lighter').addClass('active')) {
            $('#lighter').addClass('new');
        }

        $('#lighter').addClass('active');
    }

    if ($('#video').hasClass('active')) {
        if (is_photo && !$('#headcam').addClass('active')) {
            $('#headcam').addClass('new');
        }

        $('#headcam').addClass('optional');
    }

    if (Settings.include_tripod) {
        if (is_photo && !$('#tripod').addClass('active')) {
            $('#tripod').addClass('new');
        }

        $('#tripod').addClass('active');
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

        items = _randomSliceArray(items, quantity, 'light_sources');

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
        $('#lighter')
            .removeClass('active').removeClass('optional')
            .addClass('optional'); // lazy
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
            // rip grafton being the deadliest map in the game
            items = ['highschool', 'prison', 'asylum'];
        }

        if (Settings.difficulty == 'custom') {
            quantity = Settings.count_map || 0;
        }

        items = _randomSliceArray(items, quantity, 'maps');
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

        $('#ghost').hide();
    }
    else {
        $('h4').show();
        $('#view_heading').hide();

        $('div.item-collection').addClass('row');
        $('div.item').removeClass('no-float').addClass('col-md-3');

        $('#ghost').show();
    }
    
    /* 
     * not sure why this was here. will come back to it.    
        if ($('div.item.active').length === 0) {
            $('h4').show();
        }
     *
     */

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
    PHOTO_RANDO = false;

    clearItems();
    toggleItemView('all');

    $('#view_toggle .btn').removeClass('active');
    $('#view_toggle .btn.view-all').addClass('active');

    $('span.eliminate-count').html('');
    $('.actions-secondary-photo').hide();
    $('h4 a').show();
}

function checkRecentChanges() {
    let callback = function (data) {
        if (!data) { // being lazy
            return false;
        }

        let current_version = data[0];
        let modal_contents = $('#changelog_modal div.modal-body');

        $('<h4 />').html(current_version.version).appendTo(modal_contents);

        let change_list = $('<ul />').appendTo(modal_contents);

        for (let changed of current_version.changes) {
            $('<li />').html(changed).appendTo(change_list);
        }
    };

    if (LOCAL) {
        callback([
            {
                "version": "1.1",
        
                "changes": [
                    "Added a changelog and notification about active development.",
                    "Removed Grafton from difficult map list because it is no longer a death trap.",
                    "Remove automatic enabling of candle and glowstick, as the QoL change caused some confusion.",
                    "Lighter and head camera are a different color when required by other items to indicate that they're optional or not included in settings."
                ]
            }
        ]);
    }
    else {
        $.get('changelog.json', callback, 'json');
    }
}

function checkDevStream() {
    let callback = function (data) {
        if (!data) { // being lazy
            return false;
        }

        if (data.dev_stream === true) {
            $('#changelog_button').hide();
            $('#stream_button').show();
        }
        else {
            $('#stream_button').hide();
            $('#changelog_button').show();
        }
    };

    if (LOCAL) {
        callback({
            'dev_stream': false
        });
    }
    else {
        $.get('settings.json', callback, 'json');
    }
}

function _getItemsFromDOM(div_id) {
    let items = [];

    $(div_id).find('div.item').each(function () {
        if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
            items.push($(this).attr('id'));
        }
    });

    return items;
}

let last_choices = {
    'primary': [],
    'secondary': [],
    'light_sources': [],
    'maps': []
};

function _randomSliceArray(arr, len, arr_type) {
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

    let choices = shuffled.slice(0, len);

    if (len == 1) {        
        if (last_choices[arr_type].length > 2) {
            last_choices[arr_type].shift(); // pop off the oldest item from the front of the list
        }

        // TODO: better checking for dupes in last used list
        if (last_choices[arr_type].indexOf(choices[0]) > -1) {
            choices = shuffled.slice(1, 2);

            if (last_choices[arr_type].indexOf(choices[1]) > -1) {
                choices = shuffled.slice(2, 3);
            }
        }

        console.log(shuffled, choices);

        last_choices[arr_type].push(choices[0]);
    }

    return choices;
}