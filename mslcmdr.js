// The global app variable
var MC = {};

// called by onload event from HTML
function init() {
    // create the canvas and it's drawing context
    MC.canvas = document.getElementById("mslcmdr");
    MC.c = MC.canvas.getContext("2d");

    // load the background and city images
    MC.images = {};
    MC.images["city"] = new Image();
    MC.images["city"].src = "img/city.png";
    MC.images["bg"] = new Image();
    MC.images["bg"].src = "img/background.jpg";
    MC.images["title"] = new Image();
    MC.images["title"].src = "img/title.jpg";
    MC.images["explosion"] = new Image();
    MC.images["explosion"].src = "img/explosion.png";

    // set game params
    MC.needsUpdate = false;
    MC.state = "title";
    MC.missileSpeed = 300;
    MC.explosionDuration = 1500;
    MC.lastTime = new Date();
    MC.elapsedTime = new Date();

    // add mouse capture
    $("#mslcmdr").mousedown(MC.click);
    $("#mslcmdr").rightMouseDown(MC.click);

    // set up the cities
    MC.cities = [];
    MC.cities[0] = {};
    MC.cities[0].x = 170;
    MC.cities[0].y = 450;
    MC.cities[0].alive = true;
    MC.cities[1] = {};
    MC.cities[1].x = 310;
    MC.cities[1].y = 450;
    MC.cities[1].alive = true;
    MC.cities[2] = {};
    MC.cities[2].x = 450;
    MC.cities[2].y = 450;
    MC.cities[2].alive = true;
    MC.cities[3] = {};
    MC.cities[3].x = 590;
    MC.cities[3].y = 450;
    MC.cities[3].alive = true;
    MC.cities[4] = {};
    MC.cities[4].x = 730;
    MC.cities[4].y = 450;
    MC.cities[4].alive = true;

    // the missile silos
    MC.silos = {};
    MC.silos.left = {};
    MC.silos.left.x = 75;
    MC.silos.left.y = 500;
    MC.silos.right = {};
    MC.silos.right.x = 925;
    MC.silos.right.y = 500;

    // data structures for game data
    MC.playerMissiles = [];
    MC.enemyMissiles = [];
    MC.explosions = [];
    
    // kickoff the main loop
    setTimeout(MC.iter, 10);
}

MC.iter = function() {
    var x, y;
    var thisTime = new Date();
    MC.elapsedTime = thisTime - MC.lastTime;
    MC.lastTime = thisTime;

    switch(MC.state) {
    case "title":
        x = (MC.canvas.width - MC.images.title.width) / 2;
        y = (MC.canvas.height - MC.images.title.height) / 2;
        MC.c.drawImage(MC.images.title, x, y);
        MC.needsUpdate = true;
        break;

    case "game":
        MC.updatePlayerMissiles();
        MC.updateEnemyMissiles();
        MC.updateExplosions();
        MC.drawBackground();
        MC.drawCities();
        MC.drawPlayerMissiles();
        MC.drawEnemyMissiles();
        MC.drawExplosions();
        MC.needsUpdate = true;
        break;
    }

    if(MC.needsUpdate) {
        setTimeout(MC.iter, 25);
    }
}

MC.click = function(ev) {
    // get canvas x,y coords
    var i, hyp, xDiff, yDiff;
    var bb = MC.canvas.getBoundingClientRect();
    var x = (ev.clientX - bb.left) * (MC.canvas.width / bb.width);
    var y = (ev.clientY - bb.top) * (MC.canvas.height / bb.height);
    MC.logi("click: " + (ev.which === 1 ? "left" : (
                         ev.which === 2 ? "middle" : (
                         ev.which === 3 ? "right" : "other"))) +
                         " button at (" + x + "," + y + ")");
    // do any state changes and call iter
    switch(MC.state) {
    case "title":
        MC.state = "game";
        break;
    case "game":
        if(y > MC.silos.left.y || 
           ev.which == 2) {
            break;
        }
        i = MC.playerMissiles.length;
        MC.playerMissiles[i] = {};
        MC.playerMissiles[i].alive = true;
        MC.playerMissiles[i].src = {};
        MC.playerMissiles[i].dest = {};
        MC.playerMissiles[i].pos = {};
        if(ev.which === 1) {
            MC.playerMissiles[i].src.x = MC.silos.left.x;
            MC.playerMissiles[i].src.y = MC.silos.left.y;
            MC.playerMissiles[i].pos.x = MC.silos.left.x;
            MC.playerMissiles[i].pos.y = MC.silos.left.y;
        } else if(ev.which === 3) {
            MC.playerMissiles[i].src.x = MC.silos.right.x;
            MC.playerMissiles[i].src.y = MC.silos.right.y;
            MC.playerMissiles[i].pos.x = MC.silos.right.x;
            MC.playerMissiles[i].pos.y = MC.silos.right.y;
        }
        MC.playerMissiles[i].dest.x = x;
        MC.playerMissiles[i].dest.y = y;
        MC.playerMissiles[i].maxDistSqr = MC.calcDistSqr(
            MC.playerMissiles[i].src.x, MC.playerMissiles[i].src.y,
            MC.playerMissiles[i].dest.x, MC.playerMissiles[i].dest.y);

        xDiff = (MC.playerMissiles[i].dest.x - MC.playerMissiles[i].src.x);
        yDiff = (MC.playerMissiles[i].dest.y - MC.playerMissiles[i].src.y);
        hyp = Math.sqrt((xDiff*xDiff) + (yDiff*yDiff));
        MC.playerMissiles[i].xCoef = xDiff / hyp;
        MC.playerMissiles[i].yCoef = yDiff / hyp;

        MC.logi("added missile " + i + " from " + MC.playerMissiles[i].src.x + ", " +
                MC.playerMissiles[i].src.y + " to " + MC.playerMissiles[i].dest.x +
                ", " + MC.playerMissiles[i].dest.y);
        break;
    default:
        MC.loge("in unknown state: " + MC.state);
    }
    setTimeout(MC.iter, 25);
    return false;
};

MC.updatePlayerMissiles = function() { 
    var i, j, k, distSqr, nDeadMissiles = 0;
    var maxDistTraveled = MC.missileSpeed * (MC.elapsedTime / 1000);
    // update missile positions and mark the exploding ones
    for(i = 0; i < MC.playerMissiles.length; i++) {
        MC.playerMissiles[i].pos.x += maxDistTraveled * MC.playerMissiles[i].xCoef;
        MC.playerMissiles[i].pos.y += maxDistTraveled * MC.playerMissiles[i].yCoef;
        distSqr = MC.calcDistSqr(MC.playerMissiles[i].src.x, MC.playerMissiles[i].src.y,
                                 MC.playerMissiles[i].pos.x, MC.playerMissiles[i].pos.y);
        if(distSqr >= MC.playerMissiles[i].maxDistSqr) {
            MC.playerMissiles[i].alive = false;
            nDeadMissiles++;
        }
    }
    // add explosions and remove the dead missiles from array
    for(i = 0; i < nDeadMissiles; i++) {
        for(j = 0; j < MC.playerMissiles.length; j++) {
            if(MC.playerMissiles[j].alive === false) {
                k = MC.explosions.length;
                MC.explosions[k] = {};
                MC.explosions[k].pos = MC.playerMissiles[j].dest;
                MC.explosions[k].pos.x -= MC.images.explosion.width / 2;
                MC.explosions[k].pos.y -= MC.images.explosion.height / 2;
                MC.explosions[k].age = MC.explosionDuration;
                MC.playerMissiles.splice(j, 1);
                break;
            }
        }
    }
};

MC.updateEnemyMissiles = function() {  };

MC.updateExplosions = function() { 
    var i, j, nDeadExplosions = 0;
    // update explosion ages
    for(i = 0; i < MC.explosions.length; i++) {
        MC.explosions[i].age -= MC.elapsedTime;
        if(MC.explosions[i].age <= 0) {
            nDeadExplosions++;
        }
    }
    // remove expired explosions
    for(i = 0; i < nDeadExplosions; i++) {
        for(j = 0; j < MC.explosions.length; j++) {
            if(MC.explosions[j].age <= 0) {
                MC.explosions.splice(j, 1);
                break;
            }
        }
    }
};

MC.drawBackground = function() {
    MC.c.drawImage(MC.images.bg, 0, 0);
};

MC.drawCities = function() {
    var i;
    for(i = 0; i < MC.cities.length; i++) {
        MC.c.drawImage(MC.images.city, 
                       MC.cities[i].x,
                       MC.cities[i].y);
    }
};

MC.drawPlayerMissiles = function() {
    var i;
    MC.c.beginPath();
    MC.c.strokeStyle = '#F00';
    MC.c.lineWidth = 1;
    for(i = 0; i < MC.playerMissiles.length; i++) {
        MC.c.moveTo(MC.playerMissiles[i].src.x, MC.playerMissiles[i].src.y);
        MC.c.lineTo(MC.playerMissiles[i].pos.x, MC.playerMissiles[i].pos.y);
    }
    MC.c.stroke();
};

MC.drawEnemyMissiles = function() { };

MC.drawExplosions = function() { 
    var i, alpha;
    for(i = 0; i < MC.explosions.length; i++) {
        alpha = MC.explosions[i].age / MC.explosionDuration;
        MC.c.globalAlpha = alpha;
        MC.c.drawImage(MC.images.explosion,
                       MC.explosions[i].pos.x,
                       MC.explosions[i].pos.y);
    }                       
    MC.c.globalAlpha = 1;
};

MC.calcDistSqr = function(x1, y1, x2, y2) {
    return (((y2-y1)*(y2-y1)) + ((x2-x1)*(x2-x1)));
};

// loggers
MC.loge = function(str) { console.log("ERROR: " + str); };
MC.logi = function(str) { console.log("INFO: " + str); };
MC.logd = function(str) { console.log("DEBUG: " + str); };
