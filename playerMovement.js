function playerMove(dest){
    var player = engine.units[0];

    actor.firing = false;
    actor.oneMoreTick = true;
    actor.attackCommand = false;
    if(getHovered(dest) == null){

        var xPosition = dest[0];
        var yPosition = dest[1];
        var destPos = [xPosition, yPosition];

        player.dest = destPos;
        player.vector = getUnitVector(player.pos, player.dest); 
        player.dir = player.vector;
    } else {
        playerSetTarget(getHovered(dest));
    }
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

    if (!isInRadius(player.pos, player.range, actor.target.pos)){
        var mag = getDistance(player.pos, actor.target.pos) - (player.range - 1);
        var aDir = getUnitVector(player.pos,actor.target.pos);
        var x = player.pos[0] + aDir[0] * mag;
        var y = player.pos[1] + aDir[1] * mag;
        playerMove([x, y]);
    }

    actor.attackCommand = true;
}

function fireProjectile(source, dest, speed) {
    var player = engine.units[0];
    if(actor.attackCommand){
        console.log("fire projectfeaile");
        var now = Date.now();
        var p = engine.actorFactory.createActor("projectile", source, 10, 'art/dfummy.png');
        p.setProperties(dest, speed);
        engine.projectiles.push(p);
        actor.lastFired = now;
    }
}

function playerStop(){
    var player = engine.units[0];

    actor.firing = false;
    player.dest = player.pos;
    player.vector = player.facing;
    player.dir = player.facing;
    actor.attackCommand = false;

    mConsole.textContent = "playerStop()";
}
