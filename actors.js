
function ActorProto (type, pos, radius) {
    this.type = type;
    this.pos = pos;
    this.radius = radius;
    
    this.update = function(){
        console.log("default actor update: ");
        return true;
    }

    this.redraw = function(){
        console.log("default actor redraw: ");
        engine.ctx.beginPath();
        engine.ctx.arc(this.pos[0], this.pos[1], this.radius, 0, 2*Math.PI);
        engine.ctx.stroke();
    }
}

function PlayerActor(type, pos, radius, speed) {
    ActorProto.call(this, "player", pos, radius);
    this.speed = speed;
    this.vector = [1, 0];
    this.dest = this.pos;
    
    this.update = function(){
        if(getDistance(this.pos, this.dest) > 4 ){
            this.pos[0] += this.vector[0] * this.speed;
            this.pos[1] += this.vector[1] * this.speed;
            return true;
        } else {
            //console.log("no movement");
            return false;
        }
    }
    
    this.redraw = function(){
        console.log("PLAYER redraw");
        engine.ctx.beginPath();
        engine.ctx.arc(this.pos[0], this.pos[1], this.radius, 0, 2*Math.PI);
        engine.ctx.stroke();
    }

    engine.ctx.beginPath();
    engine.ctx.arc(pos[0], pos[1], 50, 0, 2*Math.PI);
    engine.ctx.stroke();
}
PlayerActor.prototype = new ActorProto();


function DummyProto(type, pos, radius) {
    ActorProto.call(this, "dummy", pos, radius);
    
    this.update = function(){
        return false;
    }
    
    this.redraw = function(){
        console.log("PLAYER redraw");
        engine.ctx.beginPath();
        engine.ctx.arc(this.pos[0], this.pos[1], this.radius, 0, 2*Math.PI);
        engine.ctx.stroke();
    }

    engine.ctx.beginPath();
    engine.ctx.arc(pos[0], pos[1], 50, 0, 2*Math.PI);
    engine.ctx.stroke();
}
PlayerActor.prototype = new ActorProto();


ActorProto.prototype.status = function(){
    console.log(    " ACTOR: " + this.type + 
                    " at pos: [" + this.pos[0] + ", " +this.pos[1] + 
                    "] headed towards []" + this.dest[0] + ", " + this.dest[1] + 
                    "] with vec [" + this.vector[0] + ", " + this.vector[1] + "]"   );
}


function ActorFactory() {
    this.createActor = function (type, pos, radius) {
        var actor;
        if (type === "player") {
            actor = new PlayerActor(type, pos, radius, 4);
        } else {
            console.log("Actor Type Undefined")
        }
        return actor;
    }
}
