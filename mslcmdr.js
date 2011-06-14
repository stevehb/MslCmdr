// the global app variable
var MC = {};

// called by onload event of HTML document body
function init() {
    // create the canvas and it's drawing context
    MC.canvas = document.getElementById("mslcmdr");
    MC.c = MC.canvas.getContext("2d");

    // load the background and city images
    MC.images = {};
    MC.images["city"] = Image();
    MC.images["city"].src = "city.png";
    MC.images["bg"] = Image();
    MC.images["bg"].src = "background.jpg";
    MC.images["title"] = Image();
    MC.images["title"].src = "title.jpg";

    // set game params
    MC.appState = "title";

    // add mouse capture
    //MC.canvas.onmousedown = MC.click;
    // $("#mslcmdr").dblclick(MC.click);
    // $("#mslcmdr").click(MC.click);
    $("#mslcmdr").mousedown(MC.click);

    // draw the scene
    setTimeout(MC.iter, 10);
}

MC.iter = function() {
    var x, y;
    console.log("calling iter()");

    switch(MC.appState) {
    case "title":
        x = (MC.canvas.width - MC.images.title.width) / 2;
        y = (MC.canvas.height - MC.images.title.height) / 2;
        MC.c.drawImage(MC.images.title, x, y);
        console.log("drawing title image to x=" + x + ", y=" + y);
        break;

    case "game":
        x = 0;
        y = 0;
        MC.c.drawImage(MC.images.bg, x, y);
        console.log("drawing bg image to x=" + x + ", y=" + y);
        break;
    }
}



MC.click = function(ev) {
    switch(ev.which) {
    case 1:
        console.log('Left mouse button pressed');
        MC.appState = "game";
        break;
    case 2:
        console.log('Middle mouse button pressed');
        break;
    case 3:
        console.log('Right mouse button pressed');
        break;
    default:
        console.log('You have a strange mouse');
    }
    setTimeout(MC.iter, 25);
    return true;
};


/*
    if(!ev) var ev = window.event;
    // get the canvas x,y coords
    var bb = MC.canvas.getBoundingClientRect();
    var x = (ev.clientX - bb.left) * (MC.canvas.width / bb.width);
    var y = (ev.clientY - bb.top) * (MC.canvas.height / bb.height);
    console.log("click: button " + ev.button + " at (" + x + "," + y + ")");

    switch(MC.appState) {
    case "title":
        MC.appState = "game";
        break;
    case "game":
        // MC.addMissle();
        break;
    }
    return false;
*/

function draw() {
    console.log("drawing background...");
    MC.c.drawImage(MC.images["bg"], 0, 0);
}
