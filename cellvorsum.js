

var canvas;
var engine;
var bgMusic;
var Player;
var gameBorder;

var Planets = [];
var hasGamepad = false;

var playerOldMass = 0;
var totalMass = 0;

var inGame = false;

function spawnPlanet () {
	var aPlanet = new Planet();
		engine.addDisplayObject(aPlanet);
		Planets.push(aPlanet);
}

window.onload = function() {

	bgMusic = document.createElement('audio');
	bgMusic.setAttribute('src', 'alligator.mp3');
	bgMusic.loop = true;
	bgMusic.play();

	canvas = document.getElementById('myCanvas');
	engine = new airEngineJS ({canvas:canvas});

	gameBorder = new Border ();
	engine.addDisplayObject(gameBorder);

	setTimeout(startGame, 1500);

	engine.mainLoop = function () {

		this.context2D.globalAlpha = 0.3;
		this.context2D.fillStyle= "white";
		this.context2D.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context2D.globalAlpha = 1;

        this.logic();
    	this.prerender();
        this.render();
    };

    engine.prerender = function () {

		if (canvas.width != window.innerWidth || canvas.height != window.innerHeight){

			canvas.width  = window.innerWidth;
  			canvas.height = window.innerHeight;
  			
		}

		

    	for (var i = Planets.length-1; i >= 0; --i) {
    		var p = Planets[i];
    		if (p.mass < 5) {
    			Planets.splice(i,1);
    			p.r = 0;
    			//spawnPlanet({mass:Math.pow(Math.ceil(Math.random()*10), 2)});
    			engine.removeDisplayObject(p);
    			if (inGame && p == Player) died();
    		} else {
    			var hit = false;
    			if (p.x < 0) {
    				hit = true;
    				p.x = p.vx = 0;
    			} else if (p.x > canvas.width) {
    				hit = true;
    				p.x = canvas.width;
    				p.vx = 0;
    			}

    			if (p.y < 0) {
    				hit = true;
    				p.y = p.vy = 0;
    			} else if (p.y > canvas.height) {
    				hit = true;
    				p.y = canvas.height;
    				p.vy = 0;
    			}
    			if (hit && p == Player) gameBorder.alpha = 1;
    		}
    	}
    	if (!inGame) {
    		engine.cameras[0].target = Planets[0];
    	} else {
    		engine.cameras[0].target = Player;
    	}
    	

		
    	engine.cameras[0].scale += (5 - Math.sqrt(Player.mass)/20) - engine.cameras[0].scale;
    	if (engine.cameras[0].scale < 1) engine.cameras[0].scale = 1;

    	var gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];

    	var restart = 0

    	if (!gamepad) {
    		gamepad = {axes:[0,0]};

    		if (engine.keyboard.keys['A']) {
	    		gamepad.axes[0] -= 1;
	    	}
	    	if (engine.keyboard.keys['D']) {
	    		gamepad.axes[0] += 1;
	    	}
	    	if (engine.keyboard.keys['W']) {
	    		gamepad.axes[1] -= 1;
	    	}
	    	if (engine.keyboard.keys['S']) {
	    		gamepad.axes[1] += 1;
	    	}

	    	restart = engine.keyboard.keys['R'];
    	} else {
    		restart = (gamepad.buttons[9] == 1)? true : false;
    		if (!hasGamepad) {
    			hasGamepad = true;
    			guyHasGamepad();
    		}
    	}

    	if (inGame) {
    		if (Math.abs(gamepad.axes[0]) > 0.3) Player.vx += gamepad.axes[0]*Player.mass/10;
    		if (Math.abs(gamepad.axes[1]) > 0.3) Player.vy += gamepad.axes[1]*Player.mass/10;
    	}

    	if (restart) {
    		restartGame();
    	}

    	checkStatsUpdate();

    	if (Planets.length == 1) {
    		if (Planets[0] == Player) wonGame();
    		else startGame();
    	}
    	

    };

};

var won = false;

var finishLevelSound = document.createElement('audio');
finishLevelSound.setAttribute('src', 'finishLevel.wav');
finishLevelSound.load();

function died () {
	$('#notification p').html('GAME OVER</br></br>PRESS START');
	$('#notification').fadeIn();
}

function wonGame () {
	if (!won) {

		finishLevelSound.currentTime = 0;
		finishLevelSound.play();

		won = true;
		$('#notification p').html('WE HAZ A WINNER!</br>BRACE YOURSELF, THE NEXT LEVEL IS COMING');
		$('#notification').fadeIn();
		setTimeout(nextLevel, 5000);
	}

}

function nextLevel () {
	restartGame();
}

var seen9000 = 0;

function checkStatsUpdate () {

	if (playerOldMass == Player.mass) return;
	playerOldMass = Player.mass;

	
	if (Player.mass > 9000 && seen9000 < 30) {
		$('#stats').html('PLAYER MASS: OVER 9000; CELLVORSUM MASS: ' + totalMass);
		seen9000++;
	} else if (Player.mass >= 5) $('#stats').html('PLAYER MASS: ' + Player.mass + '; CELLVORSUM MASS: ' + totalMass);
    else $('#stats').html('OUCH');
    
}

var gamepadSound = document.createElement('audio');
gamepadSound.setAttribute('src', 'notification.wav');
gamepadSound.load();

function guyHasGamepad() {
	//alert("GAMEPAD? YOU'RE AWESOME. REALLY");

	gamepadSound.currentTime = 0;
	gamepadSound.play();		

	if (!inGame || Player.mass < 5) $('#gamepad-notification').show(1000);
	else {
		$('#gamepad-notification').show(1000);
		setTimeout( function(){$('#gamepad-notification').hide(1000);}, 3000);
	}
	$('#instructions').html("LEFT ANALOG TO MOVE. START BUTTON TO (RE)START.");
}

var newLevelSound = document.createElement('audio');
newLevelSound.setAttribute('src', 'newLevel.wav');
newLevelSound.load();

function restartGame() {

	newLevelSound.currentTime = 0;
	newLevelSound.play();

	inGame = true;
	$('#gamepad-notification').hide(1000);
	$('#greeting').hide(1000);
	$('#stats').show(1000);
	$('#notification').fadeOut();
	startGame();
}

function calculateTotalMass () {
	totalMass = 0;
	for (var i = 0; i < Planets.length; ++i) {
		totalMass += Planets[i].mass;
	}
}

function startGame() {

	won = false;

	for (var i = Planets.length-1; i >= 0; --i) {
		engine.removeDisplayObject(Planets[i]);
		Planets.splice(i,1);
	}

	Player = new Planet({mass:120});
	engine.addDisplayObject(Player);
	Planets.push(Player);

	for (var i = 0; i < 200; i++){

		spawnPlanet();

	}

	calculateTotalMass();

	engine.cameras[0].smoothness = 10;
}

function distancePtoP (p1, p2) {
	return Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.y - p1.y,2));
}
function rByMass (mass) {
	return Math.round(Math.sqrt(mass)/Math.PI);
}

function Border () {
	this.alpha = 0;
	this.renderOn = function (c) {
		if (this.alpha == 0) return;
		c.context2D.globalAlpha = this.alpha;
		c.context2D.beginPath();
		c.context2D.moveTo(c.toX(0), c.toY(0));
		c.context2D.lineTo(c.toX(canvas.width), c.toY(0));
		c.context2D.lineTo(c.toX(canvas.width), c.toY(canvas.height));
		c.context2D.lineTo(c.toX(0), c.toY(canvas.height));
		c.context2D.lineTo(c.toX(0), c.toY(0));
		c.context2D.strokeStyle = '#AAAAAA';
		c.context2D.stroke();
		c.context2D.strokeStyle = 'black';
		c.context2D.globalAlpha = 1;
		this.alpha -= 0.1;
		if (this.alpha < 0) this.alpha = 0;
	}
}

Border.prototype = new displayObjectJS ();

function tooCloseToOtherPlanets (p) {
	for (var i = 0; i < Planets.length; ++i) {
		var p2 = Planets[i];
		if (p != p2 && distancePtoP(p, p2) < 10) return true;
	}
	return false;
}

var pingSound = document.createElement('audio');
pingSound.setAttribute('src', 'ping.wav');
pingSound.load();

var gameoverSound = document.createElement('audio');
gameoverSound.setAttribute('src', 'gameOver.wav');
gameoverSound.load();

function randomColor () {
	//avoiding white
	var col = Math.floor(Math.random()*16777215);
	col = '#'+col.toString(16);
	if (col[1] == 'F' && col[3] == 'F' && col[5]) col[5] = '0'+Math.round(Math.random()*9);
	while(col.length < 7) col+='0';
	return col;
}

function Planet (properties) {
	this.color = randomColor();
	//this.darkcolor = '#'+((col & 0xfdfdfd) >> 1).toString(16);
	this.mass = Math.pow(Math.ceil(Math.random()*20), 2);
	this.vy = this.vx = 0;
	this.x = Math.round(canvas.width*Math.random());
	this.y = Math.round(canvas.height*Math.random());

	while (tooCloseToOtherPlanets(this)){
		this.x = Math.round(canvas.width*Math.random());
		this.y = Math.round(canvas.height*Math.random());
	}

	for (var prop in properties){
		this[prop] = properties[prop];
	}

	this.logic = function () {
		
		this.mass = Math.floor(this.mass);

		if (this.mass == 0) return;

		for (var i = 0; i < Planets.length; ++i) {
			var p = Planets[i];
			if (p != this && p.mass != 0) {
				var distPtoP = distancePtoP(p, this);
				var force = (p.mass*this.mass)/(Math.pow(distPtoP, 2))/(this.mass);
				var radAngle = Math.atan2(p.y-this.y,p.x-this.x);
				this.vy += Math.sin(radAngle)*force;
				this.vx += Math.cos(radAngle)*force;
			}
		}
		 
		this.x += this.vx/this.mass;
		this.y += this.vy/this.mass;
		this.r = rByMass(this.mass);

		for (var i = Planets.length-1; i >= 0; --i) {
			var p = Planets[i];
			if (p != this) {
				var distPtoP = distancePtoP(p, this);
				var pBig = (p.r > this.r)? p : this;
				var pSmall = (p.r < this.r)? p : this;
				if (pSmall.mass != 0 && distPtoP < p.r+this.r) {
					

					if (distPtoP < pBig.r - pSmall.r) {
						pBig.mass += pSmall.mass;
						pSmall.mass = 0;
						if (inGame && pBig == Player) {
							pingSound.currentTime = 0;
							pingSound.play();
						} else if (inGame && pSmall == Player) {
							gameoverSound.currentTime = 0;
							gameoverSound.play();
						}
					} else {

						pBig.mass += pSmall.mass/2;
						pSmall.mass /= 2;

						pSmall.vx /= 10;
						pSmall.vy /= 10;

						if (pSmall.mass < 5) {
							if (inGame && pBig == Player) {
								pingSound.currentTime = 0;
								pingSound.play();
							} else if (inGame && pSmall == Player) {
								gameoverSound.currentTime = 0;
								gameoverSound.play();
							}
						}

					}

					pBig.r = rByMass(pBig.mass);
					pSmall.r = rByMass(pSmall.mass);
				}
			}
		}

	};

	this.isInBounds = function () {
		if (this.x < 0 || this.x > canvas.width) return false;
		if (this.y < 0 || this.y > canvas.height) return false;
		return true;
	}

	this.renderOn = function (c) {

		if (this.isInBounds) {
			c.context2D.beginPath();
			c.context2D.arc(c.toX(this.x), c.toY(this.y), this.r*c.scale, 0, Math.PI*2, true); 
			c.context2D.closePath();
			c.context2D.fillStyle = this.color;
			c.context2D.fill();
		}

	};

	this.cout = function () {
		console.log("Circle x:"+this.x+", y:"+this.y+", r:"+this.r);
	};
}

Planet.prototype = new displayObjectJS();