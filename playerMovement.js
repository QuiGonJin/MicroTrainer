function playerMove(dest){
    actor.oneMoreTick = true;
    actor.attackCommand = false;
    var player = engine.units[0];
    var xPosition = dest[0];
    var yPosition = dest[1];
    var destPos = [xPosition, yPosition];
    //logTuple("destPos", destPos);
    
    player.dest = destPos;
    player.vector = getUnitVector(player.pos, player.dest); 
    player.dir = player.vector;
}

function playerSetTarget(targ){
    var player = engine.units[0];

    if (targ == null) {
        actor.target = getClosestActor(player.pos);
    } else {
        actor.target = targ;
    }
    playerStop();
    player.dir = getUnitVector(player.pos, actor.target.pos);

    if (!isInRadius(player.pos, 300, actor.target.pos)){
        var mag = getDistance(player.pos, actor.target.pos) - 299;
        var aDir = getUnitVector(player.pos,actor.target.pos);
        var x = player.pos[0] + aDir[0] * mag;
        var y = player.pos[1] + aDir[1] * mag;
        playerMove([x, y]);
    }

    actor.attackCommand = true;
}

function fireProjectile(source, dest, speed) {
    var player = engine.units[0];
    if (isInRadius(player.pos, 300, actor.target.pos)){
        console.log("fire projectfeaile");
        var now = Date.now();
        var p = engine.actorFactory.createActor("projectile", source, 10, 'art/dfummy.png');
        p.setProperties(dest, speed);
        engine.projectiles.push(p);
        actor.lastFired = now;
    } else {
        console.log("out of range");
    }
}

function playerStop(){
    var player = engine.units[0];

    player.dest = player.pos;
    player.vector = player.facing;
    player.dir = player.facing;
    actor.attackCommand = false;

    mConsole.textContent = "playerStop()";
}
