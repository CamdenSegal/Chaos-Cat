

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
        

        

        

        

        //Specifies the location of sprites on the spritesheet
        Crafty.sprite(16, "media/spritesheet.png", {
            Cat: [0, 6, 9, 7],
            PlatformMain: [13, 1, 1, 2],
            PlatformLeft: [12, 1, 1, 2],
            PlatformRight: [14, 1, 1, 2],
            SmallRoachSp: [7, 0],
            LargeRoachSp: [0, 0, 2, 2],
            Rat: [0, 5, 4, 2],
            FoodBall: [0, 2, 2, 2],
            SpringYellow: [2, 2, 3, 1],
            SpringRed: [2, 3, 3, 1],
            WallRoach: [7, 1],
            CannedFood: [7, 1, 2, 1],
            Catnip: [6, 2, 2, 1],
            FlySp: [6, 3],
            Chicken: [5, 2],
            Rock: [12, 4, 2, 1],
            FYEAH: [0,13,9,2]
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
                Crafty.scene("mainmenu");
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

        Crafty.scene("mainmenu", function() {
            Crafty.background("#4c1b1d");
            Crafty.e("2D, DOM, Text")
                .attr({w:Crafty.screenWidth,h:100,x:0,y:100})
                .text("CHAOS CAT")
                .css({"text-align":"center","color":"#a8a8a8","font-size":"60px"});

            Crafty.e("Button")
                .attr({x: Crafty.screenWidth/2 - 100,y:200})
                .button('Play!',function() {
                    Crafty.scene("main");
                });
            Crafty.e("Button")
                .attr({x: Crafty.screenWidth/2 - 100,y:250})
                .button('Settings',function() {
                    //Crafty.scene("main");
                });
            Crafty.e("Button")
                .attr({x: Crafty.screenWidth/2 - 100,y:300})
                .button('High Score',function() {
                    //Crafty.scene("main");
                });
        });

        //Gameover scene
        Crafty.scene("gameover", function () {
            _gaq.push(['_trackEvent', 'Games','Chaos Cat','Gameover',Crafty.score]);
            Crafty.background("#4c1b1d");

            Crafty.viewport.x = 0;
            Crafty.viewport.y = 0;
            Crafty.e("2D, DOM, Text").attr({
                w: Crafty.screenWidth,
                h: 100,
                x: 0,
                y: 100
            }).text("Game Over!").css({
                "text-align": "center",
                "color": "#a8a8a8",
                "font-size": "60px"
            });
            var score = Crafty.e("2D, DOM, Text").attr({
                w: Crafty.screenWidth,
                h: 50,
                x: 0,
                y: 170
            }).css({
                "text-align": "center",
                "color": "#a8a8a8",
                "font-size": "100px"
            });
            if(Crafty.score){
                score.text(Crafty.score);
            }else{
                score.text('0');
            }
            

            Crafty.e("Button")
                .attr({x: Crafty.screenWidth/2 - 100,y:300})
                .button('Reset Game',function() {
                    Crafty.scene("main");
                });
            Crafty.e("Button")
                .attr({x: Crafty.screenWidth/2 - 100,y:350})
                .button('Main Menu',function() {
                    Crafty.scene("mainmenu");
                });
        });

        Crafty.scene("main", function () {
            Crafty.background("#666");

            initializeBackground();
            Crafty.score = 0;
            Crafty.energy = 500;
            Crafty.tempEnergy = 0;
            Crafty.platGen = 10;
            Crafty.platPrev = 0;
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


            var energyBar = Crafty.e("EnergyBar").attr({
                x: 0,
                y: 10,
                z: 102,
                w: 250,
                h: 20
            });
            Crafty.guiPanel.attach( energyBar);
        });
    };
}());