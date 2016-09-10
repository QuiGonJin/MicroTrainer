var container;
var mConsole;
var scoreContainer;
var canceledField;
var outcome;
var scoreDetailsField;
/**
 * Holds state and functions related to game canvas
 */
var engine = {
  //Placeholder variables for engine prototype. Initialized once game loads
  canvas: null,
  ctx: null,
  lastTime: null,
  startTime: null,
  actorFactory: null,
  units: [],
  projectiles: [],
  hovered: null,
  gameOver: false,
  clear: function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

var sounds = {
    pull1: new Audio('sound/bowPull1.wav'),
    pull2: new Audio('sound/bowPull2.wav'),
    pull3: new Audio('sound/bowPull3.wav'),
    impact1: new Audio('sound/impact1.wav'),
    impact2: new Audio('sound/impact2.wav'),
    impact3: new Audio('sound/impact3.wav'),
    fire1: new Audio('sound/fire1.wav'),
    fire2: new Audio('sound/fire2.wav'),
    fire3: new Audio('sound/fire3.wav'),
    kill1: new Audio('sound/kill1.wav'),
    kill2: new Audio('sound/kill2.wav'),
    kill3: new Audio('sound/kill3.wav'),
    
}

// var colors = {
//   friendly = "#339966",
//   enemy = "#cc0000",
//   hp100 = "#00ff00",

// }

/**
 * Variables related to scorekeeping
 * Score is calculated as a percentage of damage dealt to the objective out of max damage possible
 * Score calculation begins when the player targets the objective for the first time
 */
var scoreBoard = {
  objective: null,
  started: false,
  numHits: 0,
  numMiss: 0,
  numCanceled: 0
}


function startEngine(){
  resources.load([
    'art/vayne.png',
    'art/attackCursor.png',
    'art/dummy.png',
    'art/teeto.png'
  ]);
  resources.onReady(init);
}

function init(){
  //-------------------HTML ELEMENTS------------------//
  //Game Screen
  container = document.getElementById("canvasContainer");
  mConsole = document.getElementById("console");
  
  objectiveHPField = document.getElementById("objectiveHPField");
  canceledField = document.getElementById("canceledField");
  playerHPField = document.getElementById("playerHPField");

  //Score Screen
  scoreContainer = document.getElementById("scoreContainer");
  outcome = document.getElementById("outcome");
  scoreDetailsField = document.getElementById("scoreDetailsField");
                   


  //-------------------LISTENERS----------------------//
  //Mouse Move
  window.addEventListener('mousemove', 
    function (event) {
      var mousePos = [event.clientX, event.clientY];
      engine.hovered = getHovered(mousePos);
    }
  )

  //Right Click
  container.addEventListener("contextmenu", 
    function (e) {
      e.preventDefault();
        playerMove([event.clientX, event.clientY]);
    } 
  )
  
  //Key Down
  window.addEventListener('keydown', 
    function (e) {
      engine.keys = (engine.keys || []);
      engine.keys[e.keyCode] = true;
    }
  )

  //Key Up
  window.addEventListener('keyup', 
    function (e) {
      engine.keys[e.keyCode] = false;
    }
  )

  //------------------INIT CANVAS---------------------//
  engine.canvas = document.getElementById("contentContainer");
  engine.canvas.height = container.clientHeight;
  engine.canvas.width = container.clientWidth;
  engine.canvas.width = engine.canvas.height * (engine.canvas.clientWidth / engine.canvas.clientHeight);
  engine.ctx = engine.canvas.getContext("2d");
  engine.actorFactory = new ActorFactory();
  engine.units.push( engine.actorFactory.createActor("player", [50, 50], 35, 'art/vayne.png') );
  engine.units.push( engine.actorFactory.createActor("dummy", [200, 150], 35, 'art/teeto.png') );
  engine.units.push( engine.actorFactory.createActor("dummy", [400, 500], 35, 'art/teeto.png') );
  engine.units.push( engine.actorFactory.createActor("dummy", [600, 150], 35, 'art/teeto.png') );
  engine.units.push( engine.actorFactory.createActor("dummy", [800, 500], 35, 'art/teeto.png') );
  engine.units.push( engine.actorFactory.createActor("dummy", [1000, 150], 35, 'art/teeto.png') );
  scoreBoard.objective = engine.actorFactory.createActor("objective", [300, 300], 35, 'art/dummy.png');
  engine.units.push( scoreBoard.objective );
  //-----------------START GAME LOOP------------------//
  //Check browser compatibility
  var animFrame = window.requestAnimationFrame  ||
          window.webkitRequestAnimationFrame    ||
          window.mozRequestAnimationFrame       ||
          window.oRequestAnimationFrame         ||
          window.msRequestAnimationFrame        ||
          null ;
  if ( animFrame !== null ) {
      var recursiveAnim = function() {
          mainloop();
          animFrame( recursiveAnim );
      };
      // start the mainloop
      var player = engine.units[0];
      engine.lastTime = Date.now();
      engine.startTime = Date.now();
      scoreBoard.started = true;
      animFrame( recursiveAnim );
  } else {
      alert("Browser doesn't support requestAnimationFrame");
  }

  var mainloop = function() {
    if(!engine.gameOver){
      var now = Date.now();
      var dt = (now - engine.lastTime) / 1000.0;

      updateGame(dt);
      engine.lastTime = now;
    }
  };
}

function restart(){
  console.log("restart");
  window.location = 'index.html';
}
function updateScore(){
  var player = engine.units[0];
  //Player HP
  playerHPField.innerHTML = player.health + " / 15";

  //Objective HP
  objectiveHPField.innerHTML = scoreBoard.objective.health;

  //Canceled Attacks
  canceledField.innerHTML = scoreBoard.numCanceled;

  if(player.health < 1){
    var now = Date.now();
    var dt = (now - engine.startTime);
    engine.gameOver = true;
    scoreContainer.style.visibility = "visible";
    outcome.innerHTML = "You Died";
    scoreDetailsField.innerHTML = "Successfully fired " + scoreBoard.numHits + " attacks in " + dt/1000 + " seconds. <br>";
  }

  if(scoreBoard.objective.health < 1){
    var now = Date.now();
    var dt = (now - engine.startTime);
    engine.gameOver = true;
    scoreContainer.style.visibility = "visible";
    outcome.innerHTML = "Victory!";
    scoreDetailsField.innerHTML = "Successfully fired " + scoreBoard.numHits + " attacks in " + dt/1000 + " seconds. <br>";
  }
}


function updateGame(dt) {
  var needsRedraw = false; //Don't waste redraws unless necessary
  
  //---------------------UPDATE UNITS-------------------//
  for (var i = engine.units.length - 1; i >= 0; i--){
    var r = engine.units[i].update(dt);
    if ( r == 1 ) {
      needsRedraw = true;
    } else if ( r == 2 ) {
      playSound('kill');
      //console.log("Delete unit");
      needsRedraw = true;
      engine.units.splice(i, 1);
    }
  }
  
  //----------------------UPDATE PROJECTILES------------//
  for (var i = engine.projectiles.length-1; i >= 0; i--){
    var r = engine.projectiles[i].update(dt);
    if ( r == 1 ) {
      needsRedraw = true;
    } else if ( r == 2 ) {
      needsRedraw = true;
      engine.projectiles.splice(i, 1);
    }
  }

  //---------------------UPDATE KEYSTROKES--------------//
  // a
  if (engine.keys && engine.keys[65]) { 
    playerSetTarget(engine.hovered);
  }
  
  // s
  if (engine.keys && engine.keys[83]) { 
    playerStop();
  }

  //Redraw if needed
  if(needsRedraw == true){
    drawGame();
  } else {
    console.log("no draw necessary");
  }
}

function drawGame(dt) {
  engine.clear();

  //Units(player, targets, enemies, whatever)
  for (var i = engine.units.length - 1; i >= 0; i--){
    engine.units[i].draw();
  }
  
  //Projectiles
  for (var i = engine.projectiles.length-1; i >= 0; i--){
    engine.projectiles[i].draw();
    if(engine.projectiles[i].checkHit()){
      engine.projectiles.splice(i, 1);
        if(scoreBoard.started){
          updateScore();
        }
    }
  }
}