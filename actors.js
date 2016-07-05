/**
 * Defines Actor Prototype and actor inheritors
 * Actor is almost anything that moves on the screen
 * Actors must define type, pos, radius
 * Actor draw and update functions are called by engine
 */


var oneMoreTick = true; //hack solution to needing 1 more redraw 

function ActorFactory() {
    this.createActor = function (type, pos, radius, spriteUrl) {
        var actor;
        if (type === "player") {
            actor = new PlayerActor(type, pos, radius, spriteUrl);
            actor.setProperties(220, 400);  //Initialize with default stats
        }  
        else if (type ==="dummy") {
            actor = new DummyActor(type, pos, radius, spriteUrl);
        } 
        else if (type === "projectile"){
            actor = new ProjectileActor(type, pos, radius, spriteUrl);
            actor.setProperties(pos, 220);  //Default
        }
        else {
            console.log("Actor Type Undefined")
        }
        return actor;
    }
}

function ActorProto (type, pos, radius, spriteUrl) {
    this.type = type;
    this.pos = pos;
    this.radius = radius;
    this.sprite = resources.get(spriteUrl);
    
    this.update = function(dt){
        //console.log("default actor update: ");
        return true;
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
    this.vector = [1, 0];
    this.facing = [1, 0];
    this.dest = this.pos;
    
    this.setProperties = function(speed, range){
        this.speed = speed;
        this.range = range;
    }

    this.update = function(dt){
        var ret = false;

        //Update position
        var heading = getUnitVector(this.dest, this.pos); //I don't know why this is backwards? yolo...
        //If heading vector direction opposite of vector, then we've passed/reached the destination
        //Check for sign change. For some peculiar reason this 'if' is true when the 'heading' and 'vector' are opposite
        if( (heading[0]*this.vector[0] < 0) || ( heading[1]*this.vector[1] < 0)){
            this.pos[0] += this.vector[0] * this.speed * dt;
            this.pos[1] += this.vector[1] * this.speed * dt;
            ret = true;
        } else {
            this.pos = this.dest;
        }

        //Update direction
        var theta = getTheta(this.facing, this.vector)
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
            ret = true;
        } else if (oneMoreTick) { // The troll part...
            oneMoreTick = false;
            this.facing = this.vector;
            ret = true;
        } else {
            this.facing = this.vector;
        }

        return ret;
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
        var perpFace = [this.facing[1]*-1, this.facing[0]];
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(x + perpFace[0]*20, y + perpFace[1]*20);
        ctx.lineTo(x + this.facing[0]*radius*1.5, y + this.facing[1]*radius*1.5);
        ctx.lineTo(x - perpFace[0]*20, y - perpFace[1]*20);
        ctx.strokeStyle="#ffff00";
        ctx.stroke();
    }
    
    this.draw();
}
PlayerActor.prototype = new ActorProto();

function ProjectileActor(type, pos, radius, spriteUrl) {
    ActorProto.call(this, "projectile", pos, radius, spriteUrl);
    this.vector = [1, 0];
    this.dest = this.pos; 
    
    this.setProperties = function(dest, speed){
        this.vector = getUnitVector(this.pos, dest);
        this.dest = dest;
        this.speed = speed;
    }

    this.update = function(dt){
        var ret = false;

        //Update position
        var heading = getUnitVector(this.dest, this.pos); //I don't know why this is backwards? yolo...
        //If heading vector direction opposite of vector, then we've passed/reached the destination
        //Check for sign change. For some peculiar reason this 'if' is true when the 'heading' and 'vector' are opposite
        if( (heading[0]*this.vector[0] < 0) || ( heading[1]*this.vector[1] < 0)){
            this.pos[0] += this.vector[0] * this.speed * dt;
            this.pos[1] += this.vector[1] * this.speed * dt;
            ret = true;
        } else {
            this.pos = this.dest;
        }
        return ret;
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