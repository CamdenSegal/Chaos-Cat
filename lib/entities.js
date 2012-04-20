//Returns a random entity.
function makeEntity() {
    var type = Crafty.math.randomInt(1, 15);
    if (type < 3) {
        return Crafty.e("SmallRoach");
    } else if (type === 4) {
        return Crafty.e("LargeRoach");
    } else if (type === 5) {
        return Crafty.e("Knockable, FoodBall").knockable(100, 100);
    } else if (type === 6) {
        return Crafty.e("Knockable, SpringYellow").knockable(50, 60);
    } else if (type === 7) {
        return Crafty.e("Knockable, SpringRed").knockable(50, 60);
    } else if (type === 8) {
        return Crafty.e("Knockable, CannedFood").knockable(30, 200);
    } else if (type === 9) {
        return Crafty.e("Knockable, Catnip, Awesome").knockable(100, 500);
    } else if (type === 10) {
        return Crafty.e("Fly");
    } else if (type === 11) {
        return Crafty.e("Knockable, Rock").knockable(10, 10);
    } else if (type === 12) {
        return Crafty.e("Knockable, Chicken").knockable(75, 100);
    } else if (type === 13) {
        return Crafty.e("Rat");
    } else if (type === 14) {
        return Crafty.e("Knockable, DeathAnimation, Computer").knockable(100,75).deathAnimation([[22,0]],2);
    } else if (type === 15) {
        return Crafty.e("Knockable, DeathAnimation, Glass").knockable(60,30).deathAnimation([[22,4]],2);
    }
}

function makeEntityFlyer(){
    var type = Crafty.math.randomInt(1, 1);
    if (type === 1) {
        return Crafty.e("Fly");
    }
}

function makeEntitySitter(){
    var type = Crafty.math.randomInt(1, 9);
    if (type < 3) {
        return Crafty.e("SmallRoach");
    } else if (type === 4) {
        return Crafty.e("LargeRoach");
    } else if (type === 5) {
        return Crafty.e("Knockable, FoodBall").knockable(100, 100);
    } else if (type === 6) {
        return Crafty.e("Knockable, SpringYellow").knockable(50, 60);
    } else if (type === 7) {
        return Crafty.e("Knockable, SpringRed").knockable(50, 60);
    } else if (type === 8) {
        return Crafty.e("Knockable, CannedFood").knockable(30, 200);
    } else if (type === 9) {
        return Crafty.e("Knockable, Catnip, Awesome").knockable(100, 500);
    }
}


Crafty.c("Knockable", {

    falling: 4.0,
    hasHit: false,
    scoreVal: 10,
    energyVal: 100,


    init: function () {
        this.requires("2D, DOM, Collision, Scroller").collision().onHit("Player", function () {
            if (!this.hasHit) {
                this.hasHit = true;
                this.trigger("Knocked",null);
                this.flip('Y');
                if (this.has("PlatformGravity")) {
                    this.antigravity();
                }
                this.attr({z: 101});
                Crafty.score += this.scoreVal;
                Crafty.energy += this.energyVal;
                Crafty.scoreText.text(Crafty.score);

                this.bind("EnterFrame", function () {
                    this.y -= this.falling;
                    //this.x -= 2;
                    this.falling -= 0.3;
                    if (this.y > Crafty.screenHeight+100) {
                        this.destroy();
                    }
                });
            }
        });
    },



    knockable: function (sv, ev) {
        this.scoreVal = sv;
        if (!ev) {
            ev = sv * 10;
        }
        this.energyVal = ev;
        return this;
    }
});

Crafty.c("DeathAnimation", {
    frames: [],
    speed: 1,

    init: function () {
        this.requires("2D, Knockable, SpriteAnimation");
    },

    deathAnimation: function (frames, aspeed){
        this.animate('die',frames);
        this.speed = aspeed;
        this.bind("Knocked", function (){
            this.animate('die',this.speed,-1);
            
        });
        return this;
    }
});

Crafty.c("Walker", {
    walkSpeed: 1,
    init: function () {
        this.requires("2D, PlatformGravity").gravity("Solid");
    },

    walker: function (speed) {
        if (!speed) {
            speed = 1;
        }
        this.walkSpeed = speed * (Crafty.math.randomInt(0, 2) - 1);

        if (this.walkSpeed < 0) {
            this.flip('X');
        }

        this.bind("EnterFrame", function () {
            this.x -= this.walkSpeed;
        });
        return this;
    }
});

Crafty.c("Awesome",{
    init: function() {
        this.requires("Knockable");
        this.bind("Knocked", this.knock);
    },

    knock: function() {
        //console.log('Awesome knocked function called!');
        if(Crafty.tempEnergy === 0){
            Crafty.audio.mute(true);
            Crafty.audio.play("musicfast",-1);
        }

        Crafty.tempEnergy += 5000;
        this.fyeah = Crafty.e("2D, DOM, FYEAH, SpriteAnimation")
            .attr(Crafty.guiPanel.pos())
            .animate("flash", [[0,13],[9,13]])
            .animate("flash",1,-1)
            .timeout(function() {
                    Crafty.tempEnergy -= 5000;
                    if(Crafty.tempEnergy === 0){
                        Crafty.audio.mute(true); 
                        Crafty.audio.play('music',-1);
                    }
                    this.destroy();
                }, 5000);
        this.fyeah.w = 16*9;
        this.fyeah.h = 16*2;
        this.fyeah.z = 400;
        Crafty.guiPanel.attach(this.fyeah);
        this.fyeah.shift(Crafty.screenWidth / 2 - 100,Crafty.screenHeight/2 - 40);
    }
});


Crafty.c("Flyer",{
    curPos: 0,
    rotSpeed: 0,
    rotRadiusX: 0,
    rotRadiusY: 0,
    originPos: {x:0,y:0},
    facing: 1,

    init: function(){
        this.requires("2D");
    },

    flyer: function(speed, distancex, distancey, flip) {
        this.rotSpeed = speed/(10*Math.PI);
        this.rotRadiusX = distancex;
        this.rotRadiusY = distancey;
        this.originPos = this.pos();
        this.curPos = Crafty.math.randomNumber(0,Math.PI);
        if(this.rotSpeed && (this.rotRadiusX || this.rotRadiusY) ){
            this.bind("Knocked", this.endFly);
            this.bind("EnterFrame",function () {
                if(this.rotSpeed){
                    var changeX = Math.sin(this.curPos + this.rotSpeed)*this.rotRadiusX - Math.sin(this.curPos)*this.rotRadiusX;

                    if(flip && ((changeX > 0 && this.facing > 0) || (changeX < 0 && this.facing < 0))){
                        this.facing *= -1;
                        this["_flipX"] = (this.facing>0)?false : true;
                        this.trigger("Change");
                    }
                    this.x = this.x + changeX;
                    this.y = this.y + (Math.cos(this.curPos + this.rotSpeed)*this.rotRadiusY - Math.cos(this.curPos)*this.rotRadiusY);
                    this.curPos += this.rotSpeed;
                }
            });
        }
        return this;
    },

    endFly: function() {
        this.rotSpeed = 0;
    }
});



Crafty.c("SmallRoach", {
    init: function() {
        this.requires("Knockable, SmallRoachSp, Walker, SpriteAnimation, DeathAnimation")
            .animate('walk',[[7,0],[6,0]])
            .walker(1)
            .knockable(10, 100)
            .deathAnimation([[8,0]],2);
        if(this.walkSpeed !== 0){
            this.animate('walk',4,-1);
        }
    }
});

Crafty.c("LargeRoach", {
    init: function() {
        this.requires("Knockable, LargeRoachSp, Walker, DeathAnimation")
            .animate('walk',[[0,0],[2,0]])
            .walker(1)
            .knockable(50, 200)
            .deathAnimation([[4,0]],2);
        if(this.walkSpeed !== 0){
            this.animate('walk',4,-1);
        }
    }
});

Crafty.c("Rat", {
    init: function() {
        this.requires("Knockable, RatSp, Walker, DeathAnimation")
            .animate('walk',[[0,4],[4,4],[8,4]])
            .walker(3)
            .knockable(100, 250)
            .deathAnimation([[12,4]],2);
        if(this.walkSpeed !== 0){
            this.animate('walk',6,-1);
        }
    }
});

Crafty.c("Fly",{
    init: function(){
        this.requires("Knockable, FlySp, Flyer, DeathAnimation")
            .animate('fly',[[6,3],[7,3]])
            .flyer(2,20,50, true)
            .knockable(50,100)
            .deathAnimation([[8,3]],2)
            .animate('fly',2,-1);
    }
});


Crafty.c("Fisher",{
    init: function(){
        this.requires("Knockable, FlySp, Flyer, DeathAnimation")
            .animate('fly',[[6,3],[7,3]])
            .flyer(2,20,50, true)
            .knockable(50,100)
            .deathAnimation([[8,3]],2)
            .animate('fly',2,-1);
    }
});