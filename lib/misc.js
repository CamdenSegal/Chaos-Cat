Crafty.c("EnergyBar",{
    init: function() {
        this.requires("2D, DOM")
            .css({ "background" : "#e78447" });
        this.bind("EnterFrame",function () {
            this.w = Crafty.energy / 2;
            if(Crafty.tempEnergy){
                this.css({"background":"#fcdbcc"});
            }else{
                this.css({"background":"#e78447", "box-shadow":"none"});
            }
        });
    }
});

Crafty.c("Button", {
    init: function() {
        this.requires("2D, DOM, Text, Mouse")
            .attr({w:200,h:26});
    },

    button: function(text, onclick) {
        this.text(text);
        this.bind("Click", onclick);
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
