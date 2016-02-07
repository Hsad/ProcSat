//the class formerly known as Node.js
//the basic building block of a station

var unitNeg = new THREE.Vector3(0,-7,0);

function Module(){
	Component.call(this);
	this.radius;
	this.innerLength;
	this.capLength;
	this.capSize;
	this.shapeType;
}

Module.prototype = Object.create(Component.prototype);
Module.prototype.constructor = Module;

//Could probably move alot of this into Component, but in fragemented functions
Module.prototype.fillMountingPoints = function(){
	//based off of the radius of the module, place ports on its outside wall
	
	//because its a module, there will always be a opposite sided port
	//get point at end of module
	this.buildEndPort( (this.innerLength + 2*this.capLength), this.capSize);
	//

	//other code to generate nodes on the side of the module
	//TODo
	var rand = Math.random(); 
	if ( rand > 0.5){
		if (rand > 0.9){
			//four way
			var vec = this.rotation.clone();
			//my weird rotation hack other way
			vec.set(vec.z, vec.x, vec.y);
			this.buildSidePortPair(vec);
			vec.set(vec.z, vec.x, vec.y);
			this.buildSidePortPair(vec);
		} else if (rand > 0.7){
			//left
			var lefVec = this.rotation.clone();
			//my weird rotation hack
			var hold = lefVec.x;
			lefVec.x = lefVec.y;
			lefVec.y = lefVec.z;
			lefVec.z = hold;
			this.buildSidePortPair(lefVec);
		} else {
			//right
			var rigVec = this.rotation.clone();
			//my weird rotation hack other way
			rigVec.set(rigVec.z, rigVec.x, rigVec.y);
			drawLineFromPointRay(unitNeg, rigVec);
			this.buildSidePortPair(rigVec);

			//rigVec.set(rigVec.z, rigVec.x, rigVec.y);
			//drawLineFromPointRay(unitNeg, rigVec);
		}
	}

	
}

Module.prototype.buildSidePortPair = function(dirVec){
	drawLineFromPointRay(unitNeg.shiftOver(), dirVec);
	//dir vec is the direction of one port and the oppoisite of the other
	//pretty much can just call build port, then invert the dirVec and call it again
	//jk moving it in here
	/////dirvec is the directon of the port.
	/////find end of module with rotation * height
	/////find middle with centDivOfVecs
	/////set port center at centDivOfVecs + dirVec * radius
	/////set port rot to dirVec
	drawLineFromPointRay(unitNeg.shiftOver(), this.rotation);
	var modEnd = this.rotation.clone().multiplyScalar(this.innerLength + 2*this.capLength);
	drawLineFromPointRay(unitNeg.shiftOver(), modEnd);
	var cent = this.centDivOfVecs(this.origin, modEnd.clone().add(this.origin), 1).pop(); //pop for one var
	drawLineFromPointRay(unitNeg.shiftOver(), this.origin);
	drawLineFromPointRay(unitNeg.shiftOver(), cent);
	//drawLineFromPointRay(unitNeg.shiftOver(), modEnd);
	var offset = dirVec.clone().multiplyScalar(this.radius);
	drawLineFromPointRay(unitNeg.shiftOver(), cent);
	
	cent.add(offset);
	this.buildPort(cent, dirVec);

	offset.negate();
	cent.add(offset);
	cent.add(offset);
	dirVec.negate();
	this.buildPort(cent, dirVec);
	//
	//
	//
	//may want some sytem for linking the pairs so when one is build off of
	//the other has a higher chance of being built too
	//
	//
	//
}

THREE.Vector3.prototype.shiftOver = function(){
	this.x++;
	this.y++;
	this.z++;
	return this;
}

Module.prototype.buildPort = function(cent, dirVec){
	var point = cent.clone();
	var rot = dirVec.clone();
	var port = new MountingPoint(point, rot, this.capSize);
	this.mountingPoints.push(port);

	//drawLineFromPointRay(cent, dirVec);
}

//find centered dividision of two vecs
Module.prototype.centDivOfVecs = function(vec1, vec2, numDiv){
	var retArr = [];

	var travelVec = new THREE.Vector3();
	travelVec.subVectors(vec2, vec1);
	travelVec.divideScalar(numDiv);
	if (numDiv = 1){
		//need to add vec1 to relocate into worldspace
		retArr.push(travelVec.divideScalar(2).add(vec1));
		return retArr;
	}
	for (var x = 1; x < numDiv*2; x+=2){
		//need to add vec1 to relocate into worldspace
		retArr.push(travelVec.clone().multiplyScalar(x).add(vec1));
	}
	return retArr;
}

Module.prototype.createModuleCollisionShape = function(){
	this.createCollisionShape( (this.innerLength + 2*this.capLength), this.radius*2, this.radius*2);
}

Module.prototype.buildModuleMesh = function(){
	var mat = new THREE.MeshLambertMaterial( {color: 0xaaaaaa } );
	var mat2 = new THREE.MeshLambertMaterial( {color: 0x444444 } );
	var geo = new THREE.BoxGeometry(1,1,1);
	var cube = new THREE.Mesh( geo, mat );
	var unitUpVec = new THREE.Vector3(0,1,0);

	//var coreGeo = new THREE.BoxGeometry(this.radius, this.innerLength, this.radius);
	var coreGeo = new THREE.CylinderGeometry(this.radius, this.radius, 
			this.innerLength, 8);
	var core = new THREE.Mesh( coreGeo, mat );
	//var capGeo = new THREE.BoxGeometry(this.radius-0.3, this.capLength, this.radius-0.3);
	var capGeo1 = new THREE.CylinderGeometry(this.radius, this.capSize, this.capLength, 8);
	var startcap = new THREE.Mesh( capGeo1, mat2 );
	var capGeo2 = new THREE.CylinderGeometry(this.capSize, this.radius, this.capLength, 8);
	var endcap = new THREE.Mesh( capGeo2, mat2 );
	//boost shapes by correct distance, upwards
	startcap.position.y = -(this.capLength + this.innerLength)/2;
	endcap.position.y = (this.capLength + this.innerLength)/2;

	var completeMesh = new THREE.Object3D();
	completeMesh.add(core);
	completeMesh.add(startcap);
	completeMesh.add(endcap);

	
	//need to move center to correct location, rotate, then adjust for offset,
	//or could find the center point based off of the rot and ori and just move there and rotate
	var center = this.rotation.clone().multiplyScalar(this.innerLength/2 + this.capLength);
	center.add(this.origin); //should now be center
	completeMesh.position.copy(center);
	var quat = new THREE.Quaternion();
	quat.setFromUnitVectors(unitUpVec, this.rotation);
	completeMesh.rotation.setFromQuaternion(quat);
	//core.rotation.setFromVector3(this.rotation);
	//
	//scene.add(completeMesh);
	this.model = completeMesh;
	//
}
