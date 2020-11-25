const canvas2 = $('minimap');
/*
const smiley  = $('smiley');
const blocks  = $('blocks');
const bg      = $('bg');
const aura    = $('aura');
*/
const  ctx =  canvas.getContext('2d', {alpha: false});
const ctx2 = canvas2.getContext('2d', {alpha: false});

ctx.fillStyle = '#1F1F1F';
ctx.imageSmoothingEnabled = false

var X_SCALE = Y_SCALE = 1;
var prevPageWidth = prevPageHeight = 0;

function addImage(name){
	
	window[name]     = document.createElement('img');
	window[name].id  = name;
	window[name].src = name + '.png';
	
	return window[name];
}

addImage('smiley');
addImage('blocks');
addImage('bg');
addImage('aura');

function x_vtile(){
	return X_SCALE * 16;
}
	
function y_vtile(){
	return Y_SCALE * 16;
}
//var x_vtile() = X_SCALE * 16;
//var y_vtile() = Y_SCALE * 16;
const SPRITE_SIZE = 16;
const DISPLAY_DIGITS = 6;

var posTextX = 0, posTextY = 0;
var velTextX = 0, velTextY = 0;

class CameraDisplay extends Rectangle{
	// maybe make the moving camera an entity apart from cameraDisplay
	constructor(x, y, width, height, target){
		super(x, y, width, height);
		this.target = target;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		
		this.cx = 0;
		this.cy = 0;
		this.prevX = 0;
		this.prevY = 0;
		this.prevImg = null;
	}
	
	move(){
		this.prevX = this.x;
		this.prevY = this.y;
		
		var xtarget = this.target.x.pos*X_SCALE;
		var ytarget = this.target.y.pos*Y_SCALE;
		
		var xdiff = xtarget - this.x - this.width /2;
		var ydiff = ytarget - this.y - this.height/2;
		
		if (xdiff < 0.00001 && xdiff > 0.00001) xdiff = 0;
		if (ydiff < 0.00001 && ydiff > 0.00001) ydiff = 0;
		
		var lag = 1/16;
		
		this.x += xdiff * lag; // = Math.round(this.x + xdiff * 1/16);
		this.y += ydiff * lag;
	}
	
	draw(){
		//var layer = 1;
		
		//var pixelRowsVisible = camera.yx + this.width;
		//console.log(prevImg);
		//console.log(this.prevX,this.x);
		/*
		if (this.prevImg != null) ctx.putImageData(this.prevImg,
			this.cx - (Math.abs(this.prevX, this.x)),
			this.cy + (Math.abs(this.prevY, this.y))
			);
		*/
		ctx.clearRect(this.cx,this.cy,this.width,this.height);
		
		//else{
			for (var i = 0; i < map.columns*map.rows; i++){
				var tx = map.getTileX(i);
				var ty = map.getTileY(i);
				
				var columnIsVisible = tx*x_vtile() < (this.x + this.width ) && tx*x_vtile() > this.x-x_vtile();
				var    rowIsVisible = ty*y_vtile() < (this.y + this.height) && ty*y_vtile() > this.y-y_vtile();
			
				if (columnIsVisible && rowIsVisible){
				
					if (!serverBlockInfo[map.tiles[i]].isSolid) this.drawBlock(0, tx, ty); // Draw background behind transparent blocks
					this.drawBlock(map.tiles[i], tx, ty); // Draw foreground block
				}
			}
		//}
		//this.prevImg = ctx.getImageData(this.cx, this.cy, this.width, this.height);
		
		for (var i = 0; i < entities.length; i++) this.drawEntity(entities[i]);
		
		//ctx.fillRect(  this.cx+this.width , 0, x_vtile(), this.height+y_vtile());
		//ctx.fillRect(0,this.cy+this.height,    this.width, y_vtile());
	}

	drawBlock(id, x, y){
			
		ctx.drawImage(blocks,
			// Cropping
			id * SPRITE_SIZE,           0, // Area
				 SPRITE_SIZE, SPRITE_SIZE, // Size
					 
			//  Drawing
			 Math.round(x * x_vtile() - this.x + this.cx),
			 Math.round(y * y_vtile() - this.y + this.cy),
				 x_vtile(),               y_vtile()
				 );
	}

	drawEntity(entity){
		
		if (entity.isFlying) ctx.drawImage(aura,
		Math.round(entity.x.pos*X_SCALE - this.x - entity.width *X_SCALE*1.5 + this.cx), 
		Math.round(entity.y.pos*Y_SCALE - this.y - entity.height*Y_SCALE*1.5 + this.cy),
		
		entity.width*4*X_SCALE, entity.height*4*Y_SCALE);
		
		ctx.drawImage(smiley,
		Math.round(entity.x.pos*X_SCALE - this.x + this.cx),
		Math.round(entity.y.pos*Y_SCALE - this.y + this.cy),
		
		entity.width*X_SCALE, entity.height*Y_SCALE);
	}
}

class Minimap extends Rectangle{
	
	constructor(x, y, width, height, scale){
		super(x, y, width, height);
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.scale = scale;
	}
	
	update(x, y, style){
		var s = this.scale;
		ctx2.fillStyle = style;
		ctx2.fillRect(x*s, y*s, s, s);
	}
	
	clear(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	
	resize(){
		canvas2.width = map.columns*minimap.scale;
		canvas2.height = map.rows*minimap.scale;
	}
}

class Hotbar extends Rectangle{
	draw(){
		var screenBlocksWide = Math.floor((canvas.width/16)-1)
		
		ctx.clearRect(0, canvas.height-this.height, canvas.width, this.height);

		ctx.drawImage(blocks,
		
		Math.floor(b - (screenBlocksWide/2))*16, 0, screenBlocksWide*16, 16,
		8, canvas.height-18, screenBlocksWide*16, 16);
		
		ctx.drawImage(blocks, 5*16, 0, 16, 16,
		canvas.width/2 - canvas.width/2%16 + 8, canvas.height-32, 16, 16);
		// WEIRD AND UNNECESARY BUG:
		// ctx.drawImage(blocks, (b-19)*16, 0, Math.min(39*16, (b-98)*16), 16,8, 482, 39*16, 16);
		
		//if (hasParent && entities.length > 1) updateInfo();
	}
}

const GUI = [];
GUI.push(new CameraDisplay(0,0,40*16,30*16,entities[0]));
GUI.push(new Hotbar(0,0,0,28));

resize();

//minimap.width  = map.columns*minimap.scale,
//minimap.height = map.rows   *minimap.scale,

function resize(){
	//prevPageWidth  = document.body.clientWidth;
	//prevPageHeight = document.body.clientHeight;
	
	canvas.width  = Math.max(64, document.body.clientWidth);
	canvas.height = Math.max(64, document.body.clientHeight);
	
	GUI[0].width  = canvas.width;
	GUI[0].height = canvas.height - 16;
}

function draw(){
	ctx.fillStyle = '#1F1F1F'
	
	if (canvas.width != document.body.clientWidth || canvas.height != document.body.clientHeight) resize();
	//ctx.clearRect(0, 0, canvas.width, canvas.height-20);
	
	for (var i = 0; i < GUI.length; i++) GUI[i].draw();
}
function updateInfo(){
	
	if (posTextX != mainEntity.x.pos / 16 || posTextY != mainEntity.y.pos / 16){
		updateHTML('x', mainEntity.x.pos, DISPLAY_DIGITS);
		updateHTML('y', mainEntity.y.pos, DISPLAY_DIGITS);
	}
	if (velTextX != mainEntity.x.v || velTextY != mainEntity.y.v){
		velTextX  = mainEntity.x.v;
		velTextY  = mainEntity.y.v;
		updateHTML('xvel', velTextX, DISPLAY_DIGITS);
		updateHTML('yvel', velTextY, DISPLAY_DIGITS);
	}
	//$("time").innerHTML = (time / 100).toFixed(2) + " second(s) since last reset"
	updateHTML('time', time / 100, 2);
}

function updateHTML(element, value, depth){
	$(element).innerHTML = value.toFixed(depth);
}
