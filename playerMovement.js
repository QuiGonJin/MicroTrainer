
function playerMove(dest){
    var player = engine.units[0];

    //manual move command overrides all other animations
    playerStop();

    player.oneMoreTick = true;
    player.isStalled = false;

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

function playSound(type){
    var pick = type + Math.floor((Math.random() * 3) + 1);
    sounds[pick].play();
}

function playerSetTarget(targ){
    var player = engine.units[0];
    player.isStalled = false;

    var originalTarget = player.target;
    if (targ == null) {
        player.target = getClosestActor(player.pos);
    } else {
        player.target = targ;
    }
    //Only reset attack bar if player selected a different target
    if (player.target == originalTarget){
        player.dest = player.pos;
        player.vector = player.facing;
        player.dir = getUnitVector(player.pos, player.target.pos);
        player.attackCommand = true;
    } else {
        playerStop();
        player.dir = getUnitVector(player.pos, player.target.pos);
        player.attackCommand = true;
    }
}

function fireProjectile(source, dest, speed) {
    var player = engine.units[0];
    var now = Date.now();
    var p = engine.actorFactory.createActor("projectile", source, 10, 'art/dfummy.png');
    //sounds['fire2'].play();
    playSound('fire');
    p.impulse(dest, speed);
    engine.projectiles.push(p);
}

function playerStop(){
    var player = engine.units[0];
    if(player.firing){
        player.firing = false;
        scoreBoard.numCanceled += 1;
        updateScore();
    }
    player.dest = player.pos;
    player.vector = player.facing;
    player.dir = player.facing;
    player.attackCommand = false;
}
