if(MC === undefined) {
    var MC = {};
}

MC.initMissiles = function() {
    MC.mslProps = {
        playerSpeed : 1500,
        enemySpeed : 50,
        enemyDelay : 200,
        enemyAccumDelay : 0
    };
    MC.missiles = [];
    if(MC.settings === undefined) {
        MC.settings = {};
    }
    MC.settings.PLAYER = "player";
    MC.settings.PLAYER_COLOR = "F00";
    MC.settings.ENEMY = "enemy";
    MC.settings.ENEMY_COLOR = "FF0";
};

MC.addPlayerMissile = function(srcX, srcY, destX, destY) {
    var next = MC.missiles.length;
    var xDiff = destX - srcX;
    var yDiff = destY - srcY;
    var hyp = Math.sqrt((xDiff*xDiff) + (yDiff*yDiff));

    MC.missiles[next] = {
        alive : true,
        type : MC.settings.PLAYER,
        color : MC.settings.ENEMY_COLOR,
        src : {
            x : srcX,
            y : srcY
        },
        pos : {
            x : srcX,
            y : srcY
        },
        dest : {
            x : destX,
            y : destY
        },
        maxDistSqr : MC.calcDistSqr(srcX, srcY, destX, destY),
        xCoef : xDiff / hyp,
        yCoef : yDiff / hyp
    };
};

MC.addEnemyMissile = function() {
    var next = MC.missiles.length;
    var srcX = Math.floor(Math.random() * MC.canvas.width);
    var srcY = 0;
    var city = Math.floor(Math.random() * MC.cities.length);
    var destX = MC.cities[city].x + (MC.images.city.width / 2);
    var destY = MC.cities[city].y + (MC.images.city.height / 2);
    var xDiff = destX - srcX;
    var yDiff = destY - srcY;
    var hyp = Math.sqrt((xDiff*xDiff) + (yDiff*yDiff));

    MC.missiles[next] = {
        alive : true,
        type : MC.settings.ENEMY,
        color : MC.settings.ENEMY_COLOR,
        src : {
            x : srcX,
            y : srcY
        },
        pos : {
            x : srcX,
            y : srcY
        },
        dest : {
            x : destX,
            y : destY
        },
        maxDistSqr : MC.calcDistSqr(srcX, srcY, destX, destY),
        xCoef : xDiff / hyp,
        yCoef : yDiff / hyp
    };
};

MC.updateMissiles = function() {
    var maxPlayerDist = MC.mslProps.playerSpeed * (MC.elapsed / 1000);
    var maxEnemyDist = MC.mslProps.enemySpeed * (MC.elapsed / 1000);
    var i, j, distSqr, nDead = 0;

    // move enemy timer along, add enemy missile if time
    MC.mslProps.enemyAccumDelay += MC.elapsed;
    if(MC.mslProps.enemyAccumDelay > MC.mslProps.enemyDelay) {
        MC.addEnemyMissile();
        MC.mslProps.enemyAccumDelay -= MC.mslProps.enemyDelay;
    }

    // move the missiles forward
    for(i = 0; i < MC.missiles.length; i++) {
        if(MC.missiles[i].type === MC.settings.PLAYER) {
            MC.missiles[i].pos.x += maxPlayerDist * MC.missiles[i].xCoef;
            MC.missiles[i].pos.y += maxPlayerDist * MC.missiles[i].yCoef;
        }
        if(MC.missiles[i].type === MC.settings.ENEMY) {
            MC.missiles[i].pos.x += maxEnemyDist * MC.missiles[i].xCoef;
            MC.missiles[i].pos.y += maxEnemyDist * MC.missiles[i].yCoef;
        }
        distSqr = MC.calcDistSqr(MC.missiles[i].src.x, MC.missiles[i].src.y,
                                 MC.missiles[i].pos.x, MC.missiles[i].pos.y);
        if(distSqr >= MC.missiles[i].maxDistSqr) {
            // players where they're supposed to be, enemies where they are
            if(MC.missiles[i].type === MC.settings.PLAYER) {
                MC.addExplosion(MC.missiles[i].dest.x, MC.missiles[i].dest.y);
            } else if(MC.missiles[i].type === MC.settings.ENEMY) {
                MC.addExplosion(MC.missiles[i].pos.x, MC.missiles[i].pos.y);
            }
            MC.missiles[i].alive = false;
            nDead++;
        }
    }

    // now mark the enemies that have hit explosions
    for(i = 0; i < MC.missiles.length; i++) {
        if(MC.missiles[i].type === MC.settings.PLAYER || 
           MC.missiles[i].alive === false) {
            continue;
        }
        if(MC.pointInExplosion(MC.missiles[i].pos.x, MC.missiles[i].pos.y)) {
            MC.addExplosion(MC.missiles[i].pos.x, MC.missiles[i].pos.y);
            MC.missiles[i].alive = false;
            nDead++;
        }
    }

    // remove dead missiles
    for(i = 0; i < nDead; i++) {
        for(j = 0; j < MC.missiles.length; j++) {
            if(MC.missiles[j].alive === false) {
                MC.missiles.splice(j, 1);
                break;
            }
        }
    }
};

MC.drawMissiles = function() {
    var i;
    // draw the enemies
    MC.c.beginPath();
    MC.c.lineWidth = 1;
    MC.c.strokeStyle = MC.settings.ENEMY_COLOR;
    for(i = 0; i < MC.missiles.length; i++) {
        if(MC.missiles[i].type === MC.settings.ENEMY) {
            MC.c.moveTo(MC.missiles[i].src.x, MC.missiles[i].src.y);
            MC.c.lineTo(MC.missiles[i].pos.x, MC.missiles[i].pos.y);
        }
    }
    MC.c.stroke();
    // and the players
    MC.c.beginPath();
    MC.c.lineWidth = 1;
    MC.c.strokeStyle = MC.settings.PLAYER_COLOR;
    for(i = 0; i < MC.missiles.length; i++) {
        if(MC.missiles[i].type === MC.settings.PLAYER) {
            MC.c.moveTo(MC.missiles[i].src.x, MC.missiles[i].src.y);
            MC.c.lineTo(MC.missiles[i].pos.x, MC.missiles[i].pos.y);
        }
    }
    MC.c.stroke();
};
