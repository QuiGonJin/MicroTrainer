function playerMove(e){
    var player = engine.actors[0];

    var xPosition = e.clientX;
    var yPosition = e.clientY;
    var destPos = [xPosition, yPosition];
    logTuple("destPos", destPos);
    
    player.dest = destPos;
    player.vector = getUnitVector(player.pos, player.dest); 

    mConsole.textContent = "playerMove(e) : " +
    "[" + event.clientX +
    ", " + event.clientY + "]";
}

function playerAttack(){
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




function getUnitVector(curPos, destPos){
    deltaX = destPos[0] - curPos[0];
    deltaY = destPos[1] - curPos[1];
    
    magnitude = Math.sqrt( Math.pow(deltaX, 2) + Math.pow(deltaY, 2) );
    vecX =  deltaX / magnitude;
    vecY =  deltaY / magnitude;
    
    return [vecX, vecY];
}

function getTheta(vec1, vec2){
    var x1 = vec1[0];
    var x2 = vec2[0];
    var y1 = vec1[1];
    var y2 = vec2[1];


    var dot = x1*x2 + y1*y2;    
    var det = x1*y2 - y1*x2;

    var angle = Math.atan2(det, dot);
    return angle;
}

function getDistance(curPos, destPos){
    return Math.sqrt( 
           Math.pow((destPos[0] - curPos[0]), 2) + 
           Math.pow((destPos[1] - curPos[1]), 2)
    )
}

function logTuple(description, e){
    console.log(description + "--> X: "+ e[0] + ", Y: " + e[1]);
    
}

function getElemPosition(elem){
    return [ elem.offsetLeft, 
             elem.offsetTop];
}
