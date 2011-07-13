if(MC === undefined) {
    var MC = {};
}

MC.initExplosions = function() {
    if(MC.settings === undefined) {
        MC.settings = {};
    }
    MC.settings.EXPL_SIZE_SQR = Math.pow(MC.images.explosion.width / 2, 2);
    MC.settings.EXPL_DURATION = 1000;
    MC.explosions = [];
};

MC.addExplosion = function(explX, explY) {
    var next = MC.explosions.length;
    MC.explosions[next] = {
        pos : {
            x : explX,
            y : explY
        },
        ul : {
            x : explX - MC.images.explosion.width / 2,
            y : explY - MC.images.explosion.height / 2
        },
        age : MC.settings.EXPL_DURATION,
        img : MC.images.explosion
    };
};

MC.drawExplosions = function() {
    var i, alpha;
    for(i = 0; i < MC.explosions.length; i++) {
        alpha = MC.explosions[i].age / MC.settings.EXPL_DURATION;
        MC.c.globalAlpha = alpha;
        MC.c.drawImage(MC.explosions[i].img,
                       MC.explosions[i].ul.x,
                       MC.explosions[i].ul.y);
    }
    MC.c.globalAlpha = 1;
};

MC.pointInExplosion = function(x, y) {
    var explX, explY;
    var i, distSqr;
    for(i = 0; i < MC.explosions.length; i++) {
        explX = MC.explosions[i].pos.x;
        explY = MC.explosions[i].pos.y;
        distSqr = MC.calcDistSqr(x, y, explX, explY);
        if(distSqr < MC.settings.EXPL_SIZE_SQR) {
            return true;
        } 
    }
    return false;
};

MC.updateExplosions = function() {
    var i, j, nDead = 0;
    // age explosions
    for(i = 0; i < MC.explosions.length; i++) {
        MC.explosions[i].age -= MC.elapsed;
        if(MC.explosions[i].age <= 0) {
            nDead++;
        }
    }
    // remove expired explosions
    for(i = 0; i < nDead; i++) {
        for(j = 0; j < MC.explosions.length; j++) {
            if(MC.explosions[j].age <= 0) {
                MC.explosions.splice(j, 1);
                break;
            }
        }
    }
};


