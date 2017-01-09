'use strict';

var BOX_WIDTH = 50;
var HALF_BOX = 25;
var COUNTER = 5;

var levels = [
  {nums: [1, 2, 3], goal: 10}
];

function setupLevel(i) {
  var level = levels[i];
  var offset = 100;
  var value = "";

  for(var i = 0; i < level.nums.length; i++) {
    value = level.nums[i] + '';
    makeNum(value, offset, 100);
    offset = offset + (BOX_WIDTH * value.length) + 10;
  }
}

function makeNum(numString, x, y) {
  var newNum = jQuery('<div/>', {
    id: ("box" + COUNTER),
    class: "num",
    value: numString
  })[0];

  for (var i = 0; i < numString.length; i++) {
    var newDigit = jQuery('<span/>', {
      class: "digit",
      text: numString[i]
    });
    $(newDigit).appendTo(newNum);
  }

  $(newNum).appendTo("#game");

  newNum.style.webkitTransform =
    newNum.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
  newNum.setAttribute('data-x', x);
  newNum.setAttribute('data-y', y);

  resetAllNumSnaps();
  COUNTER++;
}

// Split digits making up any particular number
function splitAllNums() {
  var nums = document.querySelectorAll(".num");

  for (var i = 0; i < nums.length; i++) {
    var num = nums[i];

    var digits = num.querySelectorAll(".digit");
    if (digits.length > 1) {
      var x = (parseFloat(num.getAttribute('data-x')) || 0),
          y = (parseFloat(num.getAttribute('data-y')) || 0);

      // Value is now only the first digit
      num.setAttribute('value', num.getAttribute('value')[0]);

      for (var i = 1; i < digits.length; i++) {
        var digit = digits[i];
        var newNum = jQuery('<div/>', {
          id: ("box" + COUNTER),
          class: "num",
          value: digit.innerText
        })[0];
        $(digit).appendTo(newNum);
        $(newNum).appendTo("#game");

        var newX = x + (i * (BOX_WIDTH + 10));
        newNum.style.webkitTransform =
          newNum.style.transform =
            'translate(' + newX + 'px, ' + y + 'px)';
        newNum.setAttribute('data-x', newX);
        newNum.setAttribute('data-y', y);

        COUNTER++;
      }
    }
  }

  resetAllNumSnaps();
}

// Just keeps the x, y transfrom setup properly on each num
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

// When done dragging a number, check to see if we need to combine any digits
function dragEndListener (event) {
  var target = event.target;

  var id = target.id;
  var thisPos = $(target).offset();
  var thisDigits = target.children.length

  var nums = document.querySelectorAll(".num");

  for (var i = 0; i < nums.length; i++) {
    var num = nums[i];
    var pos = $(num).offset();
    var digits = num.children.length

    if(num.id != id) {
      if(thisPos.left + (BOX_WIDTH * thisDigits) == pos.left && thisPos.top == pos.top) {
        target.setAttribute('value', target.getAttribute('value') + num.getAttribute('value'));

        $(num).children().appendTo(target);
        $(num).remove();
      }
      if(thisPos.left - (BOX_WIDTH * digits) == pos.left && thisPos.top == pos.top) {
        num.setAttribute('value', num.getAttribute('value') + target.getAttribute('value'));
        $(target).children().appendTo(num);
        $(target).remove();
      }
    }
  }

  resetAllNumSnaps();
}

// Sets up all the appropriate snapping for joining different numbers
// Call again whenever numbers change somehow
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

function setupOperations() {
  interact(".operation").dropzone({
    accept: ".num",
    overlap: 0.5,
    ondrop: function (event) {
      console.log("dropped in an operation!");
      console.log(event.target.innerText);
      console.log(event.relatedTarget.getAttribute('value'));
    },
    ondragenter: function (event) {
      event.target.classList.add('over');
    },
    ondragleave: function (event) {
      event.target.classList.remove('over');
    }
  });
}

setupLevel(0);
setupOperations();
document.getElementById('scissors').addEventListener('click', splitAllNums);
