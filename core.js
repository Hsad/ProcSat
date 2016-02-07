
//variables
	var scene; 
	var camera; 
	var camControls;
	var renderer;
	var lastTime = Date.now();
	var currentTime = 0;
	var deltaTime = 0;
	var PI = 3.14159;

	//var kdtree = require("kdtree");
	var SuperLineMesh;
	var LineMat;

	//collision Index
	var CollisionIndex = new Index(3);

function init(){
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
	camera.position.z = 30;
	camera.position.y = 20; //lil hight boost, lil less
	camera.position.x = 5; 
	//camera.rotation.x = 0.5;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	camControls = new THREE.OrbitControls(camera);
	camControls.addEventListener( 'change', render);
	
	//Add lights
	var pointLight = new THREE.PointLight( 0xff9640, 4, 60, 2 );
	pointLight.position.set( 20, 20, 20 );
	scene.add( pointLight );

	var pointLight = new THREE.PointLight( 0x3f66a0, 2, 60, 2);
	pointLight.position.set( -20, -20, -20 );
	scene.add( pointLight );
		
	//document.addEventListener("keydown",onDocumentKeyDown,false);
	window.addEventListener("resize", onWindowResize, false);

	//lineDebug stuff
	LineMat = new THREE.LineBasicMaterial( { color: 0x444444 } );

	var emptyGeo = new THREE.BufferGeometry();
	var VertPos = new Float32Array( 10000 * 3);
	emptyGeo.addAttribute( "position" ,  new THREE.BufferAttribute(VertPos, 3) );
	emptyGeo.drawRange.count = 2;
	emptyGeo.computeBoundingSphere();
	SuperLineMesh = new THREE.LineSegments(emptyGeo, LineMat);
	scene.add(SuperLineMesh);
	//sceneConstructor();
	//boxCollideTest();
	//createModule();

	var C = new Creator();
	C.initalNode();
	C.generateRequirements();
	C.buildSatilite();

}

function drawLineFromPointRay(pnt, ray){
	drawLineFromVec(pnt, pnt.clone().add(ray));
}

function drawLineFromVec(vec1, vec2){
	drawLine(vec1.x,vec1.y,vec1.z,vec2.x,vec2.y,vec2.z);
}

function drawLine(point1x, point1y, point1z, point2x, point2y, point2z){
	var pos = SuperLineMesh.geometry.getAttribute('position');
	var drawRangeNum = SuperLineMesh.geometry.drawRange.count;

	pos.setXYZ(drawRangeNum, point1x, point1y, point1z);
	pos.setXYZ(drawRangeNum + 1, point2x, point2y, point2z);
	//pos.setXYZ(drawRangeNum, point1x, point1y, GlobalHeightMod);
	//pos.setXYZ(drawRangeNum + 1, point2x, point2y, GlobalHeightMod);
	pos.needsUpdate = true;

	//GlobalHeightMod += GHModInc;

	//SuperLineMesh.geometry.drawRange.count += 2;
}

function createModule(){
	var mod = new Module();
	mod.setOrigin(new THREE.Vector3());
	mod.setRotation(new THREE.Vector3(0,0,1));
	mod.model = new cube();
	mod.diameter = 1.5;
	mod.innerLength = 0.5;
	mod.capLength = 0.5;
	mod.createModuleCollisionShape();
}

function cube(){
	var mat = new THREE.MeshLambertMaterial( {color: 0xaaaaaa } );
	var geo = new THREE.BoxGeometry(1,1,1);
	var cube = new THREE.Mesh( geo, mat );
	scene.add(cube);
	return cube;
}

function sceneConstructor(){
	var mat = new THREE.MeshLambertMaterial( {color: 0x333333 } );
	var geo = new THREE.BoxGeometry(1,1,1);
	var cube = new THREE.Mesh( geo, mat );
	scene.add(cube);
}

function boxCollideTest(){
	var index = new Index(3);

	var b1 = new Shape();
	b1.coords = [[-1,1],[-1,1],[-1,1]];
	index.add(b1);

	var b2 = new Shape();
	b2.coords = [[-2,0],[-2,0],[-2,0]];
	index.add(b2);

	index.update();

	var b3 = new Shape();
	b3.coords = [[0.1,2],[0.1,2],[0.1,2]];

	console.log(index.query(b3));
}

function render() {
	currentTime = Date.now();
	deltaTime = (currentTime - lastTime) / 1000;
	lastTime = currentTime;
	requestAnimationFrame(render);	
	renderer.render(scene, camera);
}

function onWindowResize(){
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}





