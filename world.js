const BG = 0;
const FG = 1;

var entities = [];

const width = 16;
const height = 16;

const        BASE_DRAG = Math.pow(0.9981,10) * 1.00016093; // 0.9813195279915707
const NO_MODIFIER_DRAG = Math.pow(0.9900,10) * 1.00016093; // 0.9045276172161355

var controlRight = 0;
var controlDown = 0;
var isJumping = false;
var overlapA = -1;
var grounded = false;

var time = 0;

// WORLD ID GENERATION: Date.now() - (4101 * 86400)

var map = {
	columns : 10,
	rows    : 10,
	tiles   : [],
	
	tileCoordsToNumber: function(x, y){
		return (y * this.columns) + x;
	},
	
	tileCoordsToId: function(x, y){
		return this.tiles[(y * this.columns) + x];
	},
	
	getTileX: function (number){
		return (number % this.columns);
	},
	
	getTileY: function (number){
		return Math.floor(number / this.columns);
	},
	
	fillBorder: function (blockID){
		for (var i = 0; i < this.columns; i++){
			
			this.tiles[i] = blockID;                                  // Fills the top
			//map.tiles[i * (this.columns +  this.rows-1) ] = blockID; // Fills right side
			this.tiles[i + (this.columns * (this.rows   -1))] = blockID; // Fills bottom
		}
		for (var i = 1; i < this.rows;    i++){
			this.tiles[i*this.columns-1] = blockID; // Fills right side
			this.tiles[i*this.columns  ] = blockID; // Fills left side
		}
	},
	
	fillAll: function (blockID){
		// console.log(minimap); // weird
		for (var i = 0; i < this.columns*this.rows; i++){
			this.tiles[i] = blockID;
		}
	},
	
	resize: function (x, y){
		this.reset();
		if (x * y <= 1000000){ // you cannot handle the power
			if (x >= 2) this.columns = Math.round(x);
			if (y >= 2) this.rows    = Math.round(y);
		}
		this.fillAll(0);
		this.fillBorder(b);
	},
	
	reset: function(){
		entities.forEach(reset);
	}
}
map.fillAll(0);
map.fillBorder(b);
//map.fillBorders(FG, 9);

// These should probably be per-smiley variables, not global variables

//const isNonSolid = [1,1,1,1,1,1,1,1,1,,,,,,,,,,,,,,,,,,1,1,1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,1,1,1,1,,,,,,,,,,,,,1,,,,,,1,,,,,,1,1,1,,,,,1,1];

function initializeBlockRange(start, end){
	for (var i = start; i <= end; i++) serverBlockInfo[i] = {};
}

function setBlockInfo(array, attribute, value){
	for (var i = 0; i < array.length; i++){
		
		if (typeof serverBlockInfo[array[i]] === 'undefined') serverBlockInfo[array[i]] = {};
		serverBlockInfo[array[i]][attribute] = value; 
		
		//serverBlockInfo[i] = 
	}
}

initializeBlockRange(0,97);
setBlockInfo([0,1,2,3,4,5,6,7,8,26,27,28,77,83,89,90,91,96,97], 'isSolid', false);

setBlockInfo([1], 'xgravity', -2);
setBlockInfo([2], 'ygravity', -2);
setBlockInfo([3], 'xgravity',  2);
setBlockInfo([4], 'xgravity',  0);
setBlockInfo([1,3,4], 'ygravity',  0);

/*

			                             {x.mor =  0; y.mor =  0; this.queue[1] = 4;}
		else if(this.currentInside === 1){x.mor = -2; y.mor =  0;}
		else if(this.currentInside === 2){x.mor =  0; y.mor = -2;}
		else if(this.currentInside === 3){x.mor =  2; y.mor =  0;}
		else                             {x.mor =  0; y.mor =  2;}
		
		     if(this.queue[0] === 4 ||  this.isFlying)
			                        {x.mo =  0; y.mo =  0;}
		else if(this.queue[0] === 1){x.mo = -2; y.mo =  0;}
		else if(this.queue[0] === 2){x.mo =  0; y.mo = -2;}
		else if(this.queue[0] === 3){x.mo =  2; y.mo =  0;}
		else                        {x.mo =  0; y.mo =  2;}
		*/


function edit(z, x, y, b){
	//updateEditHistory();
	
	var i = map.tileCoordsToNumber(x,y);
	
	try{
		if (map.tiles.length > i && map.tiles[i]!= b && typeof serverBlockInfo[b] != 'undefined'){
			map.tiles[i] = b;
			if (serverBlockInfo[b] == false) minimap.update(x, y, '#000000');
			else minimap.update(x, y, '#ffffff');
		}
	}
	catch(error){
	}
}

function overlaps(x, y, size){
	var topLeftX = x/16 >> 0; // _loc3_
	var topLeftY = y/16 >> 0; // _loc4_
	
	var alignedX = x % 16 === 0;
	var alignedY = y % 16 === 0;
	
	var overlapsOneWay = false;
	
	function isBlockSolid(xOffset, yOffset){
		var currentX = topLeftX+xOffset;
		var currentY = topLeftY+yOffset;
		
		var blockID = map.tileCoordsToId(currentX, currentY);
		/*
		if(blockID === (61||62||63)){
			
			if (mainEntity.y.v < 0 || currentY <= overlapA || (mainEntity.y.v === 0 && mainEntity.x.v === 0 && mainEntity.y.pos + 15 > currentY*16)){
				
				if(currentY != topLeftY || overlapA === -1){
					overlapA = currentY;
				}
				overlapsOneWay = true;
			}
			else return true;
		}*/
		if (typeof blockID === 'undefined') return true;
		if (serverBlockInfo[blockID].isSolid == false) return false;
		
		return true;
	}
	
	if (isBlockSolid(0,0)||
	   (isBlockSolid(1,0) && !alignedX)||
	   (isBlockSolid(0,1) && !alignedY)||
	   (isBlockSolid(1,1) && !alignedX && !alignedY))
	{return true;}
	
	if (!overlapsOneWay) overlapA = -1;
	
	//if(y.v < 0 || _loc13_ <= _loc2_.overlapa || y.v == 0 && y.x == 0 && _loc2_.oy + 15 > _loc13_ * 16)
	
	/*
	var xmath = (x + 16) / size; // _loc5_
	var ymath = (y + 16) / size; // _loc6_
	
	var yBlockCheck = topLeftY; // _loc13_
	
	while (yBlockCheck < ymath) {
		
		var loc11 = map.tiles[FG][yBlockCheck];

		var xBlockCheck = topLeftX; //_loc14_
		
		for (; xBlockCheck < xmath; xBlockCheck++){
			if (!loc11) continue;
			
			var loc15 = loc11[xBlockCheck]
			
			if (typeof loc15 == 'undefined'){ // If block ISN'T solid
				continue;
			}
			
			//console.log(xBlockCheck + ", " + yBlockCheck);
			//console.log(smiley.x+smiley.width + ", " + (smiley.y+smiley.height));
			
			//if(!(x.pos+16 > xBlockCheck*16) || (!y.pos+16 > yBlockCheck*16)){
			//	continue;
			//}
			switch(loc15) // If it ain't solid
			{
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
					{continue;}
					break;
				case 61:
					console.log("hey");
					break;
					//loc2: player
					//loc13
					
					//loc4 topLeftY
					//loc7 = true
			}
			
			return true;
		}
		xBlockCheck++
	}
	*/
	return false;	
}

function isInside(position){
	return position + 8 >> 4;
}

const ALIGN_THRESHOLD = 2;
const INSTANT_ALIGN_THRESHOLD = 0.2;

function alignToGrid(input){
	var p = input % 16;
	if (p > 8) p -= 16;
	// p is the number of pixels away from the nearest tile.
	
	if (p < ALIGN_THRESHOLD && p > -ALIGN_THRESHOLD)
	{	
		if (p < INSTANT_ALIGN_THRESHOLD && p > -INSTANT_ALIGN_THRESHOLD) return Math.round(input); // Round to nearest tile
		else return input - (p / 15); // Otherwise move it 1/15 of the remaining distance
	}
	
	return input;
}

// AXIS

class Axis{
	constructor(setpos){
		this.pos = setpos;
		this.v = 0; // Velocity (Movement + Gravity)
		this.m = 0; // Movement multiplied by speed
		this.mor = 0; // Gravity force
		this.mo = 0; // Gravity multiplied by gravity
		
		this.remainder = NaN;
		this.cs = NaN;
	}
	
	tickStart(){
		this.done = false;
		this.mor = 0;
		this.mo = 0;
		this.remainder = this.pos % 1; // Moved from tick()
	}
	
	calculateVelocity(v, othermo, modifier){
		v += modifier;
		if(
			this.m == 0 && othermo != 0 || // If moving, and the smiley's falling
			     v  < 0 && this.m   > 0 || // If moving left, but trying to turn right
			     v  > 0 && this.m   < 0)   // If moving right, but trying to turn left
			{
				v *= BASE_DRAG;
				v *= NO_MODIFIER_DRAG;
			}
		else v *= BASE_DRAG; // Physics used for dots
		
		     if (v >    16)               v =  16;
		else if (v <   -16)               v = -16;
		else if (v < .0001 && v > -.0001) v =   0;
		return v;
	}
	
	step(startingPos, WhatToDoWhenOverlapping){
		/*
		if(this.cs > 0 || this.cs < 0){
			
			console.log(this.pos, this.cs, this.remainder);
			
			if (this.cs + this.remainder >= 1 || this.cs + this.remainder < 0){
				console.log("overload zoinks");
			}
			
			this.pos += this.cs;
			this.cs = 0;
		}*/
		
		if(this.cs > 0){
			//console.log(this.pos, this.cs, this.remainder, this.cs+this.remainder >= 1);
			
			if(this.cs + this.remainder >= 1){ // If cs & remainder go above 1
				
				this.cs -= (1 - this.remainder);
				this.pos += (1 - this.remainder);
				this.pos = this.pos >> 0;
				
				this.remainder = 0; // Remainder is 0
			}
			else{this.pos += this.cs; this.cs = 0} // Increases pos by 'velocity'.
		}
		
		else if(this.cs < 0){
			//console.log(this.pos, this.cs, this.remainder, this.cs+this.remainder >= 1);
			
			if(this.remainder + this.cs < 0 && (this.remainder != 0)){ // boosty thing go here
			
				this.cs += this.remainder;
				this.pos -= this.remainder;
				this.pos = this.pos >> 0;
				
				this.remainder = 1;
			}
			else{this.pos += this.cs; this.cs = 0}
		}
		
		var outOfBounds = (this.pos < 0 || this.pos > this.limit);
		
		if(outOfBounds || overlaps(entities[0].x.pos,entities[0].y.pos,16) && !mainEntity.isFlying){ // overlap detection here
			this.pos = startingPos;
			if(this.v > 0 && this.mor > 0 || this.v < 0 && this.mor < 0) grounded = true;
			this.v = 0;
			this.cs = WhatToDoWhenOverlapping;
			this.done = true;
		}
	}

}

// ENTITY

class Entity extends Rectangle{
	constructor(x,y,width,height){
		super(x,y,width,height);
		
		this.x.pos  = x;
		this.y.pos  = y;
		this.width  = width;
		this.height = height;
		
		this.isFlying = false;
		
		this.queue         = [0, 0, 0];
		this.tileQueue     = [];
		this.currentInside = 0;
		
		this.moving = false;
	}
	
	reset(){
		this.x = new Axis(16);
		this.y = new Axis(16);
	}
	
	tick(){
		// One tick of movement: (v + ( 2 / 7.752 / 2)) * BASE_DRAG
		// One tick of falling : (v + ( 2 / 7.752    )) * BASE_DRAG
		//              Jumping:  v = (26 / 7.752 * 2)  * BASE_DRAG
		
		var x = this.x;
		var y = this.y;
		
		x.limit = (map.columns-1)*16;
		y.limit = (map.rows-1)*16;
		
		x.m = controlRight;
		y.m = controlDown;
		
		x.tickStart();
		y.tickStart();
		
		this.currentInside = map.tileCoordsToId(isInside(x.pos), isInside(y.pos));
		var currentProperties = serverBlockInfo[this.currentInside];
		
		var previousInside = this.queue[1]; // i think???
		var previousProperties = serverBlockInfo[previousInside];
		
		this.queue.push(this.currentInside)
		this.queue.shift();
		// this stuff is temporary don't worry
		if(this.currentInside === 4 || this.isFlying){
			this.queue[1] = 4;
			}
		if(typeof currentProperties.xgravity != 'undefined') x.mor = currentProperties.xgravity;
		else x.mor =  0;
		if(typeof currentProperties.ygravity != 'undefined') y.mor = currentProperties.ygravity;
		else y.mor =  2;
		
		if(typeof previousProperties.xgravity != 'undefined') x.mo = previousProperties.xgravity
		else x.mo =  0;
		if(typeof previousProperties.ygravity != 'undefined') y.mo = previousProperties.ygravity;
		else y.mo =  2;
		
		if (this.isFlying) x.mo = y.mo =  0;
		
		if (x.mo) x.m = 0;
		else if (y.mo) y.m = 0;
		
		//if(    wasInside === 2){x.mo  = 0; y.mo  = -2;}
		//else                   {x.mo  = 0; y.mo  =  2;}
		
		//this.m  *=   speedMultiplier
		//this.mo *= gravityMultiplier
		var xmodifier = (x.m / 7.752) + (x.mo / 7.752);
		var ymodifier = (y.m / 7.752) + (y.mo / 7.752);
		
		if (x.v || xmodifier) x.v = x.calculateVelocity(x.v, y.mo, xmodifier); // Uses m and modifier
		if (y.v || ymodifier) y.v = y.calculateVelocity(y.v, x.mo, ymodifier);
		
		x.cs = x.v;
		y.cs = y.v;
		grounded = false;
		
		while(x.cs != 0 && !x.done || y.cs != 0 && !y.done ){
			// Portal support goes here
			x.step(x.pos, x.cs); // Affects pos, v, cs, done, remainder, and checks current block
			y.step(y.pos, y.cs);
		}
		
		if (isJumping === true && grounded){ //placeholder
			//isJumping = false;
			if (x.mor && x.mo) x.v = -x.mo * (26 / 7.752);
			if (y.mor && y.mo) y.v = -y.mo * (26 / 7.752);  // todo: add jumpMultiplier
		}
		
		/*
		if(injump && !this.hasLevitation)
            {
               if(this.jumpCount < this.maxJumps && this.morx && mox)
               {
                  if(this.maxJumps < 1000)
                  {
                     this.jumpCount = this.jumpCount + 1;
                  }
                  this.speedX = -this.morx * Config.physics_jump_height * this.jumpMultiplier;
                  this.changed = true;
                  this.lastJump = new Date().time * mod;
               }
               if(this.jumpCount < this.maxJumps && this.mory && moy)
               {
                  if(this.maxJumps < 1000)
                  {
                     this.jumpCount = this.jumpCount + 1;
                  }
                  this.speedY = -this.mory * Config.physics_jump_height * this.jumpMultiplier;
                  this.changed = true;
                  this.lastJump = new Date().time * mod;
               }
            }
			*/
		
		var imx = x.v << 8; // Can be moved upward?
		var imy = y.v << 8;
		     if (imx != 0) this.moving = true; // Todo: Add liquid support
		else if (xmodifier < 0.1 && xmodifier > -0.1) x.pos = alignToGrid(x.pos);
		     if (imy != 0) this.moving = true;
		else if (ymodifier < 0.1 && ymodifier > -0.1) y.pos = alignToGrid(y.pos);
		
		{y.pos = alignToGrid(y.pos)}
	}
}

//var x = mainEntity.x;
//var y = mainEntity.y;

//         horizontal = leftdown + rightdown; 1 or 0
//         vertical = updown + downdown; 1 or 0

function updateWorld(){
	mainEntity.tick()
	//console.log(x);
	//console.log(y);
	//for (var i = 0; i < cameras.length; i++) cameras[i].move();
	GUI[0].move();
	time++;
}

entities.push(new Entity(16,16,16,16));
var mainEntity = entities[0];
