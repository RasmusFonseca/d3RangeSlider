# Range slider

A small widget that allows the user to select a contiguous range of whole numbers 
using a slider. Check out [this site](https://rasmusfonseca.github.io/JQDRangeSlider/) for a demo. The page 
`minimal.html` constitutes a minimal working example:
 ```html
<html>
<head>
    <!-- Dependencies -->
    <script src="https://cdn.rawgit.com/RasmusFonseca/JQDRangeSlider/master/jquery-1.7.2.js"></script>
    <script src="https://cdn.rawgit.com/RasmusFonseca/JQDRangeSlider/master/jquery.event.drag-2.2.js"></script>
    <script src="https://cdn.rawgit.com/RasmusFonseca/JQDRangeSlider/master/jquery.event.drag.live-2.2.js"></script>

    <!-- Range slider code -->
    <script src="https://cdn.rawgit.com/RasmusFonseca/JQDRangeSlider/master/jqdRangeslider.js"></script>

    <!-- Range slider style -->
    <link href="https://cdn.rawgit.com/RasmusFonseca/JQDRangeSlider/master/jqdRangeslider.css" rel="stylesheet">

    <style type="text/css">
        #slider-container {
            position: relative;
            height:30px;
            background-color: #eeeef5;
        }
    </style>
</head>
<body>

<div id="slider-container"></div>
<script type="text/javascript">
    var slider = createJQDRangeslider(0, 100, "#slider-container");
</script>

</body>
</html>
```

This creates a slider that spans the range from 0 - 100 (both inclusive) and adds it to the container-div. If you 
want diffent placements of the handles or background colors, the 
[supplied CSS](https://github.com/RasmusFonseca/JQDRangeSlider/blob/master/jqdRangeslider.css) can easily be adapted. A 
couple of functions are defined on the `slider` object:

`slider.range()` returns the currently selected range as an `{begin: number, end: number}`-object. 

`slider.range(s,b)` sets the range to span the interval from `s` to `b` (both included). If `s>b` the two numbers 
are swapped. If `s` or `b` are outside the range limits specified in the call to `createJQDRangeslider` a warning is 
printed in the console, and the values are clamped to the valid range limits.

`slider.range(s)` moves the range without changing its width and so it starts at `s`. If the move causes the range to
 go outside the range limits a warning is printed in the console and the range moved back to the limit.

`slider.onChange(callback)` adds a change-listener to the slider, so any UI modification or call to `range` triggers 
a call to `callback` with a single `{begin: number, end: number}`-argument that reflects the newly updated range.

This example illustrates the use of these functions
```javascript
// Create slider spanning the range from 0 to 10
var slider = createJQDRangeslider(0, 10, "#slider-container");

// Range changes to 3-6
slider.range(3,6); 

// Listener gets added
slider.onChange(function(newRange){
   console.log(newRange);
});

// Range changes to 7-10
// Warning is printed that you attempted to set a range (8-11) outside the limits (0-10)
// {begin: 7, end: 10} is printed in the console because of the listener
slider.range(8);
```

