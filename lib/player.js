Crafty.c("Player", {
    init: function () {
        this.requires("2D, DOM, Jump, Cat, SpriteAnimation, PlatformGravity, Collision").jump(7).collision(new Crafty.polygon([0, 40], [130, 40], [130, 112], [0, 112])).animate("run", [
            [0, 6],
            [9, 6],
            [18, 6],
            [27, 6]
            ]).animate('run', 16, -1);
        this.nextPlat = 0;
        this.bind("EnterFrame", function () {
            if(this.y > (Crafty.screenHeight-22-this.h)){
                this.y = Crafty.screenHeight-25-this.h;
                this.isFalling = false;
            }

            var boost = (Crafty.tempEnergy) / 600, l, h, dif, tempE;
            this.x += boost + 8;
            Crafty.viewport.x = -(this.x - 100);
            Crafty.guiPanel.x += boost + 8;

            Crafty.energy -= 1;
            if (Crafty.energy <= 0) {
                Crafty.scene("gameover");
            }else if(Crafty.energy > 500){
                Crafty.energy = 500;
            }
            
            var animSpeed = 16-(4*(Crafty.tempEnergy/5000));
            if(animSpeed < 4) {animSpeed = 4;}
            this.animate('run', animSpeed, -1);

            Crafty.platGen -= 1;
            Crafty.platGen -= Crafty.tempEnergy/5000;

            if (Crafty.math.randomInt(1, Crafty.platGen) === 1 || Crafty.platGen < 1) {

                l = Crafty.math.randomInt(2, 10);
                if (l < 2) {
                    l = 2;
                }
                h = Crafty.screenHeight / 2;
                if (this.y > Crafty.screenHeight - 180) {
                    h = Crafty.math.randomInt(Crafty.screenHeight - 230, Crafty.screenHeight - 90);
                } else {
                    h = Crafty.math.randomInt(this.y - 100, this.y + 100);
                }
                if (h < 50) {
                    h = 50 + Crafty.math.randomInt(0, 200);
                }
                dif = h - Crafty.platPrev;
                if (dif < 0) {
                    dif *= -1;
                }
                if (dif > 32) {
                    Crafty.platGen += 6*l;
                    Crafty.platPrev = h;

                    Crafty.e("Platform").platform(l).attr({
                        x: (this.x + Crafty.screenWidth + 100 ),
                        y: h,
                        z: 50
                    });
                    tempE = makeEntity();
                    if (tempE) {
                        tempE.attr({
                            x: (this.x + Crafty.screenWidth + 100 + 8 * l),
                            y: h - tempE.h + 7,
                            z: 51
                        });
                    }
                }

            }
            /*if (Crafty.math.randomInt(1,3) === 1){
                h = Crafty.math.randomInt(1,400);
                tempE = makeEntity();
                if(tempE){
                    tempE.attr({x: this.x + 750, y: h, z: 51});
                    tempE.addComponent("PlatformGravity").gravity("Solid");
                }
            }*/
        });
    }
});


Crafty.c("Jump", {
    speed: 6,
    up: false,

    init: function () {
        this.requires("Keyboard");
    },

    jump: function (speed, jump) {
        if (speed) {this.speed = speed; }
        jump = jump || this.speed * 2;

        this.bind("EnterFrame", function () {
            if (this.disableControls) {return; }
            if (this.up) {
                this.y -= jump;
                this.isFalling = true;
            }
        }).bind("KeyDown", function () {
            if (this.isDown("UP_ARROW") || this.isDown("W") || this.isDown("SPACE") || this.isDown("ENTER")) {
                if(!this.isFalling){
                    if(!this.up) {
                        Crafty.energy -= 10;
                    }
                    this.up = true;
                }
            }
        });
        Crafty.addEvent(this, Crafty.stage.elem, "mousedown", function () {
             if(!this.isFalling){
                if(!this.up) {
                    Crafty.energy -= 10;
                }
                this.up = true;
            }
        });
        Crafty.addEvent(this, Crafty.stage.elem, "touchstart", function () {
             if(!this.isFalling){
                if(!this.up) {
                    Crafty.energy -= 10;
                }
                this.up = true;
            }
        });

        return this;
    }
});