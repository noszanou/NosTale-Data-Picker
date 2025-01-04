// NosApki .JS

$(document).on('mouseenter', '.hover-show-name', function() {
    var attr = $(this).attr('data-name');
    if (typeof attr !== 'undefined' && attr !== false) {
        if (attr.includes("X_PLUS_X")){
            if (typeof $(this).attr('data-plus') !== 'undefined' && Number($(this).attr('data-plus')) > 0){
                attr = attr.replace("X_PLUS_X", " +" + $(this).attr('data-plus'));
            } else {
                attr = attr.replace("X_PLUS_X", "");
            }
        }

        $('#hover-element-name').html(attr);
        setPositionToHoverElement($('#hover-element-name'), $(this));
        $('#hover-element-name').css('visibility', 'visible')
    }
});

$(document).on('mouseleave', '.hover-show-name', function() {
    $('#hover-element-name').css('visibility', 'hidden');
});

function setPositionToHoverElement(element, hover_element){
    var element_width = parseInt(element.outerWidth());
    var element_height = parseInt(element.outerHeight());

    var left = parseInt(hover_element.offset().left) - parseInt($("#divStrona").offset().left);
    var top = parseInt(hover_element.offset().top) - parseInt($("#divStrona").offset().top);

    var position_top = top - element_height;

    var main_end_point = parseInt($("#divStrona").width());

    if (main_end_point < left + element_width){
        element.css('left', '');
        element.css('right', '0');
    } else {
        element.css('left', left);
        element.css('right', '');
    }

    element.css('top', position_top);
}