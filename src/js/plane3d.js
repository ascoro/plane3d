var coroSite = window.coroSite||{};
var geometry;
coroSite.stats = function(){
	var $elMessage=$("<div class='stats message'>");
	var $contentMessage=$("<div class='content'>");
	$elMessage.append($contentMessage);
	var $elStats=$("<div class='stats'>");
	$("body").append($elStats);
	$("body").append($elMessage);
	var thiz=this;
	var messages =[];
	var messagesBusy=false;
	var lastType;
	var currentTimeout;
	thiz.addMessage=function(message,type){
		if(type){
			clearTimeout(currentTimeout);
			cleanQueue();
			messages.push({message:message,type:type});
			var delay=500;
			console.log(currentTimeout);
			if(!currentTimeout){
				delay=0;
			}
			hideMessage(delay);
		}else{
			messages.push({message:message,type:type});
			showMessage();
		}
	}


	var showMessage = function(){
		if(!messagesBusy){
			var nextMessage = messages.shift();
			if(nextMessage){
				messagesBusy=true;
				$contentMessage.html(nextMessage.message);
				$elMessage.removeClass(lastType);
				$elMessage.addClass("active");

				$elMessage.addClass(nextMessage.type);
				lastType=nextMessage.type;
				var delay=3000;
				if(nextMessage.type){
					delay=10000;					
				}
				currentTimeout = setTimeout(function(){currentTimeout=undefined; hideMessage();},delay);
			}
		}
	}
	var hideMessage = function(delay){
		if(typeof delay ==="undefined"){
			delay=500;			
		}
		messagesBusy=false;
		$elMessage.removeClass("active");
		setTimeout(showMessage,delay);
	}
	var cleanQueue = function(){
		messages=[];
	}
	thiz.updateStats=function(message){
		$elStats.html(message);
	}
}
coroSite.Shot = function(settings){
	var thiz = this;
	var speed = settings.speed||2;
	var position = settings.position||{x:0,y:0,z:0};
	var direction = settings.direction||{x:0,y:1,z:0};
	var boundingBox=7500;
	var material = new THREE.MeshBasicMaterial({ color: 'black' });
	var cube = new THREE.Mesh( new THREE.CubeGeometry( 5, 5, 5 ), material );
	cube.position.x=position.x;
	cube.position.y=position.y;
	cube.position.z=position.z;
	this.getObject = function(){
		return cube;
	};
	this.move = function(){
		cube.position.x+=direction.x*speed;
		cube.position.y+=direction.y*speed;
		cube.position.z+=direction.z*speed;
	}
	this.isDead = function(){
		if(Math.abs(cube.position.x)>boundingBox/2){ return true; }
		if(Math.abs(cube.position.y)>boundingBox/2){ return true; }
		if(Math.abs(cube.position.z)>boundingBox/2){ return true; }
		return false;
	}
};
coroSite.Enemy = function(settings){
	var thiz = this;
	var speed = settings.speed||10;
	var boundingBox=7500;
	var position = settings.position||{x:Math.random()*boundingBox-boundingBox/2,y:600,z:Math.random()*boundingBox-boundingBox/2};
	var direction = settings.direction||{x:Math.random(),y:0,z:Math.random()};
	var material = new THREE.MeshBasicMaterial({ color: 'grey' });
	var cube = new THREE.Mesh( new THREE.CubeGeometry( 20, 20, 20 ), material);
	var dead=false;
	cube.position.x=position.x;
	cube.position.y=position.y;
	cube.position.z=position.z;
	this.getObject = function(){
		return cube;
	};
	this.move = function(){
		if(!dead){
			cube.position.x+=direction.x*speed;
			cube.position.y+=direction.y*speed;
			cube.position.z+=direction.z*speed;
			if(Math.abs(cube.position.x)>boundingBox/2){ direction.x*=-1;}
			if(Math.abs(cube.position.y)>boundingBox/2){ direction.y*=-1;}
			if(Math.abs(cube.position.z)>boundingBox/2){ direction.z*=-1;}
		}
	}
	this.kill = function(){
		dead=true;
		cube.material.color.setHex( 0xff0000 );
	}
	this.isDead = function(){
		return dead;
	}
};

coroSite.MiniMap = function(settings){
	settings=settings||{};
	var thiz=this;
	var enemies = settings.enemies||[];
	var shots = settings.shots||[];
	var yourself = settings.yourself||{};
	var $map;
	var context;
	var mapId;
	var sizeElements=5;
	var init = function(){
		mapId="map-"+Math.floor(Math.random()*1000);
		$map=$("<canvas id='"+mapId+"' class='minimap'>");
		$('body').append($map);
		context = $map[0].getContext("2d");
		context.canvas.width=100;
		context.canvas.height=100;
	}
	var drawElement = function(x,y,color){
		context.fillStyle = color;
		context.fillRect(x, y, sizeElements, sizeElements);
	}
	var drawElementByCube = function(cube,color){
		drawElement((cube.position.x+3500)/75,(cube.position.z+3500)/75,color);
	}
	thiz.render = function(){
		context.fillStyle = "black";
		context.fillRect(0, 0, 100, 100);
		if(yourself){
			drawElementByCube(yourself,"green");
			
			var vector = new THREE.Vector3( 0, 0, -1 );
			vector.applyEuler( yourself.rotation, yourself.rotation.order );
			var posx=(yourself.position.x+3500)/75+sizeElements/2;
			var posz=(yourself.position.z+3500)/75+sizeElements/2;
			var ratiox = posx / vector.x;
			var ratioz = posz / vector.z;
			var minRatio = ratioz;
			if(Math.abs(ratiox)<Math.abs(ratioz)){
				minRatio=ratiox;
			}
			console.log(minRatio);
			context.fillStyle = '#555';
			context.beginPath();
			context.moveTo(posx, posz);
			context.lineTo(posx+vector.x*1000,posz+vector.z*1000);
			context.lineTo(posx+vector.x*1000+50,posz+vector.z*1000+50);
			//c2.lineTo(0, 90);
			context.closePath();
			context.fill();
		}
		for(var i=0;enemies[i];i++){
			var enemy = enemies[i].getObject();
			drawElementByCube(enemy,"grey");
		}
		for(var i=0;shots[i];i++){
			var shot = shots[i].getObject();
			drawElementByCube(shot,"white");
		}
	}
	init();
}

coroSite.Terrain = function(settings){
	var thiz = this;
	var width=settings.width;
	var depth=settings.depth;
	var heightData;
	var mapData;
	var init = function(){
		mapData =  generateHeight( width, depth );
		heightData=[];
		for(var i=0;mapData[i];i++){
			heightData[i]=mapData[i]*10;
		}
	}
	thiz.getHeight = function(x,z){
		return thiz.getHeightById(x+z*depth);
	}
	thiz.getHeightById = function(i){
		return heightData[i]||0;
	}
	thiz.getMesh = function(){	
		geometry = new THREE.PlaneGeometry( 7500, 7500, width - 1, depth - 1 );
		geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

		for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
			geometry.vertices[ i ].y = thiz.getHeightById(i);
		}

		texture = new THREE.Texture( generateTexture( mapData, width, depth ), new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping );
		texture.needsUpdate = true;

		mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
		return mesh;
	};
	var generateTexture = function( data, width, height ) {
		var canvas, canvasScaled, context, image, imageData,
		level, diff, vector3, sun, shade;
		vector3 = new THREE.Vector3( 0, 0, 0 );
		sun = new THREE.Vector3( 1, 1, 1 );
		sun.normalize();
		canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;
		context = canvas.getContext( '2d' );
		context.fillStyle = '#000';
		context.fillRect( 0, 0, width, height );
		image = context.getImageData( 0, 0, canvas.width, canvas.height );
		imageData = image.data;
		for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
			vector3.x = data[ j - 2 ] - data[ j + 2 ];
			vector3.y = 2;
			vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
			vector3.normalize();
			shade = vector3.dot( sun );
			imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
			imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
			imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
		}
		context.putImageData( image, 0, 0 );
		// Scaled 4x
		canvasScaled = document.createElement( 'canvas' );
		canvasScaled.width = width * 4;
		canvasScaled.height = height * 4;
		context = canvasScaled.getContext( '2d' );
		context.scale( 4, 4 );
		context.drawImage( canvas, 0, 0 );
		image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
		imageData = image.data;
		for ( var i = 0, l = imageData.length; i < l; i += 4 ) {
			var v = ~~ ( Math.random() * 5 );
			imageData[ i ] += v;
			imageData[ i + 1 ] += v;
			imageData[ i + 2 ] += v;
		}
		context.putImageData( image, 0, 0 );
		return canvasScaled;
	};
	var generateHeight = function( width, height ) {
		var size = width * height, data = new Float32Array( size ),
		perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;
		for ( var i = 0; i < size; i ++ ) {
			data[ i ] = 0;
		}
		for ( var j = 0; j < 4; j ++ ) {
			for ( var i = 0; i < size; i ++ ) {
				var x = i % width, y = ~~ ( i / width );
				data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
			}
			quality *= 5;
		}
		return data;
	};
	init();
};

var plane3d = function(settings){
	settings=settings||{};
	var thiz=this;
	var container, stats;
	var controls, scene, renderer;
	var  texture;
	var worldWidth = 256, worldDepth = 256, worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
	var clock, isAbove;
	var terrain;
	var youAreDeadToMeVaraible=false;
	var stats;
	var numEnemies=0;
	var minimap;
	var init = function(){
		stats=new coroSite.stats();
		clock = new THREE.Clock();
		isAbove = true;
		container = document.getElementById( 'container' );
		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
		controls = new THREE.FirstPersonControls( camera,undefined, colisionDetector,addShot);
		controls.movementSpeed = 1000;
		controls.lookSpeed = 0.1;
		scene = new THREE.Scene();
		terrain = new coroSite.Terrain({width:worldWidth,depth:worldDepth});
		mesh = terrain.getMesh();
		camera.position.y = terrain.getHeight(0,0)+400;
		scene.add( mesh );

		minimap = new coroSite.MiniMap({enemies:enemies,shots:shots,yourself:camera});

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.innerHTML = "";
		container.appendChild( renderer.domElement );

		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();
		addEnemy();

		render();
			setInterval(function(){console.log(getDirectionCamera());},1000);
	}
	var colisionDetector = function(){
		var xMap = (camera.position.x+3750)*256/7500;
		var zMap = (camera.position.z+3750)*256/7500;
		var yMap = terrain.getHeight(Math.floor(xMap),Math.floor(zMap));
		var yCamera = camera.position.y;
		if(yMap){
			isAbove = yCamera-yMap>0;
			if(!isAbove){
				console.log("Collision! you are dead! "+yCamera+" = "+yMap);
				youAreDeadToMeVaraible=true;
				stats.addMessage("You are dead!","dead");
			}
			/*cube.position.x=camera.position.x;
			cube.position.y=yMap;
			cube.position.z=camera.position.z;*/
			//console.log(yCamera+" = "+yMap+" " + (yCamera-yMap>0 ? "Above" : "Under") );
		}else{
			//console.log(xMap+" - "+zMap+" you are out of the MAP!");
		}
	}
	setInterval(function(){var enemiesAlive=0;for(var i=0;enemies[i];i++){
			if(!enemies[i].isDead()){enemiesAlive++;}
		}
		//stats.updateStats(enemiesAlive+"!");
		//console.log(numShots+" shoots - "+enemiesAlive+" alive enemies");
	},1000)
	var shots = [];
	var enemies = [];
	var numShots=0;
	var getDirectionEulerCamera=function(){
		var vector = new THREE.Vector3( 0, 0, -1 );
		vector.applyEuler( camera.rotation, camera.rotation.order );
		return vector;
	}
	var getDirectionCamera=function(){
		var vector = new THREE.Vector3( 0, 0, -1 );
		vector.applyMatrix4( camera.matrixWorld  );
		return vector;
	}
	var addShot = function(){
		var newShot = new coroSite.Shot({position:camera.position,direction:getDirectionEulerCamera(),speed:50});
		scene.add( newShot.getObject() );
		shots.push(newShot);
		numShots++;
		//console.log("Add Shoot "+numShots);
	}
	var addEnemy = function(){
		var newEnemy = new coroSite.Enemy([]);
		scene.add( newEnemy.getObject() );
		enemies.push(newEnemy);
		numEnemies++;
		//console.log("Add Shoot "+numShots);
	}
	var checkKillEnemy = function(shot){
		var shotCube = shot.getObject();
		for(var i=0;enemies[i];i++){
			var enemy=enemies[i];
			if(!enemy.isDead()){
				var cube = enemy.getObject();

				if(Math.abs(cube.position.x-shotCube.position.x)<20
					&& Math.abs(cube.position.y-shotCube.position.y)<20
					&& Math.abs(cube.position.z-shotCube.position.z)<20
					){
					enemy.kill();
					numEnemies--;
					enemies.splice(i,1);
					i--;
					//console.log("Kill enemy!");
					stats.addMessage("Enemy killed! "+numEnemies+" enemies left");

					if(numEnemies==0){
						stats.addMessage("You win!!!!!!!!!!","win");

					}
				}
			}
			
		}		
	}
	var moveShots = function(){
		for(var i=0;shots[i];i++){
			shots[i].move();
			checkKillEnemy(shots[i]);
		}
		for(var i=0;shots[i];i++){
			if(shots[i].isDead()){
				scene.remove(shots[i].getObject());
				shots.splice(i,1);
				numShots--;
				i--;
			}
		}
	}
	var moveEnemies = function(){
		for(var i=0;enemies[i];i++){
			enemies[i].move();
		}
	}
	var render = function () {
		if(!youAreDeadToMeVaraible){
			requestAnimationFrame(render);
			//colisionDetector();
			controls.update( clock.getDelta() );
			
			moveShots();
			moveEnemies();
			minimap.render();
			
			if(!youAreDeadToMeVaraible){
				renderer.render(scene, camera);
			}
		}
	};
	init();
};

			

			// http://mrl.nyu.edu/~perlin/noise/

var ImprovedNoise = function () {
	var p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,
		 23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,
		 174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,
		 133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,
		 89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,
		 202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,
		 248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,
		 178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,
		 14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,
		 93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
	for (var i=0; i < 256 ; i++) {
		p[256+i] = p[i];
	}
	function fade(t) {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}
	function lerp(t, a, b) {
		return a + t * (b - a);
	}
	function grad(hash, x, y, z) {
		var h = hash & 15;
		var u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
		return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
	}
	return {
		noise: function (x, y, z) {
			var floorX = ~~x, floorY = ~~y, floorZ = ~~z;
			var X = floorX & 255, Y = floorY & 255, Z = floorZ & 255;
			x -= floorX;
			y -= floorY;
			z -= floorZ;
			var xMinus1 = x -1, yMinus1 = y - 1, zMinus1 = z - 1;
			var u = fade(x), v = fade(y), w = fade(z);
			var A = p[X]+Y, AA = p[A]+Z, AB = p[A+1]+Z, B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;
			return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), 
							grad(p[BA], xMinus1, y, z)),
						lerp(u, grad(p[AB], x, yMinus1, z),
							grad(p[BB], xMinus1, yMinus1, z))),
					lerp(v, lerp(u, grad(p[AA+1], x, y, zMinus1),
							grad(p[BA+1], xMinus1, y, z-1)),
						lerp(u, grad(p[AB+1], x, yMinus1, zMinus1),
							grad(p[BB+1], xMinus1, yMinus1, zMinus1))));
		}
	}
}

THREE.FirstPersonControls = function ( object, domElement , callbackMove,addShot ) {
	this.addShot=addShot;
	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;
	this.lookVertical = true;
	this.autoForward = false;
	this.activeLook = true;
	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;
	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;
	this.autoSpeedFactor = 0.0;
	this.mouseX = 0;
	this.mouseY = 0;
	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;
	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;
	this.mouseDragOn = false;
	this.viewHalfX = 0;
	this.viewHalfY = 0;
	this.shoot = 0;
	if ( this.domElement !== document ) {
		this.domElement.setAttribute( 'tabindex', -1 );
	}
	this.handleResize = function () {
		if ( this.domElement === document ) {
			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;
		} else {
			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;
		}
	};
	this.onMouseDown = function ( event ) {
		if ( this.domElement !== document ) {
			this.domElement.focus();
		}
		event.preventDefault();
		event.stopPropagation();
		if ( this.activeLook ) {
			switch ( event.button ) {
				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;
			}
		}
		this.mouseDragOn = true;
	};
	this.onMouseUp = function ( event ) {
		event.preventDefault();
		event.stopPropagation();
		if ( this.activeLook ) {
			switch ( event.button ) {
				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;
			}
		}
		this.mouseDragOn = false;
	};
	this.onMouseMove = function ( event ) {
		if ( this.domElement === document ) {
			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;
		} else {
			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
		}
	};
	this.onKeyDown = function ( event ) {
		//event.preventDefault();
		switch ( event.keyCode ) {
			case 32: /*space*/ this.shoot++; break;
			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;
			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;
			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;
			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;
			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;
			case 81: /*Q*/ this.freeze = !this.freeze; break;
		}
	};
	this.onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;
			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;
			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;
			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;
			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;
		}
	};
	this.update = function( delta ) {
		if ( this.freeze ) {
			return;
		}
		if(this.shoot>0){
			this.addShot();
			this.shoot--;
		}
		if ( this.heightSpeed ) {
			var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;
			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );
		} else {
			this.autoSpeedFactor = 0.0;
		}
		var actualMoveSpeed = delta * this.movementSpeed;
		if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
		if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );
		if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
		if ( this.moveRight ) this.object.translateX( actualMoveSpeed );
		if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
		if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );
		var actualLookSpeed = delta * this.lookSpeed;
		if ( !this.activeLook ) {
			actualLookSpeed = 0;
		}
		var verticalLookRatio = 1;
		if ( this.constrainVertical ) {
			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );
		}
		this.lon += this.mouseX * actualLookSpeed;
		if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );
		this.theta = THREE.Math.degToRad( this.lon );
		if ( this.constrainVertical ) {
			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );
		}
		var targetPosition = this.target,
			position = this.object.position;
		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
		this.object.lookAt( targetPosition );
		callbackMove();
	};
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );
	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	};
	this.handleResize();
};
var planet;
$(document).on('click',function(){if(!planet) planet=new plane3d();});
var a = new coroSite.MiniMap();
a.render();