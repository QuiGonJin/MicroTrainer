var container;
var mConsole;

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

      for (var i = 0; i < engine.units.length; i++){
        if( isInRadius(engine.units[i].pos, engine.units[i].radius, engine.mousePos) ){
          mConsole.textContent = "Is on Actor: " + i;
          engine.hovered = engine.units[i];
          document.body.style.cursor = "crosshair";
          break;
        } else {
          document.body.style.cursor = "auto"; 
          engine.hovered = null;
          mConsole.textContent = "";
        }
      }
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
      if (e.keyCode == 65){
        playerSetTarget(engine.mousePos);
        //playerAttack();
      }
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
  //engine.units.push( engine.actorFactory.createActor("projectile", [250, 300], 10, 'art/dfummy.png') );

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
      actor.lastFired = Date.now();
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
    //playerAttack();
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