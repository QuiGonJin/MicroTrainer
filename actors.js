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

var actor = {
    oneMoreTick: true, //hack solution to needing 1 more redraw 
    attackCommand: false,
    firing: false,
    attackAnimBegin: null,
    lastFired: null,
    target: null,
}


function ActorFactory() {
    this.createActor = function (type, pos, radius, spriteUrl) {
        var mActor;
        if (type === "player") {
            mActor = new PlayerActor(type, pos, radius, spriteUrl);
            mActor.setProperties(220, 200, 600, 250);  //Initialize with default stats
                                                   //MS, Range, Attack Period, Attack Anim Delay
        }  
        else if (type ==="dummy") {
            mActor = new DummyActor(type, pos, radius, spriteUrl);
        } 
        else if (type === "projectile"){
            mActor = new ProjectileActor(type, pos, radius, spriteUrl);
            mActor.setProperties(pos, 220);  //Default
        }
        else {
            console.log("Actor Type Undefined")
        }
        return mActor;
    }
}

function ActorProto (type, pos, radius, spriteUrl) {
    this.type = type;
    if(pos){ //Need this or else it attempts to read the pos from when an actor proto is defined (null)
        this.pos = [pos[0], pos[1]]; //must allocate new pos, or else takes reference to pos on heap
    }
    this.radius = radius;
    this.sprite = resources.get(spriteUrl);
    this.needsUpdate = 0;


    this.vector = [1, 0]; //direction of translation
    this.facing = [1, 0]; //current direction of face
    this.dir = [1,0];     //dest direction
    this.dest = this.pos;

    this.rotate = function(dt, _callback){
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
        } else if (actor.oneMoreTick) { // The troll part...
            actor.oneMoreTick = false;
            this.facing = this.dir;
            this.needsUpdate = 1;
        } else {
            this.facing = this.dir;

            if (actor.attackCommand) {
                this.attack(dt, fireProjectile); 
            }
        }
    }


    this.attack = function(dt, _callback){
        var player = engine.units[0];
        var now = Date.now();
        var ddt = (now - actor.lastFired); //milliseconds
        
        //attack speed check
        if (ddt > this.attackPeriod){
            if (isInRadius(player.pos, this.range, actor.target.pos)){
                //If it's not firing already, fire
                if(!actor.firing){
                    console.log("Set fire");
                    actor.firing = true;
                    actor.attackAnimBegin = now;
                } else if (actor.firing) {
                    var dddt = (now - actor.attackAnimBegin);
                    if (dddt > this.attackDelay){
                        console.log(dddt);
                        console.log("FIRING");
                        actor.firing = false;
                        actor.attackAnimBegin = null;
                        _callback.apply(null, [this.pos, actor.target.pos, 800]);
                    }
                }
            } else {
                
            }
        }
    }

    this.translate = function(dt, _callback){
        //Update position
        var heading = getUnitVector(this.dest, this.pos); //I don't know why this is backwards? yolo...
        //If heading vector direction opposite of vector, then we've passed/reached the destination
        //Check for sign change. For some peculiar reason this 'if' is true when the 'heading' and 'vector' are opposite
        if( (heading[0]*this.vector[0] < 0) || ( heading[1]*this.vector[1] < 0)){
            this.pos[0] += this.vector[0] * this.speed * dt;
            this.pos[1] += this.vector[1] * this.speed * dt;
            this.needsUpdate = 1;
        } else {
            this.pos = this.dest;
            _callback();
        }
    }

    this.update = function(dt){
        //console.log("default actor update: ");
        return 0;
    }

    this.draw = function(){
        //console.log("default actor draw: ");
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
    
    this.setProperties = function(speed, range, attackPeriod, attackDelay){
        this.speed = speed;
        this.range = range;
        this.attackPeriod = attackPeriod;
        this.attackDelay = attackDelay; 
    }

    this.update = function(dt){

        //Update position
        this.translate(dt, function(){
            // nothing yet...
        });
        
        //Update direction
        this.rotate(dt, function(){
            //nothing yet...
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

        if (actor.firing){
            var omega = (( Date.now() - actor.attackAnimBegin ) / this.attackDelay )  * 2 * Math.PI;

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

function ProjectileActor(type, pos, radius, spriteUrl) {
    ActorProto.call(this, "projectile", pos, radius, spriteUrl);
    
    this.setProperties = function(dest, speed){
        this.vector = getUnitVector(this.pos, dest);
        this.dest = dest;
        this.speed = speed;
    }

    this.update = function(dt){
        //Update position
        var heading = getUnitVector(this.dest, this.pos); //I don't know why this is backwards? yolo...
        //If heading vector direction opposite of vector, then we've passed/reached the destination
        //Check for sign change. For some peculiar reason this 'if' is true when the 'heading' and 'vector' are opposite
        if( (heading[0]*this.vector[0] < 0) || ( heading[1]*this.vector[1] < 0)){
            this.pos[0] += this.vector[0] * this.speed * dt;
            this.pos[1] += this.vector[1] * this.speed * dt;
            this.needsUpdate = 1;
        } else {
            this.pos = this.dest;
            this.needsUpdate = 2;
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
        //Draw direction arrow
        var perpFace = [this.vector[1]*-1, this.vector[0]];
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(x + perpFace[0]*20, y + perpFace[1]*20);
        ctx.lineTo(x + this.vector[0]*radius*1.5, y + this.vector[1]*radius*1.5);
        ctx.lineTo(x - perpFace[0]*20, y - perpFace[1]*20);
        ctx.strokeStyle="#ffff00";
        ctx.stroke();
        ctx.closePath();
    }

    this.draw();
}
ProjectileActor.prototype = new ActorProto();


function DummyActor(type, pos, radius, spriteUrl) {
    ActorProto.call(this, "dummy", pos, radius, spriteUrl);
    this.update = function(){
        return false;
    }
    
    //Should call default actor redraw

    this.draw();
}
DummyActor.prototype = new ActorProto();