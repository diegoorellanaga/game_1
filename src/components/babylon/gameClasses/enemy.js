class Chinche {
    constructor( id, scene) {
        this.id = id
        this.meshData;
        this.animationGroup;
        this.animationGroupNative;
        this._scene = scene;
        this.isWalking = true
        this.isDead = false
        this.timeDed = 0
        this.isBug = true
        this.isCounted = false
        this.originalRotation;
        this.originalPosition; 





        this._walkingSfx =  new BABYLON.Sound("WalkInsect", "https://static.wixstatic.com/mp3/0e7f19_fb1a786cfb584bb885fe57f45680f0ba.mp3", this._scene, null, { loop: true, autoplay: false , maxDistance: 15});
        this.onRun = new BABYLON.Observable();
        //--SOUNDS--
        //observable for when to play the walking sfx
        this.onRun.add((play) => {
            if (play && !this._walkingSfx.isPlaying) {
                this._walkingSfx.play(0,0.1,1);
            } else if (!play && this._walkingSfx.isPlaying) {
                this._walkingSfx.stop();
                this._walkingSfx.isPlaying = false; // make sure that walkingsfx.stop is called only once
            }
        })
 
    }

    async loadBug(scale = 1, position=new BABYLON.Vector3(0,0,0)) {
    this.meshData = await BABYLON.SceneLoader.ImportMeshAsync("", "https://0e7f197c-3ca0-4f7f-b6e8-b631114c3c87.usrfiles.com/ugd/0e7f19_67a1fc5d5dd743b99a1f29e1b89d1865.glb", "", this._scene)
    this.mesh = this.meshData.meshes[0]
    this.mesh.scaling = new BABYLON.Vector3(scale,scale,scale)
    this.mesh.custom_id = this.id

    this.mesh_practical = this.meshData.meshes[1]
    this.mesh_practical.isBug = true
    this.mesh_practical.isDead = false
    this.mesh_practical.custom_id = this.id 
    this.mesh_practical.isPickable = true

    this.originalRotation = new BABYLON.Vector3(this.mesh_practical.rotation.x,this.mesh_practical.rotation.y,this.mesh_practical.rotation.z)
   // this.originalRotation = new BABYLON.Vector3(this.mesh.rotation.x,this.mesh.rotation.y,this.mesh.rotation.z)
    this.originalPosition = new BABYLON.Vector3(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z)
    console.log(this.mesh,this.mesh_practical)
    this.mesh.position = position
    //console.log("this 1")
    this.animationGroupNative = this.meshData.animationGroups
    this.mesh.isPickable = true
    this.mesh.checkCollisions = true

    this._walkingSfx.attachToMesh(this.mesh);

    }
    startAnimation(name,start=true,speed=1){

        var leverage = 0.77
        this.animationGroupNative.forEach(animation => {
            if(animation.name == name){
                if(name=="dead"){
                    if(start){
                        this.onRun.notifyObservers(false);
                        this.mesh.position = new BABYLON.Vector3(this.mesh.position.x,-0.23,this.mesh.position.z)
                        animation.start(false, 2, animation.from*(1-leverage)+leverage*animation.to,animation.to, false)
                        //animation.start(false, 2, animation.to,animation.from, animation.to, false)
                        //console.log(animation.from,animation.to)
                    }else{
                        console.log("stop dead animation",this.originalRotation)
                    }
                }else{
                    if(start){
                        console.log("starting to walk",speed)
                        animation.start(true, speed, animation.to/3.0, animation.to, false)
                        this.onRun.notifyObservers(true);
                    }else{
                        this.onRun.notifyObservers(false);
                        animation.stop()
                    }
                }
            }else{
                animation.stop()
                animation.reset()
            }
        })

    }

    stopWalking(){
             if(this.isDead){
                console.log("stopped animation walking displacement!!!")
            this.animationGroup.stop()
            }       
    }    

    startWalkingAnimation(path = undefined,pointsExtrapolated= 160){

        var pathToConsider= []
        if(path){
            pathToCOnsider = path
        }else{
          var pathPointNum = 10
          for(var i = 0;i<pathPointNum;i++){
            pathToConsider[i] =new BABYLON.Vector3(Math.round(24*Math.random()-24*Math.random()),0.8,Math.round(24*Math.random()-24*Math.random()))
          }

        }
        var catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(
            pathToConsider,
            60,
            true);

        var catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(
            pathToConsider,
            pointsExtrapolated,
            true
        );

        var catmullRomSpline = BABYLON.Mesh.CreateLines("catmullRom", catmullRom.getPoints(), this._scene);
        catmullRomSpline.color=new BABYLON.Color3(1,0,0);
        catmullRomSpline.isPickable = false
        catmullRomSpline.isVisible = false
	
	// Create Path3D from array of points
	var path3d = new BABYLON.Path3D(catmullRom.getPoints());
	var curve = path3d.getCurve(); // create the curve
	var tangents = path3d.getTangents();  //array of tangents to the curve
	var normals = path3d.getNormals(); //array of normals to the curve
	var binormals = path3d.getBinormals(); //array of binormals to curve
	
	//Create and draw a plane in xy plane to trace the curve at (0, 0, 0)
	//var box = BABYLON.MeshBuilder.CreateBox("box", {}, this._scene);
	var norm = new BABYLON.Vector3(0, 0, 1); //normal to plane
	var pos_of_norm = new BABYLON.Vector3(0, 0, 0);  // position of normal (for display)

	//Draw the normal line in red
	var normLine = BABYLON.Mesh.CreateLines("normLine", [pos_of_norm, pos_of_norm.add(norm).scale(2)], this._scene);	
    normLine.color = BABYLON.Color3.Red();
    normLine.isPickable = false
	
	//Set box as parent of normal line so they move and turn as one
	//normLine.parent = box;
    normLine.parent = this.mesh

    var animationPosition = new BABYLON.Animation("animPos", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	var animationRotation = new BABYLON.Animation("animRot", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);	
	
    var keysPosition = []; 
    var keysRotation = [];

    for(var p = 0; p < catmullRom.getPoints().length; p++) {
        keysPosition.push({
            frame: p,
            value: catmullRom.getPoints()[p]
        });

        keysRotation.push({
            frame: p,
            value: BABYLON.Vector3.RotationFromAxis(normals[p], binormals[p], tangents[p])
        });
    }

    animationPosition.setKeys(keysPosition);
    animationRotation.setKeys(keysRotation);

    // Create the animation group
    this.animationGroup = new BABYLON.AnimationGroup("Group");
    this.animationGroup.addTargetedAnimation(animationPosition, this.mesh);
    this.animationGroup.addTargetedAnimation(animationRotation, this.mesh);
	
	this.animationGroup.play(true);       
    }

    startWalking(r){
        	
	// Create array of points to describe the curve
	var points = [];
	var n = 850; // number of points
//	var r = 8; //radius
	for (var i = 0; i < n + 1; i++) {
		points.push( new BABYLON.Vector3((r + (r/5)*Math.sin(8*i*Math.PI/n))* Math.sin(2*i*Math.PI/n), 0, (r + (r/10)*Math.sin(6*i*Math.PI/n)) * Math.cos(2*i*Math.PI/n)));
	}	

  this.mesh.position.y = 0.5;
  this.mesh.position.z = r;
  
  var path3d = new BABYLON.Path3D(points);
  var normals = path3d.getNormals();
  var theta = Math.acos(BABYLON.Vector3.Dot(BABYLON.Axis.Z,normals[0]));
  this.mesh.rotate(BABYLON.Axis.Y, theta-Math.PI/2+Math.PI, BABYLON.Space.WORLD); 
  var startRotation = this.mesh.rotationQuaternion;
  /*----------------End Position and Rotate Car at Start---------------------*/
  
  /*----------------Animation Loop---------------------------*/
  var i=0;
  this._scene.registerAfterRender(() => {
    this.mesh.position.x = points[i].x;
    this.mesh.position.z = points[i].z;
	 theta = Math.acos(BABYLON.Vector3.Dot(normals[i],normals[i+1]));
	 var dir = BABYLON.Vector3.Cross(normals[i],normals[i+1]).y;
	 var dir = dir/Math.abs(dir);
	 this.mesh.rotate(BABYLON.Axis.Y, dir * theta, BABYLON.Space.WORLD);
	 
	 i = (i + 1) % (n-1);	//continuous looping  
	 
	 if(i == 0) {
        this.mesh.rotationQuaternion = startRotation;
	 }
  });
    }
 }