const BG = 0;
const FG = 1;

// WORLD ID GENERATION: Date.now() - (4101 * 86400)

var map = {
	columns : 15,
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
			map.tiles[i] = blockID;
			//map.tiles[i * this.rows] = blockID;
			//map.tiles[i * this.rows + this.columns-1] = blockID;
			map.tiles[i + (this.columns * (this.rows-1))] = blockID;
		}
	},
	
	fillAll: function (blockID){
		// console.log(minimap); // weird
		for (var i = 0; i < this.columns*this.rows; i++){
			map.tiles[i] = blockID;
		}
	},
	
	resize: function (x, y){
		if(x < 51) this.columns = x;
		if(y < 51) this.rows    = y;
		this.fillAll(0);
		this.fillBorder(b);
	}
}
map.fillAll(0);
map.fillBorder(10);
//map.fillBorders(FG, 9);

// These should probably be per-smiley variables, not global variables
var controlRight = 0;
var controlDown = 0;
var isJumping = false;
var overlapA = -1;
var grounded = false;

const isNonSolid = [1,1,1,1,1,1,1,1,1,,,,,,,,,,,,,,,,,,1,1,1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,1,1,1,1,,,,,,,,,,,,,1,,,,,,1,,,,,,1,1,1,,,,,1,1];

function edit(z, x, y, b){
	updateEditHistory();
	
	var i = map.tileCoordsToNumber(x,y);
	
	try{
		if (map.tiles.length > i && map.tiles[i]!= b){
			map.tiles[i] = b;
			if (isNonSolid[b] == 1) minimap.update(x, y, '#000000');
			else minimap.update(x, y, '#ffffff');
		}
	}
	catch(error){
	}
}

function overlaps(x, y, size){
	if (x < 0 || y < 0 || x > map.columns * 16 - 16 || y > map.rows * 16 - 16) return true;
	
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
			
			if (entities[0].y.v < 0 || currentY <= overlapA || (entities[0].y.v === 0 && entities[0].x.v === 0 && entities[0].y.pos + 15 > currentY*16)){
				
				if(currentY != topLeftY || overlapA === -1){
					overlapA = currentY;
				}
				overlapsOneWay = true;
			}
			else return true;
		}*/
		return !isNonSolid[blockID];
	}
	
	if (isBlockSolid(0,0)||
	   (isBlockSolid(1,0) && !alignedX)||
	   (isBlockSolid(0,1) && !alignedY)||
	   (isBlockSolid(1,1) && !alignedX && !alignedY))
	{
			return true;
	}
	
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
		
		
		if(this.pos < 0 || overlaps(x.pos,y.pos,16) && !entities[0].isFlying){ // overlap detection here
			this.pos = startingPos;
			if(this.v > 0 && this.mor > 0 || this.v < 0 && this.mor < 0) grounded = true;
			this.v = 0;
			this.cs = WhatToDoWhenOverlapping;
			this.done = true;
		}
	}

}

// ENTITY

class Entity{
	constructor(spawnX, spawnY){
		this.x = new Axis(spawnX);
		this.y = new Axis(spawnY);
		
		this.isFlying = false;
		
		this.queue = [0, 0, 0];
		this.tileQueue = [];
		this.currentInside = 0;
		
		this.moving = false;
	}
	
	tick(){
		// One tick of movement: (v + ( 2 / 7.752 / 2)) * BASE_DRAG
		// One tick of falling : (v + ( 2 / 7.752    )) * BASE_DRAG
		//              Jumping:  v = (26 / 7.752 * 2)  * BASE_DRAG
		
		x.m = controlRight;
		y.m = controlDown;
		
		x.tickStart();
		y.tickStart();
		
		this.currentInside = map.tileCoordsToId(isInside(x.pos), isInside(y.pos));
		
		this.queue.push(this.currentInside)
		this.queue.shift();
		
		// this stuff is temporary don't worry
		     if(this.currentInside === 4 ||  this.isFlying)
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
		isJumping = false;
		
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

var entities = [];
entities.push(new Entity(16,16));

var x = entities[0].x;
var y = entities[0].y;

const width = 16;
const height = 16;

const        BASE_DRAG = Math.pow(0.9981,10) * 1.00016093; // 0.9813195279915707
const NO_MODIFIER_DRAG = Math.pow(0.9900,10) * 1.00016093; // 0.9045276172161355

var time = 0;

//         horizontal = leftdown + rightdown; 1 or 0
//         vertical = updown + downdown; 1 or 0

function updateWorld(){
	entities[0].tick()
	//console.log(x);
	//console.log(y);
	time++;
}