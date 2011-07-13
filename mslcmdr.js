// The global app variable
var MC = {};

// called by onload event from HTML
function init() {
    // create the canvas and it's drawing context
    MC.canvas = document.getElementById("mslcmdr");
    MC.c = MC.canvas.getContext("2d");
    
    // load up images since they are assumed by externals
    MC.images = {
        city : new Image(),
        bg : new Image(),
        title : new Image(),
        explosion : new Image()
    };
    MC.images.city.src = "img/city.png";
    MC.images.bg.src = "img/background.jpg";
    MC.images.title.src = "img/title.jpg";
    MC.images.explosion.src = "img/explosion.png";

    $.getScript("mcMissiles.js", function() {
        MC.initMissiles();
    });
    $.getScript("mcExplosions.js", function() {
        MC.initExplosions();
    });
    $.getScript("mcCities.js", function() {
        MC.initCities();
    });

    // define states
    if(MC.settings === undefined) {
        MC.settings = {};
    }
    MC.settings.STATE_TITLE = "title";
    MC.settings.STATE_GAME = "game";

    // set game params
    MC.needsUpdate = false;
    MC.state = MC.settings.STATE_TITLE;
    MC.last = new Date();
    MC.elapsed = new Date();
    MC.interval = 1000 / 30;

    // add mouse capture
    $("#mslcmdr").mousedown(MC.click);
    $("#mslcmdr").rightMouseDown(MC.click);

    // the missile silos
    MC.silos = {
        left : {
            x : 75,
            y : 500
        },
        right : {
            x : 925,
            y : 500
        }
    };

    // kickoff the main loop
    setTimeout(MC.iter, 10);
}

MC.iter = function() {
    var x, y;
    var thisTime = new Date();
    MC.elapsed = thisTime - MC.last;
    MC.last = thisTime;

    switch(MC.state) {
    case MC.settings.STATE_TITLE:
        // center title image and draw
        x = (MC.canvas.width - MC.images.title.width) / 2;
        y = (MC.canvas.height - MC.images.title.height) / 2;
        MC.c.drawImage(MC.images.title, x, y);
        MC.needsUpdate = true;
        break;

    case MC.settings.STATE_GAME:
        MC.updateMissiles();
        MC.updateExplosions(); 
        MC.drawBackground();
        MC.drawCities();
        MC.drawMissiles();
        MC.drawExplosions();
        MC.needsUpdate = true;
        break;
    }

    if(MC.needsUpdate) {
        setTimeout(MC.iter, MC.interval);
    }
}

MC.click = function(ev) {
    // get canvas x,y coords
    var i, hyp, xDiff, yDiff;
    var bb = MC.canvas.getBoundingClientRect();
    var x = (ev.clientX - bb.left) * (MC.canvas.width / bb.width);
    var y = (ev.clientY - bb.top) * (MC.canvas.height / bb.height);

    // do any state changes and call iter
    switch(MC.state) {
    case MC.settings.STATE_TITLE:
        MC.state = MC.settings.STATE_GAME;
        break;
    case MC.settings.STATE_GAME:
        if(y < MC.silos.left.y) {
            if(ev.which === 1) {
                MC.addPlayerMissile(MC.silos.left.x, MC.silos.left.y, x, y);
            } else if(ev.which === 3) {
                MC.addPlayerMissile(MC.silos.right.x, MC.silos.right.y, x, y);
            }
        }
        break;
    default:
        MC.loge("in unknown state: " + MC.state);
        break;
    }
    setTimeout(MC.iter, 25);
    return false;
};

MC.drawBackground = function() {
    MC.c.drawImage(MC.images.bg, 0, 0);
};

MC.calcDistSqr = function(x1, y1, x2, y2) {
    return (((y2-y1)*(y2-y1)) + ((x2-x1)*(x2-x1)));
};

// loggers
MC.loge = function(str) { console.log("ERROR: " + str); };
MC.logi = function(str) { console.log("INFO: " + str); };
MC.logd = function(str) { console.log("DEBUG: " + str); };
