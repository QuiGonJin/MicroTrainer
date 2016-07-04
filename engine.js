var engine = {
  //Placeholder variables for engine prototype. Must not be null.
  canvas: null,
  container: null,
  console: null,
  ctx: null,
  actorFactory: null,
  actors: [],
  clear: function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function startEngine(){
  //-------------------HTML ELEMENTS------------------//
  engine.container = document.getElementById("canvasContainer");
  engine.console = document.getElementById("console");

  //-------------------LISTENERS----------------------//
  //Mouse Move
  window.addEventListener('mousemove', 
    function (event) {
      engine.mousePos = [event.clientX, event.clientY];

      engine.console.textContent =
      "[" + event.clientX +
      ", " + event.clientY + "]";
    }
  )

  //Right Click
  engine.container.addEventListener("contextmenu", 
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
  engine.canvas.height = engine.container.clientHeight;
  engine.canvas.width = engine.container.clientWidth;
  engine.canvas.width = engine.canvas.height * (engine.canvas.clientWidth / engine.canvas.clientHeight);
  engine.ctx = engine.canvas.getContext("2d");
  engine.actorFactory = new ActorFactory();
  engine.actors.push( engine.actorFactory.createActor("player", [50, 50], 50) );
  engine.actors.push( engine.actorFactory.createActor("player", [150, 150], 50) );


  //-----------------START GAME LOOP------------------//
  var mainloop = function() {
      updateGame();
  };
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
      animFrame( recursiveAnim );
  } else {
      alert("Browser doesn't support requestAnimationFrame");
  }
}

function updateGame() {
  var needsRedraw = false; //Don't waste redraws unless necessary
  
  //---------------------UPDATE ACTORS-----------------//
  for (var i = 0; i < engine.actors.length; i++){
    if ( engine.actors[i].update() == true ) {
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

function drawGame() {
  engine.clear();

  for (var i = 0; i < engine.actors.length; i++){
    engine.actors[i].redraw();
  }
}