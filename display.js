  var canvas  = $('game');
  var canvas2 = $('minimap');
const smiley  = $('smiley');
const blocks  = $('blocks');
const bg      = $('bg');
const aura    = $('aura');

const ctx = canvas.getContext('2d', {alpha: false, imageSmoothingEnabled: false});
const ctx2 = canvas2.getContext('2d', {alpha: false, imageSmoothingEnabled: false});

const VTILE = 16;
const DISPLAY_DIGITS = 6;

var posDisplayX = 0, posDisplayY = 0;
var velDisplayX = 0, velDisplayY = 0;

var camera = {
	x: 0,
	y: 0,
	width : 40*16,
	height: 30*16,
	move: function(target){
		var xtarget =  target.x.pos;
		var ytarget =  target.y.pos;
		
		var xdiff = target.x.pos - this.x -  this.width /2;
		var ydiff = target.y.pos - this.y -  this.height/2;
		
		this.x += xdiff * 1/16;
		this.y += ydiff * 1/16;
	}
}

var minimap = {
	x: 0,
	y: 0,
	scale: 1,
	width: 25,
	height: 25,
	update: function(x, y, style){
		var s = this.scale;
		ctx2.fillStyle = style;
		ctx2.fillRect(x*s, y*s, s, s);
	},
	clear: function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	},
	resize: function(){
		canvas2.height = map.rows*minimap.scale;
		canvas2.width = map.columns*minimap.scale;
	}
}
minimap.resize();

//minimap.width  = map.columns*minimap.scale,
//minimap.height = map.rows   *minimap.scale,

function constantDraw(){
	draw();
	editHold();
	requestAnimationFrame(constantDraw);
}

function draw(){
	updateHTML();
	camera.move(entities[0]);
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	var layer = 1;
	//map.tiles[1].forEach(drawRow)
	
	for (var i = 0; i < map.columns*map.rows; i++){
		if (isNonSolid[map.tiles[i]]) drawBlock(0, map.getTileX(i), map.getTileY(i)); // Draw background behind transparent blocks
		drawBlock(map.tiles[i], map.getTileX(i), map.getTileY(i)); // Draw foreground block
	}
	
	/*
	if (typeof imageBatch != 'object'){
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		
		map.tiles[1].forEach(drawRow)
		imageBatch = ctx.getImageData(0,0,canvas.width,canvas.height)
		
		console.log(typeof imageBatch);
	}
	ctx.putImageData(imageBatch,0,0)
	*/
	
	//layer = 0;
	//map.tiles[0].forEach(drawRow)
	
	/*
	function drawRow(item, r){
		for (c = 0; c < map.columns; c++){
			drawBlock(layer, c, r)
		}
	}
	*/
	
			ctx.drawImage(blocks,
			// Cropping
			b * VTILE,         0, // Area
			     VTILE,     VTILE, // Size
					 
			//  Drawing
			 0, 0, VTILE, VTILE
				 );
	
	function drawBlock(id, x, y){
			
		ctx.drawImage(blocks,
			// Cropping
			id * VTILE,         0, // Area
			     VTILE,     VTILE, // Size
					 
			//  Drawing
			 x * VTILE - camera.x, y * VTILE - camera.y,
			     VTILE,                VTILE
				 );
	}
	
	entities.forEach(drawEntity);
	
	function drawEntity(entity){
		if (entity.isFlying) ctx.drawImage(aura, Math.round(entity.x.pos - camera.x - 24), Math.round(entity.y.pos - camera.y - 24));
		ctx.drawImage(smiley, entity.x.pos - camera.x, entity.y.pos - camera.y);
	}
}

function updateHTML(){
	
	if (posDisplayX != entities[0].x.pos / VTILE || posDisplayY != entities[0].y.pos / VTILE){
		posDisplayX = entities[0].x.pos // / VTILE;
		posDisplayY = entities[0].y.pos // / VTILE;
		$( "pos").innerHTML = "Block position: " + posDisplayX.toFixed(DISPLAY_DIGITS) + ", " +posDisplayY.toFixed(DISPLAY_DIGITS);
	}
	if (velDisplayX != entities[0].x.v || velDisplayY != entities[0].y.v){
		velDisplayX  = entities[0].x.v;
		velDisplayY  = entities[0].y.v;
		$( "vel").innerHTML = "Velocity: " + velDisplayX.toFixed(DISPLAY_DIGITS) + ", " + velDisplayY.toFixed(DISPLAY_DIGITS);
	}
	
	$("time").innerHTML = (time / 100).toFixed(2) + " second(s) since last reset"
}

function updateEditHistory(){
	//$( "msp").innerHTML = "Last edit position: " + "(" + xtile + ", " + ytile ")";
	
	//console.log(ytile * map.columns + xtile);
}