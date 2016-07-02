var engine = {
  canvas: null,
  ctx: null,
  clear: function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

var player = {
  sprite: null,
  pos: null,
  radius: null,
  dest: null,
  speed: 4,
  vector: [0,0],
  init: function(x, y, radius) {
    this.pos = [x, y];
    this.radius = radius;
    this.dest = [x, y];
    engine.ctx.beginPath();
    engine.ctx.arc(x,y,radius,0,2*Math.PI);
    engine.ctx.stroke();
  },
  redraw: function(){
    engine.ctx.beginPath();
    engine.ctx.arc(this.pos[0], this.pos[1], this.radius, 0, 2*Math.PI);
    engine.ctx.stroke();
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
  
  p1 =  player.init(50, 50, 50);

  var mainloop = function() {
      updateGame();
      //drawGame();
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
  if(getDistance(player.pos, player.dest) > 4 ){
    player.pos[0] += player.vector[0] * player.speed;
    player.pos[1] += player.vector[1] * player.speed;
    drawGame();
  } else {
    //console.log("no movement");
  }

}

function drawGame() {
  engine.clear();
  player.redraw();
}