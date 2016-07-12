function playerMove(dest){
    actor.oneMoreTick = true;

    actor.readyToFire = false;

    var player = engine.units[0];
    var xPosition = dest[0];
    var yPosition = dest[1];
    var destPos = [xPosition, yPosition];
    logTuple("destPos", destPos);
    
    player.dest = destPos;
    player.vector = getUnitVector(player.pos, player.dest); 
    player.dir = player.vector;

    // mConsole.textContent = "playerMove(dest) : " +
    // "[" + event.clientX +
    // ", " + event.clientY + "]";
}

function playerSetTarget(pos){
    var player = engine.units[0];
    if(engine.hovered != null){
        actor.target = engine.hovered;
    } else {
        actor.target = getClosestActor(player.pos);
    }
    
    if (isInRadius(player.pos, 400, actor.target.pos)){
        actor.oneMoreTick = true;
        playerStop();
        player.dir = getUnitVector(player.pos, actor.target.pos);
        playerSetAttack();
    } else {
        console.log("out of range");
    }
}


function playerSetAttack(){
    // var player = engine.units[0];
    // var now = Date.now();
    // var dt = (now - actor.lastFired); //milliseconds

    //actor.waitingToFire = false;
    actor.readyToFire = true;

}

function fireProjectile(source, dest, speed) {
    console.log("fire projectfeaile");
    var now = Date.now();

    var p = engine.actorFactory.createActor("projectile", source, 10, 'art/dfummy.png');
    p.setProperties(dest, speed);
    engine.projectiles.push(p);
    actor.lastFired = now;
}

function playerStop(){
    var player = engine.units[0];

    player.dest = player.pos;
    player.vector = player.facing;
    actor.readyToFire = false;

    mConsole.textContent = "playerStop()";
}
