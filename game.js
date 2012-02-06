(function () {
    "use strict";

    window.onload = function () {
        //start crafty
        var winW = 800, winH = 480;
        if (document.body && document.body.offsetWidth) {
         winW = document.body.offsetWidth;
         winH = document.body.offsetHeight;
        }
        if (document.compatMode=='CSS1Compat' &&
            document.documentElement &&
            document.documentElement.offsetWidth ) {
         winW = document.documentElement.offsetWidth;
         winH = document.documentElement.offsetHeight;
        }
        if (window.innerWidth && window.innerHeight) {
         winW = window.innerWidth;
         winH = window.innerHeight;
        }
        if(winW > 800){
            winW = 800;
        }
        if(winH > 480){
            winH = 480;
        }
        Crafty.screenWidth = winW;
        Crafty.screenHeight = winH;
        Crafty.init(Crafty.screenWidth, Crafty.screenHeight);
        //Crafty.canvas.init();
        Crafty.score = 0;
        Crafty.energy = 500;
        Crafty.tempEnergy = 0;
        Crafty.platGen = 10;
        Crafty.platPrev = 0;

        //Takes in a location and places a background strip.
        function makeBackgroundStrip(xloc) {
            var i, wallType;
            Crafty.e("Bottom").attr({
                x: xloc,
                y: Crafty.screenHeight - 480
            });
        }

        //Creates 7 background strips to fill the full background
        function initializeBackground() {
            var i, numPanels = (Crafty.screenWidth / 160) + 2;
            for (i = 0; i < numPanels; i += 1) {
                makeBackgroundStrip(i * 160);
            }
        }

        //Returns a random entity.
        function makeEntity() {
            var type = Crafty.math.randomInt(1, 9);
            if (type < 3) {
                return Crafty.e("Knockable, SmallRoach, Walker").walker(1).knockable(10, 100);
            } else if (type === 4) {
                return Crafty.e("Knockable, LargeRoach, Walker").walker(1).knockable(50, 200);
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

        //Specifies the location of sprites on the spritesheet
        Crafty.sprite(16, "media/spritesheet.png", {
            Cat: [0, 6, 9, 7],
            PlatformMain: [13, 1, 1, 2],
            PlatformLeft: [12, 1, 1, 2],
            PlatformRight: [14, 1, 1, 2],
            SmallRoach: [7, 0],
            LargeRoach: [0, 0, 2, 2],
            Rat: [0, 5, 4, 2],
            FoodBall: [0, 2, 2, 2],
            SpringYellow: [2, 2, 3, 1],
            SpringRed: [2, 3, 3, 1],
            WallRoach: [7, 1],
            CannedFood: [7, 1, 2, 1],
            Catnip: [6, 2, 2, 1],
            Fly: [7, 4],
            Chicken: [6, 3],
            Rock: [12, 4, 2, 1]
        });

        //Specifies the location of sprites on the spritesheet
        Crafty.sprite(32, "media/platforms.png", {
            WhitePlatform2: [0, 0,2,1],
            WhitePlatform8: [2, 0,8,1],
            WhitePlatform4: [0, 1,4,1],
            WhitePlatform6: [4, 1,6,1],
            WhitePlatform7: [0, 2,7,1],
            WhitePlatform3: [7, 2,3,1],
            WhitePlatform5: [0, 3,5,1],
            WhitePlatform9: [0, 4,9,1],
            WhitePlatform10: [0, 5,10,1]
        });

        //Loading scene
        Crafty.scene("loading", function () {
            //Load resources and change to main scene.
            Crafty.load(["media/spritesheet.png", "media/bg.png", "media/platforms.png"], function () {
                Crafty.scene("main");
            });
            Crafty.background("#333");
            Crafty.e("2D, DOM, Text").attr({
                w: Crafty.screenWidth,
                h: 100,
                x: 0,
                y: 0
            }).text("Loading...").css({
                "text-align": "center"
            });
        });
        Crafty.scene("loading");

        //Gameover scene
        Crafty.scene("gameover", function () {
            Crafty.background("#666");
            Crafty.viewport.x = 0;
            Crafty.viewport.y = 0;
            Crafty.e("2D, DOM, Text").attr({
                w: Crafty.screenWidth,
                h: 100,
                x: 0,
                y: 100
            }).text("Game Over!").css({
                "text-align": "center",
                "color": "#FF0",
                "font-size": "60px"
            });
            var score = Crafty.e("2D, DOM, Text").attr({
                w: Crafty.screenWidth,
                h: 50,
                x: 0,
                y: 250
            }).css({
                "text-align": "center",
                "color": "#0F0",
                "font-size": "100px"
            });
            score.text(Crafty.score);
        });

        Crafty.scene("main", function () {
            Crafty.background("#666");

            initializeBackground();

            var player = Crafty.e("Player").attr({
                x: 100,
                y: 96,
                z: 100
            }).gravity("Solid");

            Crafty.guiPanel = Crafty.e("2D")
                .attr({x: 0, y: 0, z: 200});

            Crafty.scoreText = Crafty.e("2D, DOM, Text").attr({
                x: 0,
                y: Crafty.screenHeight - 20,
                z: 102,
                w: Crafty.screenWidth - 20,
                h: 20
            }).text("0").css({
                "text-align": "right"
            });

            Crafty.guiPanel.attach( Crafty.scoreText);

            Crafty.energyText = Crafty.e("2D, DOM, Text").attr({
                x: 0,
                y: Crafty.screenHeight - 20,
                z: 102,
                w: Crafty.screenWidth - 20,
                h: 20
            }).text("0").css({
                "text-align": "left"
            });

            Crafty.guiPanel.attach( Crafty.energyText);

        });


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

                    Crafty.energyText.text(Crafty.energy);

                    
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

        Crafty.c("Bottom", {
            init: function () {
                this.requires("2D, DOM, Surface, BG, Image").image("media/bg.png").surface(455);

                this.bind("EnterFrame", function () {
                    if (this.x < (-Crafty.viewport.x - 160)) {
                        this.shift(Crafty.screenWidth + 320, 0, 0, 0);
                    }
                });
            }
        });

        Crafty.c("Surface", {
            platLevel: 0,
            platWidth: 0,

            init: function () {
                this.requires("2D, DOM");
            },

            surface: function (level, width) {
                if (!width) {
                    width = this.w;
                }
                this.bar = Crafty.e("2D, Solid").attr({
                    w: width,
                    h: 6
                });
                this.attach(this.bar);
                this.bar.shift(0, level);
                return this;
            }
        });

        Crafty.c("Platform", {

            init: function () {
                this.requires("2D, PlatformRight, DOM, Scroller,Surface").surface(8);
            },

            platform: function (segs) {
                /*var i;
                for (i = 1; i < segs; i += 1) {
                    this.attach(Crafty.e("PlatformSegment").shift(-i * 16, 0));
                }
                this.attach(Crafty.e("2D, DOM, PlatformLeft, Scroller").shift(-(i) * 16));*/
                this.addComponent("WhitePlatform"+segs);
                return this;
            }
        });

        Crafty.c("PlatformSegment", {

            init: function () {
                this.requires("2D, DOM, PlatformMain, Surface, Scroller").surface(8);
            }
        });

        Crafty.c("Scroller", {
            init: function () {
                this.bind("EnterFrame", function () {
                    if (this.x < (Crafty.viewport.x - 100)) {
                        this.destroy();
                    }
                });
                this.delay(function() {
                    this.destroy();
                    }, 10000);
            }
        });

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

        Crafty.c("PlatformGravity", {
            gravityStrength: 0.3,
            gy: 0,
            isFalling: true,
            anti: null,

            init: function () {
                this.requires("2D");
            },

            gravity: function (comp) {
                if (comp) {this.anti = comp; }

                this.bind("EnterFrame", this.onenterframe);

                return this;
            },

            onenterframe: function () {
                if (this.isFalling) {
                    //if falling, move the players Y
                    this.gy += this.gravityStrength * 2;
                    this.y += this.gy;
                } else {
                    this.gy = 0; //reset change in y
                }



                var obj, hit = false,
                    pos = this.pos(),
                    q, i = 0,
                    l;

                //Increase by 1 to make sure map.search() finds the floor
                //pos._y++;
                pos._y += pos._h - 8;
                pos._h = 11;

                //map.search wants _x and intersect wants x...
                pos.x = pos._x;
                pos.y = pos._y;
                pos.w = pos._w;
                pos.h = pos._h;

                q = Crafty.map.search(pos);
                l = q.length;

                for (i = 0; i < l; i += 1) {
                    obj = q[i];
                    //check for an intersection directly below the player
                    if (obj !== this && obj.has(this.anti) && obj.intersect(pos)) {
                        hit = obj;
                        break;
                    }
                }

                if (hit) { //stop falling if found
                    if (this.isFalling) { this.stopFalling(hit); }
                } else {
                    this.isFalling = true; //keep falling otherwise
                }
            },

            stopFalling: function (e) {
                if (e) { this.y = e._y - this._h; } //move object
                //this.gy = -1 * this._bounce;
                this.isFalling = false;
                if (this.up) {this.up = false; }
                this.trigger("hit");
            },

            antigravity: function () {
                this.unbind("EnterFrame", this.onenterframe);
            }
        });
    };
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

    Crafty.c("Awesome",{
        init: function() {
            this.bind("Knocked", this.knock);
        },

        knock: function() {
            console.log('Awesome knocked function called!');
            Crafty.tempEnergy += 5000;
            var fyeah = Crafty.e("2D, DOM, Text")
                .attr(Crafty.guiPanel.pos())
                .text("FYEAH")
                .css({'text-align':'center','color':'#fff','font-size':'40px'})
                .delay(function() {Crafty.tempEnergy -= 5000; this.destroy();}, 5000);
            Crafty.guiPanel.attach(fyeah);
            fyeah.shift(Crafty.screenWidth / 2 - 100,Crafty.screenHeight/2 - 40);
        }
    });

}());