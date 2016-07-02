var player = {
  sprite: null,
  pos: null,
  dest: null,
  speed: 4,
  currentVector:[1,0],
  vector: [0,0]
}

function startEngine(){
  var container = document.getElementById("contentContainer");
  container.addEventListener("contextmenu", rightclick);
  
  player.sprite = document.getElementById("player");
  player.sprite.innerText = "nig";
  player.pos = getElemPosition(player.sprite);
  player.dest = getElemPosition(player.sprite);
  player.nPos = getElemPosition(player.sprite);
  

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
    player.pos[0] += player.vector[0]*player.speed;
    player.pos[1] += player.vector[1]*player.speed;
    drawGame();
  } else {
    console.log("no movement");
  }

}

function drawGame() {
  player.sprite.style.top =  (player.pos[1] + player.vector[1]*player.speed) + 'px';
  player.sprite.style.left = (player.pos[0] + player.vector[0]*player.speed) + 'px';
  player.sprite.rotate(1);
}