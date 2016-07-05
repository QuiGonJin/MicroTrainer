function playerMove(dest){
    actor.oneMoreTick = true;

    actor.waitingToFire = false;

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

function playerAttack(){
    actor.oneMoreTick = true;
    
    var player = engine.units[0];

    if (engine.hovered != null){
        if (isInRadius(player.pos, 400, engine.hovered.pos)){
            actor.target = engine.hovered;
            player.oneMoreTick = true;
            playerStop();
            player.dir = getUnitVector(player.pos, engine.hovered.pos);
            actor.waitingToFire = true;
            //fireProjectile(player.pos, engine.hovered.pos, 1200);
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

function fireProjectile(source, dest, speed) {
    console.log("fire projectfeaile");
    var p = engine.actorFactory.createActor("projectile", source, 10, 'art/dfummy.png');
    p.setProperties(dest, speed);
    engine.projectiles.push(p);
    actor.waitingToFire = false;
}

function playerStop(){
    var player = engine.units[0];

    player.dest = player.pos;
    player.vector = player.facing;
    actor.waitingToFire = false;

    mConsole.textContent = "playerStop()";
}
