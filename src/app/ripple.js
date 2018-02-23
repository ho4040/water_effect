var PIXI = require('pixi.js');

// You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.
var renderer = new PIXI.WebGLRenderer(800, 600);

// The renderer will create a canvas element for you that you can then insert into the DOM.
document.body.appendChild(renderer.view);

 
var tile_size = 10;
var width = 80;
var height = 60;

var newSurface = function(){
    var surface = [];
    for(var y=0;y<height;y++){
        var row = [];
        for(var i=0;i<width;i++)
            row[i] = 0;
        surface.push(row);
    }
    return surface;
}

var current_surface = newSurface();
var previous_surface = newSurface();

var getV = function(surface, x, y){
    if(x >= 0 && x < width && y >= 0 && y < height)
        return surface[y][x];
    return 0;
}

var setV = function(surface, x, y, v){
    if(x >= 0 && x < width && y >= 0 && y < height){
        surface[y][x] = v;
        return true;
    }
    return false;
}

var calcNewV = function(x,y){
    var damp = 0.95;
    var num = 0;
    var t=0;
    var k = 1;
    for(var i=-k;i<=k;i++){
        for(var j=-k;j<=k;j++){        
            if(i==0 && j == 0) continue;
            num++;
            var dist = Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2));
            t += (getV(current_surface, x+i, y+j))/dist;
        }
    }
    var avgHeight = (t/num); //Blur 하기 위해서 평균높이를 구한다
    var velocity = -getV(previous_surface, x, y); //두프레임 전의 높이를 운동량으로 이용한다.
    var newHeight = (avgHeight*2 + velocity)*damp; // 2?
    return newHeight;
}

var step = function(){
    
    var next_surface = []
    for(var y=0;y<height;y++)
    {
        var row = [];
        for(var x=0;x<width;x++)
            row.push(calcNewV(x, y));
        next_surface.push(row);
    }
    previous_surface = current_surface;
    current_surface = next_surface;
}


var stage = new PIXI.Container();
var graphics = new PIXI.Graphics();
stage.addChild(graphics);

graphics.interactive = true;
graphics.buttonMode = true;
graphics.on('pointermove', (e)=>{
    var p = e.data.getLocalPosition(graphics);
    x = Math.floor(p.x/tile_size);
    y =  Math.floor(p.y/tile_size);
    setV(current_surface, x, y, -5.5)
})


function animate() {

    step();

    //Draw
    graphics.clear()
    graphics.lineStyle(1, 0x00, 0);
    for(var y=0;y<height;y++)
    for(var x=0;x<width;x++)
    {            
        var v = getV(current_surface, x, y);
        graphics.beginFill(0x8888FF, 0.5+v);
        graphics.drawRect(x*tile_size, y*tile_size, tile_size, tile_size);
    }
    graphics.endFill();


    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
}

// start the timer for the animation loop
setInterval(animate, 30)
