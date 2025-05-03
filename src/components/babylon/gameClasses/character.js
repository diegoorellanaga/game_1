import * as BABYLON from '@babylonjs/core';
// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

export default class Character {
    constructor(scene, assetsManager,serverLocation,speedScale, inputManager) {
        this.scene = scene;
        this.assetsManager = assetsManager;
        this.serverLocation = serverLocation

        this.inputManager = inputManager

        this.highOffset = 2.355
        this.highOffset_2 = 2.4

        this.climbingSurfaceNormal = null;
        this.climbingEdgePoint = null;

        this.mesh = null; // The 3D mesh representing the character
        this.meshData = null;
        this.animations = {}; // Object to store animations
        this.characterState = {'isClimbing':false,'isFalling':false,'isRunning':false,'isGrounded':false,'isJumping':false,
                            'isCrouchingUp':false,'isIddle':true,'isPunching':false,'isRunningBack':false,'isLanding':false};
        // Add more properties as needed
        //physics
        this.speed = 8/speedScale; //5 when 2 loops
        this.rotationSpeed = 0.8 //4 when 2 loops
        this.previousAnimation = 'none'
        this.initialCharacterPositionClimbing = null
        //climbing animation
        this.charIsClimbing = false
        this.initialClimbPosition = null
        this.finalClimbPosition = null

        this.climbTransition = false
        this.climbTransitionCylinder = false
        this.cameraTransitioning = false

        this.landingSound = new BABYLON.Sound("landingSound",this.serverLocation+ "/assets/sounds/stompLanding.mp3", this.scene, null, { loop: false, autoplay: false });
        this.effortClimb = new BABYLON.Sound("effortClimbSound",this.serverLocation+ "/assets/sounds/effortMale.mp3", this.scene, null, { loop: false, autoplay: false,volume:0.3 });
   
        this.emptyPunchSound = new BABYLON.Sound("emptyPunchSound",this.serverLocation+ "/assets/sounds/punchempty.mp3", this.scene, null, { loop: false, autoplay: false });
        this.jumpSound= new BABYLON.Sound("jumpSound",this.serverLocation+ "/assets/sounds/jump.mp3", this.scene, null, { loop: false, autoplay: false });
        this.runSound = new BABYLON.Sound("Stomp", this.serverLocation+ "/assets/sounds/runImproved.mp3", this.scene, null, {
            loop: true,
            autoplay: false,
            volume:0.3
        });
        this.coinSound  = new BABYLON.Sound("coinSound",this.serverLocation+ "/assets/sounds/coin.mp3", this.scene, null, {volume:0.1, loop: false, autoplay: false });
      //  this.coinSound.setVolume(0.4)
        this.runSound.stop() 
        this.runSound.setPlaybackRate(1.8);  //0.7
    }
    async loadMesh(characterName) {
        try {
            // Load the character's model and animations using the asset manager
            this.meshData = await this.assetsManager.loadCharacterModel(characterName);

            // const objRootNode = new BABYLON.TransformNode("root", this.scene);
            // objRootNode.scaling = new BABYLON.Vector3(1, 1, -1);
            // objRootNode.rotation = new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(180), 0);
            // this.meshData.meshes.forEach((mesh) => {
            //     mesh.parent = objRootNode;
            // })
          //  this.meshData.meshes[0].parent = objRootNode


            console.log(this.meshData.animationGroups)
            return this.meshData.meshes[0];
        } catch (error) {
            console.error("Failed to load character model:", error);
            throw error;
        }
    }
    
    setupProperties( scale, position, ellipsoid, ellipsoidOffset) {


        // const rotationQuaternion =  BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI);
        // this.mesh.rotationQuaternion = this.mesh.rotationQuaternion.multiply(rotationQuaternion);
        this.mesh.position = position;
        this.mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
        this.mesh.isPickable = false;
        this.mesh.checkCollisions = true;
        this.mesh.isVisible = true;
        this.mesh.ellipsoid = ellipsoid;
        this.mesh.ellipsoidOffset = ellipsoidOffset;

        // const objRootNode = new BABYLON.TransformNode("root", this.scene);
        // objRootNode.scaling = new BABYLON.Vector3(1, 1, -1);
        // objRootNode.rotation = new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(180), 0);

        //camera cylinder:
        this.tempCylinder = BABYLON.MeshBuilder.CreateCylinder("TempCylinder", { height: 0.1, diameter: 0.1 }, this.scene); //{ height: 0.1, diameter: 0.1 }
        this.tempCylinder.position.copyFrom(this.mesh.position);
        this.tempCylinder.isPickable = false
        this.tempCylinder.checkCollisions = false
        this.tempCylinder.isVisible = false
        // Copy the direction of the character.mesh to the cylinder
        this.tempCylinder.rotationQuaternion = this.mesh.rotationQuaternion.clone();
        //camera cylinder:

      //  this.tempCylinder.parent = objRootNode

        //debug cylinder
        //////// DEBUG
        // // Create a wireframe representation of the collision ellipsoid DEBUG
        // this.ellipsoidMesh = BABYLON.MeshBuilder.CreateSphere("ellipsoidMesh", { diameterX: ellipsoid.x * 2, diameterY: ellipsoid.y * 2, diameterZ: ellipsoid.z * 2, segments: 16 }, this.scene);
        // this.ellipsoidMesh.position = this.mesh.position.add(this.mesh.ellipsoidOffset); // Position the ellipsoid mesh at the offset position
        
        // // Make the wireframe ellipsoid semi-transparent for visibility
        // this.ellipsoidMesh.material = new BABYLON.StandardMaterial("ellipsoidMaterial", this.scene);
        // this.ellipsoidMesh.material.wireframe = true;
        // this.ellipsoidMesh.material.alpha = 0.5; // Set transparency level
        
        // // Optionally, ensure the wireframe ellipsoid is not pickable
        // this.ellipsoidMesh.isPickable = false;
        // this.ellipsoidMesh.checkCollisions = false;

        //////// DEBUG

        // Setup properties for child meshes if any
        for (const child of this.mesh.getChildMeshes()) {
            child.isPickable = false;
            child.checkCollisions = false;
            child.isVisible = true;
        }
    }

    defineAnimations() {
        if (!this.meshData || !this.meshData.animationGroups) {
            console.error("Mesh or animation data not loaded.");
            return;
        }

        this.meshData.animationGroups.forEach(animation => {
            this.animations[animation.name] = animation;
        });

        if(this.animations['idle2']){
            this.animations["airdownbracedhang"].stop()
        this.animations['idle2'].start(true, 1.0, this.animations['idle2'].from, this.animations['idle2'].to, false)
        }

    }

    shortestPathAngle(startAngle, endAngle) {
        // Calculate the angular distance between startAngle and endAngle
        let nochangeDif = Math.abs(endAngle - startAngle);
        let addDiff = Math.abs((endAngle + 2 * Math.PI) - startAngle);
        let subDiff = Math.abs((endAngle - 2 * Math.PI) - startAngle);
        // Determine which angular difference is the smallest
        if (nochangeDif <= addDiff && nochangeDif <= subDiff) {
            return endAngle; // Return the same endAngle
        } else if (addDiff <= nochangeDif && addDiff <= subDiff) {
            return endAngle + 2 * Math.PI; // Return endAngle + 2π
        } else {
            return endAngle - 2 * Math.PI; // Return endAngle - 2π
        }
    }

    moveForward(deltaTime,moveScale) {  //moveForward
        if (!this.mesh || !this.scene.activeCamera) return; // Make sure the mesh and camera are loaded
        // Get the forward direction of the active camera in world space
        let cameraForward = this.scene.activeCamera.getDirection(BABYLON.Axis.Z);
        cameraForward.y = 0;
        cameraForward = cameraForward.normalize();
        let currentRotation = this.mesh.rotationQuaternion.toEulerAngles().y;
        let desiredAngle = Math.atan2(cameraForward.x, cameraForward.z) ;
        desiredAngle = BABYLON.Scalar.Lerp(currentRotation, this.shortestPathAngle(currentRotation, desiredAngle),this.rotationSpeed);
        // Convert the desired angle to a quaternion rotation
        const rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(desiredAngle, 0, 0);
        // Apply the rotation quaternion to the character mesh
        this.mesh.rotationQuaternion = rotationQuaternion;
        // Calculate the direction vector based on the rotated orientation (leftward)
        const rotatedDirection = new BABYLON.Vector3(Math.sin(desiredAngle), 0, Math.cos(desiredAngle));
        // Move the character along the rotated direction
        this.mesh.moveWithCollisions(rotatedDirection.scale(moveScale * this.speed * deltaTime));
    }
    moveBackward(deltaTime,moveScale) { //moveBackward
        if (!this.mesh || !this.scene.activeCamera) return; // Make sure the mesh and camera are loaded
        // Get the forward direction of the active camera in world space
        let cameraForward = this.scene.activeCamera.getDirection(BABYLON.Axis.Z);
        cameraForward.y = 0;
        cameraForward = cameraForward.normalize();
        let currentRotation = this.mesh.rotationQuaternion.toEulerAngles().y;
        let desiredAngle = Math.atan2(cameraForward.x, cameraForward.z) ;
        desiredAngle -= Math.PI;
        desiredAngle = BABYLON.Scalar.Lerp(currentRotation, this.shortestPathAngle(currentRotation, desiredAngle),this.rotationSpeed);
        const rotationQuaternion =  BABYLON.Quaternion.RotationYawPitchRoll(desiredAngle, 0, 0);
        // Apply the rotation quaternion to the character mesh
        this.mesh.rotationQuaternion = rotationQuaternion;
        // Calculate the direction vector based on the rotated orientation (leftward)
        const rotatedDirection = new BABYLON.Vector3(Math.sin(desiredAngle), 0, Math.cos(desiredAngle));
        // Move the character along the rotated direction
        this.mesh.moveWithCollisions(rotatedDirection.scale(moveScale * this.speed * deltaTime));

    }
    
    rotateLeft(deltaTime, moveScale) {
        if (!this.mesh || !this.scene.activeCamera) return; // Make sure the mesh and camera are loaded
        // Get the forward direction of the active camera in world space
        let cameraForward = this.scene.activeCamera.getDirection(BABYLON.Axis.Z);
        cameraForward.y = 0;
        cameraForward = cameraForward.normalize();
        let currentRotation = this.mesh.rotationQuaternion.toEulerAngles().y;
        let desiredAngle = Math.atan2(cameraForward.x, cameraForward.z) + Math.PI / 2;
        desiredAngle -= Math.PI;
        desiredAngle = BABYLON.Scalar.Lerp(currentRotation, this.shortestPathAngle(currentRotation, desiredAngle),this.rotationSpeed);
        // Convert the desired angle to a quaternion rotation
        const rotationQuaternion =  BABYLON.Quaternion.RotationYawPitchRoll(desiredAngle, 0, 0);
        // Apply the rotation quaternion to the character mesh
        this.mesh.rotationQuaternion = rotationQuaternion;
        // Calculate the direction vector based on the rotated orientation (leftward)
        const rotatedDirection = new BABYLON.Vector3(Math.sin(desiredAngle), 0, Math.cos(desiredAngle));
        // Move the character along the rotated direction
        this.mesh.moveWithCollisions(rotatedDirection.scale(moveScale * this.speed * deltaTime));
    }

    rotateRight(deltaTime, moveScale) {
        if (!this.mesh || !this.scene.activeCamera) return; // Make sure the mesh and camera are loaded
        // Get the forward direction of the active camera in world space
        let cameraForward = this.scene.activeCamera.getDirection(BABYLON.Axis.Z);
        cameraForward.y = 0;
        cameraForward = cameraForward.normalize();
        let currentRotation = this.mesh.rotationQuaternion.toEulerAngles().y;
        // Calculate the angle between camera forward and desired character forward (90 degrees offset)
        let desiredAngle = Math.atan2(cameraForward.x, cameraForward.z) - Math.PI / 2;
        desiredAngle -= Math.PI;
        desiredAngle = BABYLON.Scalar.Lerp(currentRotation, this.shortestPathAngle(currentRotation, desiredAngle),this.rotationSpeed);
        // Convert the desired angle to a quaternion rotation
        const rotationQuaternion =  BABYLON.Quaternion.RotationYawPitchRoll(desiredAngle, 0, 0);
        // Apply the rotation quaternion to the character mesh
        this.mesh.rotationQuaternion = rotationQuaternion;
        // Calculate the direction vector based on the rotated orientation (leftward)
        const rotatedDirection = new BABYLON.Vector3(Math.sin(desiredAngle), 0, Math.cos(desiredAngle));
        // Move the character along the rotated direction
        this.mesh.moveWithCollisions(rotatedDirection.scale(moveScale * this.speed * deltaTime));
    }


    stopAllAnimations(){
        this.playRunningAnimation(false)
        this.playIddleAnimation(false)
        this.playRunningBackAnimation(false)
        this.playfallAnimation(false)
        //sound section
        this.handleStopRunSound()
      //  this.animations["airdownbracedhang"].stop()
       // console.log("stopping all animations!!!")
    }

    handleStopRunSound(){
        if(this.previousAnimation=="run"){
            this.runSound.stop()
        }
    }

    startCharacterAnimations(){
      //  this.ellipsoidMesh.position = this.mesh.position.add(this.mesh.ellipsoidOffset); //for debug only
       // this.cylinderMesh.position= this.mesh.position.add(this.mesh.ellipsoidOffset);//error
       //one with the animation has ended (end of crouch up) (climbtransition) // one for the cameraTransitioning (for moving platform)// one for climbTransitionCylinder to wait till the cylynder is really finished transitioning, (for slow pcs)
       if(!this.climbTransition && !this.cameraTransitioning && !this.climbTransitionCylinder ){
       this.tempCylinder.position = this.mesh.position;
        
       if(!this.characterState['isRunningBack']){ //HERE IS THE CYLINDER!!
     //  this.tempCylinder.rotationQuaternion = this.mesh.rotationQuaternion

       // Define a small interpolation factor (adjust as needed)
       const lerpFactor = 0.005;
       
       // Inside your render loop or update function
       // Calculate the interpolated rotation quaternion
       let interpolatedRotationQuaternion = BABYLON.Quaternion.Slerp(this.tempCylinder.rotationQuaternion, this.mesh.rotationQuaternion, lerpFactor);
       
       // Apply the interpolated rotation quaternion to tempCylinder
       this.tempCylinder.rotationQuaternion = interpolatedRotationQuaternion;

       }
    }
        
        if(this.characterState['isRunning']){
            if(this.shouldIPlayRunAnimation()){
                this.stopAllAnimations()
                this.playRunningAnimation()
            }

        }else if(this.characterState['isIddle']){
            if(this.shouldIPlayIddleAnimation()){
                this.stopAllAnimations()
                this.playIddleAnimation()
            }
        }else if(this.characterState['isPunching']){
            if(this.shouldIPlayPunchingAnimation()){
                this.stopAllAnimations()
                this.playStandingPunchingAnimation_1()
            }
        }else if(this.characterState['isRunningBack']){
           // console.log("running back!!!")
            if(this.shouldIPlayRunBackAnimation()){
                this.stopAllAnimations()
                this.playRunningBackAnimation()
            }
        }else if(this.characterState['isJumping']){
          //  console.log("jumping back!!!")
            if(this.shouldIPlayJumpAnimation()){
                this.stopAllAnimations()
                this.playJumpAnimation()
            }
        }else if(this.characterState['isFalling']){
          //  console.log("CHECK ISFALLING TO ACTIVATE FALLING ANIMATION")
            if(this.shouldIPlayFallingAnimation()){
                console.log("BEFORE STARTIN THE PLALYFALL ANIMATION")
                this.stopAllAnimations()
                this.playfallAnimation()

            }
        }else if(this.characterState['isClimbing']){
            //  console.log("jumping back!!!")
              if(this.shouldIPlayClimbAnimation()){
                  this.stopAllAnimations()
                  this.playClimbAnimation()
              }
          }
    }

    playRunningAnimation(activate = true) {
        activate ? this.runSound.play(0, 0.5, 1.2):this.runSound.stop()
        this.previousAnimation = 'run'
       // activate ?  this.animations['jumpingup'].goToFrame(this.animations['jumpingup'].to): this.animations['jumpingup'].stop() 
       // console.log(this.animations['jumpingup'],this.animations['jumpingup'].to,this.animations['jumpingup'].goToFrame(this.animations['jumpingup'].to))
        activate ? this.animations['running'].start(true, 1.0, this.animations['running'].from, this.animations['running'].to, false): this.animations['running'].stop()
    }

    playRunningBackAnimation(activate = true) {
        this.previousAnimation = 'runback'
        activate ? this.animations['runningback'].start(true, 1.0, this.animations['runningback'].from, this.animations['runningback'].to, false): this.animations['runningback'].stop()
    }

    playIddleAnimation(activate = true) {
      //  console.log("PLAYIND IDDLE IDDLE animation HERE HERE")
        this.previousAnimation = 'iddle'
        activate ?  this.animations['idle2'].start(true, 1.0, this.animations['idle2'].from, this.animations['idle2'].to, false): this.animations['idle2'].stop()
    }

    playfallAnimation(activate = true) {
        this.previousAnimation = 'fall'
        activate ?  this.animations['jumpingup'].start(false, 4.0, this.animations['jumpingup'].to-2, this.animations['jumpingup'].to, false): this.animations['jumpingup'].stop()
    }//climbtocrouch  "crouchtoup"

    playLandingAnimation(activate = true) {

        let tunningAdjustement = 0.10
        let tunningAdjustement2 = 0.055
        let tunningAdjustement3 = 0.01
        // const leftDirection = this.mesh.forward.clone().rotateByQuaternionToRef(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 4+Math.PI), new BABYLON.Vector3());
        // leftDirection.scaleInPlace(tunningAdjustement2); //.11 Scale the left direction
        // this.mesh.position.addInPlace(leftDirection); // Add the left direction to the position

        // const forwardDirection = this.mesh.forward.clone().negate()
        // forwardDirection.scaleInPlace(tunningAdjustement3); //.11 Scale the left direction
        // this.mesh.position.addInPlace(forwardDirection); // Add the left direction to the position

        let landingAnimation = 'jumpingup'//'jumpinngdown'
        activate ? this.landingSound.play():this.landingSound.stop()
        this.previousAnimation = 'landing'
       // activate ?  this.animations['jumpingup'].goToFrame(this.animations['jumpingup'].to): this.animations['jumpingup'].stop() 
       // console.log(this.animations['jumpingup'],this.animations['jumpingup'].to,this.animations['jumpingup'].goToFrame(this.animations['jumpingup'].to))
        activate ? this.animations[landingAnimation].start(false, -1.4, this.animations[landingAnimation].from, this.animations[landingAnimation].to, false): this.animations[landingAnimation].stop()
        if (!this.animations[landingAnimation].onAnimationEndObservable.hasObservers()) {
            this.animations[landingAnimation].onAnimationEndObservable.addOnce(() => {
                this.characterState['isLanding'] = false
          
                const afterRenderFunctionLand = () => {
                    console.log("APPLLYING!!! land ")
                    // Rotate the forward direction 90 degrees to the left
                    const leftDirection = this.mesh.forward.clone().rotateByQuaternionToRef(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2), new BABYLON.Vector3());
                    leftDirection.scaleInPlace(tunningAdjustement); // Scale the left direction
                    this.mesh.position.addInPlace(leftDirection); // Add the left direction to the position


                    // Define the rotation angle in radians
var angle = 3 * Math.PI / 180; // Convert degrees to radians

// Create a quaternion for the rotation
var quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, angle);

// Rotate the mesh by the quaternion
this.mesh.rotate(BABYLON.Axis.Y, angle, BABYLON.Space.WORLD);




                    // Unregister the after render function to avoid continuous execution
                    this.scene.unregisterAfterRender(afterRenderFunctionLand);
                };
                // Register the after render function
                this.scene.registerAfterRender(afterRenderFunctionLand);



            });
        }
   
   
    }


    playJumpAnimation(activate = true) {

        let tunningAdjustement = 0.10

        this.jumpSound.play(0)
        this.previousAnimation = 'jump'
        activate ?  this.animations['jumpingup'].start(false, 4.0, this.animations['jumpingup'].from+5, this.animations['jumpingup'].to, false): this.animations['jumpingup'].stop()
        if (!this.animations["jumpingup"].onAnimationEndObservable.hasObservers()) {
            this.animations["jumpingup"].onAnimationEndObservable.addOnce(() => {
                this.characterState['isJumping'] = false
                this.characterState['isFalling'] = true

                const afterRenderFunction = () => {
                    console.log("APPLLYING!!! ")
                    // Rotate the forward direction 90 degrees to the left
                    const leftDirection = this.mesh.forward.clone().rotateByQuaternionToRef(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, (-Math.PI / 2)+Math.PI), new BABYLON.Vector3());
                    leftDirection.scaleInPlace(tunningAdjustement); // Scale the left direction
                    this.mesh.position.addInPlace(leftDirection); // Add the left direction to the position

                    // Define the rotation angle in radians
                    var angle = -3 * Math.PI / 180; // Convert degrees to radians

                    // Create a quaternion for the rotation
                    var quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, angle);
                    
                    // Rotate the mesh by the quaternion
                    this.mesh.rotate(BABYLON.Axis.Y, angle, BABYLON.Space.WORLD);



                    // Unregister the after render function to avoid continuous execution
                    this.scene.unregisterAfterRender(afterRenderFunction);
                };
                // Register the after render function
                this.scene.registerAfterRender(afterRenderFunction);






            });
        }
   
    }

    playClimbAnimation(activate = true) {
        
        this.previousAnimation = 'climb';
        const climbAnimation = this.animations['bracedhangtocrouch'];
    
      //  this.highOffset = 2.33
        if (activate) {
            this.effortClimb.play()
            
            //for camera purposes FOR CAMERA!!
            this.charIsClimbing = true
            this.initialClimbPosition = this.mesh.position.clone()
          //  let totalDistance = this.mesh.forward.clone().scale(0.6); // Start with the first vector
            let totalDistance = this.climbingSurfaceNormal.clone().scale(0.6); // Start with the first vector
            totalDistance.addInPlace(new BABYLON.Vector3(0,  this.highOffset, 0)); // Add the second vector
          //  totalDistance.addInPlace(this.mesh.forward.clone().scale(0.42)); // Add the third vector
            totalDistance.addInPlace(this.climbingSurfaceNormal.clone().scale(0.42)); // Add the third vector
            this.finalClimbPosition=this.initialClimbPosition.add(totalDistance)
          //for camera purposes FOR CAMERA!! END!!

            // Start the climb animation
            climbAnimation.start(false, 1.5, climbAnimation.from, climbAnimation.to, false);
        } else {
            climbAnimation.stop();
        }

        if (!climbAnimation.onAnimationEndObservable.hasObservers()) {
            climbAnimation.onAnimationEndObservable.addOnce(() => {
   
                // Calculate the direction of displacement (upwards and forward)

                const forwardDirection = this.climbingSurfaceNormal.clone().scale(0.75); // Adjust the forward displacement
                const upwardDirection = new BABYLON.Vector3(0,  this.highOffset, 0); // Adjust the upward displacement

                // Calculate the total displacement vector
                const displacement = forwardDirection.add(upwardDirection);
                // Apply the displacement to the character's position
                this.mesh.position.addInPlace(displacement);
    
                // Update character state or perform any other actions
                this.characterState['isClimbing'] = false;
                this.characterState['isCrouchingUp'] = true;
                this.playCrouchUpAnimation()
                // Add any additional logic here
            });
        }
    }


    playStandingPunchingAnimation_1(activate = true){
        this.emptyPunchSound.play()
        this.previousAnimation = 'standingPunching1'
        activate ?  this.animations["righthook"].start(false, 2.0, this.animations["righthook"].from, this.animations["righthook"].to, false): this.animations["righthook"].stop()
         // Check if the event listener is already added
         if (!this.animations["righthook"].onAnimationEndObservable.hasObservers()) {
            this.animations["righthook"].onAnimationEndObservable.addOnce(() => {
                this.characterState['isPunching'] = false
            });
        }
    }

    playCrouchUpAnimation(activate = true) {
      //  this.inputManager.keys = {}
        this.previousAnimation = 'crouchUp';
        activate ? this.animations["crouchtostand"].start(false, 1.5, this.animations["crouchtostand"].from, this.animations["crouchtostand"].to, false) : this.animations["crouchtostand"].stop();
        // Check if the event listener is already added
        if (!this.animations["crouchtostand"].onAnimationEndObservable.hasObservers()) {
            this.animations["crouchtostand"].onAnimationEndObservable.addOnce(() => {

                this.characterState['isCrouchingUp'] = false;   
                //this.characterState['isIddle'] = true;
console.log(this.inputManager.keys)
           //     this.inputManager.keys = {}
                //this.inputManager.isKeyDown('ArrowDown') = false
                // this.inputManager.isKeyDown('ArrowLeft') = false
                // this.inputManager.isKeyDown('ArrowUp') = false
                // this.inputManager.isKeyDown('ArrowRight') = false

                // this.inputManager.mobileLeft = false
                // this.inputManager.mobileDown = false
                // this.inputManager.mobileUp = false
                // this.inputManager.mobileRight = false

                const afterRenderFunction = () => {


                //    this.inputManager.keys = {}
                    // this.inputManager.mobileLeft = false
                    // this.inputManager.mobileDown = false
                    // this.inputManager.mobileUp = false
                    // this.inputManager.mobileRight = false

                    
                  //  const forwardDirection = this.mesh.forward.clone().scale(0.42);
                    const forwardDirection = this.climbingSurfaceNormal.clone().scale(0.40);
                    this.mesh.position.addInPlace(forwardDirection);
                    // Unregister the after render function to avoid continuous execution
                    this.charIsClimbing = false
                    this.climbTransition = false
                   
                    this.characterState['isIddle'] = true;
                    this.scene.unregisterAfterRender(afterRenderFunction);
                };
                // Register the after render function
                this.scene.registerAfterRender(afterRenderFunction);

            });
        }
    }

    shouldIPlayRunAnimation(){
        if(this.previousAnimation !='run'){
            return true
        }else{
            return false
        }
    }

    shouldIPlayRunBackAnimation(){
        if(this.previousAnimation !='runback'){
            return true
        }else{
            return false
        }
    }

    shouldIPlayLandingAnimation(){
        if(this.previousAnimation !='landing'){
            return true
        }else{
            return false
        }
    }

    shouldIPlayIddleAnimation(){
        if(this.previousAnimation !='iddle'){
            return true
        }else{
            return false
        }
    }

    shouldIPlayPunchingAnimation(){
        if(this.previousAnimation !='standingPunching1'){
            return true
        }else{
            return false
        }
    }

    shouldIPlayJumpAnimation(){
        if(this.previousAnimation !='jump'){
            return true
        }else{
            return false
        }
    }

    shouldIPlayFallingAnimation(){
        if(this.previousAnimation !='fall'){
            return true
        }else{
            return false
        }  
    }

    shouldIPlayClimbAnimation(){
        if(this.previousAnimation !='climb'){
            return true
        }else{
            return false
        }  
    }

    shouldIPlayCrouchUpAnimation(){
        if(this.previousAnimation !='crouchUp'){
            return true
        }else{
            return false
        }  
    }


    onAnimationPunchingEndHandler = () => {
        this.previousAnimation = 'standingPunching1'
        this.characterState['isPunching'] = false
    };


    alignCharacterToSurfaceNormal() {
        // Calculate rotation to align with surface normal
        const forward = new BABYLON.Vector3(0, 0, 1); // Default forward
        const normal = this.climbingSurfaceNormal.clone();
        
        // If climbing a vertical surface
        if (Math.abs(normal.y) < 0.9) {
            // Calculate right vector (perpendicular to normal and world up)
            const right = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), normal).normalize();
            // Calculate new forward (perpendicular to normal and right)
            const newForward = BABYLON.Vector3.Cross(normal, right).normalize();
            
            // Create rotation matrix
            const rotationMatrix = BABYLON.Matrix.LookAtLH(
                BABYLON.Vector3.Zero(),
                newForward,
                normal
            );
            
            // Extract rotation quaternion
            const rotationQuaternion = BABYLON.Quaternion.FromRotationMatrix(rotationMatrix);
            this.mesh.rotationQuaternion = rotationQuaternion;
        } else {
            // For horizontal surfaces, just face forward
            this.mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
        }
    }


    async load(characterName, scale, position, ellipsoid, ellipsoidOffset) {
        try {
            // Load the mesh
            this.mesh = await this.loadMesh(characterName);
            this.mesh.castShadows = true
            this.mesh.characterVelocity =0
    
            // Setup properties of the mesh
            this.setupProperties(scale, position, ellipsoid, ellipsoidOffset);
            // Setup animations of the mesh
            this.defineAnimations()
     
            // Additional setup for animations, materials, etc. may be done here
        } catch (error) {
            console.error("Failed to load character model:", error);
            throw error;
        }
    }
}