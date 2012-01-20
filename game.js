window.onload = function () {
    //start crafty
    Crafty.init(800, 480);
    //Crafty.canvas.init();
    Crafty.score = 0;
    Crafty.energy = 1000;
    Crafty.platGen = 10;
    Crafty.platPrev = 0;

    function makeBackgroundStrip(xloc){
    	for(var i = 0;i < 27; i++){
    		wallType = Crafty.randRange(1,4);
    		Crafty.e("2D, DOM, BG,Wall"+wallType)
    			.attr({x:xloc,y:i*16,z:-5});
    	}
    	Crafty.e("Bottom")
    		.attr({x:xloc,y:432});
    }

    function initializeBackground(){
    	for(var i = 0; i < 51; i++){
    		makeBackgroundStrip(i*16);
    	}
    }

    function makeEntity(){
        type = Crafty.randRange(1,9);
        if(type < 3){
            return Crafty.e("Knockable, SmallRoach, Walker")
                .walker(1)
                .knockable(10,100);
        } else if(type == 4){
            return Crafty.e("Knockable, LargeRoach, Walker")
                .walker(1)
                .knockable(50,200);
        } else if(type == 5){
            return Crafty.e("Knockable, FoodBall")
                .knockable(5,250);
        } else if(type == 6){
            return Crafty.e("Knockable, SpringYellow")
                .knockable(50,20);
        } else if(type == 7){
            return Crafty.e("Knockable, SpringRed")
                .knockable(50,20);
        } else if(type == 8){
            return Crafty.e("Knockable, CannedFood")
                .knockable(30,300);
        } else if(type == 9){
            return Crafty.e("Knockable, Catnip")
                .knockable(100,200);
        }
    }


    Crafty.sprite(16,"media/spritesheet.png",{
    	Cat:[0,6,9,7],
    	Floor:[11,1,1,3],
    	Wall1:[11,0],
    	Wall2:[12,0],
    	Wall3:[13,0],
    	Wall4:[14,0],
        PlatformMain:[13,1,1,2],
        PlatformLeft:[12,1,1,2],
        PlatformRight:[14,1,1,2],
    	SmallRoach:[7,0],
        LargeRoach:[0,0,2,2],
        Rat:[0,5,4,2],
        FoodBall:[0,2,2,2],
        SpringYellow:[2,2,3,1],
        SpringRed:[2,3,3,1],
        WallRoach:[7,1],
        CannedFood:[7,1,2,1],
        Catnip:[6,2,2,1],
        Fly:[7,4],
        Chicken:[6,3],
        Rock: [12,4,2,1]
    });


    Crafty.scene("loading", function(){
    	Crafty.load(["media/spritesheet.png"],function(){
    		Crafty.scene("main");
    	});

    	Crafty.background("#333");
    	Crafty.e("2D, DOM, Text").attr({w:100,h:100,x:350,y:100})
    		.text("Loading...")
    		.css({"text-align":"center"});
    	
    });
    Crafty.scene("loading");

    Crafty.scene("gameover",function(){
        Crafty.background("#666");
        Crafty.viewport.x = 0;
        Crafty.viewport.y = 0;
        Crafty.e("2D, DOM, Text")
            .attr({w:800,h:100,x:0,y:100})
            .text("Game Over!")
            .css({"text-align":"center","color":"#FF0","font-size":"60px"});
        var score = Crafty.e("2D, DOM, Text")
            .attr({w:800,h:50,x:0,y:250})
            .css({"text-align":"center","color":"#0F0","font-size":"100px"});
        score.text(Crafty.score);

    });

    Crafty.scene("main",function(){
    	Crafty.background("#666");

    	initializeBackground();

    	var player = Crafty.e("Player")
    		.attr({x:100, y:96, z:100})
    		.gravity("Solid");

        Crafty.scoreText = Crafty.e("2D, DOM, Text")
            .attr({x:0, y: 460, z:102, w:780, h: 20})
            .text("0")
            .css({"text-align":"right"});

        Crafty.energyText = Crafty.e("2D, DOM, Text")
            .attr({x:0, y: 460, z:102, w:780, h: 20})
            .text("0")
            .css({"text-align":"left"});

    });


    Crafty.c("Player",{
    	init: function() {
    		this.requires("2D, DOM, Jump, Cat, SpriteAnimation, Gravity, Collision")
    			.jump(6)
                .collision(new Crafty.polygon([0,40], [130,40], [130,112], [0,112]))
    			.animate("run",[[0,6],[9,6],[18,6],[27,6]])
    			.animate('run',16,-1)
		    this.nextPlat = 0;
    		this.bind("EnterFrame", function(){

                var boost = Crafty.energy/1000;
                this.x+=boost;
                Crafty.scoreText.x += boost;
                Crafty.energyText.x += boost;

    			this.x+= 4;
    			Crafty.viewport.x = - (this.x - 100);
                Crafty.scoreText.x += 4;
                Crafty.energyText.x += 4;
                Crafty.energy -= 1;
                if(Crafty.energy <= 0){
                    Crafty.scene("gameover");
                }
                Crafty.energyText.text(Crafty.energy);
                var pos = Crafty.viewport.rect();
                pos._x = -32-Crafty.viewport.x;
                pos._w = 16;

                var q = Crafty.map.search(pos);
                var l = q.length;
                Crafty.platGen --;

    			if(Crafty.randRange(1,Crafty.platGen) === 1 || Crafty.platGen < 1){
                    
    				var l = Crafty.randRange(5,20) - Crafty.energy / 400;
                    if(l < 2){
                        l = 2;
                    }
    				var h = 300;
    				if(this.y > 300){
    					h = Crafty.randRange(250,390);
    				}else{
    					h = Crafty.randRange(this.y-100, this.y+100);
    				}
    				if(h < 50){
    					h = 50+Crafty.randRange(0,200);
    				}
                    var dif = h-Crafty.platPrev;
                    if(dif < 0){
                        dif *= -1;
                    }
                    if(dif > 32){
                        Crafty.platGen += 100;
                        Crafty.platPrev = h;

                        Crafty.e("Platform")
                            .platform(l)
                            .attr({x:(this.x+900+16*l), y: h, z:50});
                        var tempE = makeEntity();
                        if(tempE){
                            tempE.attr({x:(this.x+900+8*l), y: h-tempE.h+7, z:51});
                        }
                    }
                    
    			}

                for(var i = 0;i<l;++i) {
                    obj = q[i];
		    if(!obj){
			break;
		    }
                    else if(obj.parent === null && obj.has("BG")) {
                        obj.shift(816,0,0,0);
                    }else if(obj.parent === null){
                        obj.destroy();
                    }
                }
    		});
    	}
    });

    Crafty.c("Bottom",{
    	init: function(){
    		this.requires("2D, DOM, Floor, Surface, BG")
    			.surface(24);
    	}
    });

    Crafty.c("Surface",{
    	_platLevel: 0,
    	_platWidth: 0,

    	init: function(){
    		this.requires("2D, DOM");
    	},

    	surface: function(level, width){
    		if(!width){
	    		width = this._w;
	    	}
	    	this.bar = Crafty.e("2D, Solid")
	    		.attr({w:width,h:6});
	    	this.attach(this.bar);
	    	this.bar.shift(0,level);
            return this;
    	}
    });

    Crafty.c("Platform",{

        init: function(){
            this.requires("2D, PlatformRight, DOM");
        },

        platform: function(segs){
            for(var i = 1;i < segs;i++){
                this.attach(Crafty.e("PlatformSegment").shift(-i*16,0));
            }
            this.attach(Crafty.e("2D, DOM, PlatformLeft").shift(-(i)*16));
            return this
        }
    });

    Crafty.c("PlatformSegment",{
        
        init: function(){
            this.requires("2D, DOM, PlatformMain, Surface")
                .surface(8);
        }
    });

    Crafty.c("Knockable",{

        falling: 4.0,
        hasHit: false,
        scoreVal: 10,
        energyVal: 100,
        
        init: function(){
            this.requires("2D, DOM, Collision")
                .collision()
                .onHit("Player",function(){
                    if(!this.hasHit){
                        this.hasHit = true;
                        this.flip('Y');
                        if(this.has("Gravity")){
                            this.antigravity();
                        }
                        this.attr({z:101});
                        Crafty.score += this.scoreVal;
                        Crafty.energy += this.energyVal;
                        Crafty.scoreText.text(Crafty.score);
                        
                        //this.unbind("EnterFrame", this._falling);
                        this.bind("EnterFrame", function(){
                            this.y -= this.falling;
                            this.falling -= 0.3;
                            if(this.y > 500){
                                this.destroy();
                            }
                        });
                    }
                });
        },



        knockable: function(sv,ev){
            this.scoreVal = sv;
            if(!ev){
                ev = sv*10;
            }
            this.energyVal = ev;
            return this;
        }
    });

    Crafty.c("Walker", {
        init: function(){
            this.requires("2D,DOM, Gravity")
                .gravity("Solid");
        },

        walker: function(speed){
            if(!speed){
                speed = 1;
            }
            speed = speed * (Crafty.randRange(0,2)-1);

            if(speed < 0){
                this.flip('X');
            }

            this.bind("EnterFrame",function(){
                this.x -= speed;
            });
            return this;
        }
    });
};