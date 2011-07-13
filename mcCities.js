if(MC === undefined) {
    var MC = {};
}

MC.initCities = function() {
    MC.cities = [
        // city 0
        { 
            x : 170,
            y : 450,
            img : MC.images.city,
            alive : true
        },
        // city 1
        {
            x : 310,
            y : 450,
            img : MC.images.city,
            alive : true
        },
        // city 2
        {
            x : 450,
            y : 450,
            img : MC.images.city,
            alive : true
        },
        // city 3
        {
            x : 590,
            y : 450,
            img : MC.images.city,
            alive : true
        },
        // city 4
        {
            x : 730,
            y : 450,
            img : MC.images.city,
            alive : true
        }
    ];

    MC.drawCities = function() {
        var i;
        for(i = 0; i < MC.cities.length; i++) {
            MC.c.drawImage(MC.cities[i].img,
                           MC.cities[i].x,
                           MC.cities[i].y);
        }
    };
};
