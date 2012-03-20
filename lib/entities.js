//Returns a random entity.
function makeEntity() {
    var type = Crafty.math.randomInt(1, 9);
    if (type < 3) {
        return Crafty.e("Knockable, SmallRoach, Walker, DeathAnimation").walker(1).knockable(10, 100).deathAnimation([[8,0]],2);
    } else if (type === 4) {
        return Crafty.e("Knockable, LargeRoach, Walker, DeathAnimation").walker(1).knockable(50, 200).deathAnimation([[4,0]],2);
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
    init: function () {
        this.requires("2D, PlatformGravity").gravity("Solid");
    },

    walker: function (speed) {
        if (!speed) {
            speed = 1;
        }
        speed = speed * (Crafty.math.randomInt(0, 2) - 1);

        if (speed < 0) {
            this.flip('X');
        }

        this.bind("EnterFrame", function () {
            this.x -= speed;
        });
        return this;
    }
});

Crafty.c("Awesome",{
    init: function() {
        this.bind("Knocked", this.knock);
    },

    knock: function() {
        //console.log('Awesome knocked function called!');
        Crafty.tempEnergy += 5000;
        this.fyeah = Crafty.e("2D, DOM, FYEAH, SpriteAnimation")
            .attr(Crafty.guiPanel.pos())
            .animate("flash", [[0,13],[9,13]])
            .animate("flash",2,-1)
            .timeout(function() {Crafty.tempEnergy -= 5000; this.destroy();}, 5000);
        this.fyeah.w = 16*9;
        this.fyeah.h = 16*2;
        this.fyeah.z = 400;
        Crafty.guiPanel.attach(this.fyeah);
        this.fyeah.shift(Crafty.screenWidth / 2 - 100,Crafty.screenHeight/2 - 40);
    }
});