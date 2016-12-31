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

  var id = target.id;
  var thisPos = $(target).offset();
  var thisText = target.getAttribute('value');
  var thisDigits = target.children.length

  var x = (parseFloat(target.getAttribute('data-x')) || 0),
      y = (parseFloat(target.getAttribute('data-y')) || 0);

  var nums = document.querySelectorAll(".num");

  for (var i = 0; i < nums.length; i++) {
    var num = nums[i];
    var pos = $(num).offset();
    var digits = num.children.length

    if(num.id != id) {
      if(thisPos.left + (BOX_WIDTH * thisDigits) == pos.left && thisPos.top == pos.top) {
        console.log("BOX TO THE RIGHT: ");
        console.log(num.id);

        $(num).children().appendTo(target);
        $(num).remove();
      }
      if(thisPos.left - (BOX_WIDTH * digits) == pos.left && thisPos.top == pos.top) {
        console.log("BOX TO THE LEFT: ");
        console.log(num.id);

        $(target).children().appendTo(num);
        $(target).remove();
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
      var digits = $(num).children().length
      var myDigits = $(nums[i]).children().length

      return [
        function(x, y) {
          return { x: pos.left - (myDigits * BOX_WIDTH), y: pos.top, range: 30 }
        },
        function(x, y) {
          return { x: pos.left + (BOX_WIDTH * digits), y: pos.top, range: 30 }
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
          relativePoints: [ { x: 0, y: 0 } ]
        }
      });
  }
}

resetAllNumSnaps();
