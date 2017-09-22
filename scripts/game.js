'use strict';

var BOX_WIDTH = 50;
var COUNTER = 5;

var SELECTED_NUM = null;
var SELECTED_OP = null;

var CURRENT_GOAL = null;

var levels = [
  // Basic operations
  {nums: [1, 1], goal: 2, par: 1, hint: "To add two numbers, click the + button, then click on the two numbers you want to add."},
  {nums: [3, 4], par: 1, goal: 12},
  {nums: [1, 2, 3], par: 2, goal: 7},
  {nums: [1, 2, 3], par: 2, goal: 5, hint: "Sometimes, puzzles can be solved multiple ways."},  // Multiple ways
  {nums: [8, 4, 5], par: 2, goal: 10},
  {nums: [1, 2, 3], par: 2, goal: 10, hint: "Use exponents."}, // Exponents
  {nums: [2, 5, 1], par: 2, goal: 36},
  {nums: [2, 5, 1], par: 2, goal: 33},

  // Concatenation
  {nums: [1, 1], par: 0, goal: 11, hint: "You can concatenate digits by dragging one next to the other."},
  {nums: [4, 4, 8], par: 1,  goal: 81},
  {nums: [1, 2, 3], par: 1, goal: 36},

  // Digit splitting
  {nums: [7, 8], par: 1, goal: 65, hint: "Click on the scissors to split numbers into their digits."},
  {nums: [4, 4], par: 2, goal: 53},

  // Harder
  {nums: [7, 4, 6], par: 2, goal: 6},
  {nums: [4, 8, 4], par: 3, goal: 4},
  {nums: [6, 8, 6], par: 2, goal: 82},
  {nums: [4, 1, 2], par: 2, goal: 46},
  {nums: [7, 7, 2], par: 2, goal: 47},
  {nums: [7, 8, 8], par: 2, goal: 72},
  {nums: [3, 2, 6], par: 1, goal: 71},
  {nums: [5, 6, 5], par: 2, goal: 59},
  {nums: [5, 6, 5], par: 3, goal: 10},
  {nums: [1, 3, 7], par: 3, goal: 48},
  {nums: [5, 7, 7, 3], par: 2, goal: 150},
  {nums: [4, 4, 2], par: 3, goal: 26, par: 3},
  {nums: [6, 3], par: 4, goal: 10}
];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function setupLevel(nums, goal, hint, par) {
  var offset = BOX_WIDTH;
  var value = "";

  $(".num").remove();
  for(var i = 0; i < nums.length; i++) {
    value = nums[i] + '';
    makeNum(value, offset, BOX_WIDTH);
    offset = offset + (BOX_WIDTH * value.length) + 10;
  }
  document.getElementById("goal").innerHTML = goal;
  CURRENT_GOAL = goal;

  if(!!hint) {
    document.getElementById("hint").classList.remove("hidden");
    document.getElementById("hint").innerText = "Hint: " + hint;
  }
  else {
    document.getElementById("hint").classList.add("hidden");
  }

  if(!!par) {
    document.getElementById("par-text").classList.remove("hidden");
    document.getElementById("par").innerText = par;
  }
  else {
    document.getElementById("par-text").classList.add("hidden");
  }

  document.getElementById("num-steps").innerText = 0;
  // TODO: why is this necessary...?
  resetAllNumSnaps();
}

function setupCurrentLevel() {
  var level_sel = document.getElementById('level-select');

  var current_level = level_sel.options[level_sel.selectedIndex].text * 1;
  var level = levels[current_level - 1];
  setupLevel(level.nums, level.goal, level.hint, level.par);
}

function setupRandomLevel() {
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
  setTimeout(function () {
    var nums = document.querySelectorAll(".num");
    if(nums.length == 1) {
      if(nums[0].getAttribute("value") == CURRENT_GOAL) {
        $("#success-modal").modal();
      }
    }
  }, 100);
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

      for (var j = 1; j < digits.length; j++) {
        var digit = digits[j];
        var newNum = jQuery('<div/>', {
          id: ("box" + COUNTER),
          class: "num",
          value: digit.innerText
        })[0];
        $(digit).appendTo(newNum);
        $(newNum).appendTo("#game-canvas");

        var newX = x + (j * (BOX_WIDTH + 10));
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
        inertia: false,
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
    else if(SELECTED_OP.id == "power" && Math.pow(num1, num2) < 1000000) {
      result = Math.pow(num1, num2);
    }

    if (result != null) {
      makeNum(result + '', SELECTED_NUM.getAttribute("data-x"), SELECTED_NUM.getAttribute("data-y"));
      SELECTED_NUM.parentNode.removeChild(SELECTED_NUM);
      event.currentTarget.parentNode.removeChild(event.currentTarget);
      var steps = document.getElementById("num-steps").innerText * 1;
      document.getElementById("num-steps").innerText = steps + 1;
    }
    SELECTED_NUM = null;
    $(".operation").removeClass("selected");
    $(".num").removeClass("selectable");
    $(".num").removeClass("selected");
    $(".num").off("click", selectableNumClickHandler);
    resetAllNumSnaps();
    checkGoal();
  }
}

function setupOperations() {
  $(".operation").on("click", function(event) {
    if(event.currentTarget.classList.contains("selected")) {
      event.currentTarget.classList.remove("selected");
      $(".num").removeClass("selectable");
      $(".num").removeClass("selected");
      $(".num").off("click", selectableNumClickHandler);
      SELECTED_NUM = null;
    }
    else {
      $(".operation").removeClass("selected");
      $(".num").off("click", selectableNumClickHandler);

      // Selected op is visually selected and set in global
      event.currentTarget.classList.add("selected");
      SELECTED_OP = event.currentTarget;

      // Numbers into 'selectable' mode now: selectable class and event handler
      $(".num").addClass("selectable");
      $(".num").on("click", selectableNumClickHandler);
    }
  });
}

function getMode() {
  var mode_select = document.getElementById("mode-select");
  return mode_select.options[mode_select.selectedIndex].text;
}

function updateSettings() {
  if(getMode() == "Levels") {
    document.getElementById("level-settings").classList.remove("hidden");
    document.getElementById("random-settings").classList.add("hidden");
    document.getElementById("next-level").classList.remove("hidden");
    document.getElementById("restart-level").classList.remove("hidden");
    document.getElementById("new-random").classList.add("hidden");
    setupCurrentLevel();
  }
  else {
    document.getElementById("random-settings").classList.remove("hidden");
    document.getElementById("level-settings").classList.add("hidden");
    document.getElementById("next-level").classList.add("hidden");
    document.getElementById("restart-level").classList.add("hidden");
    document.getElementById("new-random").classList.remove("hidden");
    setupRandomLevel();
  }
}

function setupNextLevel() {
  document.getElementById('level-select').selectedIndex += 1;
  setupCurrentLevel();
}

function playGame() {
  document.getElementById("instructions").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
}

setupCurrentLevel();
setupOperations();
document.getElementById('scissors').addEventListener('click', splitAllNums);
document.getElementById('mode-select').addEventListener('change', updateSettings);
document.getElementById('new-random').addEventListener('click', setupRandomLevel);
document.getElementById('level-select').addEventListener('change', setupCurrentLevel);
document.getElementById('next-level').addEventListener('click', setupNextLevel);
document.getElementById('restart-level').addEventListener('click', setupCurrentLevel);
document.getElementById('play').addEventListener('click', playGame);

$("#success-modal").on("hidden.bs.modal", function (e) {
  if(getMode() == "Levels") {
    setupNextLevel();
  }
  else {
    setupRandomLevel();
  }
});
