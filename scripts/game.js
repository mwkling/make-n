'use strict';

var BOX_WIDTH = 50;
var HALF_BOX = 25;
var COUNTER = 5;

var SELECTED_NUM = null;
var SELECTED_OP = null;

var CURRENT_LEVEL = null;
var CURRENT_GOAL = null;

var levels = [
  // Basic operations
  {nums: [1, 1], goal: 2},
  {nums: [3, 4], goal: 12},
  {nums: [1, 2, 3], goal: 7},
  {nums: [1, 2, 3], goal: 5},  // Multiple ways
  {nums: [8, 4, 5], goal: 10},
  {nums: [1, 2, 3], goal: 10}, // Exponents
  {nums: [2, 5, 1], goal: 36},
  {nums: [2, 5, 1], goal: 33},

  // Concatenation
  {nums: [1, 1], goal: 11},
  {nums: [4, 4, 8], goal: 81},
  {nums: [1, 2, 3], goal: 36},

  // Digit splitting
  {nums: [7, 8], goal: 65},
  {nums: [6, 3], goal: 10},
  {nums: [4, 4], goal: 53},

  // Harder
  {nums: [7, 4, 6], goal: 6},
  {nums: [4, 8, 4], goal: 4},
  {nums: [6, 8, 6], goal: 82},
  {nums: [4, 1, 2], goal: 46},
  {nums: [7, 7, 2], goal: 47},
  {nums: [7, 8, 8], goal: 72},
  {nums: [3, 2, 6], goal: 71},
  {nums: [5, 6, 5], goal: 59},
  {nums: [5, 6, 5], goal: 10}
];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function setupLevel(nums, goal) {
  var offset = 100;
  var value = "";

  $(".num").remove();
  for(var i = 0; i < nums.length; i++) {
    value = nums[i] + '';
    makeNum(value, offset, 100);
    offset = offset + (BOX_WIDTH * value.length) + 10;
  }
  document.getElementById("goal").innerHTML = goal;
  CURRENT_GOAL = goal;

  // TODO: why is this necessary...?
  resetAllNumSnaps();
}

function setupLevelN(n) {
  CURRENT_LEVEL = n;
  level = levels[n];
  setupLevel(level.nums, level.goal);
}

function setupRandomLevel() {
  CURRENT_LEVEL = null;

  var start_sel = document.getElementById("starting-digits");
  var max_sel = document.getElementById("max-goal");

  var maxGoal = max_sel.options[max_sel.selectedIndex].text * 1;
  var startingDigits = start_sel.options[start_sel.selectedIndex].text * 1;

  var goal = getRandomInt(1, maxGoal);
  var nums = [];
  for(var i = 0; i < startingDigits; i++) {
    nums.push(getRandomInt(1, 9));
  }
  setupLevel(nums, goal);
}

function checkGoal() {
  var nums = document.querySelectorAll(".num");
  if(nums.length == 1) {
    if(nums[0].getAttribute("value") == CURRENT_GOAL) {
      alert("yay");
      // TODO: do the appropriate thing depending on mode
      setupRandomLevel();
    }
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

  $(newNum).appendTo("#game-canvas");

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
        $(newNum).appendTo("#game-canvas");

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
  checkGoal();
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
      var digits = $(num).children().length;
      var myDigits = $(nums[i]).children().length;

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
      })
      .actionChecker(function (pointer, event, action, that, element, interaction) {
        // No dragging numbers when in selection mode
        if($(element).hasClass("selected") || $(element).hasClass("selectable")) {
          return null;
        } else {
          return action;
        }
      });
    ;
  }
}

// Call when we are in 'select' mode and a number gets clicked, to possibly
// perform a math operation
function selectableNumClickHandler(event){
  if(SELECTED_NUM == null) {
    event.currentTarget.classList.remove("selectable");
    event.currentTarget.classList.add("selected");
    SELECTED_NUM = event.currentTarget;
  }
  else if(event.currentTarget == SELECTED_NUM) {
    event.currentTarget.classList.remove("selected");
    event.currentTarget.classList.add("selectable");
    SELECTED_NUM = null;
  }
  else {
    var num1 = parseInt(SELECTED_NUM.getAttribute("value"));
    var num2 = parseInt(event.currentTarget.getAttribute("value"));
    var result = null;
    if (SELECTED_OP.id == "plus") {
      result = num1 + num2;
    }
    else if(SELECTED_OP.id == "minus") {
      result = (num1 > num2) ? (num1 - num2) : (num2 - num1);
    }
    else if(SELECTED_OP.id == "times") {
      result = num1 * num2;
    }
    else if(SELECTED_OP.id == "divide" && (num1 % num2 == 0)) {
      result = num1 / num2;
    }
    else if(SELECTED_OP.id == "power") {
      result = Math.pow(num1, num2);
    }

    if (result != null) {
      makeNum(result + '', SELECTED_NUM.getAttribute("data-x"), SELECTED_NUM.getAttribute("data-y"));
      SELECTED_NUM.parentNode.removeChild(SELECTED_NUM);
      event.currentTarget.parentNode.removeChild(event.currentTarget);
    }
    SELECTED_NUM = null;
    $(".operation").removeClass("selected");
    $(".num").removeClass("selectable");
    $(".num").off("click", selectableNumClickHandler);
    resetAllNumSnaps();
    checkGoal();
  }
}

function setupOperations() {
  $(".operation").on("click", function(event) {
    if(event.target.classList.contains("selected")) {
      event.target.classList.remove("selected");
      $(".num").removeClass("selectable");
      $(".num").removeClass("selected");
      $(".num").off("click", selectableNumClickHandler)
      SELECTED_NUM = null;
    }
    else {
      $(".operation").removeClass("selected");

      // Selected op is visually selected and set in global
      event.target.classList.add("selected");
      SELECTED_OP = event.target;

      // Numbers into 'selectable' mode now: selectable class and event handler
      $(".num").addClass("selectable");
      $(".num").on("click", selectableNumClickHandler);
    }
  });
}

function updateSettings() {
  var mode_select = document.getElementById("mode-select");
  var mode = mode_select.options[mode_select.selectedIndex].text;
  if(mode == "Levels") {
    document.getElementById("level-settings").classList.remove("hidden");
    document.getElementById("random-settings").classList.add("hidden");
    document.getElementById("next-level").classList.remove("hidden");
    document.getElementById("new-random").classList.add("hidden");
    // TODO: initialize level
  }
  else {
    document.getElementById("random-settings").classList.remove("hidden");
    document.getElementById("level-settings").classList.add("hidden");
    document.getElementById("next-level").classList.add("hidden");
    document.getElementById("new-random").classList.remove("hidden");

    // TODO: initialize random
  }
}

//setupLevelN(0);
setupRandomLevel();
setupOperations();
document.getElementById('scissors').addEventListener('click', splitAllNums);
document.getElementById('mode-select').addEventListener('change', updateSettings);
document.getElementById('new-random').addEventListener('click', setupRandomLevel);
