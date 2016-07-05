function playerMove(dest){
    oneMoreTick = true;

    var player = engine.actors[0];
    var xPosition = dest[0];
    var yPosition = dest[1];
    var destPos = [xPosition, yPosition];
    logTuple("destPos", destPos);
    
    player.dest = destPos;
    player.vector = getUnitVector(player.pos, player.dest); 

    mConsole.textContent = "playerMove(dest) : " +
    "[" + event.clientX +
    ", " + event.clientY + "]";
}

function playerAttack(){
    oneMoreTick = true;
    
    var player = engine.actors[0];

    if (engine.hovered != null){
        if (isInRadius(player.pos, 400, engine.hovered.pos)){
            playerStop();
            console.log("hit");
            player.vector = getUnitVector(player.pos, engine.hovered.pos);
        } else {
            console.log("out of range");
        }
    } else {
        console.log("what nigga");
    }
    mConsole.textContent = "Attack(e) : " +
    "[" + engine.mousePos[0] +
    ", " + engine.mousePos[1] + "]";   
}

function playerStop(){
    var player = engine.actors[0];

    player.dest = player.pos;
    player.vector = player.facing;

    mConsole.textContent = "playerStop()";
}
