
function ActorProto (type, pos, radius, spriteUrl) {
    this.type = type;
    this.pos = pos;
    this.radius = radius;
    this.sprite = resources.get(spriteUrl);
    
    this.update = function(dt){
        console.log("default actor update: ");
        return true;
    }

    this.draw = function(){
        console.log("default actor draw: ");
        var ctx = engine.ctx;

        var x = Math.round(this.pos[0]); //round pos to avoid sub-pixel rendering
        var y = Math.round(this.pos[1]);

        ctx.lineWidth = 3;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, 2*Math.PI);
        engine.ctx.strokeStyle="#000000";
        ctx.stroke();
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(this.sprite, x - radius, y - radius, this.radius*2, this.radius*2);
        ctx.restore();
    }
}

function PlayerActor(type, pos, radius, spriteUrl, speed) {
    ActorProto.call(this, "player", pos, radius, spriteUrl);
    this.speed = speed;
    this.vector = [1, 0];
    this.dest = this.pos;
    
    this.update = function(dt){
        if(getDistance(this.pos, this.dest) > 4 ){
            this.pos[0] += this.vector[0] * this.speed * dt;
            
            this.pos[1] += this.vector[1] * this.speed * dt;
            return true;
        } else {
            //console.log("no movement");
            return false;
        }
    }
    this.draw = function() {
        var ctx = engine.ctx;

        var x = Math.round(this.pos[0]); //round pos to avoid sub-pixel rendering
        var y = Math.round(this.pos[1]);

        ctx.lineWidth = 5;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, 2*Math.PI);
        engine.ctx.strokeStyle="#2eb82e";
        ctx.stroke();
        ctx.closePath();
        ctx.clip();

        if(this.sprite){
            ctx.drawImage(this.sprite, x - radius, y - radius, this.radius*2, this.radius*2);
        }
        ctx.restore();
    }
    
    this.draw();
}
PlayerActor.prototype = new ActorProto();


function DummyActor(type, pos, radius, spriteUrl) {
    ActorProto.call(this, "dummy", pos, radius, spriteUrl);
    this.update = function(){
        return false;
    }
    
    //Should call default actor redraw

    this.draw();
}
DummyActor.prototype = new ActorProto();

function ActorFactory() {
    this.createActor = function (type, pos, radius, spriteUrl) {
        var actor;
        if (type === "player") {
            actor = new PlayerActor(type, pos, radius, spriteUrl, 300);
        }  
        else if(type ==="dummy") {
            actor = new DummyActor(type, pos, radius, spriteUrl);
        } 
        else {
            console.log("Actor Type Undefined")
        }
        return actor;
    }
}
