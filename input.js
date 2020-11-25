var b = random(9,23);
var bshift = 0;

var mousex;
var mousey;

var isediting
var isEditHolding;
var rightClick;

function getMousePos(mouseEvent)
// https://nerdparadise.com/programming/javascriptmouseposition
{
	var obj = canvas;
	var obj_left = 0;
	var obj_top = 0;
	var pos = {x: 0, y: 0};
	while (obj.offsetParent){
		obj_left += obj.offsetLeft;
		obj_top  += obj.offsetTop;
		obj       = obj.offsetParent;
	}
	if (mouseEvent){
	// Mozilla Firefox
	pos.x = mouseEvent.pageX;
	pos.y = mouseEvent.pageY;
	}
	else{
	// Internet Explorer
	pos.x = window.event.x + document.body.scrollLeft - 2;
	pos.y = window.event.y + document.body.scrollTop  - 2;
	}
	pos.x -= obj_left + GUI[0].cx;
	pos.y -= obj_top  + GUI[0].cy;
	return pos;
}

canvas.onmousemove = updateMousePos;

canvas.onmousedown = function(){
	isEditHolding = true;
	if (event.button === 2) rightClick = true;
	else rightClick = false;
	editHold();
}

canvas.onmouseup = function(){
	isEditHolding = false;
}

canvas.oncontextmenu = function(){
	return false;
}

function updateMousePos(){
	mousex = getMousePos(event).x; // event.x - canvas.offsetLeft;
	mousey = getMousePos(event).y; // event.y - canvas.offsetTop;
};

function editHold(){
	if (isEditHolding === true){
		var xtile = Math.floor((mousex + GUI[0].x) / x_vtile());
		var ytile = Math.floor((mousey + GUI[0].y) / y_vtile());

		if(xtile < 0 || xtile >= map.columns || ytile < 0 || ytile >= map.rows) return;
		else if (rightClick === true) edit(1, xtile, ytile, bshift)
		else                          edit(1, xtile, ytile, b);
	}
	draw();
}

onkeydown = function (){
	if (event.key != ("F12")) event.preventDefault()
	/*
	var keyNumber = Number(event.key);
	
	if (keyNumber != NaN && typeof keyNumber === 'number'){
		b = keyNumber;
		return;
	}*/
	
	switch(event.key){
		case "ArrowRight":
		case "d":
			if (controlRight <  1) controlRight += 1;
			break;
		case "ArrowLeft":
		case "a":
			if (controlRight > -1) controlRight -= 1;
			break;
		case "ArrowDown":
		case "s":
			if (controlDown  <  1) controlDown  += 1
			break;
		case "ArrowUp":
		case "w":
			if (controlDown  > -1) controlDown  -= 1
			break;
		case " ":
			isJumping = true; // Placeholder
			break;
		case "g":
			if (!mainEntity.isFlying) mainEntity.isFlying = true;
			else mainEntity.isFlying = false;
			break;
			
		// Debug stuff
			
		case "p":
			start(10);
			break;
		case "f":
			canvas.requestFullscreen();
			break;
		case "[":
			tick();
			break;
		case "]":
			tick(2); break;
		case "\\":
			tick(25); break;
		case "-": 
			if (b >  0) b--;
			//else b = 316;
			break;
		case "+":
		case "=":
			if (b < 97) b++; break;
			//316 for actual last block
		case "r":
			map.reset(); break;
	}
}

onkeyup   = function (){
	switch(event.key){
		case "ArrowRight":
		case "d":
			if(controlRight > -1) controlRight -= 1;
			break;
		case "ArrowLeft":
		case "a":
			if(controlRight <  1) controlRight += 1;
			break;
		case "ArrowDown":
		case "s":
			if(controlDown  > -1) controlDown  -= 1;
			break;
		case "ArrowUp":
		case "w":
			if(controlDown  <  1) controlDown  += 1;
			break;
		case " ":
			isJumping = false; // Placeholder
			break;
	}
}

function reset(){
	entities[0].reset();
	
	time = 0;
	draw();
}
