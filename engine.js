var actors = [];

var engine = {
  canvas: null,
  ctx: null,
  clear: function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function startEngine(){
  var container = document.getElementById("canvasContainer");
  container.addEventListener("contextmenu", rightclick);
  
  engine.canvas = document.getElementById("contentContainer");
  engine.canvas.height = container.clientHeight;
  engine.canvas.width = container.clientWidth;
  engine.canvas.width = engine.canvas.height * (engine.canvas.clientWidth / engine.canvas.clientHeight);
  engine.ctx = engine.canvas.getContext("2d");
  
  var factory = new ActorFactory();
  actors.push( factory.createActor("player", [50, 50], 50) );
  actors.push( factory.createActor("player", [150, 150], 50) );

  var mainloop = function() {
      updateGame();
  };
  var animFrame = window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          null ;
  if ( animFrame !== null ) {
      var recursiveAnim = function() {
          mainloop();
          animFrame( recursiveAnim );
      };
      // start the mainloop
      animFrame( recursiveAnim );
  } else {
      alert("browser doesn't support requestAnimationFrame");
  }
}

function rightclick(event) {
  var rightclick;
  var e = window.event;
  if (e.which) rightclick = (e.which == 3);
  else if (e.button) rightclick = (e.button == 2);
  
  handleRightClick(event);
  
  document.getElementById('console').textContent =
    "clientX: " + event.clientX +
    " - clientY: " + event.clientY;
}

function updateGame() {
  var needsRedraw = false;
  for (var i = 0; i < actors.length; i++){
    if ( actors[i].update() == true ) {
        needsRedraw = true;
    }
  }
  if(needsRedraw == true){
    drawGame();
  } else {
    //console.log("no draw necessary");
  }
}

function drawGame() {
  engine.clear();

  for (var i = 0; i < actors.length; i++){
    actors[i].redraw();
  }
}