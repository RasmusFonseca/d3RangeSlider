/*jslint browser:true */
/*jslint this */


/**
 * Create a jquery-drag range slider that selects ranges between `rangeMin` and `rangeMax`, and add it to the
 * `containerSelector`. The contents of the container is laid out as follows
 * <code>
 * <div class="drag">
 *     <div class="handle WW"></div>
 *     <div class="handle EE"></div>
 * </div>
 * </code>
 * The appearance can be changed with CSS, but the `position` must be `relative`, and the width of `.drag` should be
 * left unaltered.
 *
 * @param rangeMin Minimum value of the range
 * @param rangeMax Maximum value of the range
 * @param containerSelector A CSS selection indicating exactly one element in the document
 * @returns {{range: function(number, number), onChange: function(function)}}
 */
function createJQDRangeslider (rangeMin, rangeMax, containerSelector) {
    "use strict";

    var minWidth = 10;

    var sliderRange = {begin: rangeMin, end: rangeMin};
    var changeListeners = [];
    var $container;
    var $drag;
    var dragging = false; //Used to avoid rounding errors when recomputing sliderRange from UI


    //Create elements in container
    var $drg = $(document.createElement("div"));
    $drg.attr("class", "drag");
    $drg.append( $(document.createElement("div")).attr("class", "handle WW") );
    $drg.append( $(document.createElement("div")).attr("class", "handle EE") );
    var $con = $(containerSelector);
    $container = $con;
    $con.append($drg);
    var con_width = parseFloat($con.css("width"));


    function updateUIFromRange () {
        var conW = parseFloat($container.css("width"));
        var rangeW = sliderRange.end - sliderRange.begin;
        var slope = (conW - minWidth) / (rangeMax - rangeMin);
        var uirangeW = minWidth + rangeW * slope;
        var ratio = sliderRange.begin / (rangeMax - rangeMin - rangeW);
        if (isNaN(ratio)) {
            ratio = 0;
        }
        var uirangeL = ratio * (conW - uirangeW);

        $drag.css("left", uirangeL + "px");
        $drag.css("width", uirangeW + "px");
    }

    function updateRangeFromUI () {
        var uirangeL = parseFloat($drag.css("left"));
        var uirangeW = parseFloat($drag.css("width"));
        var conW = parseFloat($container.css("width"));
        var slope = (conW - minWidth) / (rangeMax - rangeMin);
        var rangeW = (uirangeW - minWidth) / slope;
        var uislope = (rangeMax - rangeMin - rangeW) / (conW - uirangeW);
        var rangeL = rangeMin + uislope * uirangeL;
        var oldRangeW = sliderRange.end - sliderRange.begin;
        sliderRange.begin = Math.round(rangeL);
        if (dragging) {
            sliderRange.end = sliderRange.begin + oldRangeW;
        } else {
            sliderRange.end = Math.round(rangeL + rangeW);
        }

        //Fire change listeners
        changeListeners.forEach(function (callback) {
            callback({begin: sliderRange.begin, end: sliderRange.end});
        });
    }


    $drag = $(".drag")
        .drag("start", function (ev, dd) {
            dd.attr = $(ev.target).prop("className");
            dd.width = $(this).width();
            dd.height = $(this).height();

            dd.limit = $con.offset();
            dd.limit.right = $con.outerWidth() - $(this).outerWidth();

            dragging = (dd.attr.indexOf("drag") > -1);

        })
        .drag("end", function (ev, dd) {
            dragging = false;
        })
        .drag(function (ev, dd) {

            var props = {};
            if (dd.attr.indexOf("EE") > -1) {
                props.width = Math.min(Math.max(minWidth, dd.width + dd.deltaX), $con.innerWidth() - dd.originalX + $con.offset().left);
            }
            if (dd.attr.indexOf("WW") > -1) {
                props.width = Math.max(minWidth, dd.width - dd.deltaX);
                props.left = dd.originalX + dd.width - props.width - $con.offset().left;
                if (props.left < 0) {
                    props.width += props.left;
                    props.left = 0;
                }
            }
            if (dd.attr.indexOf("drag") > -1) {
                props.left = Math.min(dd.limit.right, Math.max(dd.offsetX - $con.offset().left, 0));
            }
            props.left = Math.round(props.left);
            props.width = Math.round(props.width);
            $(this).css(props);
            updateRangeFromUI();
        });

    //Reposition slider on window resize
    $(window).resize(function (ev) {
        var new_width = parseFloat($con.css("width"));
        var ratio = new_width / con_width;
        con_width = new_width;

        var props = {};
        props.left = parseFloat($(".drag").css("left")) * ratio;

        var dragWidth = parseFloat($(".drag").css("width"));
        if (dragWidth > 10.5) {
            props.width = Math.max(dragWidth * ratio, 10);
        }

        props.left = Math.round(props.left);
        props.width = Math.round(props.width);
        $(".drag").css(props);
        updateRangeFromUI();
    });

    //Click on bar
    $con.mousedown(function (ev) {
        var x = ev.offsetX;
        var props = {};
        var dragWidth = parseFloat($(".drag").css("width"));
        var conWidth = parseFloat($con.css("width"));
        props.left = Math.min(conWidth - dragWidth, Math.max(x - dragWidth / 2, 0));
        props.left = Math.round(props.left);
        props.width = Math.round(props.width);
        $(".drag").css(props);
        updateRangeFromUI();
    });


    function onChange(callback){
        changeListeners.push(callback);
        return this;
    }

    function setRange (b, e) {
        sliderRange.begin = b;
        sliderRange.end = e;

        updateUIFromRange();

        //Fire change listeners
        changeListeners.forEach(function (callback) {
            callback({begin: sliderRange.begin, end: sliderRange.end});
        });
    }


    /**
     * Returns or sets the range depending on arguments.
     * If `b` and `e` are both numbers then the range is set to span from `b` to `e`.
     * If `b` is a number and `e` is undefined the beginning of the slider is moved to `b`.
     * If both `b` and `e` are undefined the currently set range is returned as an object with `begin` and `end`
     * attributes.
     * If any arguments cause the range to be outside of the `rangeMin` and `rangeMax` specified on slider creation
     * then a warning is printed and the range correspondingly clamped.
     * @param b beginning of range
     * @param e end of range
     * @returns {{begin: number, end: number}}
     */
    function range(b, e) {
        var rLower;
        var rUpper;

        if (typeof b === "number" && typeof e === "number") {

            rLower = Math.min(b, e);
            rUpper = Math.max(b, e);

            //Check that lower and upper range are within their bounds
            if (rLower < rangeMin || rUpper > rangeMax) {
                console.log("Warning: trying to set range (" + rLower + "," + rUpper + ") which is outside of bounds (" + rangeMin + "," + rangeMax + "). ");
                rLower = Math.max(rLower, rangeMin);
                rUpper = Math.min(rUpper, rangeMax);
            }

            //Set the range
            setRange(rLower, rUpper);
        } else if (typeof b === "number") {

            rLower = b;
            var dif = sliderRange.end - sliderRange.begin;
            rUpper = rLower + dif;

            if (rLower < rangeMin) {
                console.log("Warning: trying to set range (" + rLower + "," + rUpper + ") which is outside of bounds (" + rangeMin + "," + rangeMax + "). ");
                rLower = rangeMin;
            }
            if(rUpper > rangeMax){
                console.log("Warning: trying to set range (" + rLower + "," + rUpper + ") which is outside of bounds (" + rangeMin + "," + rangeMax + "). ");
                rLower = rangeMax - dif;
                rUpper = rangeMax;
            }

            setRange(rLower, rUpper);
        }

        return {begin: sliderRange.begin, end: sliderRange.end};
    }

    setRange(sliderRange.begin, sliderRange.end);

    return {
        range: range,
        onChange: onChange
    };
}
