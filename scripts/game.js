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

function listener (event) {
    console.log(event.type, event.pageX, event.pageY);
}

interact('.dragnum')
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
      targets: [
        { x: 200, y: 200, range: 20 }
      ],
      relativePoints: [
        { x: 0.5, y: 0.5 }
      ]
    }
  });

window.dragMoveListener = dragMoveListener;
