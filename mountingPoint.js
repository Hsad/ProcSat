// this is the class for mounting points, pretty basic, but fuck it, I need to be more
// Object oriented in my codeing anyway
//

function MountingPoint(point, rotation, radius){
	this.origin = point || new THREE.Vector3();
	this.rotation = rotation || new THREE.Vector3();
	this.size = radius || 0;
	this.connectedComponent;
}

MountingPoint.prototype.isConnected = function(){
	//if the point is taken, return true, if not its undefined so return false
	return this.connectedComponent == undefined ? false : true;
}




