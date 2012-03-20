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
        this.requires("Delay");
        this.bind("EnterFrame", function () {
            if (this.x < (Crafty.viewport.x - 100)) {
                this.destroy();
            }else if(this.y > 550){
                this.destroy();
            }
        });
        this.delay(function() {
            this.destroy();
            }, 10000);
    }
});