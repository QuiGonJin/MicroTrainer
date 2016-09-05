var container;
var mConsole;
var scoreField;
var scoreContainer;
var canceledField;
/**
 * Holds state and functions related to game canvas
 */
var engine = {
  //Placeholder variables for engine prototype. Initialized once game loads
  canvas: null,
  ctx: null,
  lastTime: null,
  
  actorFactory: null,
  units: [],
  projectiles: [],
  hovered: null,
  clear: function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

/**
 * Variables related to scorekeeping
 * Score is calculated as a percentage of damage dealt to the objective out of max damage possible
 * Score calculation begins when the player targets the objective for the first time
 */
var scoreBoard = {
  objective: null,
  started: false,
  startTime: null,
  numHits: 1,
  numMiss: 0,
  numCanceled: 0
}


function startEngine(){
  resources.load([
    'art/vayne.png',
    'art/attackCursor.png',
    'art/dummy.png'
  ]);
  resources.onReady(init);
}

function init(){
  //-------------------HTML ELEMENTS------------------//
  container = document.getElementById("canvasContainer");
  mConsole = document.getElementById("console");
  scoreContainer = document.getElementById("score");
  scoreField = document.getElementById("scoreField");
  canceledField = document.getElementById("canceledField");
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
  engine.units.push( engine.actorFactory.createActor("dummy", [150, 150], 35, 'art/duffmmy.png') );
  engine.units.push( engine.actorFactory.createActor("dummy", [350, 350], 35, 'art/dummy.png') );
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
      //reset(); << this is where reset should go
      var player = engine.units[0];
      engine.lastTime = Date.now();
      player.lastFired = Date.now();
      animFrame( recursiveAnim );
  } else {
      alert("Browser doesn't support requestAnimationFrame");
  }

  var mainloop = function() {
      var now = Date.now();
      var dt = (now - engine.lastTime) / 1000.0;

      updateGame(dt);
      engine.lastTime = now;
      //drawGame(dt); Will be called by updateGame if necessary
  };
}

function updateScore(){
  var now = Date.now();
  var dt = (now - scoreBoard.startTime);
  //console.log("Total time:" + dt);
  
  var maxAttacks = Math.trunc(dt / (engine.units[0].attackPeriod + engine.units[0].attackDelay)) + 1;
  console.log("MAX: " + maxAttacks);
  console.log("YOURS: " + scoreBoard.numHits)

  var myScore = Math.trunc((scoreBoard.numHits / maxAttacks) * 100);
  scoreField.innerHTML = myScore + "%";
  if (myScore < 25) {
    scoreContainer.style.backgroundColor = "#cc0000";
  } else if (myScore < 50) {
    scoreContainer.style.backgroundColor = "#ff6666";
  } else if (myScore < 75) {
    scoreContainer.style.backgroundColor = "#ffcc00";
  } else if (myScore < 85) {
    scoreContainer.style.backgroundColor = "#2eb82e";
  } else {
    scoreContainer.style.backgroundColor = "#00FFFF";
  }

  canceledField.innerHTML = scoreBoard.numCanceled;
}


function updateGame(dt) {
  var needsRedraw = false; //Don't waste redraws unless necessary
  
  //---------------------UPDATE UNITS-------------------//
  for (var i = engine.units.length - 1; i >= 0; i--){
    var r = engine.units[i].update(dt);
    if ( r == 1 ) {
      needsRedraw = true;
    } else if ( r == 2 ) {
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
    //console.log("no draw necessary");
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
  }
}