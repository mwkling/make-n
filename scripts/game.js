'use strict';

var BOX_WIDTH = 50;
var HALF_BOX = 25;
var COUNTER = 5;

function dragMoveListener (event) {
  var target = event.target,
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
  target.style.webkitTransform =
    target.style.transform = 
      'translate(' + x + 'px, ' + y + 'px)';
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

function dragEndListener (event) {
  var target = event.target;

  var id = event.target.id;
  var thisPos = $(event.target).offset();
  var thisDigits = parseInt(event.target.getAttribute('data-digits'));
  var thisText = target.getAttribute('value');

  var x = (parseFloat(event.target.getAttribute('data-x')) || 0),
      y = (parseFloat(event.target.getAttribute('data-y')) || 0);

  var nums = document.querySelectorAll(".num");

  for (var i = 0; i < nums.length; i++) {
    var num = nums[i];
    var pos = $(num).offset();

    if(num.id != id) {
      if(thisPos.left + BOX_WIDTH == pos.left && thisPos.top == pos.top) {
        console.log("BOX TO THE RIGHT: ");
        console.log(num.id);

        var newId = "box" + COUNTER;
        var newDigits = parseInt(num.getAttribute('data-digits')) + thisDigits;
        var newText = num.getAttribute('value');

        var newNum = jQuery('<div/>', {
          id: newId,
          class: 'num',
          text: (thisText + newText),
          value: (thisText + newText)});

        // why did I have to do this?
        newNum[0].setAttribute('data-digits', newDigits);
        newNum[0].setAttribute('data-x', x);
        newNum[0].setAttribute('data-y', y);

        newNum[0].style.webkitTransform =
          newNum[0].style.transform =
          'translate(' + x + 'px, ' + y + 'px)';
        newNum[0].style.width = BOX_WIDTH * newDigits;

        newNum.appendTo("#game");

        $(num).remove();
        $(target).remove();

        COUNTER = COUNTER + 1;
      }
      if(thisPos.left- BOX_WIDTH == pos.left && thisPos.top == pos.top) {
        console.log("BOX TO THE LEFT: ");
        console.log(num.id);
      }
    }
  }

  resetAllNumSnaps();
}

function resetAllNumSnaps() {
  var nums = [].slice.call(document.querySelectorAll(".num"));

  for (var i = 0; i < nums.length; i++) {
    var id = nums[i].id;

    var notMySquare = nums.filter(function(num) {
      return id != num.id;
    });

    var targets = notMySquare.map(function(num){
      var pos = $(num).offset();

      return [
        function(x, y) {
          return { x: pos.left - HALF_BOX, y: pos.top + HALF_BOX, range: 30 }
        },
        function(x, y) {
          return { x: pos.left + (HALF_BOX * 3), y: pos.top + HALF_BOX, range: 30 }
        }
      ];
    });

    targets = targets.reduce(function(a, b) { return a.concat(b); }, []);

    interact("#" + id)
      .draggable({
        inertia: true,
        restrict: {
          restriction: "parent",
          endOnly: "true",
          elementRect: {top: 0, left: 0, bottom: 1, right: 1}
        },
        autoScroll: true,
        onmove: dragMoveListener,
        onend: dragEndListener,
        snap: {
          targets: targets,
          relativePoints: [ { x: 0.5, y: 0.5 } ]
        }
      });
  }
}

resetAllNumSnaps();
