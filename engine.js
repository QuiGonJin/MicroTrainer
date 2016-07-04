var container;
var mConsole;


/**
 * Holds state and functions related to game canvas
 */
var engine = {
  //Placeholder variables for engine prototype. Initialized once game loads
  canvas: null,
//  container: null,
//  console: null,
  ctx: null,
  lastTime: null,
  
  actorFactory: null,
  actors: [],
  clear: function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
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

  //-------------------LISTENERS----------------------//
  //Mouse Move
  window.addEventListener('mousemove', 
    function (event) {
      engine.mousePos = [event.clientX, event.clientY];

      mConsole.textContent =
      "[" + event.clientX +
      ", " + event.clientY + "]";
    }
  )

  //Right Click
  container.addEventListener("contextmenu", 
    function (e) {
      e.preventDefault();
      playerMove(event);
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
  engine.actors.push( engine.actorFactory.createActor("player", [50, 50], 35, 'art/vayne.png') );
  engine.actors.push( engine.actorFactory.createActor("dummy", [150, 150], 50, 'art/dummy.png') );


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
      engine.lastTime = Date.now();
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

function updateGame(dt) {
  var needsRedraw = false; //Don't waste redraws unless necessary
  
  //---------------------UPDATE ACTORS-----------------//
  for (var i = 0; i < engine.actors.length; i++){
    if ( engine.actors[i].update(dt) == true ) {
        needsRedraw = true;
    }
  }

  //---------------------UPDATE KEYSTROKES-------------//
  // a
  if (engine.keys && engine.keys[65]) { 
    playerAttack();
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

  for (var i = 0; i < engine.actors.length; i++){
    engine.actors[i].draw();
  }
}