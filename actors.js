/**
 * Defines Actor Prototype and actor inheritors
 * Actor is almost anything that moves on the screen
 * Actors must define type, pos, radius
 * Actor draw and update functions are called by engine
 */

/**
 * needsUpdate codes:
 * 0 -> no update
 * 1 -> normal update
 * 2 -> update and remove
 */

function ActorFactory() {
    this.createActor = function (type, pos, radius, spriteUrl) {
        var mActor;
        if (type === "player") {
            mActor = new PlayerActor(type, pos, radius, spriteUrl);
            mActor.setProperties(170, 240, 600, 250, 500);  //Initialize with default stats
                                                   //MS, Range, Attack Period, Attack Anim Delay, Attack Stall Delay
        }
        else if (type ==="objective") {
            mActor = new ObjectiveActor(type, pos, radius, spriteUrl);
        } 
        else if (type ==="dummy") {
            mActor = new DummyActor(type, pos, radius, spriteUrl);
        } 
        else if (type === "projectile"){
            mActor = new ProjectileActor(type, pos, 8, spriteUrl);
            //mActor.setProperties(pos, 220);  //Default
        }
        else {
            console.log("Actor Type Undefined")
        }
        return mActor;
    }
}

function ActorProto (type, pos, radius, spriteUrl) {
    
    //Variables describing the properties of the actor    
    this.type = type;
    if(pos){ //Need this or else it attempts to read the pos from when an actor proto is defined (null)
        this.pos = [pos[0], pos[1]]; //must allocate new pos, or else takes reference to pos on heap
    }
    this.radius = radius;
    this.sprite = resources.get(spriteUrl);
    this.dest = this.pos;       //desired translation destination
    this.vector = [1, 0];       //direction of translation
    this.facing = [1, 0];       //current direction of face
    this.dir = [1,0];           //actor's desired facing direction

    //Variables for player commands
    this.oneMoreTick = true;        //hack solution to needing 1 more redraw 
    this.attackCommand = false;     //actor has been issued attackCommand?
    this.target = null;             //Current target selection

    //Variables for basic attack
    this.firing = false;            //actor is in firing animation?
    this.lastFired = Date.now();          //The last time this actor has successfully fired a projectile
    this.attackAnimBegin = null;    //Timer for animation leading up to firing the projectile
    this.isStalled = false;         //Stalls actor for animation after firing the projectile
    this.stallDelay = 500;          //How long actor is stalled. Default to 500

    //update() returns the value of needsUpdate
    //
    // needsUpdate codes:
    // 0 -> no update
    // 1 -> normal update
    // 2 -> update and remove this actor
    this.needsUpdate = 0;

    this.rotate = function(dt, _callback){
        var player = engine.units[0];
        if (this.attackCommand){
            this.dir = getUnitVector(player.pos, this.target.pos); 
        }
        var theta = getTheta(this.facing, this.dir);
        var omega = 10 * dt;
        if( Math.abs(theta) > omega){
            var x = this.facing[0];
            var y = this.facing[1];
            if(theta < 0){
                omega = omega*-1;
            } 
            xP = x*Math.cos(omega) - y*Math.sin(omega);
            yP = x*Math.sin(omega) + y*Math.cos(omega);

            this.facing = [xP, yP];
            this.needsUpdate = 1;
        } else if (this.oneMoreTick) { 
            // The troll 'oneMoreTick' part...
            this.oneMoreTick = false;
            this.facing = this.dir;
            this.needsUpdate = 1;
        } else {
            this.facing = this.dir;
            if (this.attackCommand) {
                this.attack(dt, function(){}); 
            }
        }
    }


    this.attack = function(dt, _callback){
        var player = engine.units[0];
        var now = Date.now();
        var ddt = (now - this.lastFired); //milliseconds
        
        //attack speed check
        if (ddt > this.attackPeriod){
            if (isInRadius(player.pos, this.range, this.target.pos)){
                //If it's not firing already, fire
                if(!this.firing){
                    this.firing = true;
                    this.attackAnimBegin = now;
                } else if (this.firing) {
                    var dddt = (now - this.attackAnimBegin);
                    if (dddt > this.attackDelay){
                        this.firing = false;
                        this.attackAnimBegin = null;
                        fireProjectile(this.pos, this.target.pos, 800);
                        if(scoreBoard.started){
                            if(this.target == scoreBoard.objective){
                                scoreBoard.numHits += 1;
                            } else {
                                scoreBoard.numMiss += 1;
                            }
                        }
                        this.lastFired = now;
                        //Player is stalled after firing projectile
                        this.isStalled = true;
                    }
                }
            } else {
                
            }
        }
    }


    this.translate = function(dt, _callback){
        var player = engine.units[0];
        if (this.attackCommand){
            if (!isInRadius(player.pos, player.range, this.target.pos)){
                var mag = getDistance(player.pos, this.target.pos) - (player.range - 20);
                var aDir = getUnitVector(player.pos,this.target.pos);
                var x = player.pos[0] + aDir[0] * mag;
                var y = player.pos[1] + aDir[1] * mag;
                playerMove([x, y]);
            }
            this.attackCommand = true;
        }
        //Update position
        var heading = getUnitVector(this.pos, this.dest); 
        //If heading vector direction opposite of vector, then we've passed/reached the destination
        //Check for sign change.
        if( (heading[0]*this.vector[0] > 0) || ( heading[1]*this.vector[1] > 0)){
            this.pos[0] += this.vector[0] * this.speed * dt;
            this.pos[1] += this.vector[1] * this.speed * dt;
            this.needsUpdate = 1;
        } else {
            this.pos = this.dest;
            _callback();
        }
    }

    this.update = function(dt){
        return 0;
    }

    this.draw = function(){
        var ctx = engine.ctx;

        var x = Math.round(this.pos[0]); //round pos to avoid sub-pixel rendering
        var y = Math.round(this.pos[1]);

        ctx.lineWidth = 15;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, 2*Math.PI);
        engine.ctx.strokeStyle="#000000";
        ctx.stroke();

        ctx.closePath();
        ctx.clip();
        if(this.sprite){
            ctx.drawImage(this.sprite, x - radius, y - radius, this.radius*2, this.radius*2);
        }
        ctx.restore();
    }
}

function PlayerActor(type, pos, radius, spriteUrl) {
    ActorProto.call(this, "player", pos, radius, spriteUrl);
    
    this.setProperties = function(speed, range, attackPeriod, attackDelay, stallDelay){
        this.speed = speed;
        this.range = range;
        this.attackPeriod = attackPeriod;
        this.attackDelay = attackDelay; 
        this.stallDelay = stallDelay;
    }

    this.update = function(dt){
        //Player cannot translate while stalled, but can still rotate and attack
        if (!this.isStalled){
            //Update position
            this.translate(dt, function(){
                //no callback needed yet...
            });
        } else {
            var now = Date.now();
            var ddt = (now - this.lastFired); //milliseconds
            if (ddt > this.stallDelay){
                this.isStalled = false;
            }    
        }
        //Update direction
        this.rotate(dt, function(){
            //no callback needed yet...
        });

        return this.needsUpdate;
    }

    this.draw = function() {
        var ctx = engine.ctx;

        var x = Math.round(this.pos[0]); //round pos to avoid sub-pixel rendering
        var y = Math.round(this.pos[1]);

        //Draw and clip unit circle
        ctx.lineWidth = 5;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, 2*Math.PI);
        ctx.lineWidth = 10;
        ctx.strokeStyle="#2eb82e";
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        //Draw portrait if available
        if(this.sprite){
            ctx.drawImage(this.sprite, x - radius, y - radius, this.radius*2, this.radius*2);
        }
        ctx.restore();

        //Draw fire indicator

        if (this.firing){
            var omega = (( Date.now() - this.attackAnimBegin ) / this.attackDelay )  * 2 * Math.PI;

            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle="#cc0000";
            ctx.arc(x, y, radius + 5, 0, omega);
            ctx.stroke();
            ctx.closePath;
        }

        //Draw direction arrow
        var perpFace = [this.facing[1]*-1, this.facing[0]];
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(x + perpFace[0]*20, y + perpFace[1]*20);
        ctx.lineTo(x + this.facing[0]*radius*1.5, y + this.facing[1]*radius*1.5);
        ctx.lineTo(x - perpFace[0]*20, y - perpFace[1]*20);
        ctx.strokeStyle="#ffff00";
        ctx.stroke();
        //Draw range indicator
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle="#0099ff";
        ctx.arc(x, y, this.range, 0, 2*Math.PI);
        ctx.stroke();
        ctx.closePath;
    }
    this.draw();
}
PlayerActor.prototype = new ActorProto();


/**
 * Unlike normal actors, projectiles are very short lived
 * 
 * When constructed they're just a stationary sprite
 * Must call impulse(dest, speed) to 'fire' projectile
 * Once impulse(dest, speed) is called, the projectile is given a vector, speed, and time to live (ttl)
 * Projectile travels in speed * direction vector until it reaches its ttl and is deleted
 * 
 * All projectiles will default to expire after 1 second
 *
 * Projectiles are purely visual, damage calculation occurs regardless of animation
 */
function ProjectileActor(type, pos, radius, spriteUrl) {
    ActorProto.call(this, "projectile", pos, radius, spriteUrl);

    this.ownership = 1; //friendly or enemy projectile
    this.moving = false; //Projectile doesn't move until given impulse(dest, speed)
    this.vector = [0,1];
    this.ttl = 1000;


    this.impulse = function(dest, speed) {
        if(scoreBoard.started){
            updateScore();
        }
        this.vector = getUnitVector(this.pos, dest);
        console.log(this.vector);
        this.dest = dest;
        this.speed = speed;
        this.timeFired = Date.now();
        this.ttl = (getDistance(this.pos, dest) / speed) * 1000;
        this.moving = true;
    }

    //Used for 'skill shots'
    this.impulseWithManualTTL = function (dest, speed, ttl){
        this.ownership = 0;
        this.vector = getUnitVector(this.pos, dest);
        this.dest = dest;
        this.speed = speed;
        this.timeFired = Date.now();
        this.ttl = ttl;
        this.moving = true;
    }

    this.update = function(dt){
        if(this.moving){
            var now = Date.now();
            var ddt = (now - this.timeFired);

            if (ddt < this.ttl){
                this.pos[0] += this.vector[0] * this.speed * dt;
                this.pos[1] += this.vector[1] * this.speed * dt;
                this.needsUpdate = 1;                
            } else {
                console.log("proj expire");
                this.pos = this.dest;
                this.needsUpdate = 2;
            }
        } else {
            this.needsUpdate = 0;
        }
        return this.needsUpdate;
    }
    
    this.draw = function() {
        var ctx = engine.ctx;

        var x = Math.round(this.pos[0]); //round pos to avoid sub-pixel rendering
        var y = Math.round(this.pos[1]);

        //Draw and clip unit circle
        ctx.lineWidth = 5;
        ctx.save();
        ctx.beginPath();
        //ctx.moveTo(this.pos[0], this.pos[1]);
        console.log(this.vector);
        //ctx.lineTo(this.pos[0] - (this.vector[0] * 30), this.pos[1] - (this.vector[1] * 30)) ;
        ctx.arc(x, y, this.radius, 0, 2*Math.PI);
        ctx.lineWidth = 7;
        ctx.strokeStyle="#000000";
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        ctx.restore();
        //Draw direction arrow
        var perpFace = [this.vector[1]*-1, this.vector[0]];
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x + perpFace[0]*10, y + perpFace[1]*10);
        ctx.lineTo(x + this.vector[0]*radius*2.5, y + this.vector[1]*radius*2.5);
        ctx.lineTo(x - perpFace[0]*10, y - perpFace[1]*10);
        if (this.ownership == 1){
            ctx.strokeStyle = "#2eb82e";
        } else {
            ctx.strokeStyle = "#FF0000";
        }
        ctx.stroke();
        ctx.closePath();
    }

    this.draw();
}
ProjectileActor.prototype = new ActorProto();

function ObjectiveActor(type, pos, radius, spriteUrl) {
    ActorProto.call(this, "objective", pos, radius, spriteUrl);
    this.turnFlag = 1; //Indicates forwards or backwards
    this.speed = 1;
    this.update = function(dt){
        if(this.pos[0] < engine.canvas.width && this.pos[0] > 0){
            if(this.turnFlag == 1){
                //console.log("forwards");
                this.pos[0] += this.speed;
            } else {
                //console.log("backwards");
                this.pos[0] -= this.speed;
            }
        } else {
            //console.log("turn");
            this.pos[0] = this.pos[0] - (this.turnFlag * 5); //boost pos by +/- 5 so it doesn't get stuck on the edges
            this.turnFlag = this.turnFlag * -1;
        }
        return this.needsUpdate;
    }

    this.draw = function(){
        var ctx = engine.ctx;

        var x = Math.round(this.pos[0]); //round pos to avoid sub-pixel rendering
        var y = Math.round(this.pos[1]);

        ctx.lineWidth = 15;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, 2*Math.PI);
        engine.ctx.strokeStyle="#FF0000";
        ctx.stroke();
        
        ctx.closePath();
        ctx.clip();
        if(this.sprite){
            ctx.drawImage(this.sprite, x - radius, y - radius, this.radius*2, this.radius*2);
        }
        ctx.restore();
    }
    
}
ObjectiveActor.prototype = new ActorProto();


function DummyActor(type, pos, radius, spriteUrl) {
    ActorProto.call(this, "dummy", pos, radius, spriteUrl);
    this.lastFired = Date.now();
    this.attackPeriod = 1500;

    this.attack = function(){
        var player = engine.units[0];
        var now = Date.now();
        var dt = (now - this.lastFired);
        if(dt > this.attackPeriod){
            var v = getUnitVector(this.pos, player.pos);
            var d = v*1000;

            var p = engine.actorFactory.createActor("projectile", this.pos, 10, 'art/dfummy.png');
            p.impulseWithManualTTL(player.pos, 200, 5000);
            engine.projectiles.push(p);
            this.lastFired = now;
        }
    }

    this.update = function(dt){
      
        this.attack();
        return this.needsUpdate;
    }

    //Should call default actor redraw
    this.draw();
}
DummyActor.prototype = new ActorProto();