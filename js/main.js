var PHOTO_RANDO = false;
var LOCAL = (window.location.host === ''); // not fuzzygameson.github.io

$(function () {
    $('body').addClass(getDefaultBackgroundClass());

    if (LOCAL) {
        $('body').addClass('local');
    }

    /**
     * Add tooltips to icons in headings
     */
    tippy('h4 a.glyphicon-ban-circle', {
        content: $('h4 a.glyphicon-ban-circle').first().attr('title')
    });

    tippy('h4 a.glyphicon-repeat', {
        content: $('h4 a.glyphicon-repeat').first().attr('title')
    });

    tippy('h4 a.glyphicon-minus', {
        content: $('h4 a.glyphicon-minus').first().attr('title')
    });

    $('h4 a').hide(); // hide elimination icons until randomize is clicked

    checkRecentChanges();
    checkDevStream();

    // intentionally global
    devStreamTimer = setInterval(checkDevStream, 30000);
    devStreamVisibilityTimer = null;

    $('#ghost_randomizer').on('change', function () {
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
            
        $('#ghost_randomizer').val('none');
    });

    $('#randomize_photo_button').on('click', function () {
        resetRandomizer();

        $('#photo').addClass('active');
        $('.actions-secondary-photo').show();

        setLightSources();
        setMaps();
        
        $('#ghost_randomizer').val('none');

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

            $('#ghost_randomizer').val('none');
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

    $('a.hide-tip-elim').on('click', function () {
        Settings.commitSingle('tip_elim', false);
        Settings.store();

        $('p.tip-elim').hide();
    });

    $('a.hide-tip-auto').on('click', function () {
        Settings.commitSingle('tip_auto', false);
        Settings.store();

        $('p.tip-auto').hide();
    });

    $('a.hide-tip-chroma').on('click', function () {
        Settings.commitSingle('tip_chroma', false);
        Settings.store();

        $('p.tip-chroma').hide();
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

        // set layout overlay from settings
        if (Settings.layout_overlay) {
            $("input[name='layout_overlay']").attr('checked', 'checked');
        }
        else {
            $("input[name='layout_overlay']").removeAttr('checked');
        }

        // set preference for always including tripod from settings
        if (Settings.include_tripod) {
            $("input[name='include_tripod']").attr('checked', 'checked');
        }
        else {
            $("input[name='include_tripod']").removeAttr('checked');
        }

        // set preference for always including lighter from settings
        if (Settings.include_lighter) {
            $("input[name='include_lighter']").attr('checked', 'checked');
        }
        else {
            $("input[name='include_lighter']").removeAttr('checked');
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

    $('div.item').on('click', function () {
        if ($(this).hasClass('active') || $(this).hasClass('optional')) {
            $(this).removeClass('active').removeClass('optional');
        }
        else {
            $(this).addClass('active');
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

    $('input.layout-overlay').on('change', function () {
        if ($(this).prop('checked')) {
            $('body').addClass('overlay');

            toggleOverlay('on');
        }
        else {
            $('body').removeClass('overlay');

            toggleOverlay('off');
        }
    });

    $('#save_settings_button').on('click', function () {
        Settings.commit({
            'difficulty': $('button.difficulty.active').attr('name').replace('difficulty_', ''),
            'random_secondary': $('input.random-secondary').prop('checked') ? true : false,
            'random_light': $('input.random-light').prop('checked') ? true : false,
            'random_map': $('input.random-map').prop('checked') ? true : false,
            'layout_chroma': $('input.layout-chroma').prop('checked') ? true : false,
            'layout_overlay': $('input.layout-overlay').prop('checked') ? true : false,
            'include_tripod': $('input.include-tripod').prop('checked') ? true : false,
            'include_lighter': $('input.include-lighter').prop('checked') ? true : false,
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

    if (Settings.layout_overlay === true) {
        $('body').addClass('overlay');

        toggleOverlay('on');
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

    if (Settings.tip_elim === true) {
        $('p.tip-elim').show().find('a.glyphicon-remove').css({ 'float': 'right' });
    }

    if (Settings.tip_auto === true) {
        $('p.tip-auto').show().find('a.glyphicon-remove').css({ 'float': 'right' });
    }

    if (Settings.tip_chroma === true) {
        $('p.tip-chroma').show().find('a.glyphicon-remove').css({ 'float': 'right' });
    }
}

function clearItems() {
    $('div.item').removeClass('active').removeClass('disabled').removeClass('optional');

    $('#tripod').removeClass('col-md-5').addClass('col-md-3')
        .find('span.choice-text')
        .html(
            $('#tripod').find('span.choice-text')
                .html().replace('Emotional Support Tripod', 'Tripod')
        );

    $('#irlight, #motion, #sound').each(function () {
        $(this).find('span.choice-text')
            .html(
                $(this).find('span.choice-text')
                    .html().replace(/Sensor[\!]*/, 'Sensor')
            );
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
        $('#tripod').removeClass('col-md-3').addClass('col-md-5')
            .find('span.choice-text')
            .html(
                $('#tripod').find('span.choice-text')
                    .html().replace(/^Tripod/, 'Emotional Support Tripod')
            );
    }

    $('#motion, #sound').each(function () {
        if ($(this).hasClass('active')) {
            $(this).find('span.choice-text')
                .html(
                    $(this).find('span.choice-text')
                        .html().replace(/Sensor[\!]*/, 'Sensor!!')
                );
        }
    });

    $('#irlight').each(function () {
        if ($(this).hasClass('active')) {
            $(this).find('span.choice-text')
                .html(
                    $(this).find('span.choice-text')
                        .html().replace(/Sensor[\!]*/, 'Sensor!!!!')
                );
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
    }

    if (Settings.difficulty == 'insane') {
        items = items.filter(function (a) {
            return ['crucifix', 'photo', 'glowstick'].indexOf(a) === -1;
        });
        
        // could add this back in if too difficult
        // $('#crucifix').addClass('optional');
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

    if (Settings.include_lighter) {
        if (is_photo && !$('#lighter').addClass('active')) {
            $('#lighter').addClass('new');
        }

        $('#lighter').addClass('active');
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
    }
    else {
        $('h4').show();
        $('#view_heading').hide();

        $('div.item-collection').addClass('row');
        $('div.item').removeClass('no-float').addClass('col-md-3');
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

            $('div.item.active, div.item.optional').show();
            $('div.item:not(.active, .optional)').hide();
            $('#maps div.item').hide();

            break;

        case 'not-usable':            
            if ($('div.item.active, div.item.optional').length === 0) {
                return false;
            }

            $('div.item.active, div.item.optional').hide();
            $('div.item:not(.active, .optional)').show();
            $('#maps div.item').hide();

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

        for (version of data) {
            let modal_contents = $('#changelog_modal div.modal-body');

            $('<h4 />').html(version.date).appendTo(modal_contents);

            let change_list = $('<ul />').appendTo(modal_contents);

            for (let changed of version.changes) {
                $('<li />').html(changed).appendTo(change_list);
            }
        }
    };

    if (LOCAL) {
        callback([
            {
                "version": "1.4",
                "date": "2021-06-02",
                
                "changes": [
                    "Added a tip about chroma / color key functionality for content creators.",
                    "Added a setting to always include lighter in the randomized secondary items."
                ]
            },
        
            {
                "version": "1.3",
                "date": "2021-05-25",
        
                "changes": [
                    "Fixed a bug where optional items would not show in the Use / Don't Use filtered lists.",
                    "Removed maps from the Use / Don't Use filtered lists, so that only items are shown.",
                    "Adjusted map randomization to make it force variety between map sizes more."
                ]
            },
        
            {
                "version": "1.2",
                "date": "2021-05-20",
        
                "changes": [
                    "Added image overlay functionality to settings for concise on-stream overlay.",
                    "Updated recent changes list to show multiple dates of changes.",
                    "Moved and re-styled ghost evidence randomizer option to be consistent."
                ]
            },
        
            {
                "version": "1.1",
                "date": "2021-05-11",
        
                "changes": [
                    "Added a changelog and notification about active development.",
                    "Removed Grafton from difficult map list because it is no longer a death trap.",
                    "Remove automatic enabling of candle and glowstick, as the QoL change caused some confusion.",
                    "Lighter and head camera are a different color when required by other items to indicate that they're optional or not included in settings.",
                    "Fixed bug where IR Light Sensor lacked sufficient enthusiasm (exclamation points).",
                    "Adjusted Insane difficulty to be more difficult by excluding hunt prevention items, excluding alternative evidence items, and reducing secondary item quantities.",
                    "Added a tip about evidence elimination features available in the randomizer.",
                    "Added click functionality for toggling individual randomizer selections on or off.",
                    "Added a tip about optional or included items like the lighter and head camera."
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

            devStreamVisibilityTimer = setInterval(function () {
                $('#stream_button').animate({
                    'opacity': 0.5
                }, 700).delay(200).animate({
                    'opacity': 1.0
                }, 700);
            }, 2500);
        }
        else {
            $('#stream_button').hide();
            $('#changelog_button').show();

            if (typeof(devStreamVisibilityTimer) !== 'undefined') {
                clearInterval(devStreamVisibilityTimer);
            }
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

function toggleOverlay(toggle_status) {
    let overlay_width_class = 'overlay-square';

    switch (toggle_status) {
        case 'on':
            $('div.item.col-md-3')
                .removeClass('col-md-3')
                .addClass([overlay_width_class, 'old-md-3']);

            $('div.item.col-md-4')
                .removeClass('col-md-4')
                .addClass([overlay_width_class, 'old-md-4']);

            break;

        case 'off':
        default:
            $('div.item.old-md-3')
                .removeClass(['old-md-4', overlay_width_class])
                .addClass('col-md-3');

            $('div.item.old-md-4')
                .removeClass(['old-md-4', overlay_width_class])
                .addClass('col-md-4');

            break;
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
    'maps': [],
    'map_size': ''
};

let map_sizes = {
    'tanglewood': {
        'size': 'small'
    },
    'edgefield': {
        'size': 'small'
    },
    'ridgeview': {
        'size': 'small'
    },
    'grafton': {
        'size': 'small'
    },
    'bleasdale': {
        'size': 'small'
    },

    'highschool': {
        'size': 'medium'
    },
    'prison': {
        'size': 'medium'
    },

    'asylum': {
        'size': 'large'
    }
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
    let choices_compare = last_choices[arr_type];

    choices.sort();

    if (choices === choices_compare) {
        // shuffle again for more random
        // more lazy sort, don't judge me
        shuffled = arr.sort(function () { 
            return 0.5 - Math.random();
        }).sort(function () { 
            return 0.5 - Math.random();
        }).sort(function () { 
            return 0.5 - Math.random();
        });

        choices = shuffled.slice(0, len);
    }

    if (arr_type == 'maps' && len == 1) {
        let last_map_size = last_choices['map_size'];
        let current_map_size = map_sizes[choices[0]].size;

        if (last_map_size == current_map_size) {
            let available_map_sizes = ['small', 'medium', 'large'].filter((a) => {
                return a != current_map_size;
            }).sort(function () { 
                return 0.5 - Math.random();
            });

            let available_maps = [];

            for (let map_name of Object.keys(map_sizes)) {
                if (map_sizes[map_name].size == available_map_sizes[0]) {
                    available_maps.push(map_name);
                }
            }

            choices = available_maps.sort(function () { 
                return 0.5 - Math.random();
            }).slice(0, 1);

            last_choices['map_size'] = available_map_sizes[0];
        }
        else {
            last_choices['map_size'] = current_map_size;
        }    
    }

    last_choices[arr_type] = choices;

    return choices;
}