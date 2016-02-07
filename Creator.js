//this class manages the requirements and the active components
//it orchistrates the construction
//

function Creator(){
	this.requirements = [];
	this.avalibleComponentsQueue = [];
	this.sideQueue = [];

}

//need a func to initilize the queue with a starting node
//need a func to select first in queue and find viable requirements to satisify

//format of the requirements  enum for type 0:module, 1:solarPanels, 2:truss

//looking at a component to satisfy requirements, look at avalible mounting points
//see if any can hold any of the requirements, if one can, create it, see if it will fit
//if so, add the parent child conections, else try next mounting point
//if none can satisfy, move component to back of queue, try next.
//

Creator.prototype.initalNode = function(){
	var mod = new Module();
	mod.setOrigin(new THREE.Vector3());
	mod.setRotation(new THREE.Vector3(0,1,0));
	//mod.model = new cube();
	mod.radius = 1.5;
	mod.innerLength = 2;
	mod.capLength = 0.5;
	mod.capSize = 1;
	mod.createModuleCollisionShape();
	mod.fillMountingPoints();
	//mod.buildEndPort((mod.innerLength + 2*mod.capLength), mod.capSize);
	mod.buildModuleMesh();
	
	mod.addMeshToScene();
	mod.addCollisionShapeToIndex();
	this.avalibleComponentsQueue.push(mod);
}

Creator.prototype.generateRequirements = function(){
	var modNum = 70 ;
	for (var m = 0; m < modNum; m++){
		this.requirements.push({type:0,
			innerLength : this.rand(2,4),
			capLength : this.rand(0.3, 1),
			radius : this.rand(1, 2),
		});
	}
}

Creator.prototype.rand = function(min, max){
	return Math.random() * (max - min) + min;
}

//as long as there are availible components
//pop one off the Queue
//for every avalible mount point
//check every requirements to see if it can satisfy it
//if it can, check if the component can fit
//if it can add the component, remove the requirements
//if the current component still has free ports, add it back to the queue

//should it be looking at components first, or requirements,
//requirements imply a tier of importance, which does seem true
//the disspersed growth of the station should still occur with the Queue
//additonally the loop should stop when there are no more requirements,
//but if avalible locations run out, then some work around should be made
//however the lack of a usable point, should only push that requirements 
//down the list.
//there will need to be a check for when no requirements can be satisfied
//otherwise it could devolve into an infinite loop



Creator.prototype.buildSatilite = function(){
	var newComponentAdded = false;
	while (this.avalibleComponentsQueue.length > 0){
		var comp = this.avalibleComponentsQueue.shift();
		//for everyport, see if it can satisfy a equirement
		var avalPoints = comp.pointsAvalible();
		this.shuffle(avalPoints);
		for (var av = 0; av < avalPoints.length; av++){
			drawLineFromPointRay(avalPoints[av].origin, avalPoints[av].rotation);
		}
		//the returned avalible points are randomized to stop entirely linear growth

		breakPoint:
		for(var r = 0; r < this.requirements.length; r++){
			for (var p = 0; p < avalPoints.length; p++){
				if(this.pointSatisfiesReq(avalPoints[p], this.requirements[r])){
					//create comp
					//the equirement may beable to provide a level of auto creation based
					//on what the required part is
					var newComp = this.createCompFromReq(this.requirements[r], avalPoints[p]);
					//attempt to place comp
					if(newComp.isColliding() == false){
						//placement is clear, add comp
						newComp.addToWorld(avalPoints[p]);
						this.avalibleComponentsQueue.push(newComp);
						//set flag to refill the queue
						newComponentAdded = true;
						//take out the requirements
						this.requirements.splice(r, 1);
						break breakPoint;
					}
					else{
						//placement is not clear, destroy newComp
					}
					//if you cant you can try to adjust the size of the module
				}
			}
		}
		if (newComponentAdded){
			//new possibilities, refill the main queue with the side queue
			this.avalibleComponentsQueue = this.avalibleComponentsQueue.concat(this.sideQueue);
			this.sideQueue = [];
			newComponentAdded = false;
		}
		if (comp.pointsAvalible().length > 0){
			this.sideQueue.push(comp);
		}
		if (this.requirements.length == 0){
			return;
		}
	}
}

Creator.prototype.shuffle = function(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

Creator.prototype.createCompFromReq = function(req, mount){
	if (req.type == 0){
		//module
		var mod = new Module();
		mod.setOrigin(mount.origin.clone());
		mod.setRotation(mount.rotation.clone());
		//mod.model = new cube();
		mod.radius = req.radius || 1.5; //these should be random values between some parameter
		mod.innerLength = req.innerLength || 3;
		mod.capLength = req.capLength || 0.5;
		mod.capSize = req.capSize || 1;
		mod.createModuleCollisionShape();
		mod.fillMountingPoints();
		mod.buildModuleMesh();
		return mod;
	}
}

Creator.prototype.pointSatisfiesReq = function(point, req){
	//uhhhh not sure how this should be implemented
	return true;
}
