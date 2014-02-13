

var ctx;
var canvas;
var maxWidth;
var max;
var maxHeight;
var domain;
var boxWidth;
var boxHeight;
var box = [];
var playLoop;
var randomFactor = .5;
var mouseDown=false;
var mouseX=0;
var mouseY=0;
var lastBoxX=0;
var lastBoxY=0;
var speed = 50;
var boxHistory = [];
var isRightClick=false;
var parts = window.location.search.substr(1).split("&");
var $_GET = {};
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-38383194-1']);
_gaq.push(['_setDomainName', 'mvartan.com']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
for (var i = 0; i < parts.length; i++) {
    var temp = parts[i].split("=");
    $_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
}
function resize() {
	var d = Math.floor($("#domain")[0].value);
	var oldDomain=domain;
	domain=d;
	boxWidth = maxWidth/domain;
	boxHeight = maxHeight/domain;
	save();
	domain=oldDomain; //fallback
	$("#domain")[0].value=oldDomain;
	boxWidth = maxWidth/domain;
	boxHeight = maxHeight/domain;

}
function mod(n, m) {
        return ((m % n) + n) % n;
}
function play() {
	clearInterval(playLoop);
	var speed = $("#speed")[0].value;
	console.log(speed)
	playLoop = setInterval(loadNext,speed);

}
function onChangeSpeed() {
	if(playLoop) {
		clearInterval(playLoop);
		playLoop = setInterval(loadNext,speed);
	}
}

function load() {
	canvas = $("#game")[0];
	ctx = canvas.getContext('2d');
	canvas.onmousemove = mouseMove;
	document.body.onmouseup = onMouseUpBody;
	canvas.onmousedown = onMouseDown;
	canvas.onmouseup = onMouseDown;
	canvas.oncontextmenu = function(){return false};
	domain=60;
	if($_GET['domain']>0) {
		domain=Math.floor($_GET['domain']);
	}
		$("#domain")[0].value=domain;

	maxWidth = 600;
	maxHeight= 600;
	max = maxWidth>maxHeight?maxHeight:maxWidth;
	boxWidth = max/domain;
	boxHeight = max/domain;
	clearBoxes();

	if($_GET['randomFactor']>0)
		randomFactor=Math.floor($_GET['randomFactor']*100)/100;
	var saved = unescape($_GET["saved"]);
	var spots = saved.split("/");
	console.log(spots);
	for(var i=0;i<spots.length;i++) {
		if(spots[i]=="")
			continue;
		var coords = spots[i].split(",");
		box[coords[0]][coords[1]]=true;
	}
	redraw();

	if($_GET['autoplay']>0) {
		play();
	}


}
function onMouseDown(e) {
  if (e.which) isRightClick = (e.which == 3);
  else if (e.button) isRightClick = (e.button == 2);
	var boxX = Math.floor(mouseX/boxWidth);
	var boxY = Math.floor(mouseY/boxHeight);
	mouseMove(e);
	mouseDown=true;
	updateMouse();
	return false; 
}
function onMouseUpBody(e) {
	mouseDown=false;
}
function onMouseUp(e) {
	mouseDown=false;
	console.log("up");
}
function updateMouse() {
	if(mouseDown) {

		var boxX = Math.floor(mouseX/boxWidth);
		var boxY = Math.floor(mouseY/boxHeight);
		box[boxX][boxY]=!isRightClick;
		if(lastBoxX != -1) {
			var dx=boxX-lastBoxX;
			var dy=boxY-lastBoxY;
			var slope=dy/dx;
			var maxBoxes = Math.sqrt(dx*dx+dy*dy)*2;
			var ds = 1/maxBoxes;
			for(var i=0.0;i<1;i+=ds) {
				var midX = Math.floor(boxX-dx*i);
				var midY = Math.floor(boxY-dy*i);
				console.log(midX+","+midY)
				box[midX][midY]=!isRightClick;
			}
		}
		lastBoxX=boxX;
		lastBoxY=boxY;
	} else {
		lastBoxX=-1;
		lastBoxY=-1;
	}
	redraw();

}
function mouseMove(e) {
    var pos = findPos(canvas);
    mouseX = e.pageX - pos.x;
    mouseY = e.pageY - pos.y;
    updateMouse();
};

function redraw() {
	var speedValue = $("#speed")[0].value;
	if(speed!=speedValue) {
		speed=speedValue;
		onChangeSpeed();
	}
	var de = $("#domain")[0];
	var domainValue = Math.floor(de.value);
	if(document.activeElement!=de && domain!=domainValue) {
		resize();
	}
	ctx.clearRect(0,0,maxWidth+1,maxHeight+1);
	drawGrid();

	for(var x=0;x<domain;x++) {
		if(!box[x]) {
			box[x]=[];
			boxHistory[x]=[];
		}
		for(var y=0;y<domain;y++) {
			if(box[x][y]) {
				ctx.fillStyle="rgba(77,165,227,.8)";
				boxHistory[x][y]=1;
				fillBox(x,y);
			} else if(boxHistory && boxHistory[x] && boxHistory[x][y]) {
				//242->
				//18.0, 0.6608, .8902
				var colors = hsv2rgb((242-boxHistory[x][y])/360,.6608,.8902);
				var redComponent = colors['red'];
				var greenComponent = colors['green'];
				var blueComponent = colors['blue'];
				ctx.fillStyle="rgba("+redComponent+","+greenComponent+","+blueComponent+",.3)";
				fillBox(x,y);
				if(boxHistory[x][y]<224)
					boxHistory[x][y]++;
			}
		}
	}
}
function fillBox(x,y) {
	ctx.fillRect(boxWidth*x,boxHeight*y, boxWidth,boxHeight);
}
function drawGrid() {
	if(domain>600)
		return;
	alpha=.3;
	if(domain>30)
		alpha=.3*(30/domain);
	ctx.strokeStyle="rgba(0,0,50,"+alpha+")";
	for(var x=0;x<=domain;x++) {
		ctx.beginPath();
		ctx.moveTo(x*boxWidth+.5,0);
		ctx.lineTo(x*boxWidth+.5,maxHeight);
		ctx.stroke();
	}
	for(var y=0;y<=domain;y++) {
		ctx.beginPath();
		ctx.moveTo(0,y*boxHeight+.5);
		ctx.lineTo(maxWidth,y*boxHeight+.5);
		ctx.stroke();
	}
}
function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}
window.onload=load;
function loadNext() {
	redraw();
	var neighborCount = [];
	for(var x=0;x<domain;x++) {
		neighborCount[x]=[];
		for(var y=0;y<domain;y++) {
			neighborCount[x][y]=0;
		}
	}
	for(var x=0;x<domain;x++) {
		for(var y=0;y<domain;y++) {
			if(box[x][y]) {
				neighborCount[mod(domain,(x-1))][mod(domain,(y-1))]++;
				neighborCount[x][mod(domain,(y-1))]++;
				neighborCount[mod(domain,(x+1))][mod(domain,(y-1))]++;
				neighborCount[mod(domain,(x-1))][y]++;
				neighborCount[mod(domain,(x+1))][y]++;
				neighborCount[mod(domain,(x-1))][mod(domain,(y+1))]++;
				neighborCount[x][mod(domain,(y+1))]++;
				neighborCount[mod(domain,(x+1))][mod(domain,(y+1))]++;			}
		}
	}
	for(var x=0;x<domain;x++) {
		for(var y=0;y<domain;y++) {
			box[x][y]=(box[x][y]&&(neighborCount[x][y]==2||neighborCount[x][y]==3))||(!box[x][y]&&neighborCount[x][y]==3);
		}
	}
}
function clearBoxes() {
	boxHistory = [];
	for(var x=0;x<domain;x++) {
		boxHistory[x]=[];
	}
	box = [];
	for(var x=0;x<domain;x++) {
		box[x]=[];
		for(var y=0;y<domain;y++)
			box[x][y]=false;
	}
	redraw();
}
function randomize() {
	box = [];
	for(var x=0;x<domain;x++) {
		box[x]=[];
		for(var y=0;y<domain;y++)
			box[x][y]=Math.random()<randomFactor;

	}
	redraw();
}
function save() {
	var savedBox = box;
	var saved = []
	var savedURL = '//' + location.host + location.pathname+"?domain="+domain+"&saved=";
	for(var x=0;x<domain;x++) {
		for(var y=0;y<domain;y++) {
			if(box[x] && box[x][y]) {
				savedURL+=(x+","+y+"/");
			}
		}
	}
	if(savedURL.length<1900)
		window.location=savedURL;
	else
		alert('too large to save :(')

}

function hsv2rgb(h,s,v) {
// Adapted from http://www.easyrgb.com/math.html
// hsv values = 0 - 1, rgb values = 0 - 255
var r, g, b;
var RGB = new Array();
if(s==0){
  RGB['red']=RGB['green']=RGB['blue']=Math.round(v*255);
}else{
  // h must be < 1
  var var_h = h * 6;
  if (var_h==6) var_h = 0;
  //Or ... var_i = floor( var_h )
  var var_i = Math.floor( var_h );
  var var_1 = v*(1-s);
  var var_2 = v*(1-s*(var_h-var_i));
  var var_3 = v*(1-s*(1-(var_h-var_i)));
  if(var_i==0){ 
    var_r = v; 
    var_g = var_3; 
    var_b = var_1;
  }else if(var_i==1){ 
    var_r = var_2;
    var_g = v;
    var_b = var_1;
  }else if(var_i==2){
    var_r = var_1;
    var_g = v;
    var_b = var_3
  }else if(var_i==3){
    var_r = var_1;
    var_g = var_2;
    var_b = v;
  }else if (var_i==4){
    var_r = var_3;
    var_g = var_1;
    var_b = v;
  }else{ 
    var_r = v;
    var_g = var_1;
    var_b = var_2
  }
  //rgb results = 0 ÷ 255  
  RGB['red']=Math.round(var_r * 255);
  RGB['green']=Math.round(var_g * 255);
  RGB['blue']=Math.round(var_b * 255);
  }
return RGB;  
}

