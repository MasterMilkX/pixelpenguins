//global variables for the program
var theme = "light";

//history
var historyList = new Array(25);
var timeIndex = 0;
var incTime = false;
  //my time objects
  var History = function(func, x, y, bit, color){
    this.func = func;
    this.hx = x;
    this.hy = y;
    this.bit = bit;
    this.color = color;
  }

//define the grid and other elements
var e = document.getElementById('editor');
var etx = e.getContext('2d');
var penColor = "#000000";
var tool = "pencil";
var editorLight = true;
var gridOn = true;
var bitSize = 16;
var sf = (400 / bitSize);     //scale factor

//define the color palette
var p = document.getElementById('palette');
var ptx = p.getContext('2d');
var rainbow = new Image();
rainbow.onload = function(){ptx.drawImage(rainbow, 0, 0, 400, 400);};
rainbow.src = 'img/spectrum2.png';
var colorSel = "#000000";
var colorsSaved = new Array(8);
var saverIndex = 0;
var colorIndex = 0;

//define the current color viewer
var v = document.getElementById('color_viewer');
var vtx = v.getContext('2d');
var mouseIsDown = false;

///////////////////////////////////////////////        PROGRAM METHODS        /////////////////////////////////////////////

//initializing function
function init(){
  e.addEventListener("click", paint, false);
  p.addEventListener("click", newColor, false);
  
  window.addEventListener("keypress", doKeyDown, false);
  setTheme();
  
  e.onselectstart = function(){return false};
  p.onselectstart = function(){return false};
  
}
//set theme
function setTheme(){
  if(theme == "dark"){     
    document.body.style.backgroundColor = "#000000";
    document.body.style.color = "#ffffff";
  }
  else if(theme == "blue"){     
    document.body.style.backgroundColor = "#0000ff";
    document.body.style.color = "#ffffff";
  }
  else if(theme == "red"){     
    document.body.style.backgroundColor = "#ff0000";
    document.body.style.color = "#000000";
  }
  else if(theme == "light"){     
    document.body.style.backgroundColor = "#e7e7e7";
    document.body.style.color = "#000000";
  }
}
//toggle theme function
function changeTheme(newtheme){
  theme = newtheme;
  setTheme();
}

function saveIMG(){
  var tempIMG = document.getElementById('drawIMG');
  var dataURL = e.toDataURL('image/png');
  
  //set to fake image to save the fake image
  tempIMG.width = tempIMG.height = bitSize;
  tempIMG.src = dataURL;

}

function downloadIMG(){
  var button = document.getElementById('save');
  saveIMG();
  
  var imgURL = document.getElementById('drawIMG').src;
  button.href = imgURL;
}

function loadIMG(){
  var upIMG = document.getElementById('upload');
  var browsIMG = document.getElementById('drawIMG');

  if(upIMG.files && upIMG.files[0]){
    var reader = new FileReader();
    reader.onload = function(o){
      alert("IMAGE UPLOADED!");
      browsIMG.src = o.target.result;
      browsIMG.height = browsIMG.width = bitSize;
      etx.drawImage(browsIMG, 0, 0, 400, 400);
    };
    reader.readAsDataURL(upIMG.files[0]);
  }
}
function undoPaint(){
  if(historyList.length > 0){
    var timeObj = historyList[timeIndex - 1];   //look at the last item in history list
    if(timeObj.func == "draw"){      //undo the draw by erasing
      etx.clearRect(timeObj.hx * timeObj.bit, timeObj.hy * timeObj.bit, timeObj.bit, timeObj.bit);
    }else if(timeObj.func == "erase"){   //undo the erase by drawing
      etx.fillStyle = timeObj.color;
      etx.fillRect(timeObj.hx * timeObj.bit, timeObj.hy * timeObj.bit, timeObj.bit, timeObj.bit);
    }
    //alert(timeObj.hx + ", " + timeObj.hy + ", " + timeObj.bit);
    timeIndex--;
  }
}
function redoPaint(){
  if (timeIndex < historyList.length){
    var timeObj = historyList[timeIndex];
    if(timeObj.func == "erase"){      //undo the draw by erasing
    etx.clearRect(timeObj.x * timeObj.bit, timeObj.y * timeObj.bit, timeObj.bit, timeObj.bit);
  }else if(timeObj.func == "draw"){   //undo the erase by drawing
    etx.fillStyle = timeObj.color;
    etx.fillRect(timeObj.hx * timeObj.bit, timeObj.hy * timeObj.bit, timeObj.bit, timeObj.bit);
  }
    timeIndex++
  }
  
}


/////////////////////////////////////////////////////         CANVAS METHODS        ////////////////////////////////////////////

//hotkey methods
function doKeyDown(e){
  //editor tools hotkeys
  if(e.keyCode == 97){        // [A]
    document.getElementById("pencil").checked = true;
    changeTool();
  }else if(e.keyCode == 115){  // [S]
    document.getElementById("eraser").checked = true;
    changeTool();
  }else if(e.keyCode == 100){  // [D]
    document.getElementById("dropper").checked = true;
    changeTool();
  }else if(e.keyCode == 122){   // [Z]
    storeColor();
  }
  
  //debugger
  if(e.keyCode == 121){     // [Y]
    alert(timeIndex);
  }
  
  //color picker hotkeys #1-8
  if(e.keyCode == 49){
    getStoredColor(svTbl.rows[0].cells[0]);
  }else if(e.keyCode == 50){
    getStoredColor(svTbl.rows[0].cells[1]);
  }else if(e.keyCode == 51){
    getStoredColor(svTbl.rows[0].cells[2]);
  }else if(e.keyCode == 52){
    getStoredColor(svTbl.rows[0].cells[3]);
  }else if(e.keyCode == 53){
    getStoredColor(svTbl.rows[1].cells[0]);
  }else if(e.keyCode == 54){
    getStoredColor(svTbl.rows[1].cells[1]);
  }else if(e.keyCode == 55){
    getStoredColor(svTbl.rows[1].cells[2]);
  }else if(e.keyCode == 56){
    getStoredColor(svTbl.rows[1].cells[3]);
  }
  
  if(e.keyCode == 107){          // [K]
    undoPaint();
  }else if(e.keyCode == 108){    // [L]
    redoPaint();
  }
  
  
  
}

//editor methods
e.onmousedown = function(e){
  mouseIsDown = true;
};
e.onmouseup = function(e){
  mouseIsDown = false;
  incTime = true;
};
e.onmousemove = function(e){
  if(mouseIsDown)
    paint(e);
  
};

//properly increment the index for the history list
function incHistTime(){
  if(incTime){
    timeIndex++;
    incTime = false;    
  }
}

//editor method for painting on squares
function paint(ev){
  var x = Math.floor(ev.offsetX / sf);  //for the cursor alignment 
  var y = Math.floor(ev.offsetY / sf);  //for the cursor alignment 
  
  if(tool == "pencil"){
    etx.fillStyle = penColor;
    etx.fillRect(x * sf, y * sf, sf, sf);
    if(incTime){
      historyList.splice(timeIndex, 1, new History("draw", x, y, sf, penColor));
      if(historyList[timeIndex - 1])
        incHistTime();
    }
  }else if(tool == "eraser"){
    etx.clearRect(x * sf, y *sf, sf, sf);
    if(incTime){
      historyList.splice(timeIndex, 1, new History("erase", x, y, sf, penColor));
      incHistTime();
    }
  }else if(tool == "dropper"){
    var x2 = Math.floor(ev.offsetX);
    var y2 = Math.floor(ev.offsetY);
    var pixel = etx.getImageData(x2,y2,1,1).data;
    setColor(pixel[0], pixel[1], pixel[2]);
  }

}
function invertBG(){
  //alert(e.style.backgroundImage);
  if(gridOn){
    if(editorLight){
      e.style.backgroundImage = "url(img/grid2_DARK.png)";
    }else{
      e.style.backgroundImage = "url(img/grid2_WHITE.png)";
    }
  }else{
    e.style.backgroundImage = "none";
    if(editorLight){
      e.style.backgroundColor = "#000000";
    }else{
      e.style.backgroundColor = "#ffffff";
    }
  }
  
  editorLight = !editorLight;
}
function gridToggle(){
  gridOn = !gridOn;
  var gridText = document.getElementById('gridTog');
  if(gridText.value == "Grid On")
    gridText.value = "Grid Off";
  else
    gridText.value = "Grid On";
  editorLight = !editorLight;
  invertBG();
}

function scaleCanvas(){
  bitSize = document.getElementById('pxScale').value;
  var imgSize = (16 / bitSize) * 100;
  e.style.backgroundSize = imgSize + "% " + imgSize + "%";
  sf = 400 / bitSize;
  
  pc.width = bitSize;
  pc.height = bitSize;
  
  pcx.fillStyle = penColor;
  pcx.fillRect(0, 0, bitSize, bitSize);
}

function clearCanvas(){
  var ok = confirm("Are you sure you want to clear the canvas?\nAll unsaved changes will be lost FOREVER!");
  if(ok){
    //clear editor
    etx.clearRect(0, 0, 400, 400);
    
    //clear file input
    var oldInput = document.getElementById('upload');
    var newInput = document.createElement('input');
    
    newInput.type = "file";
    newInput.id = oldInput.id;
    newInput.name = oldInput.name;
    newInput.accept = oldInput.accept;
    newInput.onchange = oldInput.onchange;
    
    oldInput.parentNode.replaceChild(newInput, oldInput);
  }
}

//color picker methods

//color picker method for changing colors
function newColor(ev){
  var x = Math.floor(ev.offsetX);
  var y = Math.floor(ev.offsetY);
  
  var pixel = ptx.getImageData(x,y,1,1).data;
  setColor(pixel[0], pixel[1], pixel[2]);
}
//helper method for defining hex code of color
function setColor(r,g,b){
  var newColor = "#";
  newColor += assignHex(r) + assignHex(g) + assignHex(b);
  penColor = newColor;
  document.getElementById('textColor').value = penColor;
  showColor();
}
//helper method for splitting color number into hex
function assignHex(c){
  var p1 = parseInt(c / 16);
  var p2 = parseInt(c % 16);

	var p1Str;
	var  p2Str;
  if(p1 >= 10){
		p1Str = newAssignHex(p1);
  }else{
		p1Str = String(p1);
  }
  
  if(p2 >= 10){
  	p2Str = newAssignHex(p2);
  }else{
		p2Str = String(p2);
	}
	return p1Str + p2Str;
}
//helper method for reassigning # >= 10 to letters in hex
function newAssignHex(p){
  var hexEx = "abcdef";
		for(var h = 0; h < 6; h++){
    		if(p == (10 + h))
    			 return String(hexEx.charAt(h));
    	}
    	return "f";
}

//viewer method for displaying current color
function showColor(){
  vtx.fillStyle = penColor;
  vtx.fillRect(0, 0, 100, 100);
  document.getElementById('textColor').value = penColor;
}

//text box method for manually setting colors
function newTextColor(){
  penColor = document.getElementById('textColor').value;
  showColor();
}

////////////////////////////////////////////////////////////        TOOLS METHODS        //////////////////////////////////

function checkColors(checkColor){
  for(var a = 0; a < 8; a++){
    if(colorsSaved[a] == checkColor){
      colorIndex = a;
      return false;     //color already saved
    }
  }
  return true;          //no other color like it already saved
}
function storeColor(){
  if(checkColors(penColor)){
    document.getElementById('savedColor').rows[Math.floor(saverIndex / 4)].cells[saverIndex % 4].bgColor = penColor;
    colorsSaved[saverIndex] = penColor;
    if(saverIndex == 7){
      saverIndex = 0;
    }else{
      saverIndex++;
    }
  }else{
    alert("Color Already Saved \n #" + (colorIndex + 1));
  }
}

//for each cell of the saved colors
var svTbl = document.getElementById('savedColor');
for(var a = 0; a < svTbl.rows.length;a++){
  for(var b = 0; b < svTbl.rows[a].cells.length; b++){
    svTbl.rows[a].cells[b].onclick = function(){getStoredColor(this);};
  }
}
function getStoredColor(cel){
  penColor = cel.bgColor;
  showColor();
}

//tool method for changing between pen and eraser on editor
function changeTool(){
  if(document.getElementById("pencil").checked){
    tool = "pencil";
    e.style.cursor = "url(img/pencil.cur), pointer";
  }else if(document.getElementById("eraser").checked){
    tool = "eraser";
    e.style.cursor = "url(img/eraser.cur), pointer";
  }else if(document.getElementById("dropper").checked){
    tool = "dropper";
    e.style.cursor = "url(img/dropper.cur), pointer";
  }
}




///////////////////////////////////////////////////////////          other methods         /////////////////////////////////////////

init();
