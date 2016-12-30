'use strict';

var HALF_BOX = 25;
var positions = {}

function dragMoveListener (event) {
  var target = event.target,
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
  target.style.webkitTransform =
    target.style.transform = 
      'translate(' + x + 'px, ' + y + 'px)';
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);

  positions[target.id] = $(target).position();
}

function listener (event) {
    console.log(event.type, event.pageX, event.pageY);
}

var numSquares = ['box1', 'box2', 'box3']

for (var i = 0; i < numSquares.length; i++) {
  var id = numSquares[i];

  var notMySquare = numSquares.filter(function(oid) {
    return id != oid;
  });

  var targets = notMySquare.map(function(id){
    return [function(x, y) {
      if (positions[id]) {
        return { x: positions[id].left - HALF_BOX, y: positions[id].top + HALF_BOX, range: 30 }
      }
    },
    function(x, y) {
          if (positions[id]) {
            return { x: positions[id].left + (HALF_BOX * 3), y: positions[id].top + HALF_BOX, range: 30 }
          }
        }];
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
      snap: {
        targets: targets,
        relativePoints: [ { x: 0.5, y: 0.5 } ]
      }
    });
}

window.dragMoveListener = dragMoveListener;
