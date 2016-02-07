//this is the base class of every peice of the satilite

function Component(){
	this.type;
	this.origin;
	this.rotation;

	this.mountingPoints = [];
	//this.satisfiedRequirements;
	this.parentMountingPoint;
	this.parentComp;
	this.childrenComp;
	this.model;
	this.collisionShape;
}

Component.prototype.pointsAvalible = function(){
	var retArr = [];
	for (var x = 0; x < this.mountingPoints.length; x++){
		if (this.mountingPoints[x].isConnected() == false){
			retArr.push(this.mountingPoints[x]);
		}
	}
	return retArr;
}
Component.prototype.setOrigin = function(vec3){
	this.origin = vec3;
}
Component.prototype.setRotation = function(vec3){
	this.rotation = vec3.normalize();
}

Component.prototype.createCollisionShape = function( length, width, height ){
	//build me a shape
	//shapes come in the form of [ [x,x1] , [y,y1] , [z,z1] ]
	//need starting point, that will influence the xyz orientation
	//this system doesn't play nice with part rotated at angles other than 90 degrees
	//complex alternitive is to use raycasts allong every edge in the mesh
	//or implementing your own seperating axis therom


	var ori = this.origin.clone();
	var rot = this.rotation;

	//get length of the module
	var rotCop = rot.clone();
	rotCop.multiplyScalar(length);
	
	var unitVec = new THREE.Vector3(1,1,1);

	//get an absolute of the module rotation
	var rotAbs = rot.clone();
	rotAbs.x = Math.abs(rotAbs.x);
	rotAbs.y = Math.abs(rotAbs.y);
	rotAbs.z = Math.abs(rotAbs.z);

	//isolate the vector components of the radius
	unitVec.sub(rotAbs);
	unitVec.multiplyScalar(width);    ///////////Currently only deals with equal width and height//
	
	//composite and adjust for finding bounds
	rotCop.add(unitVec);
	ori.sub(unitVec.divideScalar(2));

	rotCop.add(ori);
	//set bounds, smaller values first
	var x1 = ori.x < rotCop.x ? ori.x : rotCop.x ;
	var y1 = ori.y < rotCop.y ? ori.y : rotCop.y ;
	var z1 = ori.z < rotCop.z ? ori.z : rotCop.z ;

	var x2 = ori.x > rotCop.x ? ori.x : rotCop.x ;
	var y2 = ori.y > rotCop.y ? ori.y : rotCop.y ;
	var z2 = ori.z > rotCop.z ? ori.z : rotCop.z ;
	
	//drawLineFromPointRay(ori, rotCop);
	var cShape = new Shape();
	cShape.coords = [ [x1,x2], [y1,y2], [z1,z2] ];
	this.collisionShape = cShape;

	this.drawCollisionShape();
}

Component.prototype.drawCollisionShape = function(){
	var col = this.collisionShape.coords;
	var v1 = new THREE.Vector3(col[0][0], col[1][0], col[2][0]);
	var v2 = new THREE.Vector3(col[0][1], col[1][1], col[2][1]);

	var a = new THREE.Vector3(v1.x, v1.y, v1.z);
	var b = new THREE.Vector3(v1.x, v1.y, v2.z);
	var c = new THREE.Vector3(v1.x, v2.y, v1.z);
	var d = new THREE.Vector3(v1.x, v2.y, v2.z);
	var e = new THREE.Vector3(v2.x, v1.y, v1.z);
	var f = new THREE.Vector3(v2.x, v1.y, v2.z);
	var g = new THREE.Vector3(v2.x, v2.y, v1.z);
	var h = new THREE.Vector3(v2.x, v2.y, v2.z);

	drawLineFromVec(a,c);
	drawLineFromVec(g,c);
	drawLineFromVec(a,e);
	drawLineFromVec(g,h);
	drawLineFromVec(h,d);
	drawLineFromVec(d,b);
	drawLineFromVec(b,f);
	drawLineFromVec(f,e);
}

Component.prototype.addCollisionShapeToIndex = function(){
	CollisionIndex.add(this.collisionShape);
}

Component.prototype.buildEndPort = function(length, size){
	var endPort = this.rotation.clone();
	endPort.multiplyScalar(length);
	endPort.add(this.origin);
	//size is optional
	var endMP = new MountingPoint(endPort, this.rotation, size || 1);
	this.mountingPoints.push(endMP);

	//drawLineFromPointRay(endPort, this.rotation);
}

Component.prototype.isColliding = function(){
	if( CollisionIndex.query(this.collisionShape).length > 1){
		//is colliding with something other than its parent
		return true;
	}
	return false;
}

Component.prototype.addMeshToScene = function(){
	scene.add(this.model);
}

Component.prototype.addToWorld = function(parentMountingPoint){
	this.parentMountingPoint = parentMountingPoint;
	parentMountingPoint.connectedComponent = this;
	this.addCollisionShapeToIndex();
	this.addMeshToScene();
}
