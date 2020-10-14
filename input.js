var canvas = document.getElementById("game");
var b = 10;
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
	pos.x -= obj_left;
	pos.y -= obj_top;
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

function updateMousePos(){
	mousex = getMousePos(event).x; // event.x - canvas.offsetLeft;
	mousey = getMousePos(event).y; // event.y - canvas.offsetTop;
};

function editHold(){
	if (isEditHolding === true){
		var xtile = Math.floor((mousex + camera.x) / 16);
		var ytile = Math.floor((mousey + camera.y) / 16);
		/*canvas.onmousemove = function(){
			mousex = event.x - canvas.offsetLeft;
			mousey = event.y - canvas.offsetTop;
			
			if (xtile !== Math.floor(mousex / 16)){
				xtile   = Math.floor(mousex / 16);
			}
			else if (ytile !== Math.floor(mousey / 16)){
				ytile   = Math.floor(mousey / 16);
			}
			else return;
		}
		*/

		if(xtile < 0 || xtile >= map.columns || ytile < 0 || ytile >= map.rows) return;
		else if (rightClick === true) edit(1, xtile, ytile, bshift)
		else                          edit(1, xtile, ytile, b);
	}
	draw();
}

onkeydown = function (){
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
			event.preventDefault();
			break;
		case "g":
			if (!entities[0].isFlying) entities[0].isFlying = true;
			else entities[0].isFlying = false;
			break;
		case "[":
			tick();
			break;
		case "]":
			fastForward(2); break;
		case "\\":
			fastForward(25); break;
		case "1":
			b = 9; break;
		case "2":
			b = 10; break;
		case "3":
			b = 11; break;
		case "4":
			b = 12; break;
		case "5":
			b = 13; break;
		case "6":
			b = 14; break;
		case "7":
			b = 1; break;
		case "8":
			b = 2; break;
		case "9":
			b = 3; break;
		case "0":
			b = 4; break;
		case "-":
			if (b >  0) {b--;} else b = 97; break; // Placeholder
		case "=":
			if (b < 97) {b++;} else b =  0; break; // Placeholder
		case ";":
			x.pos = 0; y.pos = 0; break;
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
	}
}

function reset(){
	x.pos = 16;
	x.v = 0;
	x.cs = 0;
	x.remainder = 0;
	
	y.pos = 16;
	y.v = 0;
	y.cs = 0;
	y.remainder = 0;
	
	time = 0;
	draw();
}